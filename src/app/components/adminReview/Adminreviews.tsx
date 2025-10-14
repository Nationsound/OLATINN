"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Trash2, Star } from "lucide-react";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  createdAt: string;
}

interface ReviewFormData {
  name: string;
  comment: string;
  rating: number;
}

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [formData, setFormData] = useState<ReviewFormData>({
    name: "",
    comment: "",
    rating: 5,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchReviews = async () => {
    const res = await fetch("http://localhost:5000/olatinn/api/contact-reviews/reviews");
    const data = await res.json();
    setReviews(data);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `http://localhost:5000/olatinn/api/contact-reviews/reviews/${editingId}`
      : "http://localhost:5000/olatinn/api/contact-reviews/reviews";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      setFormData({ name: "", comment: "", rating: 5 });
      setEditingId(null);
      fetchReviews();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    const res = await fetch(`http://localhost:5000/olatinn/api/contact-reviews/reviews/${id}`, {
      method: "DELETE",
    });

    if (res.ok) fetchReviews();
  };

  const handleEdit = (review: Review) => {
    setEditingId(review._id);
    setFormData({
      name: review.name,
      comment: review.comment,
      rating: review.rating,
    });
  };

  return (
    <motion.div
      className="p-8 rounded-2xl bg-gradient-to-br from-[#f9fafb] to-[#f3f4f6] shadow-2xl mt-12 border border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
        ✨ Manage Customer Reviews
      </h2>

      {/* --- Review Form --- */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-4 items-center justify-center mb-10"
      >
        <input
          type="text"
          placeholder="Reviewer Name"
          className="border p-3 rounded-xl w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-[#000271]"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Comment"
          className="border p-3 rounded-xl w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-[#000271]"
          value={formData.comment}
          onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
          required
        />
        <select
          className="border p-3 rounded-xl w-full md:w-1/6 focus:outline-none focus:ring-2 focus:ring-[#000271]"
          value={formData.rating}
          onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} ⭐
            </option>
          ))}
        </select>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="w-full md:w-auto bg-[#000271] hover:bg-[#17acdd] text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-300"
        >
            Submit
          {editingId ? "Update Review" : "Post Review"}
        </motion.button>
      </form>

      {/* --- Reviews List --- */}
      <AnimatePresence>
        <div className="space-y-4">
          {reviews.map((rev) => (
            <motion.div
              key={rev._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 bg-white rounded-2xl shadow-md flex justify-between items-start border border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <div>
                <p className="font-semibold text-lg text-gray-900">{rev.name}</p>
                <p className="text-gray-700">{rev.comment}</p>
                <div className="flex items-center gap-1 text-yellow-500 mt-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="gold" stroke="none" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(rev.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleEdit(rev)}
                  className="bg-[#17acdd] hover:bg-[#000271] text-white px-3 py-2 rounded-lg flex items-center gap-1 shadow-md"
                >
                  <Pencil size={16} /> Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => handleDelete(rev._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center gap-1 shadow-md"
                >
                  <Trash2 size={16} /> Delete
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminReviews;
