"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wrench, Code, Cloud, Database } from "lucide-react";

const ServiceSection = () => {
  const services = [
    {
      icon: <Wrench className="w-12 h-12 text-[var(--btn)]" />,
      title: "Custom Solutions",
      desc: "Tailored software and applications designed for your unique business needs.",
    },
    {
      icon: <Code className="w-12 h-12 text-[var(--btn)]" />,
      title: "Web Development",
      desc: "From static websites to enterprise platforms, we build with precision.",
    },
    {
      icon: <Cloud className="w-12 h-12 text-[var(--btn)]" />,
      title: "Cloud Integration",
      desc: "Smart deployments and scalable cloud infrastructure for reliability.",
    },
    {
      icon: <Database className="w-12 h-12 text-[var(--btn)]" />,
      title: "Data Management",
      desc: "Secure and structured storage using MongoDB, SQL, or hybrid systems.",
    },
  ];

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        {/* Header */}
        <h2 className="text-2xl md:text-base font-bold uppercase tracking-widest text-[var(--btn)] mb-4">
          {"// Our Services"}
        </h2>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Redefining Business Potential with Smart Solutions
        </h1>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          At Olatinn Limited, our services are designed to give you the right
          tools, technology, and expertise to thrive in today’s digital world.
        </p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-50 shadow-md rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
            >
              {service.icon}
              <h3 className="text-xl font-semibold mt-4 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm">{service.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Link
            href="/services"
            className="inline-block bg-[var(--btn)] text-white font-semibold px-8 py-3 rounded-full shadow-md hover:bg-[var(--btn-hover)] transition-all"
          >
            Explore Our Services →
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceSection;
