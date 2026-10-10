
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CART_UPDATED_EVENT,
  CartItem,
  clearCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} from "../../lib/storeCart";

type CartGroup = {
  key: string;
  storeName: string;
  currency: string;
  items: CartItem[];
  subtotal: number;
};

const formatMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`;
  }
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    const syncCart = () => {
      setItems(getCart());
    };

    syncCart();
    setIsLoaded(true);

    window.addEventListener(CART_UPDATED_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
    };
  }, []);

  const groups = useMemo(() => {
    const grouped = items.reduce<Record<string, CartGroup>>(
      (result, item) => {
        const currency = item.currency || "USD";
        const key = `${item.storeId}-${currency}`;

        if (!result[key]) {
          result[key] = {
            key,
            storeName: item.storeName,
            currency,
            items: [],
            subtotal: 0,
          };
        }

        result[key].items.push(item);
        result[key].subtotal += item.price * item.quantity;

        return result;
      },
      {}
    );

    return Object.values(grouped);
  }, [items]);

  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const currencyTotals = useMemo(() => {
    return items.reduce<Record<string, number>>((totals, item) => {
      const currency = item.currency || "USD";

      totals[currency] =
        (totals[currency] || 0) + item.price * item.quantity;

      return totals;
    }, {});
  }, [items]);

  const handleQuantityChange = (
    item: CartItem,
    quantity: number
  ) => {
    const updated = updateCartQuantity(
      item.productId,
      item.storeId,
      quantity
    );

    setItems(updated);
  };

  const handleRemove = (item: CartItem) => {
    const updated = removeFromCart(item.productId, item.storeId);
    setItems(updated);
  };

  const handleClearCart = () => {
    setItems(clearCart());
    setConfirmClear(false);
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-8 w-56 rounded bg-slate-200" />
          <div className="h-40 rounded-2xl bg-slate-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 mt-12">
      {/* Page header */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#17acdd]">
              Olatinn Store Front
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your shopping cart
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review your items before moving to checkout.
            </p>
          </div>

          <Link
            href="/store-front/shop"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold transition hover:border-[#17acdd] hover:text-[#17acdd]"
          >
            <span className="mr-2" aria-hidden="true">
              ←
            </span>
            Continue shopping
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {items.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center sm:py-24">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-4xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Your cart is waiting for something special
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              Explore products from Olatinn merchants and add your
              favourites here. They will stay in your cart when you
              browse between pages on this device.
            </p>

            <Link
              href="/store-front/shop"
              className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#000271] px-6 py-3.5 font-semibold text-white transition hover:bg-[#17acdd]"
            >
              Explore products
            </Link>
          </section>
        ) : (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_340px]">
            {/* Cart items */}
            <section className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">Cart items</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {totalQuantity}{" "}
                    {totalQuantity === 1 ? "item" : "items"} in your cart
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="text-sm font-semibold text-red-600 transition hover:text-red-800"
                >
                  Clear cart
                </button>
              </div>

              <div className="space-y-6">
                {groups.map((group) => (
                  <div
                    key={group.key}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Sold by
                      </p>
                      <p className="mt-1 font-bold text-[#000271]">
                        {group.storeName || "Olatinn Merchant"}
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {group.items.map((item) => (
                        <article
                          key={`${item.storeId}-${item.productId}`}
                          className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:p-5"
                        >
                          {/* Product image */}
                          <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-3xl" aria-hidden="true">
                                📦
                              </span>
                            )}
                          </div>

                          {/* Product details */}
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/store/${encodeURIComponent(item.storeSlug)}`}
                              className="font-semibold text-slate-900 transition hover:text-[#17acdd]"
                            >
                              {item.name}
                            </Link>

                            <p className="mt-1 text-sm text-slate-500">
                              From {item.storeName}
                            </p>

                            <p className="mt-3 text-lg font-bold text-[#000271]">
                              {formatMoney(item.price, item.currency)}
                            </p>

                            {item.stockQuantity > 0 && (
                              <p className="mt-1 text-xs text-slate-500">
                                {item.stockQuantity} available
                              </p>
                            )}

                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                              {/* Quantity controls */}
                              <div
                                className="inline-flex items-center overflow-hidden rounded-lg border border-slate-300"
                                aria-label={`Quantity for ${item.name}`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1}
                                  aria-label="Decrease quantity"
                                  className="h-10 w-10 text-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  −
                                </button>

                                <span
                                  className="min-w-10 px-2 text-center text-sm font-semibold"
                                  aria-live="polite"
                                >
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={
                                    item.stockQuantity > 0 &&
                                    item.quantity >= item.stockQuantity
                                  }
                                  aria-label="Increase quantity"
                                  className="h-10 w-10 text-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemove(item)}
                                className="text-sm font-semibold text-red-600 transition hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          </div>

                          {/* Line subtotal */}
                          <div className="text-left sm:min-w-28 sm:text-right">
                            <p className="text-xs text-slate-500">
                              Subtotal
                            </p>
                            <p className="mt-1 font-bold">
                              {formatMoney(
                                item.price * item.quantity,
                                item.currency
                              )}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4">
                      <span className="text-sm text-slate-600">
                        Store subtotal
                      </span>
                      <span className="font-bold">
                        {formatMoney(group.subtotal, group.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Order summary */}
            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-bold">Order summary</h2>

              <div className="mt-5 flex items-center justify-between border-b border-slate-100 pb-4 text-sm">
                <span className="text-slate-500">Items</span>
                <span className="font-semibold">{totalQuantity}</span>
              </div>

              <div className="mt-4 space-y-4">
                {Object.entries(currencyTotals).map(([currency, total]) => (
                  <div
                    key={currency}
                    className="flex items-start justify-between gap-4"
                  >
                    <span className="text-sm text-slate-500">
                      Subtotal ({currency})
                    </span>
                    <span className="text-right font-bold">
                      {formatMoney(total, currency)}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-5 rounded-xl bg-sky-50 p-3 text-xs leading-5 text-slate-600">
                Delivery fees, taxes, and final payment details will be
                calculated during checkout.
              </p>

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-xl bg-slate-200 px-5 py-3.5 font-semibold text-slate-500"
                title="Checkout will be enabled when the checkout flow is implemented."
              >
                Checkout coming next
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                Your cart is saved on this device. Checkout and payment
                have not been connected yet.
              </p>

              <Link
                href="/store-front/shop"
                className="mt-5 flex w-full items-center justify-center rounded-xl border border-[#000271] px-5 py-3 font-semibold text-[#000271] transition hover:bg-[#000271] hover:text-white"
              >
                Keep shopping
              </Link>
            </aside>
          </div>
        )}
      </div>

      {/* Clear cart confirmation */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setConfirmClear(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-cart-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="clear-cart-title" className="text-xl font-bold">
              Clear your cart?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              This will remove all items currently in your shopping cart.
              You can add them again later.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Keep items
              </button>

              <button
                type="button"
                onClick={handleClearCart}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
              >
                Clear cart
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}