"use client";

import { motion } from "framer-motion";
import { Shield, CheckCircle, Headphones, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useMotionValue, animate } from "framer-motion";

// ✅ Fixed CountUp component
const CountUpNumber = ({ target }: { target: number }) => {
  const { ref, inView } = useInView({ triggerOnce: true });
  const [currentValue, setCurrentValue] = useState(0);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, target, {
        duration: 2,
        onUpdate: (latest) => setCurrentValue(Math.floor(latest)),
      });
      return () => controls.stop();
    }
  }, [inView, motionValue, target]);

  return <span ref={ref}>{currentValue}</span>;
};

const TrustSection = () => {
  const trustPoints = [
    {
      icon: <Shield className="w-10 h-10 text-[var(--btn)]" />,
      title: "Secure Systems",
      desc: "Your data is handled with strict security measures and best practices.",
    },
    {
      icon: <CheckCircle className="w-10 h-10 text-[var(--btn)]" />,
      title: "Proven Track Record",
      desc: "We’ve consistently delivered reliable solutions across industries.",
    },
    {
      icon: <Headphones className="w-10 h-10 text-[var(--btn)]" />,
      title: "24/7 Support",
      desc: "Our team is always available to support you when you need us most.",
    },
    {
      icon: <Award className="w-10 h-10 text-[var(--btn)]" />,
      title: "Client-Centered",
      desc: "Your growth and satisfaction remain at the heart of our work.",
    },
  ];

  return (
    <section className="py-16 px-6 md:px-12 lg:px-20 bg-gradient-to-b from-gray-50 via-white to-gray-100">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-lg md:text-base uppercase tracking-widest text-[var(--btn)] mb-4">
          {"// Why Trust Olatinn"}
        </h2>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Built on Reliability, Driven by Integrity
        </h1>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          At Olatinn Limited, we prioritize trust. From secure solutions to
          transparent processes, we ensure that our clients can rely on us to
          support their business with confidence and consistency.
        </p>

        {/* Trust Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="bg-white shadow-md rounded-2xl p-6 flex flex-col items-center text-center hover:shadow-xl transition-shadow"
            >
              {point.icon}
              <h3 className="text-xl font-semibold mt-4 mb-2">{point.title}</h3>
              <p className="text-gray-600 text-sm">{point.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Success Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative h-56 md:h-64 rounded-2xl overflow-hidden shadow-lg"
            style={{
              backgroundImage: "url('/images/trust3.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-opacity-50 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold">
                <CountUpNumber target={10} />+
              </h2>
              <p className="text-lg mt-2">Successful Deliveries</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="relative h-56 md:h-64 rounded-2xl overflow-hidden shadow-lg"
            style={{
              backgroundImage: "url('/images/testimony.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-opacity-50 flex flex-col items-center justify-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold">
                <CountUpNumber target={10} />+
              </h2>
              <p className="text-lg mt-2">Testimonies</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
