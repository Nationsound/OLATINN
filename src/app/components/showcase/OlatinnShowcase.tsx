"use client";

import React from "react";
import Image from "next/image";


const OlatinnShowcase: React.FC = () => {
  return (
    <section className="w-full bg-gray-50 py-16 px-4 flex flex-col items-center mt-12">
        {/* Description */}
      <div className="w-full max-w-8xl text-center mx-auto mb-12">
        <h2 className="text-6xl font-bold text-[#17acdd] mb-4">
          Olusola Adebayo Tech and Innovation Limited
        </h2>
        <p className="text-gray-700 text-lg text-left leading-relaxed font-serif tracking-wider">
          OLATINN is at the forefront of innovative tech solutions, delivering 
          seamless digital experiences for businesses and individuals. We specialize 
          in building high-quality software, cutting-edge web applications, and 
          custom tech services tailored to your needs. With a focus on reliability, 
          creativity, and efficiency, OLATINN ensures your projects are executed 
          flawlessly, helping you stay ahead in the fast-paced digital world.
        </p>
      </div>
      {/* Hero Image */}
      <div className="w-full max-w-5xl mb-8">
        <Image
          src= "/images/hello.png"
          alt="OLATINN Tech Services"
          width={350}
          height={300}
          className="w-full h-[300px] object-cover rounded-2xl shadow-lg "
          priority
        />
      </div>

      
    </section>
  );
};

export default OlatinnShowcase;
