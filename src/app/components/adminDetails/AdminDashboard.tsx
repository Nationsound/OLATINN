"use client";
import AdminHeader from "@/app/components/adminHeader/AdminHeader";
import React, { useState, useEffect } from "react";

interface Booking {
  _id: string;
  service: string;
  websiteType?: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface Subscriber {
  _id: string;
  name: string;
  email: string;
}

interface Partner {
  _id: string;
  company: string;
  email: string;
}

interface AdminUser {
  _id: string;
  name: string;
  email: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"bookings" | "subscribers" | "partners" | "admins">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  // ✅ Generic typed fetcher
  const fetchData = async <T,>(endpoint: string, setter: React.Dispatch<React.SetStateAction<T>>) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      const res = await fetch(`${apiBase}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch data");
      const data: T = await res.json();
      setter(data);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CRUD actions
  const handleDelete = async (endpoint: string, id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`${apiBase}${endpoint}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setter((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error("❌ Delete error:", err);
    }
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;
    try {
      const res = await fetch(`${apiBase}/olatinn/api/bookings/${editingBooking._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingBooking),
      });
      if (!res.ok) throw new Error("Failed to update booking");
      const updated = await res.json();
      setBookings((prev) =>
        prev.map((b) => (b._id === updated.booking._id ? updated.booking : b))
      );
      setEditingBooking(null);
    } catch (err) {
      console.error("❌ Update error:", err);
    }
  };

  // ✅ Fetch per tab change
  useEffect(() => {
    const loadData = () => {
      if (activeTab === "bookings") fetchData<Booking[]>("/olatinn/api/bookings", setBookings);
      if (activeTab === "subscribers") fetchData<Subscriber[]>("/olatinn/api/subscribers", setSubscribers);
      if (activeTab === "partners") fetchData<Partner[]>("/olatinn/api/partners", setPartners);
      if (activeTab === "admins") fetchData<AdminUser[]>("/olatinn/api/admin/list", setAdmins);
    };
    loadData();
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-white mt-18">
      <div className="bg-[#17acdd] text-white px-6 py-4 shadow">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <AdminHeader
  activeTab={activeTab}
  setActiveTab={(tab: string) => {
    if (
      tab === "bookings" ||
      tab === "subscribers" ||
      tab === "partners" ||
      tab === "admins"
    ) {
      setActiveTab(tab);
    }
  }}
/>

      <main className="flex-1 p-6">
        {loading && <p className="text-gray-500">Loading...</p>}

        {/* Bookings */}
        {activeTab === "bookings" && (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-[#17acdd] mb-4">Bookings</h2>
            <table className="w-full border-collapse border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Service</th>
                  <th className="border px-4 py-2 text-left">Website Type</th>
                  <th className="border px-4 py-2 text-left">Client Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Date</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td className="border px-4 py-2">{b.service}</td>
                    <td className="border px-4 py-2">{b.websiteType || "N/A"}</td>
                    <td className="border px-4 py-2">{b.name}</td>
                    <td className="border px-4 py-2">{b.email}</td>
                    <td className="border px-4 py-2">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="border px-4 py-2 space-x-2">
                      <button onClick={() => setEditingBooking(b)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete("/olatinn/api/bookings", b._id, setBookings)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {editingBooking && (
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-3 text-[#17acdd]">Edit Booking</h3>
                <input
                  type="text"
                  value={editingBooking.name}
                  onChange={(e) => setEditingBooking({ ...editingBooking, name: e.target.value })}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="email"
                  value={editingBooking.email}
                  onChange={(e) => setEditingBooking({ ...editingBooking, email: e.target.value })}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="text"
                  value={editingBooking.service}
                  onChange={(e) => setEditingBooking({ ...editingBooking, service: e.target.value })}
                  className="w-full p-2 mb-2 border rounded"
                />
                <button onClick={handleUpdateBooking} className="bg-[#17acdd] text-white px-4 py-2 rounded-lg mr-2">Save</button>
                <button onClick={() => setEditingBooking(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">Cancel</button>
              </div>
            )}
          </section>
        )}

        {/* Subscribers */}
        {activeTab === "subscribers" && (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-[#17acdd] mb-4">Subscribers</h2>
            <table className="w-full border-collapse border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s._id}>
                    <td className="border px-4 py-2">{s.name || "N/A"}</td>
                    <td className="border px-4 py-2">{s.email}</td>
                    <td className="border px-4 py-2">
                      <button onClick={() => handleDelete("/olatinn/api/subscribers", s._id, setSubscribers)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Partners */}
        {activeTab === "partners" && (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-[#17acdd] mb-4">Partners</h2>
            <table className="w-full border-collapse border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Company</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr key={p._id}>
                    <td className="border px-4 py-2">{p.company}</td>
                    <td className="border px-4 py-2">{p.email}</td>
                    <td className="border px-4 py-2">
                      <button onClick={() => handleDelete("/olatinn/api/partners", p._id, setPartners)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Admin Users */}
        {activeTab === "admins" && (
          <section className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-[#17acdd] mb-4">Admin List</h2>
            <table className="w-full border-collapse border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-2 text-left">Name</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a._id}>
                    <td className="border px-4 py-2">{a.name}</td>
                    <td className="border px-4 py-2">{a.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
