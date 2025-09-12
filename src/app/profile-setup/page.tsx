"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ProfileSetup = () => {
  const [fullName, setFullName] = useState("");
  const [address, setAddress] = useState("");
  const [age, setAge] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("olatinnToken"); // token stored at login
    if (!token) {
      alert("No token found. Please login again.");
      router.push("/signin");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/olatinn/api/profile/user-profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // include token here
          },
          body: JSON.stringify({ fullName, address, age }),
        }
      );

      if (res.ok) {
        alert("Profile setup completed!");
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.message || "Profile setup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-[#000271] to-[#17acdd]">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17acdd]"
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17acdd]"
            required
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17acdd]"
            required
          />

          <button
            type="submit"
            className="w-full bg-[#000271] text-white py-3 rounded-lg font-semibold hover:bg-[#17acdd] transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
