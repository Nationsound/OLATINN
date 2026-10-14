"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type PendingSubscription = {
  _id: string;

  owner?: {
    _id?: string;
    fullName?: string;
    email?: string;
  } | null;

  plan?: {
    _id?: string;
    key?: string;
    name?: string;
    description?: string;
  } | null;

  status: string;

  billingInterval: "monthly" | "yearly";

  priceAtPurchase: number | null;

  currencyAtPurchase: string | null;

  paymentProvider?: string;

  paymentReference?: string | null;

  paymentSubmittedAt?: string | null;

  currentPeriodStart?: string | null;

  currentPeriodEnd?: string | null;

  rejectionReason?: string | null;

  receiptUrl?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  subscriptions?: PendingSubscription[];
  subscription?: PendingSubscription;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/olatinn/api"
).replace(/\/+$/, "");

const formatAmount = (
  amount: number | null | undefined,
  currency?: string | null
) => {
  if (
    amount === null ||
    amount === undefined ||
    !Number.isFinite(amount)
  ) {
    return "Amount unavailable";
  }

  const normalizedCurrency = currency || "NGN";

  try {
    return new Intl.NumberFormat(
      normalizedCurrency === "NGN" ? "en-NG" : "en-US",
      {
        style: "currency",
        currency: normalizedCurrency,
        maximumFractionDigits: 2,
      }
    ).format(amount / 100);
  } catch {
    return `${normalizedCurrency} ${(amount / 100).toLocaleString()}`;
  }
};

