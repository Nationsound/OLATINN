"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SubscriptionStatus =
  | "incomplete"
  | "active"
  | "trialing"
  | "canceled"
  | "ended"
  | "inactive"
  | string;

type BillingInterval = "monthly" | "yearly";

type SubscriptionOwner = {
  _id?: string;
  fullName?: string;
  name?: string;
  email?: string;
} | null;

type SubscriptionPlan = {
  _id?: string;
  key?: string;
  name?: string;
  description?: string;
};

type SubscriptionRecord = {
  _id: string;

  owner?: SubscriptionOwner;

  plan?: SubscriptionPlan | null;

  status: SubscriptionStatus;

  billingInterval: BillingInterval;

  priceAtPurchase: number | null;

  currencyAtPurchase: string | null;

  paymentProvider?: string;

  paymentReference?: string | null;

  paymentSubmittedAt?: string | null;

  currentPeriodStart?: string | null;

  currentPeriodEnd?: string | null;

  cancelAtPeriodEnd?: boolean;

  canceledAt?: string | null;

  endedAt?: string | null;

  rejectionReason?: string | null;

  reviewedBy?: string | null;

  reviewedAt?: string | null;

  paymentReceiptUrl?: string | null;

  paymentReceiptPath?: string | null;

  paymentReceiptPublicId?: string | null;

  paymentReceiptResourceType?: string | null;

  /*
   * Kept for compatibility in case an existing backend response
   * already maps paymentReceiptUrl to receiptUrl.
   */
  receiptUrl?: string | null;

  createdAt?: string;

  updatedAt?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;

  subscriptions?: SubscriptionRecord[];

  payments?: SubscriptionRecord[];

  subscribers?: SubscriptionRecord[];

  subscription?: SubscriptionRecord;

  count?: number;
};

type SubscriptionSection =
  | "pending"
  | "reviewed"
  | "active"
  | "inactive";

