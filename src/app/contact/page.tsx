"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  createdAt: string;
}

const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [reviews, setReviews] = useState<Review[]>([]);

  // Fetch reviews (visible to all, only admin can post)
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("http://localhost:5000/olatinn/api/contact-reviews/reviews");
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("http://localhost:5000/olatinn/api/contact-reviews/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex flex-col items-center justify-center px-4 py-12 space-y-16">
      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-lg w-full text-white"
      >
        <h1 className="text-4xl font-bold text-center mb-4">Contact Us</h1>
        <p className="text-center text-gray-200 mb-6">We’ll get back to you soon ✉️</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <textarea
            placeholder="Your Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="p-3 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            required
          />
          <button
            type="submit"
            className="bg-yellow-400 text-gray-900 font-semibold py-3 rounded-lg hover:bg-yellow-300 transition-colors"
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status === "success" && (
          <p className="text-green-300 text-center mt-3">Message sent successfully!</p>
        )}
        {status === "error" && (
          <p className="text-red-300 text-center mt-3">Something went wrong. Try again.</p>
        )}
      </motion.div>

      {/* Reviews Section */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white shadow-lg"
      >
        <h2 className="text-3xl font-semibold text-center mb-6">Customer Reviews 💬</h2>

        {reviews.length === 0 ? (
          <p className="text-center text-gray-200">No reviews yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <motion.div
                key={review._id}
                whileHover={{ scale: 1.03 }}
                className="bg-white/20 rounded-xl p-5 shadow-md"
              >
                <h3 className="font-bold text-lg">{review.name}</h3>
                <p className="text-gray-100 mt-2">{review.comment}</p>
                <p className="text-yellow-300 mt-3">⭐ {review.rating}/5</p>
                <p className="text-xs text-gray-300 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ContactPage;
