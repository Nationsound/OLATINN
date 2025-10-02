"use client";

import React, { useState } from "react";

const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      // Temporary: no actual API yet
      // Replace with fetch("/api/contact") when backend is ready
      console.log({ name, email, message });

      setTimeout(() => {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      }, 1000);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Contact Us</h1>
      <p>Our team will get back to you soon.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <textarea
          placeholder="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 rounded"
          rows={4}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending..." : "Send Message"}
        </button>
      </form>

      {status === "success" && <p className="text-green-600">Message sent successfully!</p>}
      {status === "error" && <p className="text-red-600">Something went wrong. Try again.</p>}
    </div>
  );
};

export default ContactPage;
