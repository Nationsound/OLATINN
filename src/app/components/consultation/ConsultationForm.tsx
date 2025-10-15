"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { motion } from "framer-motion";

interface ConsultationFormData {
  name: string;
  email: string;
  message: string;
}

const ConsultationForm: React.FC = () => {
  const [form, setForm] = useState<ConsultationFormData>({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  // Handle form field updates
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Shared submit logic with contact form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/olatinn/api/contact-reviews/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to send message");

      alert("✅ Thank you! Your consultation request has been received.");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-[#f8f9fb] text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#333b69]">
        Book a Free Consultation
      </h2>
      <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
        Let’s discuss your project goals and see how Olatinn can help you grow.
      </p>

      <motion.form
        onSubmit={handleSubmit}
        whileHover={{ scale: 1.01 }}
        className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-lg"
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:border-[#17acdd]"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:border-[#17acdd]"
          required
        />

        <textarea
          name="message"
          placeholder="Tell us about your project..."
          value={form.message}
          onChange={handleChange}
          rows={4}
          className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:border-[#17acdd]"
          required
        ></textarea>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#000271] hover:bg-[#17acdd]"
          }`}
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </motion.form>
    </section>
  );
};

export default ConsultationForm;
