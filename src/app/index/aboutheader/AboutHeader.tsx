"use client";

import { motion } from "framer-motion";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

const AboutHeader = () => {
  const router = useRouter();

  return (
    <section
      className="w-full h-[250px] py-12 px-6 flex flex-col md:flex-row items-center justify-between gap-6 mt-18 "
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

      {/* Home Icon */}
      <motion.div
        whileHover={{ scale: 1.2, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="cursor-pointer"
        onClick={() => router.push("/")}
      >
        <h2 className="text-4xl font-bold w-8 h-8 hover:text-white text-[#333b69] transition-colors duration-300">OLATINN</h2>
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
  );
};

export default AboutHeader;
