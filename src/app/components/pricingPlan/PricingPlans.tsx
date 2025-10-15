"use client";
import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Plan {
  title: string;
  price: string;
  promoPrice: string;
  features: string[];
  highlighted?: boolean;
}

const PricingPlans: React.FC = () => {
  const router = useRouter();

  const plans: Plan[] = [
    {
      title: "Starter",
      price: "₦70,000",
      promoPrice: "₦50,000",
      features: [
        "1 Web Page / Landing Page",
        "Responsive Design",
        "Basic SEO Setup",
        "Delivery: 5 Days",
      ],
    },
    {
      title: "Professional",
      price: "₦450,000",
      promoPrice: "₦350,000",
      features: [
        "5 Web Pages (Company / Portfolio)",
        "Admin Dashboard",
        "SEO Optimization",
        "Domain & Hosting Setup",
      ],
      highlighted: true,
    },
    {
      title: "Enterprise",
      price: "₦900,000+",
      promoPrice: "₦700,000+",
      features: [
        "Full Web Application",
        "Database & API Integration",
        "Advanced SEO + Analytics",
        "Custom Features on Request",
      ],
    },
  ];

  const handleGetStarted = () => {
    const user = localStorage.getItem("olatinnToken");
    if (user) {
      router.push("/dashboard"); // logged in
    } else {
      router.push("/signup"); // not logged in
    }
  };

  return (
    <section className="py-20 bg-[#f8f9fb] text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-[#333b69]">
        Our Service Pricing
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -10, scale: 1.02 }}
            className={`relative p-8 rounded-2xl shadow-lg transition ${
              plan.highlighted
                ? "bg-[#333b69] text-white border-t-4 border-[#17acdd]"
                : "bg-white text-gray-800"
            }`}
          >
            {/* ⭐ “Most Popular” Badge */}
            {plan.highlighted && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#17acdd] text-white text-xs font-semibold px-4 py-1 rounded-full shadow-md"
              >
                MOST POPULAR
              </motion.div>
            )}

            <h3 className="text-2xl font-bold mb-2 mt-4">{plan.title}</h3>

            {/* 💸 Pricing Section */}
            <div className="mb-4">
              <p
                className={`text-3xl font-semibold ${
                  plan.highlighted ? "text-white" : "text-[#000271]"
                }`}
              >
                {plan.promoPrice}
              </p>
              <p
                className={`text-sm line-through ${
                  plan.highlighted ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {plan.price}
              </p>
            </div>

            <ul className="space-y-2 text-sm text-left mb-6">
              {plan.features.map((f, idx) => (
                <li key={idx}>✅ {f}</li>
              ))}
            </ul>

            <button
              onClick={handleGetStarted}
              className={`px-6 py-3 rounded-lg font-medium w-full ${
                plan.highlighted
                  ? "bg-[#17acdd] text-white hover:bg-[#000271]"
                  : "bg-[#000271] text-white hover:bg-[#17acdd]"
              } transition`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default PricingPlans;
