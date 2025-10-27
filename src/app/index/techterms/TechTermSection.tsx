"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCloud,
  FaLock,
  FaCode,
  FaDatabase,
  FaNetworkWired,
  FaCogs,
  FaMobileAlt,
  FaRobot,
  FaServer,
  FaShieldAlt,
  FaChartLine,
  FaBrain,
} from "react-icons/fa";

const techTerms = [
  { icon: <FaCloud />, title: "Cloud Computing", desc: "On-demand access to servers, storage, databases, and services." },
  { icon: <FaLock />, title: "Cybersecurity", desc: "Protecting systems, networks, and data from cyber threats." },
  { icon: <FaCode />, title: "Programming", desc: "Writing code to create software and applications." },
  { icon: <FaDatabase />, title: "Databases", desc: "Organized collections of structured information or data." },
  { icon: <FaNetworkWired />, title: "Networking", desc: "Connecting systems and devices for communication." },
  { icon: <FaCogs />, title: "DevOps", desc: "Practices combining software development and IT operations." },
  { icon: <FaMobileAlt />, title: "Mobile Tech", desc: "Technology powering smartphones and portable devices." },
  { icon: <FaRobot />, title: "AI & Automation", desc: "Machines performing intelligent and repetitive tasks." },
  { icon: <FaServer />, title: "Servers", desc: "Powerful computers that deliver data and services." },
  { icon: <FaShieldAlt />, title: "Encryption", desc: "Securing data through encoding for safe transmission." },
  { icon: <FaChartLine />, title: "Analytics", desc: "Interpreting data to guide decision-making." },
  { icon: <FaBrain />, title: "Machine Learning", desc: "Algorithms learning from data to make predictions." },
];

const TechTermsSection = () => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(techTerms.length / itemsPerPage);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // ✅ Auto-slide only when visible
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, totalPages]);

  // ✅ Detect when section is visible in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleNext = () => setPage((p) => (p < totalPages - 1 ? p + 1 : 0));
  const handlePrev = () => setPage((p) => (p > 0 ? p - 1 : totalPages - 1));

  const currentItems = techTerms.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  return (
    <section
      ref={sectionRef}
      className="py-12 bg-white text-gray-800 overflow-hidden relative"
    >
      <h2 className="text-3xl font-bold text-center mb-4">
        Simplifying Technology for Real-World Impact
      </h2>

      {/* ✅ Wrapping container with fixed min height */}
      <div className="relative min-h-[450px] sm:min-h-[400px] md:min-h-[380px] lg:min-h-[360px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 w-full"
          >
            {currentItems.map((item, idx) => (
              <motion.div
                key={idx}
                className="flex flex-col items-center p-6 rounded-lg shadow-md border cursor-pointer bg-white hover:bg-[var(--btn-hover)] transition-colors"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-5xl mb-4 text-[var(--btn)] hover:text-white transition">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-center text-sm text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ✅ Buttons now always below grid */}
      <div className="flex justify-center items-center mt-10 space-x-6 relative z-10">
        <button
          onClick={handlePrev}
          className="px-4 py-2 rounded-full bg-[var(--btn)] text-white hover:bg-[var(--btn-hover)]"
        >
          ← Prev
        </button>
        <span className="text-lg font-semibold">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-full bg-[var(--btn)] text-white hover:bg-[var(--btn-hover)]"
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default TechTermsSection;
