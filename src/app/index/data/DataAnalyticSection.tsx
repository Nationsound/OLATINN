"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const DataAnalyticsSection = () => {
    const router = useRouter();
    
      const handleLearnMore = () => {
        router.push("/about");
      };
  return (
    <section className="w-full py-12 bg-gray-50">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <AnimatePresence>
          {/* Top Div with Image + Headline */}
          <motion.div
            key="image-section"
            className="relative w-full h-64 md:h-96 rounded-2xl shadow-lg overflow-hidden"
            style={{
              backgroundImage: "url('/images/data3.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              height: "400px",
              width: "100%",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.h2
                className="text-white text-2xl md:text-4xl font-bold text-center"
                initial={{ y: -30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Unlock Insights with Data Analytics
              </motion.h2>
            </div>
          </motion.div>

          {/* Bottom Div with Text */}
          <motion.div
            key="text-section"
            className="flex flex-col justify-center px-4"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          >
            <h3 className="text-xl md:text-2xl font-semibold mb-4 text-gray-800">
              Driving Growth with Smart Decisions
            </h3>
            <p className="text-gray-600 text-lg font-serif leading-relaxed tracking-wide">
              At <span className="font-bold text-gray-900">OLATINN</span>, we help
              businesses transform raw data into actionable insights. Our data
              analytics solutions simplify complex information, identify trends,
              and highlight opportunities that drive strategic growth.
            </p>
            <p className="mt-4 text-gray-600 text-lg font-serif leading-relaxed tracking-wide">
              Whether you&apos;re optimizing operations, enhancing customer
              experiences, or exploring new markets, OLATINN empowers you with
              the clarity needed to make confident business decisions.
            </p>
            <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLearnMore}
          className="px-8 py-4 rounded-lg text-white font-semibold transition-colors duration-300 hover:text-[var(--btn-hover)] cursor-pointer"
          style={{
            backgroundColor: "var(--btn)",
          }}
        >
          Learn More
        </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DataAnalyticsSection;
