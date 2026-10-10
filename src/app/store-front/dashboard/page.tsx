"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

const STORES_URL = API_URL ? `${API_URL}/stores` : "";

type StoreTheme = "modern" | "minimal" | "boutique";

interface Store {
  _id: string;
  businessName: string;
  storeName: string;
  slug: string;
  category: string;
  description?: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: StoreTheme;
  status?: "draft" | "published" | string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Entitlements {
  maxStores?: number;
  maxProductsPerStore?: number;
  themes?: StoreTheme[];
  analyticsLevel?: string;
  marketing?: boolean;
}

interface Plan {
  key?: string;
  name?: string;
  maxStores?: number;
}

interface StoreResponse {
  success?: boolean;
  message?: string;
  store?: Store;
  stores?: Store[];
  count?: number;
  plan?: Plan;
  entitlements?: Entitlements;
}

interface EditForm {
  businessName: string;
  storeName: string;
  slug: string;
  category: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  theme: StoreTheme;
}

const EMPTY_FORM: EditForm = {
  businessName: "",
  storeName: "",
  slug: "",
  category: "",
  description: "",
  logoUrl: "",
  primaryColor: "#000271",
  secondaryColor: "#17acdd",
  theme: "modern",
};

const THEME_DETAILS: Record<
  StoreTheme,
  {
    name: string;
    description: string;
    background: string;
    text: string;
  }
> = {
  modern: {
    name: "Modern",
    description: "Clean layouts and contemporary styling.",
    background: "#000271",
    text: "#ffffff",
  },
  minimal: {
    name: "Minimal",
    description: "A simple, elegant shopping experience.",
    background: "#f4f6fb",
    text: "#111827",
  },
  boutique: {
    name: "Boutique",
    description: "A premium look for distinctive brands.",
    background: "#f5eee5",
    text: "#402d24",
  },
};

function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("olatinnToken");
}

function getStoreStatus(store: Store): "published" | "draft" {
  return store.status === "published" ? "published" : "draft";
}