const formatDate = (date?: string | null) => {
  if (!date) {
    return "Not available";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const getMerchantName = (subscription: PendingSubscription) => {
  return (
    subscription.owner?.fullName ||
    subscription.owner?.email ||
    "Unknown merchant"
  );
};

const getMerchantEmail = (subscription: PendingSubscription) => {
  return subscription.owner?.email || "Email unavailable";
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<
    PendingSubscription[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [processingId, setProcessingId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [rejectingSubscription, setRejectingSubscription] =
    useState<PendingSubscription | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  const [receiptSubscription, setReceiptSubscription] =
    useState<PendingSubscription | null>(null);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.localStorage.getItem("adminToken");
  }, []);

  const apiRequest = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {}
    ): Promise<ApiResponse> => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Administrator authentication is required."
        );
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

          ...(options.headers || {}),
        },
      });

      const data: ApiResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "The request could not be completed."
        );
      }

      return data;
    },
    [getToken]
  );

  const loadPendingSubscriptions = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const result = await apiRequest(
          "/subscriptions/admin/pending"
        );

        setSubscriptions(result.subscriptions || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load pending subscriptions."
        );
      } finally {
        setLoading(false);
      }
    },
    [apiRequest]
  );

  useEffect(() => {
    void loadPendingSubscriptions();
  }, [loadPendingSubscriptions]);

  const handleApprove = async (
    subscription: PendingSubscription
  ) => {
    const merchantName = getMerchantName(subscription);

    const confirmed = window.confirm(
      `Approve the payment from ${merchantName} and activate the ${subscription.plan?.name || "Premium"} subscription?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");
    setProcessingId(subscription._id);

    try {
      const result = await apiRequest(
        `/subscriptions/admin/${subscription._id}/approve`,
        {
          method: "PATCH",
        }
      );

      setNotice(
        result.message ||
          "Payment approved and subscription activated."
      );

      await loadPendingSubscriptions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve this payment."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (
    subscription: PendingSubscription
  ) => {
    setError("");
    setNotice("");
    setRejectionReason("");
    setRejectingSubscription(subscription);
  };

  const closeRejectModal = () => {
    if (processingId) {
      return;
    }

    setRejectingSubscription(null);
    setRejectionReason("");
  };

  const handleReject = async () => {
    if (!rejectingSubscription) {
      return;
    }

    const reason = rejectionReason.trim();

    if (!reason) {
      setError(
        "Please provide a reason for rejecting this payment."
      );
      return;
    }

    if (reason.length > 1000) {
      setError(
        "The rejection reason cannot exceed 1000 characters."
      );
      return;
    }

    setError("");
    setNotice("");
    setProcessingId(rejectingSubscription._id);

    try {
      const result = await apiRequest(
        `/subscriptions/admin/${rejectingSubscription._id}/reject`,
        {
          method: "PATCH",
          body: JSON.stringify({
            reason,
          }),
        }
      );

      setNotice(
        result.message ||
          "Payment rejected successfully."
      );

      setRejectingSubscription(null);
      setRejectionReason("");

      await loadPendingSubscriptions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject this payment."
      );
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = subscriptions.length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#000271] px-5 py-14 text-white sm:px-8 lg:py-18">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#17acdd]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="mb-8 inline-flex items-center text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            ← Back to Admin Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">
                Olatinn Store Front
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Subscription Payments
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                Review merchant payment receipts and approve
                or reject Store Front subscription requests.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                Pending payments
              </p>

              <p className="mt-1 text-3xl font-extrabold">
                {pendingCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">
        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
          >
            <div>
              <p className="font-bold">
                Something needs your attention
              </p>

              <p className="mt-1">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-lg font-bold"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Success */}
        {notice && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800"
          >
            <div>
              <p className="font-bold">Action completed</p>

              <p className="mt-1">{notice}</p>
            </div>

            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-lg font-bold"
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-[#000271]">
              Pending review
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payments submitted by Store Front merchants.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPendingSubscriptions()}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#000271] transition hover:border-[#17acdd] hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh payments"}
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#17acdd]" />

            <p className="mt-5 font-semibold text-slate-700">
              Loading pending payments...
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we retrieve the payment queue.
            </p>
          </div>
        ) : subscriptions.length === 0 ? (
          /* Empty state */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">
              ✓
            </div>

            <h3 className="mt-6 text-xl font-extrabold text-[#000271]">
              No pending payments
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              There are currently no Store Front subscription
              payments waiting for administrator review.
            </p>
          </div>
        ) : (
          /* Payment list */
          <div className="space-y-6">
            {subscriptions.map((subscription) => {
              const isProcessing =
                processingId === subscription._id;

              return (
                <article
                  key={subscription._id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* Card header */}
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-5 sm:px-7">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                            Awaiting review
                          </span>

                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                            Manual transfer
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-extrabold text-[#000271]">
                          {subscription.plan?.name ||
                            "Store Front Plan"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Subscription ID:{" "}
                          <span className="font-mono">
                            {subscription._id}
                          </span>
                        </p>
                      </div>

                      <div className="lg:text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Amount submitted
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-[#000271]">
                          {formatAmount(
                            subscription.priceAtPurchase,
                            subscription.currencyAtPurchase
                          )}
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-slate-600">
                          {subscription.billingInterval} billing
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-3">
                    {/* Merchant */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Merchant
                      </p>

                      <p className="mt-2 font-bold text-slate-900">
                        {getMerchantName(subscription)}
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {getMerchantEmail(subscription)}
                      </p>
                    </div>

                    {/* Payment */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Payment reference
                      </p>

                      <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-800">
                        {subscription.paymentReference ||
                          "No reference provided"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        Submitted{" "}
                        {formatDate(
                          subscription.paymentSubmittedAt
                        )}
                      </p>
                    </div>

                    {/* Billing */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Billing period
                      </p>

                      <p className="mt-2 font-bold capitalize text-slate-900">
                        {subscription.billingInterval}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {subscription.plan?.key ===
                        "premium"
                          ? "Premium Store Front"
                          : subscription.plan?.name ||
                            "Store Front subscription"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                    <div>
                      {subscription.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setReceiptSubscription(
                              subscription
                            )
                          }
                          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[#17acdd] hover:bg-cyan-50 hover:text-[#000271]"
                        >
                          View payment receipt
                        </button>
                      ) : (
                        <p className="text-sm font-medium text-amber-700">
                          No receipt URL available.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() =>
                          openRejectModal(subscription)
                        }
                        disabled={isProcessing}
                        className="rounded-xl border border-red-200 px-6 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Reject payment
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleApprove(subscription)
                        }
                        disabled={isProcessing}
                        className="rounded-xl bg-[#000271] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Approve & Activate"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Receipt Modal */}
      {receiptSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setReceiptSubscription(null);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#17acdd]">
                  Payment receipt
                </p>

                <h2
                  id="receipt-title"
                  className="mt-1 text-lg font-extrabold text-[#000271]"
                >
                  {getMerchantName(
                    receiptSubscription
                  )}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setReceiptSubscription(null)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl font-bold text-slate-600 transition hover:bg-slate-100"
                aria-label="Close receipt"
              >
                ×
              </button>
            </div>

            {/* Receipt */}
            <div className="min-h-0 flex-1 overflow-auto bg-slate-100 p-4 sm:p-7">
              {receiptSubscription.receiptUrl ? (
                <iframe
                  src={receiptSubscription.receiptUrl}
                  title="Payment receipt"
                  className="h-[70vh] w-full rounded-2xl border border-slate-200 bg-white"
                />
              ) : (
                <div className="flex min-h-[50vh] items-center justify-center text-center">
                  <div>
                    <p className="font-bold text-slate-800">
                      Receipt unavailable
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      No receipt URL was supplied with this
                      payment.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex flex-col justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
              <div className="text-sm text-slate-500">
                Reference:{" "}
                <span className="font-mono font-semibold text-slate-700">
                  {receiptSubscription.paymentReference ||
                    "Not provided"}
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setReceiptSubscription(null)
                }
                className="rounded-xl bg-[#000271] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17acdd]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectModal();
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600">
                    Reject payment
                  </p>

                  <h2
                    id="reject-title"
                    className="mt-1 text-xl font-extrabold text-[#000271]"
                  >
                    Reject this payment?
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={Boolean(processingId)}
                  className="text-xl font-bold text-slate-500 disabled:opacity-50"
                  aria-label="Close rejection dialog"
                >
                  ×
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                You are rejecting the payment submitted by{" "}
                <strong>
                  {getMerchantName(
                    rejectingSubscription
                  )}
                </strong>
                .
              </p>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Amount
                  </span>

                  <strong className="text-[#000271]">
                    {formatAmount(
                      rejectingSubscription.priceAtPurchase,
                      rejectingSubscription.currencyAtPurchase
                    )}
                  </strong>
                </div>

                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Billing
                  </span>

                  <strong className="capitalize text-slate-800">
                    {rejectingSubscription.billingInterval}
                  </strong>
                </div>

                <div className="mt-2 flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Reference
                  </span>

                  <strong className="max-w-[65%] break-all text-right font-mono text-xs text-slate-800">
                    {rejectingSubscription.paymentReference ||
                      "Not provided"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="px-6 py-5">
              <label
                htmlFor="rejectionReason"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Reason for rejection
              </label>

              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(event) =>
                  setRejectionReason(event.target.value)
                }
                maxLength={1000}
                rows={5}
                placeholder="Explain why this payment cannot be approved."
                disabled={Boolean(processingId)}
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>
                  The merchant will be able to submit a
                  corrected receipt.
                </span>

                <span>
                  {rejectionReason.length}/1000
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={Boolean(processingId)}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleReject()}
                disabled={
                  Boolean(processingId) ||
                  !rejectionReason.trim()
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingId
                  ? "Rejecting..."
                  : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}