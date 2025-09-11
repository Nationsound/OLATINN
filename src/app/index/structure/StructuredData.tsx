"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const StructuredData = () => {
  return (
    <section className="w-full py-16 px-6 md:px-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-[var(--btn)]"
        >
          Structured Data Storage with MongoDB & SQL
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Image div */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center"
            >
              <Image
                src="/images/base1.png" // replace with your image path
                alt="Database Illustration"
                className="rounded-2xl shadow-lg w-[90%] md:w-[80%]"
                width={600}
                height={400}
              />
            </motion.div>
          </AnimatePresence>

          {/* Paragraph div */}
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <p className="text-lg md:text-base leading-relaxed font-serif tracking-wide text-gray-700 dark:text-gray-300">
                Efficient data storage is crucial for any application. Whether
                using <span className="font-semibold">MongoDB</span> for
                flexibility with JSON-like documents, or{" "}
                <span className="font-semibold">SQL</span> databases for
                relational integrity, storing data structurally ensures faster
                queries, scalability, and maintainability of your system. At{" "}
                <span className="font-semibold text-[var(--btn-hover)]">
                  Olatinn Limited
                </span>
                , we specialize in designing and implementing these database
                solutions so that your ideas can become reality—structured,
                scalable, and future-ready.
              </p>

              {/* CTA button */}
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 rounded-2xl bg-[var(--btn)] text-white font-medium shadow-md hover:bg-[var(--btn-hover)] transition"
                >
                  Learn More
                </motion.button>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default StructuredData;
