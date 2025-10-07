"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserInteraction from "../interaction/UserInteraction";
import {Blog} from "../../context/BlogContext";
import { useBlog } from "@/app/context/BlogContext";
import { dummyBlogs } from "../dummy/DummyData";

const API_BASE = "http://localhost:5000/olatinn/api/blogs";

const BlogDetails = () => {
  const { selectedBlog, setSelectedBlog, allBlogs = [] } = useBlog();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Resolve blog
  const blog: Blog | null = useMemo(() => {
  return (
    selectedBlog ??
    allBlogs.find((b: Blog) => b.slug === params.slug) ??
    dummyBlogs.find((b: Blog) => b.slug === params.slug) ??
    null
  );
}, [selectedBlog, allBlogs, params.slug]);
  // Fetch blog if not found locally
  useEffect(() => {
    if (!blog) {
      const fetchBlogBySlug = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API_BASE}/${params.slug}`);
          if (!res.ok) throw new Error("Blog not found");
          const data = await res.json();

          const mappedBlog = {
            id: data._id,
            slug: data.slug,
            title: data.title,
            excerpt: data.content?.slice(0, 200) || "No excerpt available",
            content: data.content || "Unknown",
            coverImage: data.imageUrl || "/images/placeholder.jpg",
            author: data.author || "Unknown",
            date: data.date || new Date(data.createdAt).toLocaleDateString(),
            readingTime: Math.ceil((data.content?.length || 500) / 200),
          };

          setSelectedBlog(mappedBlog);
        } catch (err) {
          console.warn("Blog fetch failed:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchBlogBySlug();
    } else {
      setSelectedBlog(blog);
    }
  }, [blog, params.slug, setSelectedBlog]);

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading blog...</div>;
  }

  if (!blog) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-600">
          Blog not found. Try navigating from the blog list again.
        </p>
        <button
          onClick={() => router.push("/blog")}
          className="mt-4 px-6 py-3 rounded-xl bg-[#000271] text-white hover:bg-[#5adfe8] transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Combine all blogs for navigation
  const combinedBlogs = [...dummyBlogs, ...allBlogs];
  const currentIndex = combinedBlogs.findIndex((b) => b.slug === blog.slug);
  const prevBlog =
    currentIndex > 0
      ? combinedBlogs[currentIndex - 1]
      : combinedBlogs[combinedBlogs.length - 1];
  const nextBlog =
    currentIndex < combinedBlogs.length - 1
      ? combinedBlogs[currentIndex + 1]
      : combinedBlogs[0];

  return (
    <>
      {/* ✅ SEO for each blog */}

      <AnimatePresence mode="wait">
        <motion.div
          key={blog.slug}
          className="max-w-4xl mx-auto px-4 py-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
        >
          {/* Title */}
          <motion.h1
            className="text-4xl font-bold mb-6 text-[#000271]"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {blog.title}
          </motion.h1>

          {/* Cover Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Image
              src={blog.coverImage || "/images/placeholder.jpg"}
              alt={blog.title}
              width={800}
              height={500}
              className="w-full h-[500px] object-cover rounded-xl mb-8 shadow-lg"
            />
          </motion.div>

          {/* Content */}
          <motion.p
            className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {blog?.content || blog?.excerpt || "No content available."}
          </motion.p>

          {/* Author + Date */}
          <motion.div
            className="mt-6 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            By {blog.author || "Unknown"} • {blog.date || "Unknown date"} •{" "}
            {blog.readingTime || 5} min read
          </motion.div>

          {/* Navigation */}
          <motion.div
            className="mt-8 flex justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => router.push(`/blog/${prevBlog.slug}`)}
              className="px-6 py-3 rounded-xl bg-[#17acdd] text-gray-700 hover:bg-[#000271] transition cursor-pointer"
            >
              ← Previous
            </button>
            <button
              onClick={() => router.push(`/blog/${nextBlog.slug}`)}
              className="px-6 py-3 rounded-xl bg-[#000271] text-white hover:bg-[#17acdd] transition cursor-pointer"
            >
              Next →
            </button>
          </motion.div>

          {/* User Interaction */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <UserInteraction blogId={blog.slug} />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default BlogDetails;
