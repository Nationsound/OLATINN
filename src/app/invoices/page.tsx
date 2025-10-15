"use client";

import React, { useEffect, useState } from "react";

interface ServiceItem {
  description: string;
  amount: number;
}

interface Invoice {
  _id: string;
  clientName: string;
  clientEmail: string;
  services?: ServiceItem[];
  subtotal?: number;
  total?: number;
  deposit?: number;
  balanceDue?: number;
  currency?: string; // currency symbol from backend
  pdfPath?: string;
  invoiceNumber?: string;
  logoUrl?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/olatinn/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Delete invoice by ID
  const deleteInvoice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const res = await fetch(`http://localhost:5000/olatinn/api/invoices/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to delete invoice");
      }

      // Remove deleted invoice from state
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
    } catch (err: any) {
      console.error("Error deleting invoice:", err.message);
      alert("Failed to delete invoice: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-lg text-gray-500">
        Loading invoices...
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold text-[#17acdd] mb-4">Invoices</h1>
        <p className="text-gray-600 text-center">No invoices created yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-[#17acdd]">Invoices</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {invoices.map((inv) => (
          <div
            key={inv._id}
            className="bg-white shadow-md hover:shadow-lg transition rounded-2xl p-5 flex flex-col"
          >
            {/* Logo */}
            {inv.logoUrl && (
              <div className="flex justify-end mb-2">
                <img
                  src={inv.logoUrl}
                  alt="Company Logo"
                  className="w-20 h-20 object-contain rounded"
                />
              </div>
            )}

            <h2 className="font-semibold text-lg text-gray-800">{inv.clientName}</h2>
            <p className="text-sm text-gray-500">{inv.clientEmail}</p>

            {/* Services */}
            {inv.services && inv.services.length > 0 && (
              <div className="mt-3">
                {inv.services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between text-gray-700 text-sm mb-1"
                  >
                    <span>{srv.description}</span>
                    <span>
                      {inv.currency ?? "₦"}
                      {srv.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="mt-3 border-t pt-2">
              {inv.subtotal !== undefined && (
                <p className="flex justify-between text-gray-600 text-sm">
                  <span>Subtotal:</span>
                  <span>
                    {inv.currency ?? "₦"}
                    {inv.subtotal.toLocaleString()}
                  </span>
                </p>
              )}
              {inv.deposit !== undefined && (
                <p className="flex justify-between text-gray-600 text-sm">
                  <span>Deposit:</span>
                  <span>
                    {inv.currency ?? "₦"}
                    {inv.deposit.toLocaleString()}
                  </span>
                </p>
              )}
              {inv.balanceDue !== undefined && (
                <p className="flex justify-between font-bold text-[#17acdd]">
                  <span>Balance Due:</span>
                  <span>
                    {inv.currency ?? "₦"}
                    {inv.balanceDue.toLocaleString()}
                  </span>
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-4 flex gap-2">
              {inv.pdfPath && (
                <a
                  href={`http://localhost:5000/olatinn/api/invoices/${inv._id}/download`}
                  className="flex-1 bg-[#000271] hover:bg-[#17acdd] text-white px-4 py-2 rounded-lg text-center font-semibold transition"
                >
                  Download PDF
                </a>
              )}
              <button
                onClick={() => deleteInvoice(inv._id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
