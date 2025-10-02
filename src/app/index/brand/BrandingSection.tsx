"use client";

import { motion } from "framer-motion";
import { NextSeo } from "next-seo";

const BrandingSection = () => {
  return (
    <>
      {/* ✅ SEO Metadata */}
      <NextSeo
        title="OLATINN | Olusola Adebayo Tech and Innovation Limited"
        description="OLATINN Limited — Empowering businesses with innovative technology, scalable infrastructure, and defect-free digital solutions. We build without defects."
        canonical="https://www.olatinnlimited.com"
        openGraph={{
          url: "https://www.olatinnlimited.com",
          title: "OLATINN | Olusola Adebayo Tech and Innovation Limited",
          description:
            "OLATINN Limited — Empowering businesses with innovative technology, scalable infrastructure, and defect-free digital solutions. We build without defects.",
          siteName: "OLATINN Limited",
          images: [
            {
              url: "https://www.olatinnlimited.com/images/branding-cover.jpg", // replace with your actual brand/hero image
              width: 1200,
              height: 630,
              alt: "OLATINN Branding",
            },
          ],
        }}
        twitter={{
          handle: "@olatinn",
          site: "@olatinn",
          cardType: "summary_large_image",
        }}
      />

      <section className="relative py-20 px-6 md:px-12 lg:px-20 bg-gradient-to-r from-[#000271] via-[#1e3a8a] to-[#17acdd] text-white overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* OLATINN */}
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4"
          >
            OLATINN
          </motion.h1>

          {/* Full Name */}
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-semibold mb-6"
          >
            Olusola Adebayo Tech and Innovation Limited
          </motion.h2>

          {/* Motto */}
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl italic font-light"
          >
            “We Build Without Defects.”
          </motion.p>
        </div>

        {/* Decorative Gradient Blur Effects */}
        <div className="absolute inset-0">
          <div className="absolute w-72 h-72 bg-pink-500/20 rounded-full blur-3xl -top-10 -left-10"></div>
          <div className="absolute w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl bottom-0 right-0"></div>
        </div>
      </section>
    </>
  );
};

export default BrandingSection;
