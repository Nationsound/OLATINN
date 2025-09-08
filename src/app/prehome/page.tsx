"use client";
import React from "react";
import { useRouter } from "next/navigation";

const PreHome = () => {
  const router = useRouter(); // ✅ must be inside component

  const handleClick = () => {
    router.push("/home"); // redirect to home page
  };

  return (
    <div
      className="h-screen w-full flex flex-col justify-center items-center text-white bg-cover bg-center"
      style={{ backgroundImage: "url('/images/prehome.jpg')" }} // replace with your image path
    >
      <h1 className="text-2xl font-bold mb-6">Welcome to OLATINN</h1>
      <button
        onClick={handleClick}
        className="px-6 py-3 bg-[#e0cd4c] rounded-lg hover:bg-[#19abdc] transition cursor-pointer"
      >
        Click Me
      </button>
    </div>
  );
};

export default PreHome;
