"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const AuthenticationSection = () => {
  const router = useRouter();

  const handleLearnMore = () => {
    router.push('/about');
  }
  return (
    <section className="py-16 px-6 md:px-12 lg:px-20 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <AnimatePresence>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            Smarter Authentication with Olatinn
          </motion.h2>
        </AnimatePresence>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text block */}
          <AnimatePresence>
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.7 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900">
                End-to-End Authentication Setup
              </h3>
              <p className="text-gray-600 leading-relaxed">
                At <span className="font-bold text-[#000271] text-lg leading-relaxed font-serif tracking-wide">Olatinn</span>, we
                provide complete authentication solutions that combine both{" "}
                <span className="font-medium">static HTML with DOM manipulation</span>{" "}
                for lightweight client-side validation and{" "}
                <span className="font-medium">server-side smart authentication</span>{" "}
                for robust, secure access control.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed font-serif tracking-wide">
                From simple form handling to enterprise-grade login systems, our
                approach ensures scalability, reliability, and user-friendly
                experiences.
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

          {/* Image block */}
          <AnimatePresence>
            <motion.div
              className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-lg"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.7 }}
            >
              <Image
                src="/images/web1.webp"
                alt="Authentication illustration"
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default AuthenticationSection;
