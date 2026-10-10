// app/store-front/products/new/page.tsx

"use client";

import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || "";

const PRODUCTS_URL = API_URL ? `${API_URL}/products` : "";

const MAX_IMAGE_SIZE = 5 * 3024 * 3024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") || "";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [trackInventory, setTrackInventory] = useState(true);

  const [image, setImage] = useState<File | null>(null);
  const [imageAlt, setImageAlt] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [image]);

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile = event.target.files?.[0];

    setError("");

    if (!selectedFile) {
      setImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      setImage(null);
      event.target.value = "";
      setError("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setImage(null);
      event.target.value = "";
      setError("The image must not exceed 5 MB.");
      return;
    }

    setImage(selectedFile);
  }

  function removeImage() {
    setImage(null);
    setImageAlt("");

    const input = document.getElementById(
      "productImage"
    ) as HTMLInputElement | null;

    if (input) {
      input.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!storeId) {
      setError(
        "Store ID is missing. Return to your Store Front dashboard and select a store."
      );
      return;
    }

    if (!PRODUCTS_URL) {
      setError("NEXT_PUBLIC_API_URL is not configured.");
      return;
    }

    const token = localStorage.getItem("olatinnToken");

    if (!token) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    if (!name.trim()) {
      setError("Enter a product name.");
      return;
    }

    const productPrice = Number(price);
    const stock = Number(stockQuantity);

    const originalPrice =
      compareAtPrice.trim() === ""
        ? null
        : Number(compareAtPrice);

    if (!Number.isFinite(productPrice) || productPrice < 0) {
      setError("Enter a valid selling price.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError(
        "Stock quantity must be a whole number of zero or greater."
      );
      return;
    }

    if (
      originalPrice !== null &&
      (!Number.isFinite(originalPrice) || originalPrice < 0)
    ) {
      setError(
        "Enter a valid original price or leave the field empty."
      );
      return;
    }

    if (image && !ALLOWED_IMAGE_TYPES.includes(image.type)) {
      setError("The selected image format is not supported.");
      return;
    }

    if (image && image.size > MAX_IMAGE_SIZE) {
      setError("The image must not exceed 5 MB.");
      return;
    }

    // FormData allows the browser to send both text fields and a file.
    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("category", category.trim());
    formData.append("brand", brand.trim());
    formData.append("sku", sku.trim());
    formData.append("price", String(productPrice));
    formData.append(
      "compareAtPrice",
      originalPrice === null ? "" : String(originalPrice)
    );
    formData.append("stockQuantity", String(stock));
    formData.append("trackInventory", String(trackInventory));
    formData.append("status", status);
    formData.append("imageAlt", imageAlt.trim());

    if (image) {
      formData.append("image", image);
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${PRODUCTS_URL}/store/${encodeURIComponent(storeId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      // Do not set Content-Type manually for FormData.
      // The browser adds the required multipart boundary.

      const data: {
        success?: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to create the product."
        );
      }

      router.push(
        `/store-front/products?storeId=${encodeURIComponent(storeId)}`
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the product."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <Link
            href={
              storeId
                ? `/store-front/products?storeId=${encodeURIComponent(storeId)}`
                : "/store-front"
            }
            className="text-sm font-semibold text-[#17acdd] hover:underline"
          >
            ← Back to Product Management
          </Link>

          <h1 className="mt-4 text-3xl font-extrabold text-[#000271] sm:text-4xl">
            Add a Product
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Add your product details, upload an image, set the price,
            and manage your inventory.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#000271]">
              Product Information
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product Name *
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Classic Leather Sneakers"
                  maxLength={150}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe the product and its features..."
                  rows={5}
                  maxLength={5000}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Category
                </label>

                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="e.g. Fashion"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor="brand"
                  className="mb-2 block text-sm font-semibold"
                >
                  Brand
                </label>

                <input
                  id="brand"
                  type="text"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  placeholder="e.g. Olatinn Collection"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="sku"
                  className="mb-2 block text-sm font-semibold"
                >
                  SKU / Product Code
                </label>

                <input
                  id="sku"
                  type="text"
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="e.g. SNEAKER-001"
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>
          </section>

          {/* Pricing and inventory */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#000271]">
              Pricing and Inventory
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-semibold"
                >
                  Selling Price *
                </label>

                <input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div>
                <label
                  htmlFor="compareAtPrice"
                  className="mb-2 block text-sm font-semibold"
                >
                  Original Price (Optional)
                </label>

                <input
                  id="compareAtPrice"
                  type="number"
                  value={compareAtPrice}
                  onChange={(event) => setCompareAtPrice(event.target.value)}
                  placeholder="e.g. 899.99"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="stockQuantity"
                  className="mb-2 block text-sm font-semibold"
                >
                  Available Stock
                </label>

                <input
                  id="stockQuantity"
                  type="number"
                  value={stockQuantity}
                  onChange={(event) => setStockQuantity(event.target.value)}
                  min="0"
                  step="1"
                  disabled={!trackInventory}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
                  <input
                    type="checkbox"
                    checked={trackInventory}
                    onChange={(event) =>
                      setTrackInventory(event.target.checked)
                    }
                    className="mt-1 h-4 w-4 accent-[#000271]"
                  />

                  <span>
                    <span className="block text-sm font-bold text-[#000271]">
                      Track inventory
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Enable this option to track available units.
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Image upload */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#000271]">
              Product Image
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Upload a clear image of your product. Maximum file size: 5 MB.
            </p>

            <div className="mt-6">
              <label
                htmlFor="productImage"
                className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-[#17acdd] hover:bg-cyan-50"
              >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt={imageAlt || name || "Selected product image"}
                      className="mb-4 max-h-64 max-w-full rounded-xl object-contain"
                    />

                    <span className="text-sm font-bold text-[#000271]">
                      Choose a different image
                    </span>
                  </>
                ) : (
                  <>
                    <span className="mb-3 text-5xl">📷</span>

                    <span className="text-base font-bold text-[#000271]">
                      Click to upload an image
                    </span>

                    <span className="mt-2 text-sm text-slate-500">
                      JPG, PNG, WebP or GIF
                    </span>
                  </>
                )}

                <input
                  id="productImage"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </label>

              {image && (
                <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold text-slate-800">
                      {image.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {(image.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Remove Image
                  </button>
                </div>
              )}

              <div className="mt-5">
                <label
                  htmlFor="imageAlt"
                  className="mb-2 block text-sm font-semibold"
                >
                  Image Description
                </label>

                <input
                  id="imageAlt"
                  type="text"
                  value={imageAlt}
                  onChange={(event) => setImageAlt(event.target.value)}
                  placeholder="Briefly describe the image"
                  maxLength={200}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#17acdd] focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>
          </section>

          {/* Publishing options */}
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-[#000271]">
              Publishing
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label
                className={`cursor-pointer rounded-xl border p-4 ${
                  status === "draft"
                    ? "border-[#000271] bg-blue-50"
                    : "border-slate-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "draft"}
                    onChange={() => setStatus("draft")}
                    className="accent-[#000271]"
                  />

                  <span>
                    <span className="block text-sm font-bold text-[#000271]">
                      Save as Draft
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Keep the product unpublished.
                    </span>
                  </span>
                </span>
              </label>

              <label
                className={`cursor-pointer rounded-xl border p-4 ${
                  status === "published"
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-slate-200"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="status"
                    checked={status === "published"}
                    onChange={() => setStatus("published")}
                    className="accent-emerald-600"
                  />

                  <span>
                    <span className="block text-sm font-bold text-emerald-800">
                      Publish Product
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Request publication immediately.
                    </span>
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={
                storeId
                  ? `/store-front/products?storeId=${encodeURIComponent(storeId)}`
                  : "/store-front"
              }
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-bold text-[#000271] hover:border-[#17acdd]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#000271] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#17acdd] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Uploading and Saving..."
                : status === "published"
                  ? "Save and Publish"
                  : "Save as Draft"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function AddProductPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">
          Loading product form...
        </main>
      }
    >
      <AddProductContent />
    </Suspense>
  );
}