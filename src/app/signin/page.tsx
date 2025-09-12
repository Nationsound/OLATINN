"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
const handleSignin = async (e) => {
  e.preventDefault();

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

      // If profile has fullName, address, or age -> redirect to dashboard
      if (profileData.fullName || profileData.address || profileData.age) {
        router.push("/dashboard");
      } else {
        router.push("/profile-setup");
      }
    } else {
      // If fetching profile fails, assume profile not set up
      router.push("/profile-setup");
    }
  } catch (error) {
    console.error(error);
    alert("Error connecting to server");
  }
};


  return (
    <div className="h-screen w-full bg-cover bg-center flex items-center justify-center" 
      style={{ backgroundImage: "url('/images/bg-auth2.jpg')" }}>
      <div className="mb-2">
        <div className="flex justify-center mb-6">
          <Image 
          src="/images/logo5.png" 
          alt="Logo" 
          width={180}
          height={60}
          className="rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-center text-[var(--btn)] mb-6">Sign In</h2>

        <form onSubmit={handleSignin} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[var(--primary)] outline-none" required />

          <button type="submit" className="w-full py-3 rounded-lg text-white font-semibold transition duration-300"
            style={{ backgroundColor: "var(--btn)" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "var(--btn-hover)")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "var(--btn)")}>
            Sign In
          </button>
        </form>

        <div className="flex justify-between items-center mt-4 text-sm">
          <a href="/forgot-password" className="text-[var(--primary)] hover:text-[var(--secondary)]">
            Forgotten password?
          </a>
          <a href="/signup" className="text-[var(--primary)] hover:text-[var(--secondary)]">
            Never registered? Signup
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signin;
