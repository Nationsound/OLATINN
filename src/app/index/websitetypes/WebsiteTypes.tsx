"use client";
import { motion } from "framer-motion";

const websiteTypes = [
  {
    title: "E-Commerce Websites",
    desc: "We build seamless, secure, and scalable e-commerce platforms that help businesses sell without limitations. At Olatinn, we ensure high performance and flawless shopping experiences.",
  },
  {
    title: "Corporate Websites",
    desc: "We craft professional websites for businesses that reflect credibility, brand identity, and trust. Our solutions are designed for scalability and zero downtime.",
  },
  {
    title: "Portfolio Websites",
    desc: "Whether you’re a creative, professional, or agency, Olatinn helps you showcase your work beautifully, with designs that speak quality and reliability.",
  },
  {
    title: "Educational Platforms",
    desc: "We develop interactive e-learning systems with smooth content management, ensuring secure and efficient learning experiences for schools and training centers.",
  },
  {
    title: "Blogs & Media",
    desc: "From personal blogs to large-scale publishing platforms, we create robust, SEO-friendly websites that deliver content with speed and consistency.",
  },
  {
    title: "SaaS Applications",
    desc: "We build powerful SaaS platforms that run entirely on the cloud, meaning users don’t need to install anything — they simply log in and use the service from anywhere. At Olatinn, we design SaaS applications that are scalable, secure, and user-friendly, helping businesses deliver subscription-based services seamlessly.",
  },
];

const WebsiteTypes = () => {
  return (
    <section className="py-20 px-6 md:px-12 lg:px-20 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-lg md:text-base uppercase tracking-widest text-[var(--btn)] mb-4">
          {"// Website Solutions"}
        </h2>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
          We Build Without Defects
        </h1>
        <p className="text-gray-600 max-w-3xl mx-auto font-serif leading-relaxed tracking-wider text-justify">
          At Olatinn Limited, we specialize in designing and deploying different types of
          websites tailored to your needs — ensuring reliability, performance, and defect-free
          development.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {websiteTypes.map((site, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="rounded-2xl p-8 bg-[var(--btn)] text-white shadow-lg hover:bg-[var(--btn-hover)] transition-colors cursor-pointer"
          >
            <h3 className="text-2xl font-bold mb-4">{site.title}</h3>
            <p className="text-sm opacity-90 font-serif leading-relaxed tracking-wider text-justify">{site.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WebsiteTypes;
