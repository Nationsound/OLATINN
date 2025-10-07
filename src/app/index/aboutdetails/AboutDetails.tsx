"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const AboutDetails = () => {
  const text = "FROM START-UPs INTO INDUSTRY LEADERS";

  const letters = text.split("").map((char, idx) => (
    <motion.span
      key={idx}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: idx * 0.05,
        type: "spring",
        damping: 12,
        stiffness: 100,
      }}
      className="inline-block"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  ));

  const cards = [
    {
      title: "Scalable Solutions",
      desc: "We design systems that grow with your business, ensuring long-term success.",
    },
    {
      title: "Creative Designs",
      desc: "Our design approach merges aesthetics with usability, driving user engagement.",
    },
    {
      title: "Innovative Systems",
      desc: "We integrate the latest technologies to create unique solutions tailored for you.",
    },
    {
      title: "Business Empowerment",
      desc: "Through strategy and technology, OLATINN helps transform startups into industry leaders.",
    },
  ];

  return (
    <section className="py-16 px-6 lg:px-20 bg-gray-50">
      <h1 className="w-full max-w-5xl mx-auto text-4xl font-serif leading-relaxed tracking-widest text-indigo-950 mb-8 flex flex-wrap">
        {letters}
      </h1>

      <div className="flex flex-col lg:flex-row items-center gap-10">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="flex-1"
        >
          <Image
            src="/images/about.png"
            alt="About OLATINN"
            width={500}
            height={500}
            className="w-full h-full max-h-[800px] object-cover rounded-2xl shadow-lg hover:opacity-90 transition duration-500"
          />
        </motion.div>

        {/* Text + Cards */}
        <div className="flex-1 max-w-[700px]">
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-lg text-gray-700 leading-relaxed mb-12 font-serif tracking-wide"
          >
            At <span className="font-semibold text-gray-900">OLATINN</span>, we are passionate
            about delivering technology solutions that empower businesses and individuals. From
            scalable cloud infrastructure to creative designs and innovative systems, our mission
            is to transform ideas into impactful realities.
          </motion.p>

          <div className="grid sm:grid-cols-2 gap-6">
            {cards.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-500 border border-gray-100 hover:border-indigo-500"
              >
                <h4 className="text-xl font-semibold mb-3 text-indigo-600">{item.title}</h4>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutDetails;
