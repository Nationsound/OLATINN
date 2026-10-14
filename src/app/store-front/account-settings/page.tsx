
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type PaymentSettingsData = {
  accountHolderName: string;
  accountType: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  routingDetails: string;
  bankTransferEnabled: boolean;
  customerInstructions: string;
  paymentCurrency: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  store?: {
    _id?: string;
    storeName?: string;
    businessName?: string;
  };
  paymentSettings?: Partial<PaymentSettingsData>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const STORES_URL = API_BASE ? `${API_BASE}/stores` : "";

const initialSettings: PaymentSettingsData = {
  accountHolderName: "",
  accountType: "",
  bankName: "",
  accountNumber: "",
  branchCode: "",
  routingDetails: "",
  bankTransferEnabled: false,
  customerInstructions: "",
  paymentCurrency: "USD",
};

export default function StoreAccountSettingsPage() {
  const router = useRouter();

  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("Your Store");
  const [settings, setSettings] =
    useState<PaymentSettingsData>(initialSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      router.replace(
        `/signin?next=${encodeURIComponent(
          "/store-front/account-settings"
        )}`
      );
      return;
    }

    if (!STORES_URL) {
      setError(
        "The API URL is not configured. Check NEXT_PUBLIC_API_URL."
      );
      setLoading(false);
      return;
    }

    try {
      // First retrieve the merchant's existing store.
      const storeResponse = await fetch(`${STORES_URL}/my-store`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const storeData = (await storeResponse
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (storeResponse.status === 401 || storeResponse.status === 403) {
        setError(
          storeData.message ||
            "Your session has expired. Please sign in again."
        );
        setLoading(false);
        return;
      }

      if (!storeResponse.ok) {
        throw new Error(
          storeData.message ||
            (storeResponse.status === 404
              ? "No store was found for your account. Create your store first."
              : "Unable to retrieve your store.")
        );
      }

      const store = storeData.store;

      if (!store?._id) {
        throw new Error(
          "The store response did not include a store ID. Check the response from GET /stores/my-store."
        );
      }

      setStoreId(store._id);
      setStoreName(store.storeName || store.businessName || "Your Store");

      // Load saved payment settings for this store.
      const settingsResponse = await fetch(
        `${STORES_URL}/${encodeURIComponent(
          store._id
        )}/payment-settings`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const settingsData = (await settingsResponse
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (
        settingsResponse.status === 401 ||
        settingsResponse.status === 403
      ) {
        throw new Error(
          settingsData.message ||
            "You are not authorized to access these payment settings."
        );
      }

      if (!settingsResponse.ok) {
        throw new Error(
          settingsData.message || "Unable to load payment settings."
        );
      }

      setSettings({
        ...initialSettings,
        ...(settingsData.paymentSettings || {}),
      });
    } catch (err) {
      console.error("Load payment settings error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading payment settings."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const updateField = <K extends keyof PaymentSettingsData>(
    field: K,
    value: PaymentSettingsData[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
    setNotice("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      router.replace(
        `/signin?next=${encodeURIComponent(
          "/store-front/account-settings"
        )}`
      );
      return;
    }

    if (!STORES_URL || !storeId) {
      setError("Your store could not be identified. Please reload the page.");
      return;
    }

    if (
      settings.bankTransferEnabled &&
      (!settings.accountHolderName.trim() || !settings.bankName.trim())
    ) {
      setError(
        "Enter the account holder name and bank name before enabling bank transfers."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${STORES_URL}/${encodeURIComponent(storeId)}/payment-settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            paymentSettings: {
              accountHolderName: settings.accountHolderName.trim(),
              accountType: settings.accountType,
              bankName: settings.bankName.trim(),
              accountNumber: settings.accountNumber.trim(),
              branchCode: settings.branchCode.trim(),
              routingDetails: settings.routingDetails.trim(),
              bankTransferEnabled: settings.bankTransferEnabled,
              customerInstructions: settings.customerInstructions.trim(),
              paymentCurrency: settings.paymentCurrency,
            },
          }),
        }
      );

      const data = (await response
        .json()
        .catch(() => ({}))) as ApiResponse;

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            data.message ||
              "Your session could not be verified. Please sign in again."
          );
        }

        throw new Error(
          data.message || "Unable to save your payment settings."
        );
      }

      if (data.paymentSettings) {
        setSettings((current) => ({
          ...current,
          ...data.paymentSettings,
        }));
      }

      setNotice("Your payment settings have been saved successfully.");
    } catch (err) {
      console.error("Save payment settings error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save payment settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#17acdd]" />
          <p className="font-semibold text-slate-700">
            Loading payment settings...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/store-front/dashboard")}
            className="flex items-center gap-3 text-left"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#000271] text-xl font-black text-white">
              O
            </span>
            <span>
              <span className="block font-extrabold tracking-tight text-[#000271]">
                OLATINN
              </span>
              <span className="block text-xs font-medium text-slate-500">
                STORE FRONT
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/store-front/dashboard")}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#17acdd] hover:text-[#000271]"
          >
            Back to dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#17acdd]">
            MERCHANT SETTINGS
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#000271] sm:text-4xl">
            Payment settings
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Configure how customers can pay for orders placed with{" "}
            <span className="font-semibold text-slate-800">{storeName}</span>.
            These settings are saved for this store.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadSettings()}
              className="ml-2 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
          >
            {notice}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-5 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-[#000271]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-6 w-6"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 10h18M7 15h4" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Bank transfer details
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Provide the details customers need to transfer payments to
                  your business.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="accountHolderName"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Account holder name
                </label>
                <input
                  id="accountHolderName"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={settings.accountHolderName}
                  onChange={(event) =>
                    updateField("accountHolderName", event.target.value)
                  }
                  placeholder="Name registered to the account"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />
              </div>

              <div>
                <label
                  htmlFor="bankName"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Bank name
                </label>
                <input
                  id="bankName"
                  type="text"
                  maxLength={100}
                  value={settings.bankName}
                  onChange={(event) =>
                    updateField("bankName", event.target.value)
                  }
                  placeholder="e.g. your bank's name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />
              </div>

              <div>
                <label
                  htmlFor="accountNumber"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Account number <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="accountNumber"
                  type="text"
                  maxLength={50}
                  value={settings.accountNumber}
                  onChange={(event) =>
                    updateField("accountNumber", event.target.value)
                  }
                  placeholder="e.g. 1234567890"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />
              </div>

              <div>
                <label
                  htmlFor="branchCode"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Branch code <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="branchCode"
                  type="text"
                  maxLength={50}
                  value={settings.branchCode}
                  onChange={(event) =>
                    updateField("branchCode", event.target.value)
                  }
                  placeholder="e.g. 0001"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />
              </div>

              <div>
                <label
                  htmlFor="routingDetails"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Routing details <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  id="routingDetails"
                  type="text"
                  maxLength={120}
                  value={settings.routingDetails}
                  onChange={(event) =>
                    updateField("routingDetails", event.target.value)
                  }
                  placeholder="e.g. Swift code / IBAN / sort code"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
                />
              </div>

              <div>
                <label
                  htmlFor="accountType"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Account type
                </label>
                <select
                  id="accountType"
                  value={settings.accountType}
                  onChange={(event) =>
                    updateField("accountType", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
                >
                  <option value="">Select account type</option>
                  <option value="savings">Savings</option>
                  <option value="current">Current / Checking</option>
                  <option value="business">Business</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="paymentCurrency"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Payment currency
                </label>
                <select
                  id="paymentCurrency"
                  value={settings.paymentCurrency}
                  onChange={(event) =>
                    updateField("paymentCurrency", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="NGN">NGN — Nigerian Naira</option>
                  <option value="ZAR">ZAR — South African Rand</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="EUR">EUR — Euro</option>
                </select>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              Only enter banking information you intend to share with customers
              for payment. Avoid displaying private account details anywhere
              other than the intended checkout flow.
            </p>
          </div>

          <div className="border-b border-slate-100 p-5 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-slate-900">
                  Accept bank transfers
                </h2>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  Allow customers to select bank transfer as a payment method
                  when placing an order.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.bankTransferEnabled}
                onClick={() =>
                  updateField(
                    "bankTransferEnabled",
                    !settings.bankTransferEnabled
                  )
                }
                className={`relative mt-1 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
                  settings.bankTransferEnabled
                    ? "bg-[#17acdd]"
                    : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    settings.bankTransferEnabled
                      ? "translate-x-6"
                      : "translate-x-1"
                  }`}
                />
                <span className="sr-only">
                  {settings.bankTransferEnabled
                    ? "Disable bank transfers"
                    : "Enable bank transfers"}
                </span>
              </button>
            </div>

            <div
              className={`mt-4 rounded-xl p-4 text-sm ${
                settings.bankTransferEnabled
                  ? "border border-green-200 bg-green-50 text-green-800"
                  : "border border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <span className="font-semibold">
                {settings.bankTransferEnabled ? "Enabled" : "Disabled"}
              </span>
              {" · "}
              {settings.bankTransferEnabled
                ? "Bank transfer is selected as an available payment option."
                : "Customers should not be offered bank transfer at checkout."}
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <label
              htmlFor="customerInstructions"
              className="block text-sm font-bold text-slate-800"
            >
              Instructions for customers
            </label>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Explain how customers should make the transfer and provide any
              reference they should include with their payment.
            </p>

            <textarea
              id="customerInstructions"
              value={settings.customerInstructions}
              onChange={(event) =>
                updateField("customerInstructions", event.target.value)
              }
              maxLength={1500}
              rows={5}
              placeholder="Enter your payment instructions..."
              className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {settings.customerInstructions.length}/1500 characters
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.push("/store-front/dashboard")}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !storeId}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#000271] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {saving ? "Saving settings..." : "Save payment settings"}
              </button>
            </div>
          </div>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">
          Payment settings apply to {storeName}. Remember to verify customer
          payments before marking orders as paid.
        </p>
      </section>
    </main>
  );
}