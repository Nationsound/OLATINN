"use client";
import { useState } from "react";
import { motion } from "framer-motion";
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

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const currentItems = techTerms.slice(
    page * itemsPerPage,
    page * itemsPerPage + itemsPerPage
  );

  return (
    <section className="py-12 bg-white text-gray-800">
      <h2 className="text-3xl font-bold text-center mb-8">
        Simplifying Technology for Real-World Impact
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
        {currentItems.map((item, idx) => (
          <motion.div
            key={idx}
            className="flex flex-col items-center p-6 rounded-lg shadow-md border cursor-pointer bg-white hover:bg-[var(--btn-hover)] transition-colors"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-5xl mb-4 text-[var(--btn)] hover:text-white transition">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-center text-sm text-gray-600">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="flex justify-center items-center mt-8 space-x-6">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="px-4 py-2 rounded-full bg-[var(--btn)] text-white hover:bg-[var(--btn-hover)] disabled:opacity-50"
        >
          ← Prev
        </button>
        <span className="text-lg font-semibold">
          {page + 1} / {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === totalPages - 1}
          className="px-4 py-2 rounded-full bg-[var(--btn)] text-white hover:bg-[var(--btn-hover)] disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </section>
  );
};

export default TechTermsSection;