function formatDate(date?: string): string {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getThemeStyle(theme: StoreTheme) {
  return THEME_DETAILS[theme] || THEME_DETAILS.modern;
}

export default function StoreFrontDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");

  const [planName, setPlanName] = useState("Current plan");
  const [maxStores, setMaxStores] = useState<number | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements>({});

  const [busyStoreId, setBusyStoreId] = useState<string | null>(null);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(
    null
  );

  const [editingStoreId, setEditingStoreId] = useState<string | null>(
    null
  );
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [savingEdit, setSavingEdit] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publishedCount = stores.filter(
    (store) => getStoreStatus(store) === "published"
  ).length;

  const draftCount = stores.length - publishedCount;

  const remainingStores =
    maxStores === null || maxStores === -1
      ? null
      : Math.max(0, maxStores - stores.length);

  const canCreateStore =
    maxStores === null ||
    maxStores === -1 ||
    stores.length < maxStores;

  const loadStores = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const token = getToken();

      if (!token) {
        setPageError(
          "Your session has expired or you are not signed in. Please sign in to manage your stores."
        );
        setStores([]);
        return;
      }

      if (!STORES_URL) {
        setPageError(
          "The API URL is missing. Please configure NEXT_PUBLIC_API_URL in your environment variables."
        );
        return;
      }

      const response = await fetch(STORES_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data: StoreResponse = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to load your stores."
        );
      }

      setStores(Array.isArray(data.stores) ? data.stores : []);

      if (data.plan?.name) {
        setPlanName(data.plan.name);
      } else if (data.plan?.key) {
        setPlanName(data.plan.key);
      }

      if (typeof data.entitlements?.maxStores === "number") {
        setMaxStores(data.entitlements.maxStores);
      } else if (typeof data.plan?.maxStores === "number") {
        setMaxStores(data.plan.maxStores);
      } else {
        setMaxStores(null);
      }

      setEntitlements(data.entitlements || {});
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading your stores."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  const handleEditClick = (store: Store) => {
    setNotice("");
    setPageError("");

    setEditingStoreId(store._id);

    setEditForm({
      businessName: store.businessName || "",
      storeName: store.storeName || "",
      slug: store.slug || "",
      category: store.category || "",
      description: store.description || "",
      logoUrl: store.logoUrl || "",
      primaryColor: store.primaryColor || "#000271",
      secondaryColor: store.secondaryColor || "#17acdd",
      theme: store.theme || "modern",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleEditChange = (
    field: keyof EditForm,
    value: string
  ) => {
    setEditForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCancelEdit = () => {
    setEditingStoreId(null);
    setEditForm(EMPTY_FORM);
  };

  const handleSaveStore = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingStoreId) {
      return;
    }

    const token = getToken();

    if (!token) {
      setPageError("Please sign in again to update your store.");
      return;
    }

    if (
      !editForm.businessName.trim() ||
      !editForm.storeName.trim() ||
      !editForm.category.trim()
    ) {
      setPageError(
        "Business name, store name, and category are required."
      );
      return;
    }

    setSavingEdit(true);
    setPageError("");
    setNotice("");

    try {
      const response = await fetch(
        `${STORES_URL}/${encodeURIComponent(editingStoreId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessName: editForm.businessName.trim(),
            storeName: editForm.storeName.trim(),
            slug: editForm.slug.trim(),
            category: editForm.category.trim(),
            description: editForm.description.trim(),
            logoUrl: editForm.logoUrl.trim(),
            primaryColor: editForm.primaryColor,
            secondaryColor: editForm.secondaryColor,
            theme: editForm.theme,
          }),
        }
      );

      const data: StoreResponse = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to update this store."
        );
      }

      setNotice(data.message || "Store details updated successfully.");
      setEditingStoreId(null);
      setEditForm(EMPTY_FORM);

      await loadStores();
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating your store."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTogglePublish = async (store: Store) => {
    const token = getToken();

    if (!token) {
      setPageError("Please sign in again to manage your store.");
      return;
    }

    const currentlyPublished = getStoreStatus(store) === "published";

    const endpoint = currentlyPublished
      ? `${STORES_URL}/${encodeURIComponent(store._id)}/unpublish`
      : `${STORES_URL}/${encodeURIComponent(store._id)}/publish`;

    setBusyStoreId(store._id);
    setPageError("");
    setNotice("");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data: StoreResponse = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            `Unable to ${
              currentlyPublished ? "unpublish" : "publish"
            } this store.`
        );
      }

      setNotice(
        data.message ||
          (currentlyPublished
            ? "Your store has been unpublished."
            : "Your store has been published.")
      );

      await loadStores();
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Something went wrong while changing the store status."
      );
    } finally {
      setBusyStoreId(null);
    }
  };

  const handleDeleteStore = async (store: Store) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${store.storeName}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const token = getToken();

    if (!token) {
      setPageError("Please sign in again to delete your store.");
      return;
    }

    setDeletingStoreId(store._id);
    setPageError("");
    setNotice("");

    try {
      const response = await fetch(
        `${STORES_URL}/${encodeURIComponent(store._id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data: StoreResponse = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to delete this store."
        );
      }

      if (editingStoreId === store._id) {
        handleCancelEdit();
      }

      setNotice(data.message || "Store deleted successfully.");

      await loadStores();
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "Something went wrong while deleting your store."
      );
    } finally {
      setDeletingStoreId(null);
    }
  };

  const handleCopyStoreLink = async (store: Store) => {
    const storeUrl = `${window.location.origin}/store/${encodeURIComponent(
      store.slug
    )}`;

    try {
      await navigator.clipboard.writeText(storeUrl);
      setNotice("Store link copied to your clipboard.");
      setPageError("");
    } catch {
      setNotice(`Your store link: ${storeUrl}`);
      setPageError("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("olatinnToken");
    window.location.href = "/signin";
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/store-front"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#000271] text-xl font-bold text-white">
              O
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight text-[#000271]">
                Olatinn
              </p>
              <p className="text-xs font-medium text-slate-500">
                Store Front
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/store-front"
              className="text-sm font-medium text-slate-600 transition hover:text-[#17acdd]"
            >
              Store Front Home
            </Link>

            <Link
              href="/store-front/setup"
              className="text-sm font-medium text-slate-600 transition hover:text-[#17acdd]"
            >
              Create a Store
            </Link>

            <Link
              href="/store-front/plans"
              className="text-sm font-medium text-slate-600 transition hover:text-[#17acdd]"
            >
              Plans
            </Link>

            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 transition hover:text-[#17acdd]"
            >
              Main Dashboard
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Sign out
            </button>
          </nav>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-2xl text-[#000271] md:hidden"
          >
            {mobileMenuOpen ? "×" : "☰"}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4">
              <Link
                href="/store-front"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                Store Front Home
              </Link>

              <Link
                href="/store-front/setup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                Create a Store
              </Link>

              <Link
                href="/store-front/plans"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                Plans
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                Main Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-semibold text-red-600"
              >
                Sign out
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Heading */}
        <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#000271]">
              <span className="h-2 w-2 rounded-full bg-[#17acdd]" />
              Merchant workspace
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#000271] sm:text-4xl">
              Your Store Front Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Manage your storefronts, update their appearance, publish
              your stores, and keep track of your merchant account.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/store-front/plans"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#000271] transition hover:border-[#17acdd] hover:bg-cyan-50"
            >
              View Plans
            </Link>

            <Link
              href="/store-front/setup"
              className={`inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition ${
                canCreateStore
                  ? "bg-[#000271] hover:bg-[#17acdd]"
                  : "cursor-not-allowed bg-slate-400"
              }`}
              onClick={(event) => {
                if (!canCreateStore) {
                  event.preventDefault();
                  setNotice(
                    `Your ${planName} plan has reached its store limit. Upgrade your plan to create another store.`
                  );
                }
              }}
              aria-disabled={!canCreateStore}
            >
              + Create a Store
            </Link>
          </div>
        </section>

        {/* Alerts */}
        {pageError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <span className="text-lg">!</span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">Something needs your attention</p>
              <p className="mt-1 break-words">{pageError}</p>
              <button
                type="button"
                onClick={() => void loadStores()}
                className="mt-3 font-bold underline underline-offset-4"
              >
                Try again
              </button>
            </div>

            <button
              type="button"
              onClick={() => setPageError("")}
              aria-label="Dismiss error"
              className="text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 flex items-start justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-[#000271]"
          >
            <p>{notice}</p>

            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
              className="font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Plan summary */}
        <section className="mb-8 overflow-hidden rounded-3xl bg-[#000271] text-white shadow-sm">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.5fr_1fr] lg:items-center">
            <div>
              <p className="text-sm font-medium text-cyan-200">
                Your merchant subscription
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold">
                  {planName}
                </h2>

                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
                  Current plan
                </span>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
                Your subscription determines how many stores you can
                create and which themes and features are available.
                Your existing stores remain yours to manage.
              </p>

              <Link
                href="/store-front/plans"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200 transition hover:text-white"
              >
                Explore subscription options
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-200">
                  Store capacity
                </span>

                <span className="text-sm font-bold">
                  {maxStores === -1
                    ? "Unlimited"
                    : maxStores === null
                      ? `${stores.length} created`
                      : `${stores.length} / ${maxStores}`}
                </span>
              </div>

              {maxStores !== null && maxStores !== -1 && (
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-white/20"
                  role="progressbar"
                  aria-label="Store capacity used"
                  aria-valuemin={0}
                  aria-valuemax={Math.max(maxStores, 1)}
                  aria-valuenow={Math.min(stores.length, maxStores)}
                >
                  <div
                    className="h-full rounded-full bg-[#17acdd] transition-all"
                    style={{
                      width: `${
                        maxStores > 0
                          ? Math.min(
                              (stores.length / maxStores) * 100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              )}

              <p className="mt-3 text-sm text-slate-200">
                {remainingStores === null
                  ? "Your plan has unlimited store capacity, or the limit has not been supplied by the server."
                  : remainingStores > 0
                    ? `${remainingStores} ${
                        remainingStores === 1 ? "store" : "stores"
                      } remaining on your current plan.`
                    : "You have reached your current store limit."}
              </p>
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Total stores
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                🏬
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#000271]">
              {loading ? "..." : stores.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Stores in your account
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Published
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                ✓
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-emerald-600">
              {loading ? "..." : publishedCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Live storefronts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Drafts
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-xl">
                ✎
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-600">
              {loading ? "..." : draftCount}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Stores not currently published
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Product allowance
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-xl">
                📦
              </span>
            </div>
            <p className="mt-4 text-3xl font-extrabold text-[#000271]">
              {typeof entitlements.maxProductsPerStore === "number"
                ? entitlements.maxProductsPerStore === -1
                  ? "∞"
                  : entitlements.maxProductsPerStore
                : "—"}
            </p>

            
            <p className="mt-1 text-xs text-slate-500">
              Products per store
            </p>
          </div>
        </section>

        {/* Edit form */}
        {editingStoreId && (
          <section
            id="edit-store-form"
            className="mb-8 rounded-3xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#17acdd]">
                  Store settings
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-[#000271]">
                  Edit your store
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Update your business details and storefront appearance.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="self-start rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:self-auto"
              >
                Cancel editing
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="businessName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Business name *
                  </label>

                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    maxLength={120}
                    value={editForm.businessName}
                    onChange={(event) =>
                      handleEditChange(
                        "businessName",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                    placeholder="e.g. Olatinn Fashion House"
                  />
                </div>

                <div>
                  <label
                    htmlFor="storeName"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Store name *
                  </label>

                  <input
                    id="storeName"
                    name="storeName"
                    type="text"
                    required
                    maxLength={120}
                    value={editForm.storeName}
                    onChange={(event) =>
                      handleEditChange(
                        "storeName",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                    placeholder="Your storefront name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="slug"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Store URL slug
                  </label>

                  <input
                    id="slug"
                    name="slug"
                    type="text"
                    maxLength={100}
                    value={editForm.slug}
                    onChange={(event) =>
                      handleEditChange("slug", event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                    placeholder="my-store"
                  />

                  <p className="mt-2 break-all text-xs text-slate-500">
                    Your store address will use this slug.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Business category *
                  </label>

                  <input
                    id="category"
                    name="category"
                    type="text"
                    required
                    maxLength={80}
                    value={editForm.category}
                    onChange={(event) =>
                      handleEditChange(
                        "category",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                    placeholder="Fashion, electronics, beauty..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Store description
                  </label>

                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    maxLength={2000}
                    value={editForm.description}
                    onChange={(event) =>
                      handleEditChange(
                        "description",
                        event.target.value
                      )
                    }
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                    placeholder="Tell customers about your business and what makes your store special."
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="logoUrl"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Store logo URL
                  </label>

                  <input
                    id="logoUrl"
                    name="logoUrl"
                    type="url"
                    value={editForm.logoUrl}
                    onChange={(event) =>
                      handleEditChange(
                        "logoUrl",
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                    placeholder="https://example.com/logo.png"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Enter an image URL. This field does not upload a
                    file to Cloudinary.
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-lg font-bold text-[#000271]">
                  Store appearance
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Choose a theme and customize your brand colors.
                  Your subscription determines which themes you can use.
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {(
                    ["modern", "minimal", "boutique"] as StoreTheme[]
                  ).map((theme) => {
                    const details = getThemeStyle(theme);
                    const allowedThemes = entitlements.themes;
                    const isAllowed =
                      !allowedThemes ||
                      allowedThemes.length === 0 ||
                      allowedThemes.includes(theme);

                    return (
                      <label
                        key={theme}
                        className={`cursor-pointer overflow-hidden rounded-2xl border-2 transition ${
                          editForm.theme === theme
                            ? "border-[#17acdd] ring-2 ring-cyan-100"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={theme}
                          checked={editForm.theme === theme}
                          onChange={() =>
                            handleEditChange("theme", theme)
                          }
                          className="sr-only"
                        />

                        <div
                          className="flex h-24 items-center justify-center"
                          style={{
                            backgroundColor: details.background,
                            color: details.text,
                          }}
                        >
                          <div className="text-center">
                            <div className="text-lg font-extrabold">
                              {editForm.storeName || "Your Store"}
                            </div>
                            <div className="mt-1 text-xs opacity-75">
                              Shop the collection
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold capitalize text-slate-800">
                              {details.name}
                            </span>

                            {editForm.theme === theme && (
                              <span className="text-sm font-bold text-[#17acdd]">
                                Selected
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {details.description}
                          </p>

                          {!isAllowed && (
                            <p className="mt-2 text-xs font-semibold text-amber-700">
                              May require a plan upgrade
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="primaryColor"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Primary brand color
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        id="primaryColor"
                        name="primaryColor"
                        type="color"
                        value={editForm.primaryColor}
                        onChange={(event) =>
                          handleEditChange(
                            "primaryColor",
                            event.target.value
                          )
                        }
                        className="h-12 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                      />

                      <input
                        type="text"
                        aria-label="Primary brand color hex value"
                        value={editForm.primaryColor}
                        maxLength={7}
                        pattern="^#[0-9A-Fa-f]{6}$"
                        onChange={(event) =>
                          handleEditChange(
                            "primaryColor",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-[#17acdd]"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="secondaryColor"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Secondary brand color
                    </label>

                    <div className="flex items-center gap-3">
                      <input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="color"
                        value={editForm.secondaryColor}
                        onChange={(event) =>
                          handleEditChange(
                            "secondaryColor",
                            event.target.value
                          )
                        }
                        className="h-12 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                      />

                      <input
                        type="text"
                        aria-label="Secondary brand color hex value"
                        value={editForm.secondaryColor}
                        maxLength={7}
                        pattern="^#[0-9A-Fa-f]{6}$"
                        onChange={(event) =>
                          handleEditChange(
                            "secondaryColor",
                            event.target.value
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-[#17acdd]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center justify-center rounded-xl bg-[#000271] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingEdit ? "Saving changes..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={savingEdit}
                  className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Store list heading */}
        <section className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-[#000271]">
              My Stores
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage every storefront associated with your account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadStores()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#17acdd] hover:text-[#000271] disabled:opacity-50 sm:self-auto"
          >
            <span aria-hidden="true">↻</span>
            {loading ? "Refreshing..." : "Refresh stores"}
          </button>
        </section>

        {/* Loading state */}
        {loading && stores.length === 0 && (
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white"
              >
                <div className="h-36 bg-slate-200" />
                <div className="space-y-4 p-5">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-10 rounded-xl bg-slate-100" />
                  <div className="h-10 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Empty state */}
        {!loading && !pageError && stores.length === 0 && (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:px-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
              🏬
            </div>

            <h3 className="mt-6 text-2xl font-extrabold text-[#000271]">
              Your storefront journey starts here
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              You have not created a store yet. Set up your first
              storefront, customize its appearance, and publish it when
              you are ready to welcome customers.
            </p>

            <Link
              href="/store-front/setup"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#000271] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#17acdd]"
            >
              Create Your First Store
            </Link>

            <p className="mt-4 text-xs text-slate-400">
              Your available store capacity depends on your current plan.
            </p>
          </section>
        )}

        {/* Store cards */}
        {!loading && stores.length > 0 && (
          <section className="grid items-start gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => {
              const theme = getThemeStyle(
                store.theme || "modern"
              );

              const isPublished =
                getStoreStatus(store) === "published";

              const isBusy = busyStoreId === store._id;
              const isDeleting =
                deletingStoreId === store._id;

              const storeUrl = `/store/${encodeURIComponent(
                store.slug
              )}`;

              return (
                <article
                  key={store._id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Store preview */}
                  <div
                    className="relative flex h-40 items-center justify-center overflow-hidden p-6"
                    style={{
                      backgroundColor:
                        store.primaryColor || theme.background,
                      color: "#ffffff",
                    }}
                  >
                    <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full border border-white/15" />
                    <div className="absolute -bottom-16 -left-8 h-40 w-40 rounded-full border border-white/15" />

                    <div className="relative z-10 w-full text-center">
                      {store.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={store.logoUrl}
                          alt={`${store.storeName} logo`}
                          className="mx-auto mb-3 h-12 max-w-40 rounded-lg bg-white/95 object-contain p-1.5"
                        />
                      ) : (
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 text-xl font-extrabold">
                          {(store.storeName || "S")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <h3 className="break-words text-xl font-extrabold">
                        {store.storeName}
                      </h3>

                      <p className="mt-1 text-xs text-white/80">
                        {store.category}
                      </p>
                    </div>

                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${
                        isPublished
                          ? "bg-emerald-400 text-emerald-950"
                          : "bg-white/90 text-slate-700"
                      }`}
                    >
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  {/* Store details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {store.businessName}
                        </p>

                        <h3 className="mt-1 break-words text-lg font-extrabold text-[#000271]">
                          {store.storeName}
                        </h3>
                      </div>

                      <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                        {store.theme || "modern"}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-slate-500">
                      {store.description ||
                        "Add a description to tell customers about your store."}
                    </p>

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500">
                          Store URL slug
                        </span>
                        <span className="max-w-[65%] break-all text-right font-semibold text-slate-700">
                          /store/{store.slug}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-slate-500">
                          Created
                        </span>
                        <span className="font-semibold text-slate-700">
                          {formatDate(store.createdAt)}
                        </span>
                      </div>

                      {isPublished && store.publishedAt && (
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-slate-500">
                            Published
                          </span>
                          <span className="font-semibold text-slate-700">
                            {formatDate(store.publishedAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Main actions */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => handleEditClick(store)}
                        disabled={isBusy || isDeleting}
                        className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-bold text-[#000271] transition hover:border-[#17acdd] hover:bg-cyan-50 disabled:opacity-50"
                      >
                        Edit Store
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleTogglePublish(store)}
                        disabled={isBusy || isDeleting}
                        className={`rounded-xl px-3 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isPublished
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-emerald-600 hover:bg-emerald-700"
                        }`}
                      >
                        {isBusy
                          ? "Please wait..."
                          : isPublished
                            ? "Unpublish"
                            : "Publish"}
                      </button>
                    </div>

                    {/* Secondary actions */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {isPublished && (
                        <Link
                          href={storeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-xl bg-cyan-50 px-3 py-2.5 text-center text-xs font-bold text-[#000271] transition hover:bg-cyan-100"
                        >
                          View Store ↗
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => void handleCopyStoreLink(store)}
                        className="flex-1 rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Copy Store Link
                      </button>
                    </div>

                    {/* Product management */}
<div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-bold text-[#000271]">
        Product Management
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        Add products, manage prices and stock, and control
        which products appear in your storefront.
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      <Link
        href={`/store-front/products?storeId=${encodeURIComponent(store._id)}`}
        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#000271] transition hover:border-[#17acdd] hover:bg-cyan-50"
      >
        Manage Products
      </Link>

      <Link
        href={`/store-front/products/new?storeId=${encodeURIComponent(store._id)}`}
        className="inline-flex items-center justify-center rounded-xl bg-[#000271] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#17acdd]"
      >
        + Add Product
      </Link>
    </div>
  </div>
</div>

                    

                    {/* Delete */}
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => void handleDeleteStore(store)}
                        disabled={isBusy || isDeleting}
                        className="w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting
                          ? "Deleting store..."
                          : "Delete Store"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Subscription feature information */}
        {!loading && stores.length > 0 && (
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-extrabold text-[#000271]">
                  Get more from your storefronts
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Your current plan controls your store capacity, product
                  allowance, available themes, analytics, and marketing
                  features. Review your plan to see which features are
                  available to your account.
                </p>

                {entitlements.themes &&
                  entitlements.themes.length > 0 && (
                    <p className="mt-3 text-xs text-slate-500">
                      Available themes:{" "}
                      <span className="font-semibold capitalize text-slate-700">
                        {entitlements.themes.join(", ")}
                      </span>
                    </p>
                  )}

                {entitlements.analyticsLevel && (
                  <p className="mt-2 text-xs text-slate-500">
                    Analytics level:{" "}
                    <span className="font-semibold capitalize text-slate-700">
                      {entitlements.analyticsLevel}
                    </span>
                  </p>
                )}
              </div>

              <Link
                href="/store-front/plans"
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#000271] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17acdd]"
              >
                Compare Plans
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-slate-200 py-6">
          <div className="flex flex-col justify-between gap-3 text-xs text-slate-500 sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} Olatinn. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/dashboard"
                className="transition hover:text-[#17acdd]"
              >
                Main Dashboard
              </Link>

              <Link
                href="/store-front"
                className="transition hover:text-[#17acdd]"
              >
                Store Front
              </Link>

              <Link
                href="/store-front/plans"
                className="transition hover:text-[#17acdd]"
              >
                Subscription Plans
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}