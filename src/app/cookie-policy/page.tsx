"use client";

import React from "react";
import { motion } from "framer-motion";

const CookiePolicy = () => {
  return (
    <motion.section
      className="max-w-5xl mx-auto py-20 px-6 text-gray-700 leading-7"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h1
        className="text-3xl font-bold mb-6 text-[#17acdd]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Cookie Policy
      </motion.h1>

      <motion.p
        className="mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        This Cookie Policy explains how <strong>OLATINN</strong> uses cookies
        and similar technologies to recognize you when you visit our website.
        It details what these technologies are and why we use them, as well as
        your rights to control our use of them.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mt-8 mb-3">What Are Cookies?</h2>
        <p className="mb-4">
          Cookies are small text files stored on your device when you visit a
          website. They help websites recognize your device and store
          information about your preferences or past actions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">How We Use Cookies</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To improve the functionality and performance of our website.</li>
          <li>To analyze website traffic and user interactions.</li>
          <li>To personalize content and remember your preferences.</li>
          <li>To support security and authentication processes.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          Types of Cookies We Use
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Essential Cookies:</strong> Necessary for basic website
            functionality.
          </li>
          <li>
            <strong>Performance Cookies:</strong> Collect anonymous data about
            how visitors use our site.
          </li>
          <li>
            <strong>Functional Cookies:</strong> Remember your preferences and
            enhance your experience.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us measure and improve our
            website performance.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          Managing Your Cookie Preferences
        </h2>
        <p className="mb-4">
          You can control and manage cookies in your browser settings. Most
          browsers allow you to refuse cookies or delete them. However,
          disabling cookies may affect the functionality of our website.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3">
          Updates to This Policy
        </h2>
        <p className="mb-4">
          We may update this Cookie Policy from time to time to reflect changes
          in technology, legal requirements, or our practices. The date of the
          latest update will always be displayed at the bottom of this page.
        </p>

        <p className="mt-8 text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </motion.div>
    </motion.section>
  );
};

export default CookiePolicy;
