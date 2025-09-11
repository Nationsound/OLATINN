"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Typewriter } from "react-simple-typewriter";

const slides = [
  {
    id: 1,
    text: "Welcome to Olusola Adebayo Tech and Innovation (OLATINN) Limited.",
    bg: "/images/slide1.jpg",
  },
  {
    id: 2,
    text: "We Specialize In Scalable Cloud Infrastructure.",
    bg: "/images/slide2.jpg",
  },
  {
    id: 3,
    text: "We Deliver Tech Solutions, Innovation, and Creative Designs that Empower Businesses and Individuals.",
    bg: "/images/slide3.jpg",
  },
];

const LandingPage = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // change slide every 6s
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={slides[index].id}
          className="absolute top-0 left-0 h-full w-full flex justify-center items-center text-white text-3xl font-bold bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[index].bg})` }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 1 }}
        >
          <span className="max-w-3xl text-center px-4">
            <Typewriter
              words={[slides[index].text]}
              loop={1}
              cursor
              cursorStyle="|"
              typeSpeed={40}
              deleteSpeed={20}
              delaySpeed={1000}
            />
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
