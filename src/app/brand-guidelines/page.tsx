"use client";

import { motion } from "framer-motion";

export default function BrandGuidelines() {
  return (
    <motion.div
      className="max-w-4xl mx-auto p-8 text-gray-800 dark:text-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl font-bold mb-6 text-center">Brand Guidelines</h1>

      <p className="mb-4 text-gray-500 leading-relaxed font-bold tracking-wider font-serif">
        Welcome to the <span className="font-bold text-2xl text-[#17acdd]">Olusola Adebayo Tech And Innovation (OLATINN) Limited</span> Brand Guidelines. This document ensures our
        visual identity remains consistent, clear, and professional across all
        media and platforms.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">1. Logo Usage</h2>
      <p className="mb-4 text-gray-500 leading-relaxed font-bold tracking-wider font-serif">
        Always use the official Olatinn logo. Maintain adequate clear space and
        never alter proportions, colors, or orientation.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">2. Color Palette</h2>
      <p className="mb-4 text-gray-500 leading-relaxed font-bold tracking-wider font-serif">
        Our primary brand color is <span className="font-bold text-[#17acdd]">#17ACDD</span>, 
        representing growth, innovation, and creativity. Complementary neutral
        tones include white, charcoal, and soft yellow.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">3. Typography</h2>
      <p className="mb-4 text-gray-500 leading-relaxed font-bold tracking-wider font-serif">
        Use modern, clean typefaces for a professional and digital-friendly
        appearance. Headings: <span className="font-semibold">Poppins</span>, Body:{" "}
        <span className="font-semibold">Inter</span> or <span className="font-semibold">Open Sans</span>.
      </p>

      <h2 className="text-2xl text-gray-700 font-semibold mt-8 mb-2">4. Imagery & Tone</h2>
      <p className="mb-4 text-gray-500 leading-relaxed font-bold tracking-wider font-serif">
        Imagery should reflect creativity, innovation, and simplicity.
        Communication tone must remain positive, confident, and authentic.
      </p>
    </motion.div>
  );
}
