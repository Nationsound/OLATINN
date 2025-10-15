"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <motion.div
      className="max-w-4xl mx-auto p-8 text-gray-800 dark:text-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl text-gray-700 font-bold mb-6 text-center">Privacy Policy</h1>

      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        At <span className="font-extrabold text-2xl text-[#17acdd]">Olusola Adebayo Tech And Innovation (OLATINN) Limited</span>, we respect your privacy and are committed to protecting your
        personal information. This Privacy Policy explains how we collect, use,
        and safeguard your data when you visit our website or use our services.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">1. Information We Collect</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        We may collect information such as your name, email address, and usage
        data when you interact with our platform or contact us.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">2. How We Use Information</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        We use your data to improve our services, respond to inquiries, and send
        updates about our products and offers. We never sell your personal data
        to third parties.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">3. Data Protection</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        We implement secure storage, encryption, and strict access control to
        protect your data from unauthorized access or misuse.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">4. Your Rights</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        You can request access, correction, or deletion of your personal data at
        any time by contacting our support team.
      </p>

      <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        Last updated: {new Date().getFullYear()}
      </p>
    </motion.div>
  );
}