type TabConfig = {
  key: SubscriptionSection;
  label: string;
  description: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

const TABS: TabConfig[] = [
  {
    key: "pending",
    label: "Pending Payments",
    description: "Manual payments waiting for administrator review.",
  },
  {
    key: "reviewed",
    label: "Payment History",
    description: "Previously approved and rejected payment submissions.",
  },
  {
    key: "active",
    label: "Active Premium",
    description: "Premium subscribers whose paid access is currently active.",
  },
  {
    key: "inactive",
    label: "Inactive Premium",
    description: "Premium subscribers whose paid access has ended or is inactive.",
  },
];

function formatAmount(
  amount: number | null | undefined,
  currency?: string | null
): string {
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
}

function formatDate(date?: string | null): string {
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
}

function formatShortDate(date?: string | null): string {
  if (!date) {
    return "Not available";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMerchantName(subscription: SubscriptionRecord): string {
  return (
    subscription.owner?.fullName ||
    subscription.owner?.name ||
    subscription.owner?.email ||
    "Unknown merchant"
  );
}

function getMerchantEmail(subscription: SubscriptionRecord): string {
  return subscription.owner?.email || "Email unavailable";
}

function getReceiptUrl(
  subscription: SubscriptionRecord
): string | null {
  return (
    subscription.paymentReceiptUrl ||
    subscription.receiptUrl ||
    null
  );
}

function getPlanName(subscription: SubscriptionRecord): string {
  return (
    subscription.plan?.name ||
    (subscription.plan?.key === "premium"
      ? "Premium"
      : "Store Front Plan")
  );
}

function getStatusLabel(status?: string): string {
  if (!status) {
    return "Unknown";
  }

  switch (status.toLowerCase()) {
    case "active":
      return "Active";

    case "trialing":
      return "Trialing";

    case "incomplete":
      return "Incomplete";

    case "canceled":
      return "Canceled";

    case "ended":
      return "Ended";

    case "inactive":
      return "Inactive";

    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

function getStatusClasses(status?: string): string {
  switch (status?.toLowerCase()) {
    case "active":
    case "trialing":
      return "bg-emerald-100 text-emerald-800";

    case "incomplete":
      return "bg-amber-100 text-amber-800";

    case "canceled":
    case "ended":
    case "inactive":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function isRejected(subscription: SubscriptionRecord): boolean {
  return Boolean(
    subscription.rejectionReason &&
      subscription.reviewedAt
  );
}

function isApproved(subscription: SubscriptionRecord): boolean {
  return (
    (subscription.status === "active" ||
      subscription.status === "trialing") &&
    Boolean(subscription.reviewedAt)
  );
}

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] =
    useState<SubscriptionSection>("pending");

  const [pendingSubscriptions, setPendingSubscriptions] =
    useState<SubscriptionRecord[]>([]);

  const [reviewedSubscriptions, setReviewedSubscriptions] =
    useState<SubscriptionRecord[]>([]);

  const [activeSubscriptions, setActiveSubscriptions] =
    useState<SubscriptionRecord[]>([]);

  const [inactiveSubscriptions, setInactiveSubscriptions] =
    useState<SubscriptionRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [endpointWarnings, setEndpointWarnings] =
    useState<string[]>([]);

  const [rejectingSubscription, setRejectingSubscription] =
    useState<SubscriptionRecord | null>(null);

  const [rejectionReason, setRejectionReason] =
    useState("");

  const [receiptSubscription, setReceiptSubscription] =
    useState<SubscriptionRecord | null>(null);

  const getToken = useCallback((): string | null => {
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

      if (!API_URL) {
        throw new Error(
          "The API URL is missing. Please configure NEXT_PUBLIC_API_URL."
        );
      }

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          ...options,

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers || {}),
          },

          cache: "no-store",
        }
      );

      const data: ApiResponse = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Request failed with status ${response.status}.`
        );
      }

      return data;
    },
    [getToken]
  );

  /*
   * ============================================================
   * LOAD ALL SUBSCRIPTION CATEGORIES
   * ============================================================
   *
   * Existing endpoint:
   *
   * GET /subscriptions/admin/pending
   *
   * New backend endpoints to implement:
   *
   * GET /subscriptions/admin/reviewed
   * GET /subscriptions/admin/premium/active
   * GET /subscriptions/admin/premium/inactive
   *
   * Promise.allSettled is intentional.
   *
   * It means the existing pending-payment page continues working
   * even while the new backend endpoints are being implemented.
   */
  const loadAllSubscriptions = useCallback(
  async (showFullLoader = true) => {
    if (showFullLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");
    setEndpointWarnings([]);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Administrator authentication is required. Please sign in again."
        );
      }

      const results = await Promise.allSettled([
        // ========================================
        // Pending manual payments
        // Backend returns: { subscriptions: [...] }
        // ========================================
        apiRequest("/subscriptions/admin/pending"),

        // ========================================
        // Reviewed payment history
        // Backend returns: { payments: [...] }
        // ========================================
        apiRequest("/subscriptions/admin/history"),

        // ========================================
        // Active Premium subscribers
        // Backend returns: { subscribers: [...] }
        // ========================================
        apiRequest("/subscriptions/admin/premium/active"),

        // ========================================
        // Inactive Premium subscribers
        // Backend returns: { subscribers: [...] }
        // ========================================
        apiRequest("/subscriptions/admin/premium/inactive"),
      ]);

      const warnings: string[] = [];

      // ========================================
      // 1. PENDING PAYMENTS
      // ========================================

      if (results[0].status === "fulfilled") {
        const result = results[0].value;

        setPendingSubscriptions(
          Array.isArray(result.subscriptions)
            ? result.subscriptions
            : []
        );
      } else {
        setPendingSubscriptions([]);

        warnings.push(
          `Pending payments: ${
            results[0].reason instanceof Error
              ? results[0].reason.message
              : "Unable to load."
          }`
        );
      }

      // ========================================
      // 2. PAYMENT HISTORY
      // ========================================
      // IMPORTANT:
      // getPaymentHistory returns "payments",
      // NOT "subscriptions".
      // ========================================

      if (results[1].status === "fulfilled") {
        const result = results[1].value;

        setReviewedSubscriptions(
          Array.isArray(result.payments)
            ? result.payments
            : []
        );
      } else {
        setReviewedSubscriptions([]);

        warnings.push(
          `Payment history: ${
            results[1].reason instanceof Error
              ? results[1].reason.message
              : "Unable to load."
          }`
        );
      }

      // ========================================
      // 3. ACTIVE PREMIUM SUBSCRIBERS
      // ========================================
      // IMPORTANT:
      // getActivePremiumSubscribers returns
      // "subscribers", NOT "subscriptions".
      // ========================================

      if (results[2].status === "fulfilled") {
        const result = results[2].value;

        setActiveSubscriptions(
          Array.isArray(result.subscribers)
            ? result.subscribers
            : []
        );
      } else {
        setActiveSubscriptions([]);

        warnings.push(
          `Active Premium subscribers: ${
            results[2].reason instanceof Error
              ? results[2].reason.message
              : "Unable to load."
          }`
        );
      }

      // ========================================
      // 4. INACTIVE PREMIUM SUBSCRIBERS
      // ========================================
      // IMPORTANT:
      // getInactivePremiumSubscribers returns
      // "subscribers", NOT "subscriptions".
      // ========================================

      if (results[3].status === "fulfilled") {
        const result = results[3].value;

        setInactiveSubscriptions(
          Array.isArray(result.subscribers)
            ? result.subscribers
            : []
        );
      } else {
        setInactiveSubscriptions([]);

        warnings.push(
          `Inactive Premium subscribers: ${
            results[3].reason instanceof Error
              ? results[3].reason.message
              : "Unable to load."
          }`
        );
      }

      setEndpointWarnings(warnings);

      // ========================================
      // If the main pending endpoint failed,
      // show the general error.
      // ========================================

      if (results[0].status === "rejected") {
        throw results[0].reason;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subscriptions."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  [apiRequest, getToken]
);

  useEffect(() => {
    void loadAllSubscriptions(true);
  }, [loadAllSubscriptions]);

  /*
   * ============================================================
   * APPROVE PAYMENT
   * ============================================================
   */
  const handleApprove = async (
    subscription: SubscriptionRecord
  ) => {
    const merchantName = getMerchantName(subscription);

    const confirmed = window.confirm(
      `Approve the payment from ${merchantName} and activate the ${getPlanName(
        subscription
      )} subscription?`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setNotice("");
    setProcessingId(subscription._id);

    try {
      const result = await apiRequest(
        `/subscriptions/admin/${encodeURIComponent(
          subscription._id
        )}/approve`,
        {
          method: "PATCH",
        }
      );

      setNotice(
        result.message ||
          "Payment approved and subscription activated."
      );

      /*
       * Refresh everything so the subscription moves from
       * pending into the appropriate historical/active section.
       */
      await loadAllSubscriptions(false);
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

  /*
   * ============================================================
   * OPEN REJECTION MODAL
   * ============================================================
   */
  const openRejectModal = (
    subscription: SubscriptionRecord
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

  /*
   * ============================================================
   * REJECT PAYMENT
   * ============================================================
   */
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
        `/subscriptions/admin/${encodeURIComponent(
          rejectingSubscription._id
        )}/reject`,
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

      await loadAllSubscriptions(false);
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

  /*
   * ============================================================
   * SELECT CURRENT LIST
   * ============================================================
   */
  const currentSubscriptions = useMemo(() => {
    switch (activeTab) {
      case "reviewed":
        return reviewedSubscriptions;

      case "active":
        return activeSubscriptions;

      case "inactive":
        return inactiveSubscriptions;

      case "pending":
      default:
        return pendingSubscriptions;
    }
  }, [
    activeTab,
    pendingSubscriptions,
    reviewedSubscriptions,
    activeSubscriptions,
    inactiveSubscriptions,
  ]);

  const pendingCount = pendingSubscriptions.length;

  const reviewedCount = reviewedSubscriptions.length;

  const approvedCount = reviewedSubscriptions.filter(
    isApproved
  ).length;

  const rejectedCount = reviewedSubscriptions.filter(
    isRejected
  ).length;

  const activeCount = activeSubscriptions.length;

  const inactiveCount = inactiveSubscriptions.length;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* ========================================================
          HEADER
          ======================================================== */}
      <section className="relative overflow-hidden bg-[#000271] px-5 py-14 text-white sm:px-8 lg:py-18">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#17acdd]/20 blur-3xl" />

        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/admin"
            className="mb-8 inline-flex items-center text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            ← Back to Admin Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">
                Olatinn Store Front
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Subscription Management
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100 sm:text-base">
                Review manual payments, inspect receipts, approve or
                reject subscription requests, and monitor Premium
                subscribers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[620px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  Pending
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {pendingCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  Reviewed
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {reviewedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  Active
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {activeCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">
                  Inactive
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {inactiveCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CONTENT
          ======================================================== */}
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

        {/* Notice */}
        {notice && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-800"
          >
            <div>
              <p className="font-bold">
                Action completed
              </p>

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

        {/* Backend endpoint warnings */}
        {endpointWarnings.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-bold">
              Some subscription sections are waiting for their
              backend endpoints.
            </p>

            <p className="mt-1 leading-6">
              The existing pending-payment endpoint is still usable.
              The sections below will populate automatically once
              their backend endpoints are implemented.
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              {endpointWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ======================================================
            SUMMARY
            ====================================================== */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending payments
            </p>

            <p className="mt-3 text-3xl font-extrabold text-[#000271]">
              {pendingCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Awaiting administrator review
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Approved payments
            </p>

            <p className="mt-3 text-3xl font-extrabold text-emerald-600">
              {approvedCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Previously approved
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Rejected payments
            </p>

            <p className="mt-3 text-3xl font-extrabold text-red-600">
              {rejectedCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Previously rejected
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Premium access
            </p>

            <p className="mt-3 text-3xl font-extrabold text-[#000271]">
              {activeCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently active Premium subscribers
            </p>
          </div>
        </section>

        {/* ======================================================
            TABS
            ====================================================== */}
        <section className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {TABS.map((tab) => {
                const selected = activeTab === tab.key;

                let count = 0;

                if (tab.key === "pending") {
                  count = pendingCount;
                }

                if (tab.key === "reviewed") {
                  count = reviewedCount;
                }

                if (tab.key === "active") {
                  count = activeCount;
                }

                if (tab.key === "inactive") {
                  count = inactiveCount;
                }

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.key);
                      setError("");
                      setNotice("");
                    }}
                    className={`rounded-2xl px-4 py-4 text-left transition ${
                      selected
                        ? "bg-[#000271] text-white shadow-sm"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-extrabold">
                        {tab.label}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${
                          selected
                            ? "bg-white/15 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {count}
                      </span>
                    </div>

                    <p
                      className={`mt-1 text-xs leading-5 ${
                        selected
                          ? "text-blue-100"
                          : "text-slate-500"
                      }`}
                    >
                      {tab.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-7">
            <div>
              <h2 className="text-2xl font-extrabold text-[#000271]">
                {
                  TABS.find(
                    (tab) => tab.key === activeTab
                  )?.label
                }
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {
                  TABS.find(
                    (tab) => tab.key === activeTab
                  )?.description
                }
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadAllSubscriptions(false)
              }
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-[#000271] transition hover:border-[#17acdd] hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {refreshing
                ? "Refreshing..."
                : "Refresh subscriptions"}
            </button>
          </div>
        </section>

        {/* ======================================================
            LOADING
            ====================================================== */}
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#17acdd]" />

            <p className="mt-5 font-semibold text-slate-700">
              Loading subscriptions...
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while we retrieve the Store Front
              subscription records.
            </p>
          </div>
        ) : currentSubscriptions.length === 0 ? (
          /* ====================================================
             EMPTY STATE
             ==================================================== */
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-2xl">
              {activeTab === "pending"
                ? "✓"
                : activeTab === "reviewed"
                  ? "◷"
                  : activeTab === "active"
                    ? "★"
                    : "○"}
            </div>

            <h3 className="mt-6 text-xl font-extrabold text-[#000271]">
              {activeTab === "pending"
                ? "No pending payments"
                : activeTab === "reviewed"
                  ? "No payment history"
                  : activeTab === "active"
                    ? "No active Premium subscribers"
                    : "No inactive Premium subscribers"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {activeTab === "pending"
                ? "There are currently no Store Front subscription payments waiting for administrator review."
                : activeTab === "reviewed"
                  ? "Approved and rejected payment records will appear here."
                  : activeTab === "active"
                    ? "Currently active Premium subscriptions will appear here."
                    : "Expired, ended, or otherwise inactive Premium subscriptions will appear here."}
            </p>
          </div>
        ) : (
          /* ====================================================
             SUBSCRIPTION LIST
             ==================================================== */
          <div className="space-y-6">
            {currentSubscriptions.map((subscription) => {
              const isProcessing =
                processingId === subscription._id;

              const receiptUrl =
                getReceiptUrl(subscription);

              const approved =
                isApproved(subscription);

              const rejected =
                isRejected(subscription);

              return (
                <article
                  key={subscription._id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  {/* =================================================
                      CARD HEADER
                      ================================================= */}
                  <div className="border-b border-slate-100 bg-slate-50 px-5 py-5 sm:px-7">
                    <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${getStatusClasses(
                              subscription.status
                            )}`}
                          >
                            {getStatusLabel(
                              subscription.status
                            )}
                          </span>

                          {approved && (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-800">
                              Payment approved
                            </span>
                          )}

                          {rejected && (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-800">
                              Payment rejected
                            </span>
                          )}

                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                            Manual transfer
                          </span>

                          {subscription.plan?.key ===
                            "premium" && (
                            <span className="rounded-full bg-[#000271] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                              Premium
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 text-xl font-extrabold text-[#000271]">
                          {getPlanName(subscription)}
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
                          Amount
                        </p>

                        <p className="mt-1 text-2xl font-extrabold text-[#000271]">
                          {formatAmount(
                            subscription.priceAtPurchase,
                            subscription.currencyAtPurchase
                          )}
                        </p>

                        <p className="mt-1 text-sm font-semibold capitalize text-slate-600">
                          {subscription.billingInterval}{" "}
                          billing
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      DETAILS
                      ================================================= */}
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

                      {subscription.paymentSubmittedAt && (
                        <p className="mt-2 text-xs text-slate-500">
                          Submitted{" "}
                          {formatDate(
                            subscription.paymentSubmittedAt
                          )}
                        </p>
                      )}
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
                          : getPlanName(
                              subscription
                            )}
                      </p>
                    </div>
                  </div>

                  {/* =================================================
                      ACTIVE PERIOD
                      ================================================= */}
                  {(subscription.currentPeriodStart ||
                    subscription.currentPeriodEnd) && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 sm:px-7">
                      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Period started
                          </p>

                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {formatDate(
                              subscription.currentPeriodStart
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Expiry date
                          </p>

                          <p className="mt-2 text-sm font-bold text-[#000271]">
                            {formatDate(
                              subscription.currentPeriodEnd
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Reviewed
                          </p>

                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {formatDate(
                              subscription.reviewedAt
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Cancellation
                          </p>

                          <p className="mt-2 text-sm font-bold text-slate-800">
                            {subscription.cancelAtPeriodEnd
                              ? "Scheduled"
                              : "Not scheduled"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      REJECTION REASON
                      ================================================= */}
                  {rejected &&
                    subscription.rejectionReason && (
                      <div className="border-t border-red-100 bg-red-50 px-5 py-5 sm:px-7">
                        <p className="text-xs font-bold uppercase tracking-wider text-red-500">
                          Rejection reason
                        </p>

                        <p className="mt-2 text-sm leading-6 text-red-900">
                          {subscription.rejectionReason}
                        </p>
                      </div>
                    )}

                  {/* =================================================
                      RECEIPT + ACTIONS
                      ================================================= */}
                  <div className="flex flex-col gap-4 border-t border-slate-100 px-5 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      {receiptUrl ? (
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

                    {/* Pending actions only */}
                    {activeTab === "pending" && (
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            openRejectModal(
                              subscription
                            )
                          }
                          disabled={isProcessing}
                          className="rounded-xl border border-red-200 px-6 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject payment
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void handleApprove(
                              subscription
                            )
                          }
                          disabled={isProcessing}
                          className="rounded-xl bg-[#000271] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Approve & Activate"}
                        </button>
                      </div>
                    )}

                    {/* Reviewed metadata */}
                    {activeTab === "reviewed" && (
                      <div className="text-right text-xs text-slate-500">
                        {approved
                          ? "Payment was approved."
                          : rejected
                            ? "Payment was rejected."
                            : "Payment has been reviewed."}
                      </div>
                    )}

                    {/* Active subscriber metadata */}
                    {activeTab === "active" && (
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                          Premium access active
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          Expires{" "}
                          {formatShortDate(
                            subscription.currentPeriodEnd
                          )}
                        </p>
                      </div>
                    )}

                    {/* Inactive subscriber metadata */}
                    {activeTab === "inactive" && (
                      <div className="text-right">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Premium access inactive
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          Ended{" "}
                          {formatShortDate(
                            subscription.currentPeriodEnd ||
                              subscription.endedAt
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          RECEIPT MODAL
          ======================================================== */}
      {receiptSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setReceiptSubscription(null);
            }
          }}
        >
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Receipt header */}
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

                <p className="mt-1 text-xs text-slate-500">
                  {getPlanName(
                    receiptSubscription
                  )}{" "}
                  •{" "}
                  {receiptSubscription.billingInterval}
                </p>
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
              {getReceiptUrl(
                receiptSubscription
              ) ? (
                <iframe
                  src={
                    getReceiptUrl(
                      receiptSubscription
                    ) || undefined
                  }
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
                      No receipt URL was supplied with
                      this payment.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Receipt footer */}
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

      {/* ========================================================
          REJECTION MODAL
          ======================================================== */}
      {rejectingSubscription && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
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
                  disabled={Boolean(
                    processingId
                  )}
                  className="text-xl font-bold text-slate-500 disabled:opacity-50"
                  aria-label="Close rejection dialog"
                >
                  ×
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                You are rejecting the payment submitted
                by{" "}
                <strong>
                  {getMerchantName(
                    rejectingSubscription
                  )}
                </strong>
                .
              </p>
            </div>

            {/* Payment summary */}
            <div className="px-6 py-5">
              <div className="rounded-2xl bg-slate-50 p-4">
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
                    {
                      rejectingSubscription.billingInterval
                    }
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
            <div className="px-6 pb-5">
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
                  setRejectionReason(
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={5}
                placeholder="Explain why this payment cannot be approved."
                disabled={Boolean(
                  processingId
                )}
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
              />

              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>
                  The merchant can submit a corrected
                  receipt.
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
                disabled={Boolean(
                  processingId
                )}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void handleReject()
                }
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