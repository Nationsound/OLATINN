"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Typewriter } from "react-simple-typewriter";
import { NextSeo } from "next-seo";

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
    <>
      {/* ✅ SEO for Landing Page */}
      <NextSeo
        title="OLATINN - Olusola Adebayo Tech and Innovation Limited"
        description="We build without defects — delivering scalable cloud infrastructure, creative designs, and innovative tech solutions for businesses and individuals."
        canonical="https://www.olatinnlimited.com"
        openGraph={{
          url: "https://www.olatinnlimited.com",
          title: "OLATINN - Olusola Adebayo Tech and Innovation Limited",
          description:
            "Scalable cloud solutions, innovation, and creative designs to empower businesses and individuals.",
          images: [
            {
              url: "https://www.olatinnlimited.com/images/og-landing.jpg",
              width: 1200,
              height: 630,
              alt: "OLATINN Landing Page",
            },
          ],
          siteName: "OLATINN",
        }}
        twitter={{
          handle: "@olatinn",
          site: "@olatinn",
          cardType: "summary_large_image",
        }}
      />

      {/* ✅ Landing Page Hero */}
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
    </>
  );
};

export default LandingPage;
