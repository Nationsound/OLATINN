"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type StoreTheme = "modern" | "minimal" | "boutique";

interface Store {
  _id: string;
  businessName: string;
  storeName: string;
  slug: string;
  category: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: StoreTheme;
  status: "draft" | "published";
  publishedAt?: string | null;
  createdAt?: string;
}

interface StoreResponse {
  success?: boolean;
  message?: string;
  store?: Store;
}

interface ThemeStyle {
  pageBackground: string;
  headerBackground: string;
  cardBackground: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  heroBackground: string;
  heroText: string;
  heroMuted: string;
  accentColor: string;
  radius: string;
  fontFamily: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";
const STORES_URL = API_URL ? `${API_URL}/stores` : "";

const getThemeStyle = (
  theme: StoreTheme,
  primaryColor: string,
  secondaryColor: string
): ThemeStyle => {
  const themes: Record<StoreTheme, ThemeStyle> = {
    modern: {
      pageBackground: "#f5f8fc",
      headerBackground: "#ffffff",
      cardBackground: "#ffffff",
      textColor: "#0f172a",
      mutedColor: "#64748b",
      borderColor: "#e2e8f0",
      heroBackground: `linear-gradient(125deg, ${primaryColor}, ${secondaryColor})`,
      heroText: "#ffffff",
      heroMuted: "#e0f2fe",
      accentColor: secondaryColor,
      radius: "1.5rem",
      fontFamily: "inherit",
    },

    minimal: {
      pageBackground: "#f8fafc",
      headerBackground: "#ffffff",
      cardBackground: "#ffffff",
      textColor: "#1e293b",
      mutedColor: "#64748b",
      borderColor: "#e2e8f0",
      heroBackground: "#ffffff",
      heroText: "#1e293b",
      heroMuted: "#64748b",
      accentColor: primaryColor,
      radius: "0.75rem",
      fontFamily: "inherit",
    },

    boutique: {
      pageBackground: "#f7efe5",
      headerBackground: "#fffaf4",
      cardBackground: "#fffaf4",
      textColor: "#3d3028",
      mutedColor: "#827166",
      borderColor: "#e7d8c8",
      heroBackground: `linear-gradient(135deg, #f0dfcc, #fffaf4)`,
      heroText: "#3d3028",
      heroMuted: "#827166",
      accentColor: secondaryColor,
      radius: "0.35rem",
      fontFamily: "Georgia, 'Times New Roman', serif",
    },
  };

  return themes[theme];
};

const formatDate = (date?: string) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function StoreFrontDashboard() {
  const router = useRouter();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem("olatinnToken")));
  }, []);

  const loadStore = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");

    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      setHasToken(false);
      setError("Please sign in to access your Store Front dashboard.");
      setLoading(false);
      return;
    }

    setHasToken(true);

    if (!STORES_URL) {
      setError(
        "The API URL is not configured. Please check NEXT_PUBLIC_API_URL."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${STORES_URL}/my-store`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = (await response
        .json()
        .catch(() => ({}))) as StoreResponse;

      if (response.status === 404) {
        setStore(null);
        setLoading(false);
        return;
      }

      if (response.status === 401 || response.status === 403) {
        setError(
          data.message ||
            "Your session could not be verified. Please sign in again if it has expired."
        );
        setLoading(false);
        return;
      }

      if (!response.ok || !data.store) {
        setError(data.message || "We couldn't load your store.");
        setLoading(false);
        return;
      }

      setStore({
        ...data.store,
        theme: data.store.theme ?? "modern",
      });
    } catch (err) {
      console.error("Store dashboard loading error:", err);
      setError(
        "Unable to connect to Olatinn. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStore();
  }, [loadStore]);

  const handlePublish = async () => {
    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      setError("Please sign in before publishing your store.");
      return;
    }

    if (!store) {
      setError("Create your store before publishing it.");
      return;
    }

    if (!STORES_URL) {
      setError("The API URL is not configured.");
      return;
    }

    setPublishing(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${STORES_URL}/my-store/publish`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = (await response
        .json()
        .catch(() => ({}))) as StoreResponse;

      if (response.status === 401 || response.status === 403) {
        setError(
          data.message ||
            "Your session could not be verified. Please sign in again if it has expired."
        );
        return;
      }

      if (!response.ok) {
        setError(data.message || "We couldn't publish your store.");
        return;
      }

      if (data.store) {
        setStore({
          ...data.store,
          theme: data.store.theme ?? store.theme ?? "modern",
        });
      } else {
        await loadStore();
      }

      setNotice(data.message || "Your store has been published!");
    } catch (err) {
      console.error("Store publishing error:", err);
      setError("Unable to publish your store. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const handleSignIn = () => {
    router.push(
      `/signin?next=${encodeURIComponent("/store-front/dashboard")}`
    );
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#17acdd]" />
          <p className="mt-5 font-medium text-slate-600">
            Loading your Store Front...
          </p>
        </div>
      </main>
    );
  }

  if (!store && error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-amber-600">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            We couldn't load your dashboard
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>

          <button
            type="button"
            onClick={() => void loadStore()}
            className="mt-6 w-full rounded-xl bg-[#000271] px-5 py-3 font-semibold text-white transition hover:bg-[#17acdd]"
          >
            Try again
          </button>

          {!hasToken && (
            <button
              type="button"
              onClick={handleSignIn}
              className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </button>
          )}

          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm font-medium text-slate-500 hover:text-[#000271]"
          >
            Back to main dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#000271]">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 10h18" />
              <path d="M5 10v10h14V10" />
              <path d="m3 10 2-6h14l2 6" />
              <path d="M9 20v-6h6v6" />
            </svg>
          </div>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-[#17acdd]">
            Olatinn Store Front
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            Your store starts here.
          </h1>

          <p className="mx-auto mt-4 max-w-sm leading-7 text-slate-600">
            You haven't created a store yet. Set up your business, choose your
            store identity, and get ready to showcase your products.
          </p>

          <Link
            href="/store-front/setup"
            className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#000271] px-6 py-4 font-bold text-white transition hover:bg-[#17acdd]"
          >
            Build Your Store <span className="ml-2">→</span>
          </Link>

          <Link
            href="/dashboard"
            className="mt-5 inline-block text-sm font-semibold text-slate-500 hover:text-[#000271]"
          >
            Back to main dashboard
          </Link>
        </div>
      </main>
    );
  }

  const activeTheme: StoreTheme = store.theme ?? "modern";
  const primaryColor = store.primaryColor || "#000271";
  const secondaryColor = store.secondaryColor || "#17acdd";

  const style = getThemeStyle(
    activeTheme,
    primaryColor,
    secondaryColor
  );

  const isPublished = store.status === "published";

  const cardStyle = {
    backgroundColor: style.cardBackground,
    borderColor: style.borderColor,
    borderRadius: style.radius,
    color: style.textColor,
    fontFamily: style.fontFamily,
  };

  const primaryButtonStyle = {
    backgroundColor: primaryColor,
    color: "#ffffff",
    borderRadius: style.radius,
  };

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: style.pageBackground,
        color: style.textColor,
        fontFamily: style.fontFamily,
      }}
    >
      {/* Navigation */}
      <header
        className="border-b transition-colors duration-300"
        style={{
          backgroundColor: style.headerBackground,
          borderColor: style.borderColor,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center text-lg font-extrabold text-white"
              style={{
                backgroundColor: primaryColor,
                borderRadius: style.radius,
              }}
            >
              O
            </div>

            <div>
              <p
                className="text-lg font-extrabold tracking-tight"
                style={{ color: style.textColor }}
              >
                OLATINN
              </p>
              <p
                className="text-xs font-medium"
                style={{ color: style.mutedColor }}
              >
                Store Front
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <span
              className="hidden rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex"
              style={{
                backgroundColor: isPublished ? "#dcfce7" : "#fef3c7",
                color: isPublished ? "#166534" : "#92400e",
              }}
            >
              {isPublished ? "Published" : "Draft"}
            </span>

            <Link
              href="/dashboard"
              className="border px-4 py-2.5 text-sm font-semibold transition hover:opacity-75"
              style={{
                borderColor: style.borderColor,
                borderRadius: style.radius,
                color: style.textColor,
              }}
            >
              Main Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* Theme-aware welcome banner */}
        <section
          className="relative overflow-hidden border p-7 transition-all duration-300 sm:p-10"
          style={{
            background: style.heroBackground,
            color: style.heroText,
            borderColor: style.borderColor,
            borderRadius: style.radius,
          }}
        >
          {activeTheme === "modern" && (
            <>
              <div
                className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: secondaryColor }}
              />
              <div
                className="pointer-events-none absolute -bottom-24 right-1/3 h-52 w-52 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: "#5adfe8" }}
              />
            </>
          )}

          {activeTheme === "boutique" && (
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-2"
              style={{ backgroundColor: secondaryColor }}
            />
          )}

          <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p
                className="text-sm font-bold uppercase tracking-[0.2em]"
                style={{
                  color:
                    activeTheme === "modern"
                      ? "#cffafe"
                      : style.accentColor,
                }}
              >
                Merchant workspace
              </p>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Welcome to your Store Front
              </h1>

              <p
                className="mt-4 max-w-xl leading-7"
                style={{ color: style.heroMuted }}
              >
                Manage your business identity, monitor your store status, and
                prepare your storefront for customers, all from one place.
              </p>

              <div
                className="mt-5 inline-flex items-center gap-2 border px-3 py-2 text-xs font-bold uppercase tracking-wider"
                style={{
                  borderColor:
                    activeTheme === "modern"
                      ? "rgba(255,255,255,0.3)"
                      : style.borderColor,
                  borderRadius: style.radius,
                  color: style.heroText,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: style.accentColor }}
                />
                {activeTheme} theme
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadStore()}
                className="border px-5 py-3 text-sm font-bold transition hover:opacity-75"
                style={{
                  borderColor: style.borderColor,
                  borderRadius: style.radius,
                  color: style.heroText,
                }}
              >
                Refresh
              </button>

              <Link
                href="/store-front/setup"
                className="px-5 py-3 text-sm font-bold transition hover:opacity-80"
                style={{
                  backgroundColor: style.accentColor,
                  color: activeTheme === "minimal" ? "#ffffff" : "#ffffff",
                  borderRadius: style.radius,
                }}
              >
                Store details
              </Link>
            </div>
          </div>
        </section>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderRadius: style.radius }}
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError("")}
              className="self-start font-bold underline sm:self-auto"
            >
              Dismiss
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800"
            style={{ borderRadius: style.radius }}
          >
            {notice}
          </div>
        )}

        {/* Store overview */}
        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div
            className="border p-6 shadow-sm transition-colors duration-300 lg:col-span-2 sm:p-8"
            style={cardStyle}
          >
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border"
                style={{
                  borderColor: style.borderColor,
                  borderRadius: style.radius,
                  backgroundColor: style.pageBackground,
                }}
              >
                {store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={store.logoUrl}
                    alt={`${store.storeName} logo`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span
                    className="text-3xl font-extrabold"
                    style={{ color: primaryColor }}
                  >
                    {store.storeName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="break-words text-2xl font-extrabold">
                    {store.storeName}
                  </h2>

                  <span
                    className="px-3 py-1 text-xs font-bold"
                    style={{
                      backgroundColor: isPublished ? "#dcfce7" : "#fef3c7",
                      color: isPublished ? "#166534" : "#92400e",
                      borderRadius: style.radius,
                    }}
                  >
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="mt-2 text-sm" style={{ color: style.mutedColor }}>
                  {store.businessName}
                </p>

                <p
                  className="mt-4 inline-flex px-3 py-1.5 text-sm font-medium"
                  style={{
                    backgroundColor: style.pageBackground,
                    color: style.textColor,
                    borderRadius: style.radius,
                  }}
                >
                  {store.category}
                </p>

                {store.description && (
                  <p
                    className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-7"
                    style={{ color: style.mutedColor }}
                  >
                    {store.description}
                  </p>
                )}
              </div>
            </div>

            {/* Brand colours */}
            <div
              className="mt-8 grid grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-2"
              style={{ borderColor: style.borderColor }}
            >
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: style.mutedColor }}
                >
                  Store slug
                </p>
                <p className="mt-2 break-all font-semibold">{store.slug}</p>
              </div>

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: style.mutedColor }}
                >
                  Created
                </p>
                <p className="mt-2 font-semibold">
                  {formatDate(store.createdAt)}
                </p>
              </div>

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: style.mutedColor }}
                >
                  Primary colour
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-6 w-6 border border-black/10"
                    style={{
                      backgroundColor: primaryColor,
                      borderRadius: style.radius,
                    }}
                  />
                  <span className="font-mono text-sm">{primaryColor}</span>
                </div>
              </div>

              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: style.mutedColor }}
                >
                  Secondary colour
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-6 w-6 border border-black/10"
                    style={{
                      backgroundColor: secondaryColor,
                      borderRadius: style.radius,
                    }}
                  />
                  <span className="font-mono text-sm">{secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Publish card */}
          <div
            className="border p-6 shadow-sm sm:p-8"
            style={cardStyle}
          >
            <div
              className="flex h-12 w-12 items-center justify-center text-xl font-bold"
              style={{
                backgroundColor: style.pageBackground,
                color: style.accentColor,
                borderRadius: style.radius,
              }}
            >
              ↗
            </div>

            <h2 className="mt-5 text-xl font-extrabold">
              {isPublished ? "Your store is live" : "Ready to go live?"}
            </h2>

            <p
              className="mt-3 text-sm leading-6"
              style={{ color: style.mutedColor }}
            >
              {isPublished
                ? "Your store has been published. You can review its details and check its status."
                : "Publish your store when you're ready to make it available through your public storefront."}
            </p>

            <div className="mt-6">
              {isPublished ? (
                <div
                  className="px-4 py-3 text-sm font-semibold"
                  style={{
                    backgroundColor: "#dcfce7",
                    color: "#166534",
                    borderRadius: style.radius,
                  }}
                >
                  Store published successfully
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full px-5 py-3.5 font-bold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                  style={primaryButtonStyle}
                >
                  {publishing ? "Publishing..." : "Publish My Store"}
                </button>
              )}
            </div>

            <p
              className="mt-4 text-xs leading-5"
              style={{ color: style.mutedColor }}
            >
              Make sure your store details are correct before publishing.
            </p>
          </div>
        </section>

        {/* Management cards */}
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold">Manage your business</h2>
          <p className="mt-2 text-sm" style={{ color: style.mutedColor }}>
            Your tools for building and growing your online store.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {/* Products */}
            <div
              className="border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              style={cardStyle}
            >
              <div
                className="flex h-12 w-12 items-center justify-center text-xl font-bold"
                style={{
                  backgroundColor: style.pageBackground,
                  color: style.accentColor,
                  borderRadius: style.radius,
                }}
              >
                ◈
              </div>

              <h3 className="mt-5 text-lg font-bold">Products</h3>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: style.mutedColor }}
              >
                Add products, organise your catalogue, and manage the items
                you want customers to discover.
              </p>

              <div
                className="mt-5 inline-flex px-3 py-2 text-xs font-semibold"
                style={{
                  backgroundColor: style.pageBackground,
                  color: style.mutedColor,
                  borderRadius: style.radius,
                }}
              >
                Product management not connected yet
              </div>
            </div>

            {/* Store details */}
            <Link
              href="/store-front/setup"
              className="group border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              style={cardStyle}
            >
              <div
                className="flex h-12 w-12 items-center justify-center text-xl font-bold"
                style={{
                  backgroundColor: style.pageBackground,
                  color: style.accentColor,
                  borderRadius: style.radius,
                }}
              >
                ✎
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Store details and design
              </h3>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: style.mutedColor }}
              >
                Review your business information, branding, colours, and logo.
              </p>

              <span
                className="mt-5 inline-flex items-center font-bold"
                style={{ color: primaryColor }}
              >
                Review store details <span className="ml-2">→</span>
              </span>
            </Link>

            {/* Plans */}
            <Link
              href="/store-front/plans"
              className="group border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              style={cardStyle}
            >
              <div
                className="flex h-12 w-12 items-center justify-center text-xl font-bold"
                style={{
                  backgroundColor: style.pageBackground,
                  color: style.accentColor,
                  borderRadius: style.radius,
                }}
              >
                ☆
              </div>

              <h3 className="mt-5 text-lg font-bold">Plans and upgrades</h3>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: style.mutedColor }}
              >
                Explore options for growing your business with additional
                stores and higher product limits.
              </p>

              <span
                className="mt-5 inline-flex items-center font-bold"
                style={{ color: primaryColor }}
              >
                Explore plans <span className="ml-2">→</span>
              </span>
            </Link>
          </div>
        </section>

        {/* Footer information */}
        <section
          className="mt-10 border p-6 sm:p-8"
          style={cardStyle}
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-extrabold">
                Keep building your business
              </h2>

              <p
                className="mt-2 max-w-2xl text-sm leading-6"
                style={{ color: style.mutedColor }}
              >
                Your Store Front is the starting point for your online
                business. Complete your store details and prepare your product
                catalogue as the next features become available.
              </p>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center justify-center border px-5 py-3 font-bold transition hover:opacity-75"
              style={{
                borderColor: style.borderColor,
                borderRadius: style.radius,
                color: style.textColor,
              }}
            >
              Return to Olatinn
            </Link>
          </div>
        </section>

        <footer
          className="py-8 text-center text-xs"
          style={{ color: style.mutedColor }}
        >
          Olatinn Store Front · {activeTheme} theme
        </footer>
      </div>
    </main>
  );
}