"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const keyServices = [
  {
    title: "Developing",
    desc: "We build robust web, mobile, and full-stack solutions tailored to meet diverse business needs.",
    image: "/images/soft1.jpg",
  },
  {
    title: "Designing",
    desc: "Our UI/UX and system design approaches focus on creating seamless, user-friendly experiences.",
    image: "/images/soft4.png",
  },
  {
    title: "Deploying",
    desc: "From APIs to cloud platforms, we ensure smooth, secure, and efficient deployment of software solutions.",
    image: "/images/soft6.png",
  },
  {
    title: "Maintaining & Supporting",
    desc: "Ongoing maintenance and technical support to guarantee your systems run with minimal downtime.",
    image: "/images/soft7.png",
  },
  {
    title: "DevOps Services",
    desc: "We streamline CI/CD pipelines, infrastructure automation, and monitoring for scalability and efficiency.",
    image: "/images/soft9.png",
  },
  {
    title: "Consultation & Training",
    desc: "Providing expert guidance, mentorship, and training for teams, startups, and enterprises.",
    image: "/images/soft10.jpg",
  },
  {
    title: "Product Development",
    desc: "Transforming ideas into innovative, market-ready digital products with scalable architectures.",
    image: "/images/soft11.png",
  },
  {
    title: "Digital Transformation",
    desc: "Helping individuals, startups, and enterprises modernize and thrive in domestic and international markets.",
    image: "/images/soft12.png",
  },
];

const ServicesExplained = () => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 3;

  const startIndex = page * itemsPerPage;
  const visibleItems = keyServices.slice(startIndex, startIndex + itemsPerPage);

  const handleNext = () => {
    if (startIndex + itemsPerPage < keyServices.length) {
      setPage(page + 1);
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  return (
    <section className="py-20 bg-gray-50 relative">
      {/* Header */}
      <div className="text-center mb-12 max-w-5xl mx-auto">
        <h2 className="text-lg md:text-base uppercase tracking-widest text-[var(--btn)] mb-4">
          {"// Our Core Expertise"}
        </h2>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6 text-center">
          Specializing In Scalable Cloud Infrastructure
        </h1>
        <p className="text-gray-600 leading-relaxed font-serif text-justify tracking-wider">
          We carry on the business of developing, designing, deploying, maintaining,
          and supporting full-stack software solutions, including but not limited to
          frontend and backend web and mobile applications, APIs, databases, cloud
          infrastructures, and DevOps services; and to provide consulting, training,
          and technical support in the field of software engineering, product
          development, and digital transformation for individuals, startups,
          businesses, and enterprises, both in domestic and international markets.
        </p>
      </div>

      {/* Cards with Navigation */}
      <div className="flex justify-center items-center gap-6">
        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className={`p-3 rounded-full shadow-md transition ${
            page === 0
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:bg-[var(--btn)] hover:text-white"
          }`}
        >
          <ArrowLeft size={20} />
        </button>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-8xl h-[420px]">
          <AnimatePresence mode="wait">
            {visibleItems.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.6 }}
                className="relative rounded-2xl overflow-hidden shadow-lg group"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.image})` }}
                ></div>
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
                <div className="relative p-6 text-white z-10">
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={startIndex + itemsPerPage >= keyServices.length}
          className={`p-3 rounded-full shadow-md transition ${
            startIndex + itemsPerPage >= keyServices.length
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:bg-[var(--btn)] hover:text-white"
          }`}
        >
          <ArrowRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default ServicesExplained;
