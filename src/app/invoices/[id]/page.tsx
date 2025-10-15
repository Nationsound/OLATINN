"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  services: { description: string; amount: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  pdfPath?: string;
  createdAt: string;
  dueDate?: string;
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/olatinn/api/invoices/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setInvoice(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching invoice:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-[#000271] text-xl font-semibold">
        Loading invoice details...
      </div>
    );

  if (!invoice)
    return (
      <div className="text-center py-20 text-[#000271] font-medium">
        Invoice not found.
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f8f9fb] flex flex-col items-center py-10 px-6"
    >
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-3xl p-8 border-t-4 border-[#17acdd]">
        <h1 className="text-3xl font-bold text-center text-[#000271] mb-2">
          Invoice Details
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Invoice Number: <span className="font-semibold">{invoice.invoiceNumber}</span>
        </p>

        <div className="space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Client Name:</span> {invoice.clientName}
          </p>
          <p>
            <span className="font-semibold">Client Email:</span> {invoice.clientEmail}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`px-2 py-1 rounded text-white ${
                invoice.status === "Paid"
                  ? "bg-green-600"
                  : invoice.status === "Pending"
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
            >
              {invoice.status}
            </span>
          </p>
          <p>
            <span className="font-semibold">Issued On:</span>{" "}
            {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
          {invoice.dueDate && (
            <p>
              <span className="font-semibold">Due Date:</span>{" "}
              {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>

        <hr className="my-6 border-gray-300" />

        <h2 className="text-xl font-semibold mb-2 text-[#959A4A]">Services</h2>
        <ul className="space-y-2 text-gray-700">
          {invoice.services.map((srv, idx) => (
            <li key={idx} className="flex justify-between border-b py-2">
              <span>{srv.description}</span>
              <span className="font-semibold">₦{srv.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 text-right text-gray-800">
          <p>Subtotal: ₦{invoice.subtotal.toLocaleString()}</p>
          <p>Tax: ₦{invoice.tax.toLocaleString()}</p>
          <p className="text-lg font-bold text-[#000271] mt-2">
            Total: ₦{invoice.total.toLocaleString()}
          </p>
        </div>

        <div className="flex justify-center mt-8">
          <a
            href={`http://localhost:5000/olatinn/api/invoices/${invoice._id}/download`}
            className="px-6 py-3 rounded-lg bg-[#000271] text-white font-medium hover:bg-[#17acdd] transition"
          >
            Download PDF
          </a>
        </div>

        <p className="mt-8 text-xs text-center text-gray-500">
          Approved by Olusola Adebayo Tech and Inn. Ltd
        </p>
      </div>
    </motion.div>
  );
}
