"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";

type Plan = {
  _id: string;
  key: "free" | "premium";
  name: string;
  description?: string;
  isActive: boolean;
  prices: {
    currency: string;
    monthly: number | null;
    yearly: number | null;
  };
  entitlements: {
    maxStores: number;
    maxProductsPerStore: number;
    themes: string[];
    analyticsLevel: "none" | "basic" | "advanced";
    marketing: boolean;
  };
};

type Subscription = {
  _id: string;
  status: string;
  billingInterval: "monthly" | "yearly";
  priceAtPurchase: number | null;
  currencyAtPurchase: string | null;
  paymentSubmittedAt?: string | null;
  currentPeriodEnd?: string | null;
  rejectionReason?: string | null;
  plan?: {
    key: string;
    name: string;
  };
};

type BankDetails = {
  accountName: string;
  bankName: string;
  accountNumber: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/olatinn/api"
).replace(/\/+$/, "");

const formatNaira = (amount: number | null | undefined) => {
  if (amount == null || !Number.isFinite(amount)) {
    return "Price unavailable";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(amount / 100);
};

const formatDate = (date?: string | null) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function StoreFrontPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] =
    useState<Subscription | null>(null);
  const [bankDetails, setBankDetails] =
    useState<BankDetails | null>(null);

  const [billingInterval, setBillingInterval] =
    useState<"monthly" | "yearly">("monthly");

  const [receipt, setReceipt] = useState<File | null>(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [selectedPlan, setSelectedPlan] =
    useState<Plan | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem("olatinnToken")
      : null;

  const apiRequest = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {}),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "The request could not be completed."
        );
      }

      return data;
    },
    [token]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const plansResponse = await apiRequest("/plans");

      setPlans(plansResponse.plans || []);

      if (token) {
        const results = await Promise.allSettled([
          apiRequest("/subscription/me"),
          apiRequest("/subscription/bank-details"),
        ]);

        if (results[0].status === "fulfilled") {
          setSubscription(
            results[0].value.subscription || null
          );
        }

        if (results[1].status === "fulfilled") {
          setBankDetails(
            results[1].value.bankDetails || null
          );
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load subscription plans."
      );
    } finally {
      setLoading(false);
    }
  }, [apiRequest, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const freePlan = useMemo(
    () => plans.find((plan) => plan.key === "free"),
    [plans]
  );

  const premiumPlan = useMemo(
    () => plans.find((plan) => plan.key === "premium"),
    [plans]
  );

  const premiumPrice = premiumPlan?.prices[billingInterval];

  const yearlySavings = useMemo(() => {
    if (
      !premiumPlan ||
      premiumPlan.prices.monthly == null ||
      premiumPlan.prices.yearly == null
    ) {
      return null;
    }

    const annualMonthlyCost = premiumPlan.prices.monthly * 12;
    const yearlyCost = premiumPlan.prices.yearly;

    if (annualMonthlyCost <= 0 || yearlyCost >= annualMonthlyCost) {
      return null;
    }

    return Math.round(
      ((annualMonthlyCost - yearlyCost) / annualMonthlyCost) * 100
    );
  }, [premiumPlan]);

  const hasActiveSubscription =
    subscription?.status === "active" ||
    subscription?.status === "trialing";

  const hasPendingPayment =
    subscription?.status === "incomplete" &&
    Boolean(subscription.paymentSubmittedAt);

  const handleFreePlan = async () => {
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const result = await apiRequest("/subscription/free", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setNotice(result.message || "Free plan activated.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to activate the Free plan."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceiptSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!selectedPlan || !receipt) {
      setError("Choose a plan and attach your receipt.");
      return;
    }

    if (!paymentReference.trim()) {
      setError("Enter your bank transfer reference.");
      return;
    }

    const formData = new FormData();

    formData.append("planKey", selectedPlan.key);
    formData.append("billingInterval", billingInterval);
    formData.append("paymentReference", paymentReference.trim());
    formData.append("receipt", receipt);

    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const result = await apiRequest("/subscription/receipt", {
        method: "POST",
        body: formData,
      });

      setNotice(
        result.message ||
          "Receipt submitted for administrator review."
      );

      setReceipt(null);
      setPaymentReference("");
      setSelectedPlan(null);

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit the receipt."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openPremiumForm = () => {
    if (!premiumPlan) {
      setError("The Premium plan is currently unavailable.");
      return;
    }

    if (premiumPrice == null || premiumPrice <= 0) {
      setError(
        "Premium pricing has not been configured for this billing interval."
      );
      return;
    }

    if (!token) {
      window.location.href = "/signin?next=/store-front/plans";
      return;
    }

    setError("");
    setNotice("");
    setSelectedPlan(premiumPlan);

    window.setTimeout(() => {
      document
        .getElementById("payment-form")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to request cancellation of your subscription?"
    );

    if (!confirmed) return;

    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const result = await apiRequest("/subscription/cancel", {
        method: "POST",
        body: JSON.stringify({}),
      });

      setNotice(result.message || "Cancellation recorded.");
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel the subscription."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-[#000271] px-5 py-16 text-white sm:px-8 lg:py-24 mt-5">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#17acdd]/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Link
            href="/store-front"
            className="mb-8 inline-flex text-sm font-medium text-cyan-200 transition hover:text-white"
          >
            ← Back to Store Front
          </Link>

          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-cyan-200">
            Olatinn Store Front
          </p>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            The right plan for your next big move.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-100 sm:text-lg">
            Start for free or unlock more ways to grow your
            business. Choose a billing period that works for you.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-slate-500">
            Loading your plans...
          </div>
        ) : (
          <>
            {subscription && (
              <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-slate-500">
                      Your latest subscription
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {subscription.plan?.name || "Store Front plan"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      Status:{" "}
                      <span className="font-semibold capitalize">
                        {subscription.status.replace("_", " ")}
                      </span>
                    </p>

                    {subscription.currentPeriodEnd && (
                      <p className="mt-1 text-sm text-slate-600">
                        Current period ends{" "}
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    )}

                    {hasPendingPayment && (
                      <p className="mt-2 text-sm font-medium text-amber-700">
                        Your payment receipt is awaiting administrator
                        review.
                      </p>
                    )}

                    {subscription.rejectionReason && (
                      <p className="mt-2 text-sm text-red-700">
                        Previous review: {subscription.rejectionReason}
                      </p>
                    )}
                  </div>

                  {hasActiveSubscription &&
                    subscription.plan?.key === "premium" && (
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={submitting}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        Request cancellation
                      </button>
                    )}
                </div>
              </div>
            )}

            <div className="mb-8 flex flex-col items-center gap-4 text-center">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Simple plans. Clear choices.
              </h2>

              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setBillingInterval("monthly")}
                  className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
                    billingInterval === "monthly"
                      ? "bg-[#000271] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Monthly
                </button>

                <button
                  type="button"
                  onClick={() => setBillingInterval("yearly")}
                  className={`rounded-lg px-5 py-3 text-sm font-semibold transition ${
                    billingInterval === "yearly"
                      ? "bg-[#000271] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Yearly
                  {yearlySavings !== null && (
                    <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                      Save {yearlySavings}%
                    </span>
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-500">
                Prices are displayed in Nigerian naira (NGN).
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {freePlan && (
                <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
                      Get started
                    </p>

                    <h3 className="mt-3 text-3xl font-extrabold">
                      {freePlan.name}
                    </h3>

                    <p className="mt-3 min-h-12 leading-6 text-slate-600">
                      {freePlan.description ||
                        "Create your first storefront and begin showcasing your products."}
                    </p>

                    <div className="mt-6">
                      <span className="text-4xl font-extrabold">
                        Free
                      </span>
                      <p className="mt-1 text-sm text-slate-500">
                        No subscription payment required
                      </p>
                    </div>
                  </div>

                  <ul className="my-8 flex-1 space-y-4 text-sm text-slate-700">
                    <li>
                      ✓{" "}
                      {freePlan.entitlements.maxStores === -1
                        ? "Unlimited stores"
                        : `${freePlan.entitlements.maxStores} store(s)`}
                    </li>

                    <li>
                      ✓{" "}
                      {freePlan.entitlements.maxProductsPerStore === -1
                        ? "Unlimited products per store"
                        : `${freePlan.entitlements.maxProductsPerStore} products per store`}
                    </li>

                    <li>
                      ✓ Themes:{" "}
                      {freePlan.entitlements.themes.join(", ")}
                    </li>

                    <li>
                      ✓{" "}
                      {freePlan.entitlements.analyticsLevel === "none"
                        ? "No analytics"
                        : `${freePlan.entitlements.analyticsLevel} analytics`}
                    </li>

                    <li>
                      {freePlan.entitlements.marketing ? "✓" : "•"}{" "}
                      Marketing features{" "}
                      {freePlan.entitlements.marketing
                        ? "included"
                        : "not included"}
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={() => {
                      if (!token) {
                        window.location.href =
                          "/signin?next=/store-front/plans";
                        return;
                      }

                      void handleFreePlan();
                    }}
                    disabled={
                      submitting ||
                      (hasActiveSubscription &&
                        subscription?.plan?.key === "free") ||
                      hasPendingPayment
                    }
                    className="w-full rounded-xl border border-slate-300 px-5 py-3.5 font-bold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {hasActiveSubscription &&
                    subscription?.plan?.key === "free"
                      ? "Your current plan"
                      : "Choose Free"}
                  </button>
                </article>
              )}

              {premiumPlan && (
                <article className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#17acdd] bg-white p-7 shadow-xl shadow-blue-950/5 sm:p-9">
                  <div className="absolute right-5 top-5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-[#000271]">
                    GROW YOUR BUSINESS
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest text-[#17acdd]">
                      More room to grow
                    </p>

                    <h3 className="mt-3 text-3xl font-extrabold">
                      {premiumPlan.name}
                    </h3>

                    <p className="mt-3 min-h-12 leading-6 text-slate-600">
                      {premiumPlan.description ||
                        "Unlock more storefront capacity and premium business tools."}
                    </p>

                    <div className="mt-6">
                      <span className="text-4xl font-extrabold">
                        {formatNaira(premiumPrice)}
                      </span>

                      <span className="ml-2 text-sm text-slate-500">
                        / {billingInterval === "monthly" ? "month" : "year"}
                      </span>

                      {billingInterval === "yearly" &&
                        yearlySavings !== null && (
                          <p className="mt-2 text-sm font-semibold text-green-700">
                            Save {yearlySavings}% compared with monthly
                            billing.
                          </p>
                        )}
                    </div>
                  </div>

                  <ul className="my-8 flex-1 space-y-4 text-sm text-slate-700">
                    <li>
                      ✓{" "}
                      {premiumPlan.entitlements.maxStores === -1
                        ? "Unlimited stores"
                        : `${premiumPlan.entitlements.maxStores} stores`}
                    </li>

                    <li>
                      ✓{" "}
                      {premiumPlan.entitlements.maxProductsPerStore === -1
                        ? "Unlimited products per store"
                        : `${premiumPlan.entitlements.maxProductsPerStore} products per store`}
                    </li>

                    <li>
                      ✓ Themes:{" "}
                      {premiumPlan.entitlements.themes.join(", ")}
                    </li>

                    <li>
                      ✓{" "}
                      {premiumPlan.entitlements.analyticsLevel} analytics
                    </li>

                    <li>
                      {premiumPlan.entitlements.marketing ? "✓" : "•"}{" "}
                      Marketing features{" "}
                      {premiumPlan.entitlements.marketing
                        ? "included"
                        : "not included"}
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={openPremiumForm}
                    disabled={submitting || hasPendingPayment}
                    className="w-full rounded-xl bg-[#000271] px-5 py-3.5 font-bold text-white transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {hasPendingPayment
                      ? "Payment under review"
                      : "Continue with Premium"}
                  </button>
                </article>
              )}
            </div>

            {selectedPlan && (
              <section
                id="payment-form"
                className="mt-12 scroll-mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"
              >
                <div className="max-w-2xl">
                  <p className="text-sm font-bold uppercase tracking-widest text-[#17acdd]">
                    Manual bank transfer
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold">
                    Complete your Premium subscription
                  </h2>

                  <p className="mt-3 leading-6 text-slate-600">
                    Transfer{" "}
                    <strong>{formatNaira(premiumPrice)}</strong>{" "}
                    for {billingInterval} billing to the account below.
                    Then upload your receipt. Premium access begins only
                    after an administrator approves the payment.
                  </p>
                </div>

                {bankDetails ? (
                  <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Bank
                      </p>
                      <p className="mt-1 font-bold">
                        {bankDetails.bankName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Account name
                      </p>
                      <p className="mt-1 font-bold">
                        {bankDetails.accountName}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Account number
                      </p>
                      <p className="mt-1 font-bold">
                        {bankDetails.accountNumber}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    Bank transfer details are not configured yet.
                    Please contact Olatinn before transferring money.
                  </p>
                )}

                <form
                  onSubmit={handleReceiptSubmit}
                  className="mt-7 max-w-2xl space-y-5"
                >
                  <div>
                    <label
                      htmlFor="paymentReference"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Bank transfer reference
                    </label>

                    <input
                      id="paymentReference"
                      type="text"
                      value={paymentReference}
                      onChange={(event) =>
                        setPaymentReference(event.target.value)
                      }
                      required
                      maxLength={150}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                      placeholder="Enter your transfer reference"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="receipt"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Payment receipt
                    </label>

                    <input
                      id="receipt"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      required
                      onChange={(event) =>
                        setReceipt(event.target.files?.[0] || null)
                      }
                      className="block w-full rounded-xl border border-slate-300 p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:font-semibold"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG or PDF, maximum 5 MB.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={
                        submitting ||
                        !receipt ||
                        !bankDetails
                      }
                      className="rounded-xl bg-[#000271] px-6 py-3.5 font-bold text-white transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting
                        ? "Submitting..."
                        : "Submit payment receipt"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPlan(null)}
                      className="rounded-xl border border-slate-300 px-6 py-3.5 font-semibold transition hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </section>
            )}
          </>
        )}
      </section>
    </main>
  );
}