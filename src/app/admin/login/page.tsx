"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginData {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // ✅ Handle input changes
  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle login submit
  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError("");

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/olatinn/api/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Save token (optional, for auth)
      localStorage.setItem("adminToken", data.token);

      // ✅ Navigate to dashboard
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Redirect to registration
  const handleRegisterRedirect = (): void => {
    router.push("/admin/registration");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#17acdd] to-[#1e90ff] p-6">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-[#17acdd] mb-6">
          Admin Login
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-center font-medium">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#17acdd] outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#17acdd] outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#17acdd] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#1e90ff] transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-4">
          Not registered yet?{" "}
          <button
            type="button"
            onClick={handleRegisterRedirect}
            className="text-[#17acdd] font-semibold hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
