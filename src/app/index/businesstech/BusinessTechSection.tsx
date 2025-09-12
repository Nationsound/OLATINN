"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
import { useRef } from "react";
import Image from "next/image";

const BusinessTechSection = () => {

    const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax transform
  const y = useTransform(scrollYProgress, [0, 1], ["-50px", "50px"]);

  return (
    <section ref={ref} className="w-full py-16 px-6 bg-gray-50">
      <div className="flex flex-col md:flex-row gap-10 items-center max-w-7xl mx-auto">
        
        {/* Left Div - Image Background with Parallax */}
        <motion.div
          style={{ y }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full md:w-1/2 h-[1180px] rounded-2xl shadow-lg overflow-hidden relative"
        >
          <Image
            src="/images/biz1.jpg"
            alt="Technology in Business"
            width={600}
            height={400}
            className="w-full h-full object-cover hover:opacity-90 transition duration-500"
          />
        </motion.div>

        {/* Right Div - Content */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-full md:w-1/2 bg-white rounded-2xl shadow-lg p-8 relative"
        >
          {/* Quote Icon */}
          <FaQuoteLeft className="text-4xl text-[var(--btn)] hover:text-[var(--btn-hover)] transition-colors duration-300 mb-4" />

          {/* Heading */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
            Technology: The Catalyst of Modern Business Growth
          </h2>

          {/* Long Content */}
          <p className="text-gray-600 font-serif leading-relaxed tracking-wide text-justify">
            In today’s digital economy, technology is not just a tool—it is the driving 
            force behind successful business development. Companies that once relied 
            on outdated models are now embracing digital transformation to innovate, 
            scale, and compete globally.  
             <br />
            At the heart of this transformation is the ability to use technology to 
            streamline operations, reduce costs, and improve efficiency, while also 
            enhancing the customer experience. From automation and analytics to 
            cloud-based systems and AI-powered insights, technology empowers businesses 
            to make better decisions, anticipate trends, and unlock growth opportunities.  
             <br />
            Communication has also been redefined by modern tools. Cloud platforms, 
            instant messaging, and collaborative apps allow teams to work seamlessly 
            across continents and time zones. This level of connectivity is vital for 
            startups and enterprises looking to expand their reach, strengthen 
            partnerships, and deliver value on a global scale.  
             <br />
            More importantly, technology is the foundation of innovation. Businesses can 
            transform bold ideas into market-ready solutions using modern frameworks, 
            advanced design systems, and scalable infrastructures. Those who embrace 
            innovation don’t just survive—they lead.  
             <br />
            <strong className="font-bold text-[var(--btn)]">
              This is where OLATINN comes in.
            </strong>{" "}
             <br />
            At OLATINN, we specialize in helping businesses grow from the ground up. 
            Whether you are a small startup with an ambitious vision or an established 
            brand looking to innovate, our team provides the technical skills and 
            creative designs needed to accelerate your journey. From building intuitive 
            websites and mobile applications to integrating smart business solutions, 
            OLATINN ensures that your digital foundation is strong, scalable, and 
            future-ready.  
             <br />
            With our expertise in modern design principles, user experience, and 
            cutting-edge technologies, we don’t just deliver products—we create 
            transformative solutions tailored to your brand’s unique goals. Our approach 
            ensures that your business not only thrives today but continues to grow, 
            adapt, and lead in the years ahead.  
             <br />
            At OLATINN, we believe greatness starts with vision and is achieved through 
            the right combination of technology, design, and innovation. By partnering 
            with us, your business gains the tools, strategies, and digital experiences 
            needed to move from concept to market leader.  
             <br />
            In essence, technology is the catalyst for growth—and with OLATINN as your 
            partner, your business has everything it needs to rise from scratch to 
            greatness. Together, we build not just businesses, but lasting success.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default BusinessTechSection