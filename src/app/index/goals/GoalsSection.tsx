"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";

const GoalsSection = () => {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-white">
      <div className="max-w-5xl mx-auto text-center">
        {/* Small Subheading */}
        <motion.h2
          className="text-3xl md:text-base font-bold uppercase tracking-widest text-[#000271] mb-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          // Our Goal
        </motion.h2>

        {/* Big Headline */}
        <AnimatePresence>
          <motion.h3
            className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-12 leading-snug"
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Empowering businesses with smart digital solutions for sustainable
            growth.
          </motion.h3>
        </AnimatePresence>

        {/* Goal Write-up with Quotation */}
        <AnimatePresence>
          <motion.div
            className="relative bg-gray-50 p-8 md:p-12 rounded-2xl shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Quote Icons */}
            <FaQuoteLeft className="absolute top-4 left-4 text-[#000271] text-3xl opacity-70" />
            <FaQuoteRight className="absolute bottom-4 right-4 text-[#000271] text-3xl opacity-70" />

            {/* Text */}
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed tracking-wide font-serif italic">
              At <span className="font-bold text-[#000271]">OLATINN Limited</span>, 
              our goal is to empower businesses with intelligent digital solutions 
              that transform challenges into opportunities. We are committed to 
              simplifying complex processes, enhancing decision-making through 
              data-driven insights, and driving sustainable growth for organizations  
              across industries.
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default GoalsSection;
