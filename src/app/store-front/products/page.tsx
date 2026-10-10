"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

const PRODUCTS_URL = API_URL ? `${API_URL}/products` : "";

type ProductImage = {
  url: string;
  alt?: string;
};

type Product = {
  _id: string;
  store: string | { _id: string };
  name: string;
  slug: string;
  description?: string;
  category?: string;
  brand?: string;
  sku?: string;
  price: number;
  compareAtPrice?: number | null;
  stockQuantity?: number;
  trackInventory?: boolean;
  images?: ProductImage[];
  status: "draft" | "published" | "archived";
  isFeatured?: boolean;
  createdAt?: string;
};

type ApiResponse = {
  success?: boolean;
  message?: string;
  count?: number;
  products?: Product[];
  product?: Product;
};

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("olatinnToken") || "";
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(price);
}

function ProductManagementContent() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const loadProducts = useCallback(async () => {
    if (!storeId) {
      setError(
        "Store ID is missing. Return to your Store Front dashboard and select a store."
      );
      setLoading(false);
      return;
    }

    if (!PRODUCTS_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      setLoading(false);
      return;
    }

    const token = getToken();

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${PRODUCTS_URL}/store/${encodeURIComponent(storeId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  async function handleProductStatus(product: Product) {
    const action =
      product.status === "published" ? "unpublish" : "publish";

    setBusyId(product._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${PRODUCTS_URL}/${encodeURIComponent(product._id)}/${action}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Unable to ${action} product.`);
      }

      setNotice(
        action === "publish"
          ? "Product published successfully."
          : "Product unpublished successfully."
      );

      await loadProducts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update product status."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleDeleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete "${product.name}" permanently? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(product._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${PRODUCTS_URL}/${encodeURIComponent(product._id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete product.");
      }

      setProducts((current) =>
        current.filter((item) => item._id !== product._id)
      );

      setNotice("Product deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete product."
      );
    } finally {
      setDeletingId("");
    }
  }

  const publishedCount = products.filter(
    (product) => product.status === "published"
  ).length;

  const draftCount = products.filter(
    (product) => product.status === "draft"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 mt-5">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/store-front"
              className="text-sm font-semibold text-[#17acdd] hover:underline"
            >
              ← Back to Store Front Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-extrabold text-[#000271] sm:text-4xl">
              Product Management
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Manage your catalogue, prices, stock, and product visibility.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void loadProducts()}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[#000271] hover:border-[#17acdd] disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              href={`/store-front/products/new?storeId=${encodeURIComponent(storeId)}`}
              className="rounded-xl bg-[#000271] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#17acdd]"
            >
              + Add Product
            </Link>
          </div>
        </header>

        {!storeId && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            No store was selected. Go back to the Store Front dashboard and
            click Manage Products on the relevant store.
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            {notice}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total products</p>
            <p className="mt-2 text-3xl font-extrabold text-[#000271]">
              {products.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Published products</p>
            <p className="mt-2 text-3xl font-extrabold text-emerald-600">
              {publishedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Draft products</p>
            <p className="mt-2 text-3xl font-extrabold text-amber-600">
              {draftCount}
            </p>
          </div>
        </section>

        {loading ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#17acdd]" />
            <p className="mt-4 text-sm text-slate-500">
              Loading your products...
            </p>
          </section>
        ) : products.length === 0 && !error ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="text-5xl">📦</div>

            <h2 className="mt-5 text-2xl font-extrabold text-[#000271]">
              Your catalogue is ready for its first product
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Add your first item with its price, description, images, and
              available stock. You can publish it when you are ready.
            </p>

            <Link
              href={`/store-front/products/new?storeId=${encodeURIComponent(storeId)}`}
              className="mt-6 inline-flex rounded-xl bg-[#000271] px-6 py-3 text-sm font-bold text-white hover:bg-[#17acdd]"
            >
              Create First Product
            </Link>
          </section>
        ) : (
          <section className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                key={product._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="relative flex h-52 items-center justify-center bg-slate-100">
                  {product.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-5xl">📦</div>
                  )}

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      product.status === "published"
                        ? "bg-emerald-100 text-emerald-800"
                        : product.status === "archived"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {product.category || "Uncategorised"}
                  </p>

                  <h2 className="mt-1 break-words text-xl font-extrabold text-[#000271]">
                    {product.name}
                  </h2>

                  <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-5 text-slate-500">
                    {product.description || "No description added yet."}
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Selling price</p>
                      <p className="mt-1 text-xl font-extrabold text-[#000271]">
                        {formatPrice(product.price)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">Stock</p>
                      <p className="mt-1 text-sm font-bold text-slate-700">
                        {product.trackInventory === false
                          ? "Not tracked"
                          : product.stockQuantity ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Link
                      href={`/store-front/products/${encodeURIComponent(product._id)}/edit?storeId=${encodeURIComponent(storeId)}`}
                      className="rounded-xl border border-slate-200 px-3 py-3 text-center text-sm font-bold text-[#000271] hover:border-[#17acdd] hover:bg-cyan-50"
                    >
                      Edit Product
                    </Link>

                    <button
                      type="button"
                      onClick={() => void handleProductStatus(product)}
                      disabled={
                        busyId === product._id ||
                        deletingId === product._id
                      }
                      className={`rounded-xl px-3 py-3 text-sm font-bold text-white disabled:opacity-50 ${
                        product.status === "published"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {busyId === product._id
                        ? "Please wait..."
                        : product.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDeleteProduct(product)}
                    disabled={
                      busyId === product._id ||
                      deletingId === product._id
                    }
                    className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === product._id
                      ? "Deleting..."
                      : "Delete Product"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

export default function ProductManagementPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">
          Loading product management...
        </main>
      }
    >
      <ProductManagementContent />
    </Suspense>
  );
}