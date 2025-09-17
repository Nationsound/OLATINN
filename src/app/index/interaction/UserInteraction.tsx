"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type Props = {
  blogId: number | string;
};

type Comment = {
  id: number;
  name: string;
  text: string;
};

type BlogInteractionData = {
  comments: Comment[];
  likes: number;
  rating: number; // average rating
  userRating?: number; // logged-in user's rating (stored locally)
};

const COMMENTS_PER_PAGE = 3;

const UserInteraction = ({ blogId }: Props) => {
  const storageKey = `interaction_${blogId}`;

  const [data, setData] = useState<BlogInteractionData>({
    comments: [],
    likes: 0,
    rating: 0,
    userRating: undefined,
  });

  const [form, setForm] = useState({ name: "", email: "", text: "" });
  const [page, setPage] = useState(1);

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setData(JSON.parse(saved));
    }
  }, [storageKey]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data, storageKey]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.text) return;

    const newComment: Comment = {
      id: Date.now(),
      name: form.name,
      text: form.text,
    };

    setData((prev) => ({
      ...prev,
      comments: [...prev.comments, newComment],
    }));
    setForm({ name: "", email: "", text: "" });
    setPage(Math.ceil((data.comments.length + 1) / COMMENTS_PER_PAGE)); // move to last page
  };

  const handleLike = () => {
    setData((prev) => ({ ...prev, likes: prev.likes + 1 }));
  };

  const handleRating = (value: number) => {
    setData((prev) => {
      const newRating = prev.userRating
        ? prev.rating // keep old avg since user already rated
        : (prev.rating * prev.comments.length + value) /
          (prev.comments.length + 1 || 1);

      return { ...prev, rating: newRating, userRating: value };
    });
  };

  // Pagination
  const totalPages = Math.ceil(data.comments.length / COMMENTS_PER_PAGE);
  const paginatedComments = data.comments.slice(
    (page - 1) * COMMENTS_PER_PAGE,
    page * COMMENTS_PER_PAGE
  );

  return (
    <motion.div
      className="p-6 border rounded-xl shadow-md bg-white dark:bg-[#17acdd] mt-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-semibold mb-6 text-[#000271]">
        Share Your Thoughts
      </h2>

      {/* Like & Rating */}
      <div className="flex items-center gap-6 mb-6">
        {/* Likes */}
        <button
          onClick={handleLike}
          className="px-4 py-2 rounded-lg bg-[#000271] text-white hover:bg-[#1a1a8c] transition"
        >
          👍 Like ({data.likes})
        </button>

        {/* Ratings */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              className={`text-2xl ${
                data.userRating && data.userRating >= star
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="ml-2 text-gray-700 dark:text-gray-200">
          Avg: {data.rating.toFixed(1)}
        </span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#000271] outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Your email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#000271] outline-none"
        />
        <textarea
          name="text"
          placeholder="Write a comment..."
          value={form.text}
          onChange={handleChange}
          rows={4}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#000271] outline-none"
        ></textarea>
        <button
          type="submit"
          className="px-6 py-3 rounded-lg bg-[#000271] text-white font-medium hover:bg-[#1a1a8c] transition"
        >
          Post Comment
        </button>
      </form>

      {/* Comment List */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Comments ({data.comments.length})
        </h3>
        <div className="space-y-4">
          {paginatedComments.map((c) => (
            <motion.div
              key={c.id}
              className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="font-medium text-[#000271]">{c.name}</p>
              <p className="text-gray-600 dark:text-gray-300">{c.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-600 dark:text-gray-200">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default UserInteraction;
