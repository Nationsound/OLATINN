"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowLeft, HiArrowRight } from "react-icons/hi";

interface Card {
  title: string;
  image: string;
}

const cards: Card[] = [
  { title: "Scalable Infrastructure", image: "/images/card1.png" },
  { title: "Creative UI/UX", image: "/images/card2.png" },
  { title: "Cloud Solutions", image: "/images/card3.png" },
  { title: "Innovative Tech", image: "/images/card4.png" },
  { title: "Business Empowerment", image: "/images/card5.jpg" },
  { title: "Design Excellence", image: "/images/card6.jpg" },
];

const CardCarousel: React.FC = () => {
  const [page, setPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  // Set cardsPerPage responsively on client
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 640) setCardsPerPage(1); // mobile
      else if (w < 1024) setCardsPerPage(2); // tablet
      else setCardsPerPage(3); // desktop
      // Optionally reset page to avoid out-of-range
      setPage((p) => {
        const total = Math.ceil(cards.length / (w < 640 ? 1 : w < 1024 ? 2 : 3));
        return Math.min(p, Math.max(0, total - 1));
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalPages = Math.ceil(cards.length / cardsPerPage);

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 0));
  };

  const startIndex = page * cardsPerPage;
  const visibleCards = cards.slice(startIndex, startIndex + cardsPerPage);

  return (
    <section className="py-16 px-6 lg:px-20 bg-gray-50 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-indigo-600">// Our Expertise</h2>

        <div className="flex gap-4">
          <button
            aria-label="Previous"
            onClick={handlePrev}
            disabled={page === 0}
            className="text-2xl text-indigo-600 hover:text-indigo-400 transition disabled:opacity-30"
          >
            <HiArrowLeft />
          </button>

          <button
            aria-label="Next"
            onClick={handleNext}
            disabled={page >= totalPages - 1}
            className="text-2xl text-indigo-600 hover:text-indigo-400 transition disabled:opacity-30"
          >
            <HiArrowRight />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div className="flex overflow-hidden relative">
        <AnimatePresence initial={false} mode="wait">
          {visibleCards.map((card, idx) => {
            const globalIndex = startIndex + idx;
            return (
              <motion.div
                key={`${card.title}-${globalIndex}`}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
                className="relative flex-shrink-0 w-full sm:w-[32%] h-[400px] rounded-2xl shadow-lg overflow-hidden mx-2 cursor-pointer"
                style={{
                  backgroundImage: `url('${card.image}')`, 
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                whileHover={{ scale: 1.03 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) handleNext();
                  else if (info.offset.x > 80) handlePrev();
                }}
              >
                {/* semi-transparent overlay for readability */}
                <div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/30" />

                {/* Title centered above bottom border (readable) */}
                <div className="absolute inset-0 flex items-end justify-center pb-20 px-4">
                  <h3 className="text-white text-2xl md:text-3xl font-bold text-center drop-shadow-md">
                    {card.title}
                  </h3>
                </div>

                {/* Bottom colored bar */}
                <div className="absolute bottom-0 w-full h-[60px] bg-indigo-600 hover:bg-indigo-500 transition-colors duration-300" />
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Edge peek gradient to visually show more content */}
        {page < totalPages - 1 && (
          <div className="absolute right-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-l from-gray-50/0 via-gray-50/40 to-gray-50" />
        )}
        {page > 0 && (
          <div className="absolute left-0 top-0 h-full w-16 pointer-events-none bg-gradient-to-r from-gray-50/0 via-gray-50/40 to-gray-50" />
        )}
      </div>
    </section>
  );
};

export default CardCarousel;
