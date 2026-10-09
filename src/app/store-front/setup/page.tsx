"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

type StoreTheme = "modern" | "minimal" | "boutique";

type Store = {
  _id: string;
  businessName: string;
  storeName: string;
  slug: string;
  category: string;
  description: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  theme: StoreTheme;
  status: "draft" | "published";
};

type StoreThemeStyle = {
  previewBackground: string;
  cardBackground: string;
  textColor: string;
  secondaryTextColor: string;
  cardBorder: string;
  cardRadius: string;
  fontFamily: string;
  accentColor: string;
};

type StoreResponse = {
  success?: boolean;
  message?: string;
  store?: Store;
  logoUrl?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");
const STORES_URL = API_BASE ? `${API_BASE}/stores` : "";

const categories = [
  "Fashion",
  "Electronics",
  "Beauty & Personal Care",
  "Food & Groceries",
  "Home & Living",
  "Health & Wellness",
  "Arts & Crafts",
  "Books & Stationery",
  "Sports & Fitness",
  "Jewellery & Accessories",
  "Services",
  "Other",
];

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");

const StoreSetupPage = () => {
  const router = useRouter();

  // Store information
  const [businessName, setBusinessName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Store branding
  const [primaryColor, setPrimaryColor] = useState("#000271");
  const [secondaryColor, setSecondaryColor] = useState("#17acdd");
  const [theme, setTheme] = useState<StoreTheme>("modern");

  // Page and request states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Check whether the signed-in user already has a store.
  const checkExistingStore = useCallback(async () => {
    setLoading(true);
    setError("");

    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      router.replace(
        `/signin?next=${encodeURIComponent("/store-front/setup")}`
      );
      return;
    }

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

      if (response.ok) {
        router.replace("/store-front/dashboard");
        return;
      }

      if (response.status === 404) {
        // No store exists yet, so show the setup form.
        setLoading(false);
        return;
      }

      const data = (await response
        .json()
        .catch(() => ({}))) as StoreResponse;

      if (response.status === 401 || response.status === 403) {
        setError(
          data.message ||
            "Your session could not be verified. Please sign in again if your session has expired."
        );
        setLoading(false);
        return;
      }

      setError(
        data.message || "We couldn't check your store. Please try again."
      );
      setLoading(false);
    } catch (err) {
      console.error("Store lookup error:", err);

      setError(
        "Unable to connect to Olatinn. Check your connection and try again."
      );
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void checkExistingStore();
  }, [checkExistingStore]);

  // Generate the store URL from the store name until manually edited.
  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(storeName));
    }
  }, [storeName, slugEdited]);

  // Upload the store logo.
  const handleLogoUpload = async (file: File) => {
    setError("");
    setNotice("");

    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      router.replace(
        `/signin?next=${encodeURIComponent("/store-front/setup")}`
      );
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, WEBP, or GIF image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your logo must not exceed 5 MB.");
      return;
    }

    if (!STORES_URL) {
      setError("The API URL is not configured.");
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch(`${STORES_URL}/upload-logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = (await response
        .json()
        .catch(() => ({}))) as StoreResponse;

      if (!response.ok) {
        throw new Error(
          data.message ||
            (response.status === 401 || response.status === 403
              ? "Your session could not be verified. Please check that you are signed in."
              : "Logo upload failed.")
        );
      }

      if (!data.logoUrl) {
        throw new Error(
          "The upload succeeded, but no logo URL was returned."
        );
      }

      setLogoUrl(data.logoUrl);
      setNotice("Logo uploaded successfully!");
    } catch (err) {
      console.error("Logo upload error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload your logo. Please try again."
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  // Validate the form and create the store.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setNotice("");

    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      router.push(
        `/signin?next=${encodeURIComponent("/store-front/setup")}`
      );
      return;
    }

    if (!STORES_URL) {
      setError("The API URL is not configured.");
      return;
    }

    const cleanSlug = slugify(slug);

    if (!businessName.trim() || !storeName.trim() || !category) {
      setError("Please complete all required fields.");
      return;
    }

    if (!cleanSlug) {
      setError("Please enter a valid store URL.");
      return;
    }

    if (description.length > 1000) {
      setError("Your description must not exceed 1,000 characters.");
      return;
    }

    if (logoUrl.trim()) {
      try {
        const parsedUrl = new URL(logoUrl.trim());

        if (
          parsedUrl.protocol !== "https:" &&
          parsedUrl.protocol !== "http:"
        ) {
          setError("The logo URL must start with http:// or https://.");
          return;
        }
      } catch {
        setError("Please enter a valid logo image URL.");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await fetch(STORES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessName: businessName.trim(),
          storeName: storeName.trim(),
          slug: cleanSlug,
          category,
          description: description.trim(),
          logoUrl: logoUrl.trim(),
          primaryColor,
          secondaryColor,
          theme,
        }),
      });

      const data = (await response
        .json()
        .catch(() => ({}))) as StoreResponse;

      if (response.status === 401 || response.status === 403) {
        setError(
          data.message ||
            "Your session could not be verified. Please sign in again if your session has expired."
        );
        return;
      }

      if (response.status === 409) {
        // Check whether a store was created in another tab.
        const existingResponse = await fetch(`${STORES_URL}/my-store`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (existingResponse.ok) {
          router.replace("/store-front/dashboard");
          return;
        }

        setError(
          data.message ||
            "That store URL or account is already in use. Please check your details."
        );
        return;
      }

      if (!response.ok) {
        setError(data.message || "We couldn't create your store.");
        return;
      }

      setNotice("Your store has been created successfully!");
      router.push("/store-front/dashboard");
    } catch (err) {
      console.error("Store creation error:", err);

      setError(
        "Unable to connect to Olatinn. Your store was not confirmed as created."
      );
    } finally {
      setSaving(false);
    }
  };

  // Styles shared by the live preview and selected theme.
  const themeStyles: Record<StoreTheme, StoreThemeStyle> = {
    modern: {
      previewBackground: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
      cardBackground: "#ffffff",
      textColor: "#0f172a",
      secondaryTextColor: "#64748b",
      cardBorder: "transparent",
      cardRadius: "1rem",
      fontFamily: "inherit",
      accentColor: primaryColor,
    },

    minimal: {
      previewBackground: "#f8fafc",
      cardBackground: "#ffffff",
      textColor: "#1e293b",
      secondaryTextColor: "#64748b",
      cardBorder: "#e2e8f0",
      cardRadius: "0.5rem",
      fontFamily: "inherit",
      accentColor: primaryColor,
    },

    boutique: {
      previewBackground: "#f7efe5",
      cardBackground: "#fffaf4",
      textColor: "#3d3028",
      secondaryTextColor: "#827166",
      cardBorder: "#e7d8c8",
      cardRadius: "0.25rem",
      fontFamily: "Georgia, serif",
      accentColor: secondaryColor,
    },
  };

  const selectedTheme = themeStyles[theme];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-[#17acdd]" />
          <p className="font-medium text-slate-700">
            Preparing your Store Front...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Checking your Olatinn account
          </p>
        </div>
      </main>
    );
  }

  if (error && !businessName && !storeName && !category) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl text-red-600">
            !
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            We couldn't load your store setup
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void checkExistingStore()}
            className="mt-6 w-full rounded-xl bg-[#000271] px-5 py-3 font-semibold text-white transition hover:bg-[#17acdd]"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={() => router.push("/store-front")}
            className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Back to Store Front
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => router.push("/store-front")}
            className="flex items-center gap-3"
            aria-label="Return to Olatinn Store Front"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#000271] text-xl font-black text-white">
              O
            </span>

            <span className="text-left">
              <span className="block text-lg font-extrabold tracking-tight text-[#000271]">
                OLATINN
              </span>
              <span className="block text-xs font-medium text-slate-500">
                STORE FRONT
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#17acdd] hover:text-[#000271]"
          >
            Exit to dashboard
          </button>
        </div>
      </header>

      {/* Main content: preview column and setup form */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:py-16">
        {/* Left column */}
        <div className="lg:sticky lg:top-10 lg:self-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-4 py-2 text-sm font-semibold text-[#000271]">
            <span className="h-2 w-2 rounded-full bg-[#17acdd]" />
            YOUR BUSINESS, YOUR STORE
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Turn your business into{" "}
            <span className="text-[#17acdd]">an online store.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Set up your storefront, bring your brand to life, and prepare
            to showcase your products to customers online.
          </p>

          <div className="mt-8 space-y-5">
            {[
              {
                number: "01",
                title: "Introduce your business",
                text: "Give your store a name and choose its category.",
              },
              {
                number: "02",
                title: "Make it yours",
                text: "Choose your store address and brand colours.",
              },
              {
                number: "03",
                title: "Get ready to sell",
                text: "Create your store, then continue to your merchant dashboard.",
              },
            ].map((item) => (
              <div key={item.number} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-[#17acdd] shadow-sm ring-1 ring-slate-200">
                  {item.number}
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Live Store Brand Preview */}
          <div
            className="mt-10 overflow-hidden rounded-3xl p-6 shadow-xl transition-all duration-300 sm:p-8"
            style={{
              background: selectedTheme.previewBackground,
              color: selectedTheme.textColor,
              border:
                theme === "minimal"
                  ? `1px solid ${selectedTheme.cardBorder}`
                  : "1px solid transparent",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-[0.2em]"
              style={{
                color:
                  theme === "modern"
                    ? "#cffafe"
                    : selectedTheme.secondaryTextColor,
              }}
            >
              YOUR BRAND PREVIEW
            </p>

            {/* Store card */}
            <div
              className="mt-5 p-5 transition-all duration-300"
              style={{
                backgroundColor: selectedTheme.cardBackground,
                color: selectedTheme.textColor,
                border: `1px solid ${selectedTheme.cardBorder}`,
                borderRadius: selectedTheme.cardRadius,
                fontFamily: selectedTheme.fontFamily,
              }}
            >
              {/* Logo and business names */}
              <div className="flex items-center gap-3">
                {logoUrl.trim() ? (
                  <img
                    src={logoUrl.trim()}
                    alt="Store logo preview"
                    className="h-12 w-12 shrink-0 rounded-xl border border-slate-100 object-contain"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {storeName.trim().charAt(0).toUpperCase() || "S"}
                  </div>
                )}

                <div className="min-w-0">
                  <p
                    className="truncate font-extrabold"
                    style={{ color: selectedTheme.textColor }}
                  >
                    {storeName.trim() || "Your Store Name"}
                  </p>

                  <p
                    className="truncate text-xs"
                    style={{
                      color: selectedTheme.secondaryTextColor,
                    }}
                  >
                    {businessName.trim() || "Your business name"}
                  </p>
                </div>
              </div>

              {/* Welcome section */}
              <div
                className="mt-6 p-4"
                style={{
                  background:
                    theme === "modern"
                      ? `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})`
                      : theme === "minimal"
                        ? "#f8fafc"
                        : "#f2e5d7",
                  color:
                    theme === "modern"
                      ? "#ffffff"
                      : selectedTheme.textColor,
                  borderRadius: selectedTheme.cardRadius,
                  border:
                    theme === "minimal"
                      ? "1px solid #e2e8f0"
                      : "1px solid transparent",
                }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{
                    color:
                      theme === "modern"
                        ? "#ffffff"
                        : selectedTheme.secondaryTextColor,
                  }}
                >
                  Welcome to
                </p>

                <h3
                  className={`mt-2 text-2xl font-bold ${
                    theme === "boutique" ? "italic" : ""
                  }`}
                  style={{ color: "inherit" }}
                >
                  {storeName.trim() || "Your next big thing"}
                </h3>

                <p
                  className="mt-2 text-sm"
                  style={{
                    color:
                      theme === "modern"
                        ? "#ffffff"
                        : selectedTheme.secondaryTextColor,
                  }}
                >
                  {category || "Your category will appear here"}
                </p>

                {description.trim() && (
                  <p
                    className="mt-3 text-sm leading-6"
                    style={{
                      color:
                        theme === "modern"
                          ? "#ffffff"
                          : selectedTheme.secondaryTextColor,
                    }}
                  >
                    {description.trim()}
                  </p>
                )}

                <div
                  className="mt-5 inline-block px-4 py-2 text-xs font-bold"
                  style={{
                    backgroundColor:
                      theme === "minimal"
                        ? "#ffffff"
                        : selectedTheme.accentColor,
                    color:
                      theme === "minimal"
                        ? selectedTheme.accentColor
                        : "#ffffff",
                    borderRadius: selectedTheme.cardRadius,
                    border:
                      theme === "minimal"
                        ? `1px solid ${selectedTheme.accentColor}`
                        : "1px solid transparent",
                  }}
                >
                  Explore Store
                </div>
              </div>

              {/* Store URL */}
              <div className="mt-4 flex items-center justify-between gap-3">
                <span
                  className="truncate text-xs"
                  style={{
                    color: selectedTheme.secondaryTextColor,
                  }}
                >
                  olatinn.com/store/{slugify(slug) || "your-store"}
                </span>

                <span
                  className="shrink-0 px-3 py-2 text-xs font-bold"
                  style={{
                    backgroundColor: primaryColor,
                    color: "#ffffff",
                    borderRadius: selectedTheme.cardRadius,
                  }}
                >
                  Preview
                </span>
              </div>
            </div>
          </div>
          {/* End of live preview */}
        </div>
        {/* End of left column */}

        {/* Right column: store setup form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_20px_70px_-35px_rgba(0,2,113,0.25)] sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#17acdd]">
              STEP 1 OF YOUR STORE JOURNEY
            </p>

            <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">
              Set up your store
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Start with the essentials. You can refine your storefront as
              you continue.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success message */}
          {notice && (
            <div
              role="status"
              className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700"
            >
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business name */}
            <div>
              <label
                htmlFor="businessName"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Business name <span className="text-red-500">*</span>
              </label>

              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="e.g. Adebayo Retail Limited"
                maxLength={100}
                autoComplete="organization"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
              />

              <p className="mt-2 text-xs text-slate-500">
                The registered or trading name of your business.
              </p>
            </div>

            {/* Store name */}
            <div>
              <label
                htmlFor="storeName"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Store display name <span className="text-red-500">*</span>
              </label>

              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(event) => setStoreName(event.target.value)}
                placeholder="e.g. Adebayo Fashion House"
                maxLength={80}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
              />
            </div>

            {/* Store URL */}
            <div>
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Store URL <span className="text-red-500">*</span>
              </label>

              <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#17acdd] focus-within:ring-4 focus-within:ring-cyan-50">
                <span className="flex items-center border-r border-slate-200 bg-slate-100 px-3 text-xs text-slate-500 sm:px-4 sm:text-sm">
                  /store/
                </span>

                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setSlug(slugify(event.target.value));
                  }}
                  placeholder="your-store-name"
                  maxLength={60}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  title="Use lowercase letters, numbers, and hyphens."
                  required
                  className="min-w-0 flex-1 bg-transparent px-3 py-3.5 text-sm outline-none sm:px-4"
                />
              </div>

              <p className="mt-2 break-all text-xs text-slate-500">
                Your store address will use this unique name. Availability is
                checked when you create your store.
              </p>
            </div>

            {/* Business category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-bold text-slate-800"
              >
                Business category <span className="text-red-500">*</span>
              </label>

              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
              >
                <option value="">Select your category</option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Store description */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="description"
                  className="block text-sm font-bold text-slate-800"
                >
                  Store description
                </label>

                <span className="text-xs text-slate-400">
                  {description.length}/1000
                </span>
              </div>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Tell customers what makes your business special..."
                maxLength={1000}
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#17acdd] focus:bg-white focus:ring-4 focus:ring-cyan-50"
              />
            </div>

            {/* Store logo upload */}
            <div className="space-y-3">
              <label
                htmlFor="storeLogo"
                className="block text-sm font-semibold text-gray-700"
              >
                Store logo
              </label>

              <input
                id="storeLogo"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                disabled={uploadingLogo || saving}
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    void handleLogoUpload(file);
                  }

                  event.target.value = "";
                }}
                className="block w-full rounded-xl border border-gray-300 p-3 text-sm"
              />

              <p className="text-xs text-gray-500">
                JPG, PNG, WEBP, or GIF. Maximum size: 5 MB.
              </p>

              {uploadingLogo && (
                <p className="text-sm font-medium text-blue-700">
                  Uploading logo to Cloudinary...
                </p>
              )}

              {logoUrl && (
                <div className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                  <img
                    src={logoUrl}
                    alt="Uploaded store logo"
                    className="h-20 w-20 rounded-lg border border-gray-200 object-contain"
                  />

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800">
                      Logo uploaded
                    </p>

                    <p className="break-all text-xs text-gray-500">
                      Your Cloudinary image URL is ready.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setLogoUrl("");
                        setNotice("");
                      }}
                      disabled={uploadingLogo || saving}
                      className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      Remove logo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Store theme selection */}
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Store theme
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Choose the design style that best represents your business.
                You can customise your brand colours below.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {/* Modern theme */}
                <button
                  type="button"
                  onClick={() => setTheme("modern")}
                  aria-pressed={theme === "modern"}
                  className={`rounded-xl border p-4 text-left transition ${
                    theme === "modern"
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <div
                    className="mb-3 flex h-20 items-end rounded-lg p-2"
                    style={{
                      background: `linear-gradient(120deg, ${primaryColor}, ${secondaryColor})`,
                    }}
                  >
                    <div className="h-2 w-12 rounded-full bg-white/90" />
                  </div>

                  <span className="block text-sm font-bold text-slate-800">
                    Modern
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Bold layouts, vibrant colours, and contemporary styling.
                  </span>

                  <span
                    className={`mt-3 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                      theme === "modern"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {theme === "modern" ? "Selected" : "Choose theme"}
                  </span>
                </button>

                {/* Minimal theme */}
                <button
                  type="button"
                  onClick={() => setTheme("minimal")}
                  aria-pressed={theme === "minimal"}
                  className={`rounded-xl border p-4 text-left transition ${
                    theme === "minimal"
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="mb-3 flex h-20 flex-col justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
                    <div className="h-2 w-12 rounded-full bg-slate-800" />
                    <div className="h-1.5 w-full rounded-full bg-slate-200" />
                    <div className="h-1.5 w-3/4 rounded-full bg-slate-100" />
                  </div>

                  <span className="block text-sm font-bold text-slate-800">
                    Minimal
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Clean layouts, subtle details, and plenty of whitespace.
                  </span>

                  <span
                    className={`mt-3 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                      theme === "minimal"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {theme === "minimal" ? "Selected" : "Choose theme"}
                  </span>
                </button>

                {/* Boutique theme */}
                <button
                  type="button"
                  onClick={() => setTheme("boutique")}
                  aria-pressed={theme === "boutique"}
                  className={`rounded-xl border p-4 text-left transition ${
                    theme === "boutique"
                      ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <div
                    className="mb-3 flex h-20 flex-col justify-center gap-2 rounded-lg border border-stone-200 px-3"
                    style={{ backgroundColor: "#f7efe5" }}
                  >
                    <div className="font-serif text-sm font-semibold text-stone-800">
                      Collection
                    </div>
                    <div className="h-px w-full bg-stone-300" />
                    <div className="h-1.5 w-10 rounded-full bg-stone-400" />
                  </div>

                  <span className="block text-sm font-bold text-slate-800">
                    Boutique
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Elegant typography, warm tones, and a premium feel.
                  </span>

                  <span
                    className={`mt-3 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                      theme === "boutique"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {theme === "boutique" ? "Selected" : "Choose theme"}
                  </span>
                </button>
              </div>
            </div>

            {/* Brand colours */}
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Brand colours
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Choose colours that represent your business.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {/* Primary colour */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <label
                    htmlFor="primaryColor"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Primary colour
                  </label>

                  <div className="mt-3 flex items-center gap-3">
                    <input
                      id="primaryColor"
                      type="color"
                      value={primaryColor}
                      onChange={(event) =>
                        setPrimaryColor(event.target.value)
                      }
                      className="h-11 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
                    />

                    <span className="font-mono text-sm uppercase text-slate-600">
                      {primaryColor}
                    </span>
                  </div>
                </div>

                {/* Secondary colour */}
                <div className="rounded-xl border border-slate-200 p-4">
                  <label
                    htmlFor="secondaryColor"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Secondary colour
                  </label>

                  <div className="mt-3 flex items-center gap-3">
                    <input
                      id="secondaryColor"
                      type="color"
                      value={secondaryColor}
                      onChange={(event) =>
                        setSecondaryColor(event.target.value)
                      }
                      className="h-11 w-14 cursor-pointer rounded-lg border-0 bg-transparent"
                    />

                    <span className="font-mono text-sm uppercase text-slate-600">
                      {secondaryColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Draft information */}
            <div className="rounded-xl border border-cyan-100 bg-cyan-50/70 p-4">
              <div className="flex gap-3">
                <span className="text-xl text-[#000271]">i</span>

                <div>
                  <p className="text-sm font-bold text-[#000271]">
                    Your store starts as a draft
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Creating your store does not publish it automatically.
                    You can finish setting it up before making it public.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={saving || uploadingLogo}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#000271] px-5 py-4 font-bold text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Creating your store...
                </>
              ) : uploadingLogo ? (
                "Please wait for the logo upload..."
              ) : (
                <>
                  Create My Store
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>

            <p className="text-center text-xs leading-5 text-slate-500">
              By creating your store, you confirm that you are authorized
              to represent this business.
            </p>
          </form>
        </div>
        {/* End of setup form */}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-xs text-slate-500">
        Powered by Olatinn · Your business, built for the web.
      </footer>
    </main>
  );
};

export default StoreSetupPage;