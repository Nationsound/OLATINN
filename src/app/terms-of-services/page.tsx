"use client";

import { motion } from "framer-motion";

export default function TermsOfService() {
  return (
    <motion.div
      className="max-w-4xl mx-auto p-8 text-gray-800 dark:text-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl text-gray-700 font-bold mb-6 text-center">Terms of Service</h1>

      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        Welcome to <span className="font-extrabold text-2xl text-[#17acdd]">Olusola Adebayo Tech And Innovation (OLATINN) Limited</span>. By using our website and services, you agree to these
        Terms of Service. Please read them carefully before continuing.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">1. Use of Our Services</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        You agree to use our services only for lawful purposes and in accordance
        with these terms. Misuse of our platform may result in account
        suspension.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">2. Intellectual Property</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        All content, logos, and materials on Olatinn are the property of Olatinn
        or its licensors and are protected by copyright and trademark laws.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">3. Limitation of Liability</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        Olatinn is not responsible for any damages or losses resulting from the
        use or inability to use our services.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">4. Changes to Terms</h2>
      <p className="mb-4 text-gray-500 leading-relaxed tracking-wider font-serif">
        We reserve the right to update these Terms at any time. Continued use of
        our services means you accept the updated version.
      </p>

      <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
        Last updated: {new Date().getFullYear()}
      </p>
    </motion.div>
  );
}
