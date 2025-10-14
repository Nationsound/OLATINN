"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Contact {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

const AdminContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await fetch("http://localhost:5000/olatinn/api/contact-reviews/contacts");
        const data = await res.json();

        if (res.ok) setContacts(data);
        else setError(data.message || "Failed to load contacts");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading contacts...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <motion.div
      className="p-6 bg-white rounded-2xl shadow-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Contact Messages
      </h2>

      {contacts.length === 0 ? (
        <p className="text-gray-500 text-center">No contact messages yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Message</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <motion.tr
                  key={contact._id}
                  whileHover={{ scale: 1.02 }}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="px-4 py-2">{contact.name}</td>
                  <td className="px-4 py-2">{contact.email}</td>
                  <td className="px-4 py-2">{contact.message}</td>
                  <td className="px-4 py-2">
                    {new Date(contact.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default AdminContacts;
