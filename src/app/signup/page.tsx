"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SignupPage = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      setLoading(false);
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
      console.error("Signup error:", error);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/bg-auth.png')" }}
    >
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo5.png"
            alt="OLATINN Logo"
            width={180}
            height={60}
            className="rounded-full"
          />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign Up</h1>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#959A4A]"
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#959A4A]"
            required
          />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#959A4A]"
            required
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
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#000271] hover:bg-[#17acdd]"
            }`}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>

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
