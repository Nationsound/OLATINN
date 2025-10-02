"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NextSeo } from "next-seo";

const AboutUsSection = () => {
  const router = useRouter();

  const handleLearnMore = () => {
    router.push("/about");
  };

  return (
    <>
      {/* ✅ SEO Meta Tags for About Section */}
      <NextSeo
        title="About Us | OLATINN"
        description="Learn how OLATINN empowers businesses with scalable infrastructure, creative designs, and innovative systems that transform ideas into impactful realities."
        canonical="https://olatinnlimited.com"
        openGraph={{
          url: "https://olatinnlimited.com",
          title: "About Us | OLATINN",
          description:
            "Discover how OLATINN empowers businesses with scalable infrastructure, creative designs, and innovative systems that transform ideas into impactful realities.",
          images: [
            {
              url: "/images/about.png",
              width: 1200,
              height: 630,
              alt: "About OLATINN",
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

      {/* ✅ Section Content */}
      <section className="py-16 bg-gray-100 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto px-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-[#000271]">
            {"// About Us"}
          </h2>
          <p className="text-lg text-gray-700 font-serif leading-relaxed tracking-wide mb-8 text-justify">
            At <span className="font-semibold">OLATINN</span>, we are passionate
            about delivering technology solutions that empower businesses and
            individuals. From scalable cloud infrastructure to creative designs
            and innovative systems, our mission is to transform ideas into
            impactful realities.
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
      </section>
    </>
  );
};

export default AboutUsSection;
