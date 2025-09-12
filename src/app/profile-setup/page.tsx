"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const ProfileSetup = () => {
  const [fullName, setFullName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("olatinnToken");
    if (!token) {
      alert("No token found. Please login again.");
      router.push("/signin");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/olatinn/api/profile/user-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fullName, address, age: Number(age) }),
      });

      if (res.ok) {
        alert("Profile setup completed!");
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.message || "Profile setup failed");
      }
    } catch (error) {
      console.error("Profile setup error:", error);
      alert("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-[#000271] to-[#17acdd] p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17acdd]"
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17acdd]"
            required
          />

          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17acdd]"
            required
            min={1}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#000271] hover:bg-[#17acdd]"
            }`}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup;
