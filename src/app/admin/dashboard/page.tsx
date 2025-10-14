"use client";

import React from "react";
import { motion } from "framer-motion";
import AdminBlogForm from "@/app/components/adminBlog/AdminBlogForm";
import AdminChat from "@/app/components/adminChat/adminChat";
import AdminContacts from "@/app/components/adminContact/AdminContact";
import AdminDashboard from "@/app/components/adminDetails/AdminDashboard";
import AdminReviews from "@/app/components/adminReview/Adminreviews";
import DesignTemplate from "@/app/index/designtemplate/DesignTemplate";

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-6 space-y-10">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-[#959A4A] mb-2">
          Admin Control Center
        </h1>
        <p className="text-gray-500">
          Manage blogs, contacts, designs, and reviews efficiently.
        </p>
      </motion.div>

      {/* Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-lg rounded-2xl p-6"
      >
        <AdminDashboard />
      </motion.div>

      {/* Blog + Design Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#959A4A]">
            Design Templates
          </h2>
          <DesignTemplate />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#959A4A]">
            Publish a Blog Post
          </h2>
          <AdminBlogForm />
        </motion.div>
      </div>

      {/* Chat Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-md rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-[#5adfe8] bg-[#000271]">Customer Contacts And Reviews</h2>
        <AdminChat />
      </motion.div>

      {/* Contacts and Reviews */}
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#5adfe8]">
            Contact Messages
          </h2>
          <AdminContacts />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-md rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#959A4A]">
            Reviews and Feedback
          </h2>
          <AdminReviews />
        </motion.div>
      </div>
    </div>
  );
};

export default Page;
