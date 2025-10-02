"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation"; 
import { NextSeo } from "next-seo";

const AboutHeader = () => {
  const router = useRouter();

  return (
    <>
      {/* SEO Meta Tags for About Page */}
      <NextSeo
        title="About Us | Olatinn"
        description="Learn more about Olatinn – experts in online growth, data-driven results, tailored strategies, and cost-effective solutions for businesses."
        openGraph={{
          url: "https://olatinnlimited.com/about",
          title: "About Us | Olatinn",
          description:
            "Discover Olatinn's mission and vision. We help businesses grow with expert strategies, data insights, and cost-effective solutions.",
          images: [
            {
              url: "https://olatinnlimited.com/images/about-preview.jpg",
              width: 1200,
              height: 630,
              alt: "Olatinn Team",
            },
          ],
          site_name: "Olatinn",
        }}
        twitter={{
          cardType: "summary_large_image",
        }}
      />

      {/* Header Section */}
      <section
        className="w-full h-[250px] py-12 px-6 flex flex-col md:flex-row items-center justify-between gap-6 mt-18"
        style={{ backgroundColor: "var(--secondary)" }}
      >
        {/* About Title */}
        <motion.h3
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-lg md:text-4xl font-bold hover:text-white text-[#333b69]"
        >
          About Us:
        </motion.h3>

        {/* Olatinn Text Logo */}
        <motion.div
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer"
          onClick={() => router.push("/")}
        >
          <h2 className="text-4xl font-bold w-8 h-8 hover:text-white text-[#333b69] transition-colors duration-300">
            OLATINN
          </h2>
        </motion.div>

        {/* Home Icon */}
        <motion.div
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="cursor-pointer"
          onClick={() => router.push("/")}
        >
          <Home className="w-8 h-8 hover:text-white text-[#333b69] transition-colors duration-300" />
        </motion.div>
      </section>
    </>
  );
};

export default AboutHeader;
