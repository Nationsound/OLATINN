"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { FaUsers, FaCalendarCheck, FaHandshake, FaUserShield, FaSignOutAlt } from "react-icons/fa";

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab, setActiveTab }) => {
  const router = useRouter();

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  return (
    <header className="bg-white shadow-md flex justify-center space-x-6 py-3">
      <button
        onClick={() => setActiveTab("bookings")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          activeTab === "bookings"
            ? "bg-[#17acdd] text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <FaCalendarCheck /> Bookings
      </button>

      <button
        onClick={() => setActiveTab("subscribers")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          activeTab === "subscribers"
            ? "bg-[#17acdd] text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <FaUsers /> Subscribers
      </button>

      <button
        onClick={() => setActiveTab("partners")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          activeTab === "partners"
            ? "bg-[#17acdd] text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <FaHandshake /> Partners
      </button>

      <button
        onClick={() => setActiveTab("admins")}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
          activeTab === "admins"
            ? "bg-[#17acdd] text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        <FaUserShield /> Admin List
      </button>

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      >
        <FaSignOutAlt /> Logout
      </button>
    </header>
  );
};

export default AdminHeader;
