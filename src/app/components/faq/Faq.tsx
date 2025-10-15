"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

const FAQSection = () => {
  const faqs = [
    {
      q: "How long does a web project take?",
      a: "Depending on the scope, most projects take 1–4 weeks from concept to launch.",
    },
    {
      q: "Do you offer SEO and maintenance?",
      a: "Yes, we offer full SEO optimization and ongoing site maintenance packages.",
    },
    {
      q: "Can you redesign my existing website?",
      a: "Absolutely! We modernize outdated designs and improve speed, UI/UX, and branding.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept bank transfers, Paystack, and direct invoice payments.",
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 bg-[#17acdd] text-white">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
          Frequently Asked Questions
        </h2>

        {faqs.map((item, i) => (
          <div
            key={i}
            className="border-b border-gray-500 py-4 cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{item.q}</h3>
              <FaChevronDown
                className={`transition-transform ${
                  open === i ? "rotate-180" : ""
                }`}
              />
            </div>
            <AnimatePresence>
              {open === i && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-gray-300 mt-2"
                >
                  {item.a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
