
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/olatinn/api"
).replace(/\/+$/, "");

type StoreInfo = {
  storeName?: string;
  businessName?: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
};

type Product = {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  images?: { url: string; alt?: string }[];
  store?: StoreInfo | null;
};

type MarketplaceResponse = {
  success: boolean;
  products: Product[];
  categories: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
};

export default function StoreFrontShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
      });

      if (search) params.set("search", search);
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      const response = await fetch(
        `${API_URL}/products/public/marketplace?${params.toString()}`
      );

      const data: MarketplaceResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load products."
        );
      }

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(
        Math.max(1, data.pagination?.totalPages || 1)
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const chooseCategory = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  const formatPrice = (
    amount: number,
    currency = "ZAR"
  ) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Marketplace navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/store-front"
            className="text-xl font-extrabold tracking-tight text-[#000271]"
          >
            Olatinn <span className="text-[#17acdd]">Store Front</span>
          </Link>

          <nav className="flex items-center gap-3 text-sm font-semibold">
            <Link
              href="/store-front"
              className="hidden text-slate-600 hover:text-[#17acdd] sm:inline"
            >
              Home
            </Link>

            <Link
              href="/store-front/setup"
              className="rounded-full bg-[#000271] px-4 py-2.5 text-white transition hover:bg-[#17acdd]"
            >
              Become a merchant
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero and search */}
      <section className="overflow-hidden bg-[#000271]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-[#5adfe8]">
            Discover something new
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            One marketplace.
            <span className="block text-[#5adfe8]">
              Endless discoveries.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            Explore products from independent merchants and
            discover stores built on Olatinn.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-xl sm:flex-row"
          >
            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(event.target.value)
              }
              placeholder="Search products, brands or categories..."
              aria-label="Search products"
              className="min-w-0 flex-1 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-[#17acdd]"
            />

            <button
              type="submit"
              className="rounded-xl bg-[#17acdd] px-7 py-3 font-bold text-white transition hover:bg-[#000271] sm:py-3"
            >
              Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-200">
            <span className="font-semibold">Shopping made simple</span>
            <span className="text-[#5adfe8]">•</span>
            <span>Independent stores</span>
            <span className="text-[#5adfe8]">•</span>
            <span>Discover new products</span>
          </div>
        </div>
      </section>

      {/* Product catalogue */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#17acdd]">
              The marketplace
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-[#000271] sm:text-3xl">
              Explore products
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? "Finding products..."
                : `${total} published product${total === 1 ? "" : "s"} found`}
            </p>
          </div>

          {(search || selectedCategory) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSearchInput("");
                setSelectedCategory("");
                setPage(1);
              }}
              className="self-start text-sm font-semibold text-[#17acdd] hover:underline sm:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            onClick={() => chooseCategory("")}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
              selectedCategory === ""
                ? "bg-[#000271] text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-[#17acdd]"
            }`}
          >
            All products
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => chooseCategory(category)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "bg-[#000271] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#17acdd]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            <p className="font-bold">We couldn't load the products.</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void fetchProducts()}
              className="mt-3 font-bold underline"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
            aria-label="Loading products"
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-square bg-slate-200" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : !error && products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="text-4xl">🛍️</div>
            <h3 className="mt-4 text-xl font-bold text-[#000271]">
              No products found yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try another search or category. Published products
              from participating stores will appear here.
            </p>
            <Link
              href="/store-front/setup"
              className="mt-6 inline-flex rounded-full bg-[#17acdd] px-6 py-3 font-bold text-white hover:bg-[#000271]"
            >
              Open your store
            </Link>
          </div>
        ) : !error ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((product) => {
                const store = product.store;
                const image = product.images?.[0];

                return (
                  <article
                    key={product._id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      href={
                        store?.slug
                          ? `/store/${encodeURIComponent(store.slug)}`
                          : "/store-front/shop"
                      }
                      className="relative block aspect-square overflow-hidden bg-slate-100"
                      aria-label={`View ${product.name} and its store`}
                    >
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={image.alt || product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl text-slate-300">
                          ◇
                        </div>
                      )}

                      {product.category && (
                        <span className="absolute left-3 top-3 max-w-[85%] truncate rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#000271] shadow-sm">
                          {product.category}
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-3 sm:p-4">
                      {product.brand && (
                        <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {product.brand}
                        </p>
                      )}

                      <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-slate-800 sm:text-base">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-lg font-extrabold text-[#000271]">
                        {formatPrice(product.price)}
                      </p>

                      {typeof product.compareAtPrice === "number" &&
                        product.compareAtPrice > product.price && (
                          <p className="text-xs text-slate-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </p>
                        )}

                      <div className="mt-auto border-t border-slate-100 pt-3">
                        <p className="truncate text-xs text-slate-500">
                          Sold by{" "}
                          <span className="font-semibold text-slate-700">
                            {store?.storeName ||
                              store?.businessName ||
                              "Olatinn merchant"}
                          </span>
                        </p>

                        {store?.slug && (
                          <Link
                            href={`/store/${encodeURIComponent(store.slug)}`}
                            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#17acdd] px-3 py-2.5 text-sm font-bold text-[#000271] transition hover:bg-[#000271] hover:text-white"
                          >
                            Visit store
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => current - 1)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#000271] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => current + 1)
                  }
                  className="rounded-xl bg-[#000271] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : null}
      </section>

      {/* Merchant call to action */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-[#eafaff] p-7 sm:p-10 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#17acdd]">
              Have something to sell?
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#000271]">
              Your next customer could be here.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Create your storefront and bring your products to
              the Olatinn marketplace.
            </p>
          </div>

          <Link
            href="/store-front/setup"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#000271] px-7 py-3.5 font-bold text-white transition hover:bg-[#17acdd]"
          >
            Become a merchant
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-4 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Olatinn Store Front</p>
          <Link
            href="/store-front"
            className="font-semibold text-[#000271] hover:text-[#17acdd]"
          >
            Back to Store Front
          </Link>
        </div>
      </footer>
    </main>
  );
}