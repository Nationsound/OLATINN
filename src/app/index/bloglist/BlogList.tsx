"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Image from "next/image";
import { NextSeo } from "next-seo";
import { useBlog, Blog } from "@/app/context/BlogContext";
import { dummyBlogs } from "../dummy/DummyData";

const API_BASE = "http://localhost:5000/olatinn/api/blogs";

const BlogList = () => {
  const router = useRouter();
  const { setSelectedBlog, allBlogs = [], setAllBlogs } = useBlog();

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const blogsPerPage = 2;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();

        // Map API data to context Blog type
        const normalized: Blog[] = data.map((b: any) => ({
          id: Number(b._id || b.id), // ensure number type
          slug: b.slug,
          title: b.title,
          excerpt: b.excerpt,
          content: b.content,
          coverImage: b.coverImage,
          imageUrl: b.imageUrl,
          author: b.author,
          date: b.date,
          createdAt: b.createdAt,
          readingTime: b.readingTime,
        }));

        // Ensure dummy blogs match context Blog type
        const merged: Blog[] = [...dummyBlogs.map(d => ({
          ...d,
          id: Number(d.id), 
        })), ...normalized];

        setAllBlogs(merged);
      } catch (err) {
        console.error("Error fetching blogs:", err);

        // fallback to dummyBlogs, ensure type
        setAllBlogs(dummyBlogs.map(d => ({ ...d, id: Number(d.id) })));
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [setAllBlogs]);

  const totalPages = Math.ceil(allBlogs.length / blogsPerPage);
  const startIndex = (page - 1) * blogsPerPage;
  const currentBlogs = allBlogs.slice(startIndex, startIndex + blogsPerPage);

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading blogs...</div>;
  }

  return (
    <>
      <NextSeo
        title="Dive Into The Amazing World Of Technology | OLatinn"
        description="Explore insightful blogs on technology, innovation, and digital transformation. Stay updated with OLatinn’s latest articles."
        canonical="http://www.olatinnlimited.com/blog"
        openGraph={{
          url: "http://www.olatinnlimited.com/blog",
          title: "Dive Into The Amazing World Of Technology | OLatinn",
          description:
            "Explore insightful blogs on technology, innovation, and digital transformation. Stay updated with OLatinn’s latest articles.",
          images: [
            {
              url: "/images/placeholder.jpg",
              width: 1200,
              height: 630,
              alt: "OLatinn Blog Cover",
            },
          ],
          site_name: "OLatinn",
        }}
        twitter={{
          handle: "@olatinn",
          site: "@olatinn",
          cardType: "summary_large_image",
        }}
      />

      <div className="w-full flex justify-center px-4 py-12">
        <div className="w-full max-w-[1300px]">
          <motion.h1
            className="text-4xl font-bold mb-10 text-center text-[#000271]"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Dive Into The Amazing World Of Technology
          </motion.h1>

          <div className="flex flex-col gap-12 items-center">
            {currentBlogs.map((blog, idx) => (
              <motion.article
                key={blog.id}
                onClick={() => {
                  setSelectedBlog(blog);
                  router.push(`/blog/${blog.slug}`);
                }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden transition cursor-pointer lg:min-w-[800px] lg:min-h-[800px] w-full max-w-[1000px]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * idx, duration: 0.45 }}
              >
                <div className="w-full h-[350px] md:h-[400px] lg:h-[450px] relative">
                  <Image
                    src={blog.coverImage || blog.imageUrl || "/images/placeholder.jpg"}
                    alt={blog.title || "Blog image"}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>

                <div className="p-8 flex flex-col justify-between">
                  <h2 className="text-2xl font-semibold mb-3 text-[#5adfe8]">
                    {blog.title || "Untitled"}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed line-clamp-4">
                    {blog.excerpt || blog.content?.slice(0, 300) + "..." || "No content available."}
                  </p>

                  <div className="mt-6 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{blog.author ?? "Unknown author"}</span>
                    <span>
                      {blog.date ??
                        (blog.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString()
                          : "Unknown date")}{" "}
                      • {blog.readingTime ?? Math.ceil((blog.content?.length || 500) / 200)} min read
                    </span>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBlog(blog);
                        router.push(`/blog/${blog.slug}`);
                      }}
                      className="px-6 py-3 rounded-xl bg-[#000271] text-white font-semibold hover:bg-[#17acdd] transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition ${
                page === 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#000271] text-white hover:bg-[#17acdd]"
              }`}
            >
              <FaArrowLeft /> Previous
            </button>

            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition ${
                page === totalPages
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#000271] text-white hover:bg-[#17acdd]"
              }`}
            >
              Next <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogList;
