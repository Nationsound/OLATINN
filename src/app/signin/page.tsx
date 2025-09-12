"use client";

import React, { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Signin = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1️⃣ Sign in user
      const res = await fetch("http://localhost:5000/olatinn/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      localStorage.setItem("olatinnToken", data.token); // save token
      alert("Login successful!");

      // 2️⃣ Check if profile exists
      const profileRes = await fetch("http://localhost:5000/olatinn/api/profile/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();

        // Redirect based on profile completeness
        if (profileData.fullName || profileData.address || profileData.age) {
          router.push("/dashboard");
        } else {
          router.push("/profile-setup");
        }
      } else {
        router.push("/profile-setup");
      }
    } catch (error) {
      console.error("Signin error:", error);
      alert("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('/images/bg-auth2.jpg')" }}
    >
      <div className="mb-2 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/images/logo5.png"
            alt="Logo"
            width={180}
            height={60}
            className="rounded-full"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-[var(--btn)] mb-6">Sign In</h2>

        {/* Signin Form */}
        <form onSubmit={handleSignin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--btn)] hover:bg-[var(--btn-hover)]"
            }`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Links */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <a
            href="/forgot-password"
            className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
          >
            Forgotten password?
          </a>
          <a
            href="/signup"
            className="text-[var(--primary)] hover:text-[var(--secondary)] transition-colors"
          >
            Never registered? Signup
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signin;
