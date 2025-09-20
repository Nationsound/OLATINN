"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Design {
  _id: string;
  title: string;
  description: string;
  link?: string;
  date: string;
  slug: string;
  image?: string; // match backend field
}

const UserDashboardDesigns: React.FC = () => {
  const [latest, setLatest] = useState<Design | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("http://localhost:5000/olatinn/api/designs/latest");
        if (!res.ok) {
          console.warn("No API route found or server error");
          return;
        }
        const data: Design = await res.json();
        setLatest(data);
      } catch (error) {
        console.error("Failed to fetch latest design", error);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="bg-[#5adfe8] shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-3">Latest Design</h2>

      {latest ? (
        <div className="space-y-4">
          {/* Image */}
          <div className="w-full h-[400px] md:h-[500px] bg-gray-200 rounded-lg overflow-hidden">
            {latest.image ? (
              <Image
                src={latest.image}
                alt={latest.title}
                width={600}
                height={500}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Title + Description */}
          <h3 className="text-xl font-semibold">{latest.title}</h3>
          <p className="text-gray-700">{latest.description}</p>

          {latest.link && (
            <a
              href={latest.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              Visit Link
            </a>
          )}
        </div>
      ) : (
        <p className="text-gray-500 italic">No designs posted yet</p>
      )}

      <button
        onClick={() => router.push("/designs")}
        className="bg-[#000271] text-white py-2 px-4 rounded hover:bg-[#17acdd] mt-3"
      >
        View More
      </button>
    </div>
  );
};

export default UserDashboardDesigns;
