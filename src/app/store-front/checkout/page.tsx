"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CART_UPDATED_EVENT,
  CartItem,
  getCart,
} from "../../lib/storeCart";

type CheckoutCustomer = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryNotes: string;
};

type CartGroup = {
  key: string;
  storeId: string;
  storeSlug: string;
  storeName: string;
  currency: string;
  items: CartItem[];
  subtotal: number;
};

const CUSTOMER_STORAGE_KEY = "olatinn_checkout_customer";

const defaultCustomer: CheckoutCustomer = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Nigeria",
  deliveryNotes: "",
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

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [customer, setCustomer] =
    useState<CheckoutCustomer>(defaultCustomer);

  const [selectedStoreKey, setSelectedStoreKey] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  /*
   * ============================================================
   * Load cart + saved customer information
   * ============================================================
   */

  useEffect(() => {
    const savedCustomer = window.localStorage.getItem(
      CUSTOMER_STORAGE_KEY
    );

    if (savedCustomer) {
      try {
        const parsed = JSON.parse(savedCustomer);

        setCustomer({
          ...defaultCustomer,
          ...parsed,
        });
      } catch {
        window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      }
    }

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

  /*
   * ============================================================
   * Autosave customer details
   * ============================================================
   */

  useEffect(() => {
    if (!isLoaded) return;

    window.localStorage.setItem(
      CUSTOMER_STORAGE_KEY,
      JSON.stringify(customer)
    );
  }, [customer, isLoaded]);

  /*
   * ============================================================
   * Group cart items by store
   * ============================================================
   */

  const groups = useMemo(() => {
    const grouped = items.reduce<Record<string, CartGroup>>(
      (result, item) => {
        const currency = item.currency || "USD";

        const key = `${item.storeId}-${currency}`;

        if (!result[key]) {
          result[key] = {
            key,
            storeId: item.storeId,
            storeSlug: item.storeSlug,
            storeName: item.storeName,
            currency,
            items: [],
            subtotal: 0,
          };
        }

        result[key].items.push(item);

        result[key].subtotal +=
          item.price * item.quantity;

        return result;
      },
      {}
    );

    return Object.values(grouped);
  }, [items]);

  /*
   * ============================================================
   * Automatically select first store
   * ============================================================
   */

  useEffect(() => {
    if (
      groups.length > 0 &&
      !groups.some((group) => group.key === selectedStoreKey)
    ) {
      setSelectedStoreKey(groups[0].key);
    }
  }, [groups, selectedStoreKey]);

  /*
   * ============================================================
   * Selected store
   * ============================================================
   */

  const selectedGroup = useMemo(() => {
    return groups.find(
      (group) => group.key === selectedStoreKey
    );
  }, [groups, selectedStoreKey]);

  /*
   * ============================================================
   * Customer input helper
   * ============================================================
   */

  const updateCustomer = (
    field: keyof CheckoutCustomer,
    value: string
  ) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));

    setCheckoutError("");
    setCheckoutSuccess("");
  };

  /*
   * ============================================================
   * Basic validation
   * ============================================================
   */

  const validateCustomer = () => {
    if (!customer.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!customer.email.trim()) {
      return "Please enter your email address.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      return "Please enter a valid email address.";
    }

    if (!customer.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!customer.addressLine1.trim()) {
      return "Please enter your home or delivery address.";
    }

    if (!customer.city.trim()) {
      return "Please enter your city.";
    }

    if (!customer.state.trim()) {
      return "Please enter your state or province.";
    }

    if (!customer.postalCode.trim()) {
      return "Please enter your postal code.";
    }

    if (!customer.country.trim()) {
      return "Please select your country.";
    }

    return "";
  };

  /*
   * ============================================================
   * Checkout
   *
   * IMPORTANT:
   * This currently prepares the order data on the frontend.
   * Connect the fetch URL to the order creation endpoint when
   * the backend order controller is mounted.
   * ============================================================
   */

 const handleCheckout = async () => {
  setCheckoutError("");
  setCheckoutSuccess("");

  if (!selectedGroup) {
    setCheckoutError(
      "Please select a store before continuing."
    );
    return;
  }

  const validationError = validateCustomer();

  if (validationError) {
    setCheckoutError(validationError);
    return;
  }

  if (selectedGroup.items.length === 0) {
    setCheckoutError(
      "There are no items available for this store."
    );
    return;
  }

  setIsSubmitting(true);

  try {
    const orderPayload = {
      storeId: selectedGroup.storeId,
      storeSlug: selectedGroup.storeSlug,

      customer: {
        fullName: customer.fullName.trim(),

        email: customer.email
          .trim()
          .toLowerCase(),

        phone: customer.phone.trim(),

        address: [
          customer.addressLine1.trim(),
          customer.addressLine2.trim(),
        ]
          .filter(Boolean)
          .join(", "),

        city: customer.city.trim(),
        state: customer.state.trim(),
        country: customer.country.trim(),

        deliveryNotes:
          customer.deliveryNotes?.trim() || "",
      },

      items: selectedGroup.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),

      deliveryFee: 0,
    };

    const apiUrl =
      `${process.env.NEXT_PUBLIC_API_URL}/orders/create`;

    console.log(
      "Order creation URL:",
      apiUrl
    );

    console.log(
      "FULL CHECKOUT ITEMS:",
      JSON.stringify(
        selectedGroup.items,
        null,
        2
      )
    );

    console.log(
      "PRODUCT IDS BEING SENT:",
      selectedGroup.items.map(
        (item) => item.productId
      )
    );

    console.log(
      "PRODUCT ID TYPES:",
      selectedGroup.items.map(
        (item) => ({
          productId: item.productId,
          type: typeof item.productId,
        })
      )
    );

    console.log(
      "ORDER PAYLOAD:",
      JSON.stringify(
        orderPayload,
        null,
        2
      )
    );

    const response = await fetch(
      apiUrl,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(
          orderPayload
        ),
      }
    );

    const responseText =
      await response.text();

    console.log(
      "Order creation status:",
      response.status
    );

    console.log(
      "Order creation raw response:",
      responseText
    );

    let data: any = {};

    try {
      data = responseText
        ? JSON.parse(responseText)
        : {};
    } catch (parseError) {
      console.error(
        "Unable to parse order response:",
        parseError
      );
    }

    console.log(
      "Order creation response:",
      data
    );

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Unable to create your order. Server returned ${response.status}.`
      );
    }

    const orderNumber =
      data?.order?.orderNumber ||
      data?.orderNumber ||
      "";

    setCheckoutSuccess(
      orderNumber
        ? `Your ${selectedGroup.storeName} order has been created successfully. Order number: ${orderNumber}`
        : `Your ${selectedGroup.storeName} order has been created successfully.`
    );

  } catch (error) {
    console.error(
      "Checkout error:",
      error
    );

    setCheckoutError(
      error instanceof Error
        ? error.message
        : "Unable to prepare your order. Please try again."
    );

  } finally {
    setIsSubmitting(false);
  }
};

  /*
   * ============================================================
   * Loading
   * ============================================================
   */

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="mb-6 h-8 w-64 rounded bg-slate-200" />

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="h-[600px] rounded-3xl bg-slate-200" />
            <div className="h-[450px] rounded-3xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * Empty cart
   * ============================================================
   */

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-slate-900">
        <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-sky-50 text-4xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-bold">
            Your cart is empty
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Add products to your cart before proceeding
            to checkout.
          </p>

          <Link
            href="/store-front/shop"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#000271] px-6 py-3.5 font-semibold text-white transition hover:bg-[#17acdd]"
          >
            Explore products
          </Link>
        </section>
      </main>
    );
  }

  /*
   * ============================================================
   * Checkout UI
   * ============================================================
   */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#17acdd]">
              Olatinn Store Front
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Checkout
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Enter your delivery details and review
              your order before payment.
            </p>
          </div>

          <Link
            href="/store-front/cart"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold transition hover:border-[#17acdd] hover:text-[#17acdd]"
          >
            <span
              className="mr-2"
              aria-hidden="true"
            >
              ←
            </span>

            Back to cart
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        {/* Store selector */}

        {groups.length > 1 && (
          <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold">
                Choose a store to checkout
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Each merchant has a separate checkout.
                You can return here and checkout another
                store afterwards.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => {
                const isSelected =
                  group.key === selectedStoreKey;

                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() =>
                      setSelectedStoreKey(group.key)
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? "border-[#17acdd] bg-sky-50 ring-2 ring-[#17acdd]/20"
                        : "border-slate-200 hover:border-[#17acdd]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Merchant
                        </p>

                        <p className="mt-1 font-bold text-[#000271]">
                          {group.storeName ||
                            "Olatinn Merchant"}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="rounded-full bg-[#17acdd] px-2 py-1 text-[10px] font-bold text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-500">
                        {group.items.length}{" "}
                        {group.items.length === 1
                          ? "product"
                          : "products"}
                      </span>

                      <span className="font-bold">
                        {formatMoney(
                          group.subtotal,
                          group.currency
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {selectedGroup && (
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_380px]">
            {/* Customer information */}

            <section className="min-w-0 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="mb-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#17acdd]">
                    Customer details
                  </p>

                  <h2 className="mt-2 text-2xl font-bold">
                    Delivery information
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    You do not need an Olatinn account to
                    place an order. Your details are saved
                    on this device so you can edit them
                    before placing your order.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Full name */}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Full name
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      value={customer.fullName}
                      onChange={(event) =>
                        updateCustomer(
                          "fullName",
                          event.target.value
                        )
                      }
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={customer.email}
                      onChange={(event) =>
                        updateCustomer(
                          "email",
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* Phone */}

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Phone number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      value={customer.phone}
                      onChange={(event) =>
                        updateCustomer(
                          "phone",
                          event.target.value
                        )
                      }
                      placeholder="Your phone number"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* Address */}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="addressLine1"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Home / delivery address
                    </label>

                    <input
                      id="addressLine1"
                      type="text"
                      autoComplete="street-address"
                      value={customer.addressLine1}
                      onChange={(event) =>
                        updateCustomer(
                          "addressLine1",
                          event.target.value
                        )
                      }
                      placeholder="House number, street and area"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* Address line 2 */}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="addressLine2"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Apartment / unit / landmark
                      <span className="ml-2 font-normal text-slate-400">
                        Optional
                      </span>
                    </label>

                    <input
                      id="addressLine2"
                      type="text"
                      autoComplete="address-line2"
                      value={customer.addressLine2}
                      onChange={(event) =>
                        updateCustomer(
                          "addressLine2",
                          event.target.value
                        )
                      }
                      placeholder="Apartment, unit or nearby landmark"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* City */}

                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-semibold"
                    >
                      City
                    </label>

                    <input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      value={customer.city}
                      onChange={(event) =>
                        updateCustomer(
                          "city",
                          event.target.value
                        )
                      }
                      placeholder="City"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* State */}

                  <div>
                    <label
                      htmlFor="state"
                      className="mb-2 block text-sm font-semibold"
                    >
                      State / province
                    </label>

                    <input
                      id="state"
                      type="text"
                      autoComplete="address-level1"
                      value={customer.state}
                      onChange={(event) =>
                        updateCustomer(
                          "state",
                          event.target.value
                        )
                      }
                      placeholder="State or province"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* Postal code */}

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Postal code
                    </label>

                    <input
                      id="postalCode"
                      type="text"
                      autoComplete="postal-code"
                      value={customer.postalCode}
                      onChange={(event) =>
                        updateCustomer(
                          "postalCode",
                          event.target.value
                        )
                      }
                      placeholder="Postal code"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>

                  {/* Country */}

                  <div>
                    <label
                      htmlFor="country"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Country
                    </label>

                    <input
                      id="country"
                      type="text"
                      autoComplete="country-name"
                      value={customer.country}
                      onChange={(event) =>
                        updateCustomer(
                          "country",
                          event.target.value
                        )
                      }
                      placeholder="Country"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#17acdd] focus:ring-2 focus:ring-[#17acdd]/20"
                    />
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-sky-50 p-4">
                  <p className="text-xs leading-5 text-slate-600">
                    Your checkout information is automatically
                    saved in your browser. You can return later
                    and edit it before completing your order.
                  </p>
                </div>
              </div>

              {/* Selected store products */}

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your order
                  </p>

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-bold text-[#000271]">
                      {selectedGroup.storeName ||
                        "Olatinn Merchant"}
                    </h2>

                    <span className="text-sm text-slate-500">
                      {selectedGroup.items.length}{" "}
                      {selectedGroup.items.length === 1
                        ? "product"
                        : "products"}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {selectedGroup.items.map((item) => (
                    <article
                      key={`${item.storeId}-${item.productId}`}
                      className="flex gap-4 p-4 sm:p-5"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span
                            className="text-2xl"
                            aria-hidden="true"
                          >
                            📦
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Quantity: {item.quantity}
                        </p>

                        <p className="mt-2 font-bold text-[#000271]">
                          {formatMoney(
                            item.price * item.quantity,
                            item.currency ||
                              selectedGroup.currency
                          )}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </section>

            {/* Order summary */}

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#17acdd]">
                  Checkout
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  Order summary
                </h2>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Merchant
                </p>

                <p className="mt-1 font-bold text-[#000271]">
                  {selectedGroup.storeName ||
                    "Olatinn Merchant"}
                </p>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Items
                  </span>

                  <span className="font-semibold">
                    {selectedGroup.items.reduce(
                      (total, item) =>
                        total + item.quantity,
                      0
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    {formatMoney(
                      selectedGroup.subtotal,
                      selectedGroup.currency
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-bold">
                    Order total
                  </span>

                  <span className="text-xl font-bold text-[#000271]">
                    {formatMoney(
                      selectedGroup.subtotal,
                      selectedGroup.currency
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-amber-50 p-4">
                <p className="text-xs leading-5 text-slate-600">
                  Delivery fees, taxes, discounts, and
                  payment charges will be confirmed before
                  the final payment step.
                </p>
              </div>

              {checkoutError && (
                <div
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
                  role="alert"
                >
                  <p className="text-sm font-medium text-red-700">
                    {checkoutError}
                  </p>
                </div>
              )}

              {checkoutSuccess && (
                <div
                  className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4"
                  role="status"
                >
                  <p className="text-sm font-medium text-green-700">
                    {checkoutSuccess}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="mt-6 w-full rounded-xl bg-[#000271] px-5 py-3.5 font-semibold text-white transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Preparing order..."
                  : `Continue with ${selectedGroup.storeName || "store"}`}
              </button>

              <Link
                href="/store-front/cart"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold transition hover:border-[#000271] hover:text-[#000271]"
              >
                Return to cart
              </Link>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                By continuing, you confirm that the
                information provided is accurate for
                delivery and order processing.
              </p>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}