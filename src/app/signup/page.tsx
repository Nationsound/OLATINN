"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/olatinn/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      if (res.ok) {
        alert("Signup successful!");
        router.push("/signin");
      } else {
        const data = await res.json();
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error connecting to server");
    }
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/bg-auth.png')" }}
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo5.png"
            alt="OLATINN Logo"
            width={180}
            height={60}
            className="rounded-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Sign Up
        </h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#959A4A]"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#959A4A]"
        />

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#959A4A]"
        />

        {/* Show Password Toggle */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="mr-2"
          />
          <label htmlFor="showPassword" className="text-gray-700 text-sm">
            Show Password
          </label>
        </div>

        <button
          onClick={handleSignup}
          className="w-full bg-[#000271] text-white py-3 rounded-lg font-semibold hover:bg-[#17acdd] transition"
        >
          Sign Up
        </button>

        <p className="text-center text-gray-600 mt-4">
          Already signed up?{" "}
          <span
            onClick={() => router.push("/signin")}
            className="text-[#000271] font-medium cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
