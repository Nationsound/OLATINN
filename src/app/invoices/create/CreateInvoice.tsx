"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image"; // ✅ replaces <img>

interface Service {
  description: string;
  amount: string;
}

interface FormData {
  clientName: string;
  clientEmail: string;
  deposit: number;
  currency: string;
  services: Service[];
  logo: File | null;
}

interface AlertType {
  type: "success" | "error" | "";
  message: string;
}

export default function CreateInvoicePage() {
  const [formData, setFormData] = useState<FormData>({
    clientName: "",
    clientEmail: "",
    deposit: 0,
    currency: "₦",
    services: [{ description: "", amount: "" }],
    logo: null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertType>({ type: "", message: "" });

  // ✅ Handle input change for client info, deposit
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "deposit" ? Number(value) : value,
    }));
  };

  // ✅ Handle logo upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo: file }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // ✅ Handle service field change
  const handleServiceChange = (
    index: number,
    field: keyof Service,
    value: string
  ): void => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    setFormData((prev) => ({ ...prev, services: newServices }));
  };

  // ✅ Add new service
  const addService = (): void => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { description: "", amount: "" }],
    }));
  };

  // ✅ Remove service
  const removeService = (index: number): void => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, services: newServices }));
  };

  // ✅ Submit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setAlert({ type: "", message: "" });

    try {
      const data = new FormData();
      data.append("clientName", formData.clientName);
      data.append("clientEmail", formData.clientEmail);
      data.append("deposit", formData.deposit.toString());
      data.append("currency", formData.currency);
      data.append("services", JSON.stringify(formData.services));
      if (formData.logo) data.append("logo", formData.logo);

      const res = await fetch(
        "http://localhost:5000/olatinn/api/invoices/create",
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error creating invoice");
      }

      setAlert({
        type: "success",
        message: "✅ Invoice created and emailed successfully!",
      });

      // ✅ Reset form
      setFormData({
        clientName: "",
        clientEmail: "",
        deposit: 0,
        currency: "₦",
        services: [{ description: "", amount: "" }],
        logo: null,
      });
      setPreview(null);
    } catch (err: unknown) {
      // ✅ Replace `any` with proper type check
      const message =
        err instanceof Error ? err.message : "An unknown error occurred";
      setAlert({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4"
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4 text-[#000271]">
          Create New Invoice
        </h2>

        {alert.message && (
          <div
            className={`text-center mb-4 p-2 rounded ${
              alert.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Info */}
          <input
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="Client Name"
            required
            className="w-full border p-2 rounded"
          />
          <input
            name="clientEmail"
            type="email"
            value={formData.clientEmail}
            onChange={handleChange}
            placeholder="Client Email"
            required
            className="w-full border p-2 rounded"
          />

          {/* Deposit & Currency */}
          <input
            type="number"
            name="deposit"
            value={formData.deposit}
            onChange={handleChange}
            placeholder="Deposit (optional)"
            className="w-full border p-2 rounded"
          />

          <select
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="₦">Naira (₦)</option>
            <option value="$">Dollar ($)</option>
            <option value="€">Euro (€)</option>
            <option value="£">British Pound (£)</option>
            <option value="د.إ">Dirham (د.إ)</option>
          </select>

          {/* Services */}
          {formData.services.map((service, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                value={service.description}
                placeholder="Service Description"
                required
                onChange={(e) =>
                  handleServiceChange(index, "description", e.target.value)
                }
                className="flex-1 border p-2 rounded"
              />

              <input
                type="number"
                value={service.amount}
                placeholder="Amount"
                required
                onChange={(e) =>
                  handleServiceChange(index, "amount", e.target.value)
                }
                className="w-24 border p-2 rounded"
              />

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="bg-red-500 text-white px-2 rounded"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addService}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add Another Service
          </button>

          {/* ✅ Logo Upload (using next/image) */}
          <div className="border p-2 rounded">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Logo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm"
            />
            {preview && (
              <div className="mt-3 flex justify-center">
                <Image
                  src={preview}
                  alt="Logo Preview"
                  width={96}
                  height={96}
                  className="object-contain border rounded-md"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#000271] hover:bg-[#17acdd] text-white py-2 rounded-lg font-semibold transition"
          >
            {loading ? "Processing..." : "Create & Send Invoice"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
