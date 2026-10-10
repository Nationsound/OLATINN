"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { addToCart, type CartItem } from "../../lib/storeCart";

type Store = {
  _id?: string;
  businessName: string;
  storeName: string;
  slug: string;
  category: string;
  description?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: "modern" | "minimal" | "boutique";
  status?: string;
  currency?: string;
};

type ProductImage = {
  url: string;
  alt?: string;
};

type Product = {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity?: number;
  trackInventory?: boolean;
  images?: ProductImage[];
  status?: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/olatinn/api"
).replace(/\/+$/, "");

const formatPrice = (
  price: number,
  currency: string
): string => {
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toFixed(2)}`;
  }
};

export default function PublicStorePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  const [error, setError] = useState("");
  const [productError, setProductError] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const loadStore = async () => {
      setLoading(true);
      setProductsLoading(true);
      setError("");
      setProductError("");

      try {
        const storeResponse = await fetch(
          `${API_URL}/stores/public/${encodeURIComponent(slug)}`
        );

        const storeText = await storeResponse.text();

        let storeData: {
          success?: boolean;
          message?: string;
          store?: Store;
        };

        try {
          storeData = JSON.parse(storeText);
        } catch {
          throw new Error(
            "The server returned an invalid store response."
          );
        }

        if (
          !storeResponse.ok ||
          storeData.success === false ||
          !storeData.store
        ) {
          throw new Error(
            storeData.message || "This store could not be found."
          );
        }

        if (cancelled) return;

        setStore(storeData.store);

        // Fetch published products belonging to this store.
        try {
          const productsResponse = await fetch(
            `${API_URL}/products/public/store/${encodeURIComponent(
              slug
            )}`
          );

          const productsText = await productsResponse.text();

          let productsData: {
            success?: boolean;
            message?: string;
            products?: Product[];
          };

          try {
            productsData = JSON.parse(productsText);
          } catch {
            throw new Error(
              "The server returned an invalid products response."
            );
          }

          if (
            !productsResponse.ok ||
            productsData.success === false
          ) {
            throw new Error(
              productsData.message ||
                "Unable to load this store's products."
            );
          }

          if (!cancelled) {
            setProducts(
  Array.isArray(productsData.products)
    ? productsData.products
    : []
);
          }
        } catch (err) {
          if (!cancelled) {
            setProductError(
              err instanceof Error
                ? err.message
                : "Unable to load this store's products."
            );
          }
        } finally {
          if (!cancelled) {
            setProductsLoading(false);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this storefront."
          );
        }

        if (!cancelled) {
          setProductsLoading(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStore();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleAddToCart = (product: Product) => {
    if (!store?._id) {
      setCartMessage(
        "This store is missing its store ID. Please try again later."
      );
      return;
    }

    const stockQuantity = Number(product.stockQuantity ?? 0);

    if (
      product.trackInventory &&
      stockQuantity <= 0
    ) {
      setCartMessage(`${product.name} is currently out of stock.`);
      return;
    }

    try {
      const item: Omit<CartItem, "quantity"> = {
        productId: product._id,
        name: product.name,
        price: Number(product.price),
        image: product.images?.[0]?.url || "",
        storeId: store._id,
        storeName: store.storeName,
        storeSlug: store.slug,
        currency: store.currency || "ZAR",
        stockQuantity: product.trackInventory
          ? stockQuantity
          : -1,
      };

      const updatedCart = addToCart(item);

      const cartItem = updatedCart.find(
        (entry) =>
          entry.productId === product._id &&
          entry.storeId === store._id
      );

      if (
        product.trackInventory &&
        cartItem &&
        cartItem.quantity >= stockQuantity
      ) {
        setCartMessage(
          `${product.name} added to cart. Maximum available stock reached.`
        );
      } else {
        setCartMessage(`${product.name} added to your cart!`);
      }
    } catch {
      setCartMessage(
        "We couldn't update your cart. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-900" />
          <p className="text-gray-600">Opening storefront...</p>
        </div>
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">🏪</div>

          <h1 className="text-2xl font-bold text-gray-900">
            Store unavailable
          </h1>

          <p className="mt-3 text-gray-600">
            {error || "This store could not be found."}
          </p>

          <Link
            href="/store-front"
            className="mt-6 inline-flex rounded-xl bg-blue-950 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
          >
            Back to Store Front
          </Link>
        </div>
      </main>
    );
  }

  const primaryColor = store.primaryColor || "#000271";
  const secondaryColor = store.secondaryColor || "#17acdd";
  const currency = store.currency || "ZAR";

  const themeClass =
    store.theme === "minimal"
      ? "rounded-none"
      : store.theme === "boutique"
        ? "rounded-3xl"
        : "rounded-2xl";

  return (
    <main
      className="min-h-screen bg-gray-50"
      style={
        {
          "--store-primary": primaryColor,
          "--store-secondary": secondaryColor,
        } as React.CSSProperties
      }
    >
      {/* Store navigation */}
      <header
        className="border-b border-gray-200 bg-white"
        style={{ borderTop: `5px solid ${primaryColor}` }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/store-front"
            className="text-sm font-semibold text-gray-500 transition hover:text-gray-900"
          >
            ← Olatinn Store Front
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/store-front/shop"
              className="text-sm font-semibold text-gray-600 transition hover:text-sky-600"
            >
              Explore products
            </Link>

            <Link
              href="/store-front/cart"
              className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              🛒 Cart
            </Link>
          </div>
        </div>
      </header>

      {/* Store hero */}
      <section
        className={`relative overflow-hidden ${themeClass}`}
        style={{
          background: `linear-gradient(125deg, ${primaryColor}, ${secondaryColor})`,
        }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:px-10 sm:py-24 lg:grid-cols-2 lg:py-28">
          <div className="text-white">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-white/80">
              Welcome to our store
            </p>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {store.storeName}
            </h1>

            <p className="mt-4 text-lg font-medium text-white/90">
              {store.businessName}
            </p>

            {store.description && (
              <p className="mt-6 max-w-xl text-base leading-8 text-white/85 sm:text-lg">
                {store.description}
              </p>
            )}

            <div className="mt-8">
              <span className="inline-flex rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white">
                {store.category}
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-sm">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={`${store.storeName} logo`}
                  className="h-full max-h-72 w-full object-contain"
                />
              ) : (
                <div className="text-center text-white">
                  <div className="text-7xl">🏪</div>
                  <p className="mt-5 text-xl font-bold">
                    {store.storeName}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Published products */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: secondaryColor }}
            >
              Discover our collection
            </p>

            <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
              Shop {store.storeName}
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-gray-600">
              Explore products from {store.businessName} and add your
              favourites to your cart.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
            <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
            Published storefront
          </span>
        </div>

        {cartMessage && (
          <div
            role="status"
            className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm font-medium text-blue-950"
          >
            <span>{cartMessage}</span>

            <Link
              href="/store-front/cart"
              className="font-bold underline underline-offset-4"
            >
              View cart
            </Link>

            <button
              type="button"
              onClick={() => setCartMessage("")}
              className="ml-auto text-gray-500 hover:text-gray-900"
              aria-label="Dismiss message"
            >
              ✕
            </button>
          </div>
        )}

        {productsLoading ? (
          <div className="py-20 text-center">
            <div
              className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200"
              style={{ borderTopColor: primaryColor }}
            />

            <p className="text-gray-600">
              Loading products from this store...
            </p>
          </div>
        ) : productError ? (
          <div className="mt-10 rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
            <div className="text-4xl">⚠️</div>

            <h3 className="mt-4 text-xl font-bold text-gray-900">
              Products could not be loaded
            </h3>

            <p className="mt-3 text-gray-600">{productError}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-xl px-6 py-3 font-semibold text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <div className="text-5xl">🛍️</div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">
              No published products yet
            </h3>

            <p className="mx-auto mt-3 max-w-lg leading-7 text-gray-600">
              This storefront is live, but its published products will
              appear here when they are available.
            </p>

            <Link
              href="/store-front/shop"
              className="mt-6 inline-flex rounded-xl px-6 py-3 font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: primaryColor }}
            >
              Explore other stores
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-gray-500">
              {products.length} product{products.length === 1 ? "" : "s"}{" "}
              available
            </p>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const image = product.images?.[0];
                const stock = Number(product.stockQuantity ?? 0);

                const outOfStock =
                  product.trackInventory === true && stock <= 0;

                return (
                  <article
                    key={product._id}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gray-100">
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={image.alt || product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-6xl">📦</div>
                      )}

                      {outOfStock && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white">
                          Out of stock
                        </span>
                      )}

                      {product.category && (
                        <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                          {product.category}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {product.brand && (
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                          {product.brand}
                        </p>
                      )}

                      <h3 className="mt-2 text-lg font-bold text-gray-900">
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className="text-xl font-extrabold"
                          style={{ color: primaryColor }}
                        >
                          {formatPrice(Number(product.price), currency)}
                        </span>

                        {typeof product.compareAtPrice === "number" &&
                          product.compareAtPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(
                                product.compareAtPrice,
                                currency
                              )}
                            </span>
                          )}
                      </div>

                      {product.trackInventory && !outOfStock && (
                        <p className="mt-2 text-xs text-gray-500">
                          {stock} in stock
                        </p>
                      )}

                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => handleAddToCart(product)}
                        className="mt-auto w-full rounded-xl px-4 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                        style={{
                          backgroundColor: outOfStock
                            ? undefined
                            : primaryColor,
                          marginTop: "20px",
                        }}
                      >
                        {outOfStock ? "Out of stock" : "🛒 Add to Cart"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {store.businessName}. All rights
            reserved.
          </p>

          <p>
            Storefront powered by{" "}
            <span
              className="font-bold"
              style={{ color: primaryColor }}
            >
              Olatinn
            </span>
          </p>
        </div>
      </footer>
    </main>
  );
}