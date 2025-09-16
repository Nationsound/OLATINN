"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";


// --- Type definitions ---
interface User {
  fullName: string;
  address: string;
  age: number;
}

interface PartnerData {
  company: string;
  email: string;
}

interface BookingData {
  service: string;
  name: string;
  email: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [websiteType, setWebsiteType] = useState("");
  const [bookingData, setBookingData] = useState<BookingData>({
    service: "",
    name: "",
    email: "",
  });
  const [partnerData, setPartnerData] = useState<PartnerData>({ company: "", email: "" });
  const [subscribeEmail, setSubscribeEmail] = useState("");

  const router = useRouter();

  // --- Fetch user profile ---
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/olatinn/api/profile/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("olatinnToken")}`,
          },
        });

        if (res.ok) {
          const data: User = await res.json();
          setUser(data);
        } else {
          router.push("/signin");
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        router.push("/signin");
      }
    };

    fetchUser();
  }, [router]);

  // --- Logout handler ---
  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:5000/olatinn/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        localStorage.removeItem("olatinnToken");
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- Partner Form ---
  const handlePartnerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/olatinn/api/partners", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("olatinnToken")}`,
        },
        body: JSON.stringify(partnerData),
      });
      if (res.ok) {
        alert("Partner form submitted successfully!");
        setPartnerData({ company: "", email: "" });
        setShowPartnerForm(false);
      } else {
        const data = await res.json();
        alert(data.message || "Partner submission failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while submitting partner form");
    }
  };

  // --- Subscribe Form ---
  const handleSubscribeSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/olatinn/api/subscribers/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("olatinnToken")}`,
        },
        body: JSON.stringify({ email: subscribeEmail }),
      });
      if (res.ok) {
        alert("Subscribed successfully!");
        setSubscribeEmail("");
        setShowSubscribeForm(false);
      } else {
        const data = await res.json();
        alert(data.message || "Subscription failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while subscribing");
    }
  };

  // --- Booking Form ---
  const handleBookingSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/olatinn/api/bookings/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("olatinnToken")}`,
        },
        body: JSON.stringify({
          ...bookingData,
          service: bookingData.service === "Website" ? websiteType : bookingData.service,
        }),
      });
      if (res.ok) {
        alert("Booking submitted successfully!");
        setBookingData({ service: "", name: "", email: "" });
        setWebsiteType("");
        setShowBookingForm(false);
      } else {
        const data = await res.json();
        alert(data.message || "Booking failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server error while submitting booking");
    }
  };

  if (!user) return null;

  const userInitial = user.fullName ? user.fullName[0].toUpperCase() : "?";
  const firstName = user.fullName ? user.fullName.split(" ")[0] : "User";

  const websiteOptions = [
    "E-commerce",
    "Corporate",
    "Portfolio",
    "Blog",
    "Educational",
    "Entertainment",
    "Non-profit",
    "Government",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 mt-18">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#000271]">
              Welcome To OLATINN, <span className="text-[#17acdd]">{firstName}</span>
            </h1>
            <p className="text-gray-600 mt-2 text-lg">Our creative hub for business enhancement</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500 transition cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* User Profile Card */}
        <div className="flex items-center bg-white rounded-2xl shadow-lg p-6 mb-8 space-x-6">
          <div className="flex items-center justify-center w-24 h-24 bg-[#17acdd] text-white text-5xl font-bold rounded-full">
            {userInitial}
          </div>
          <div>
            <p className="text-xl font-semibold">{user.fullName}</p>
            <p className="text-gray-600">Address: {user.address}</p>
            <p className="text-gray-600">Age: {user.age}</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => setShowPartnerForm(!showPartnerForm)}
            className="bg-[#000271] text-white rounded-2xl p-6 shadow-lg cursor-pointer hover:bg-[#17acdd] transition"
          >
            <h2 className="text-xl font-bold">Become A Partner</h2>
            <p className="mt-2 text-sm">Click to join our partner program.</p>
          </div>

          <div
            onClick={() => setShowSubscribeForm(!showSubscribeForm)}
            className="bg-[#17acdd] text-white rounded-2xl p-6 shadow-lg cursor-pointer hover:bg-[#000271] transition"
          >
            <h2 className="text-xl font-bold">Subscribe</h2>
            <p className="mt-2 text-sm">Get frequent updates and stay connected.</p>
          </div>

          <div
            onClick={() => setShowBookingForm(!showBookingForm)}
            className="bg-[#5adfe8] text-white rounded-2xl p-6 shadow-lg cursor-pointer hover:bg-[#17acdd] transition"
          >
            <h2 className="text-xl font-bold">Booking</h2>
            <p className="mt-2 text-sm">Access your booking dashboard and schedule services.</p>
          </div>
        </div>

        {/* Partner Form */}
        {showPartnerForm && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Partner Form</h3>
            <form onSubmit={handlePartnerSubmit}>
              <input
                type="text"
                placeholder="Company Name"
                required
                value={partnerData.company}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPartnerData({ ...partnerData, company: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Business Email"
                required
                value={partnerData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPartnerData({ ...partnerData, email: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded-lg"
              />
              <button className="bg-[#000271] text-white px-6 py-2 rounded-lg hover:bg-[#17acdd]">
                Submit
              </button>
            </form>
          </div>
        )}

        {/* Subscribe Form */}
        {showSubscribeForm && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Subscribe Form</h3>
            <form onSubmit={handleSubscribeSubmit}>
              <input
                type="email"
                placeholder="Your Email"
                required
                value={subscribeEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSubscribeEmail(e.target.value)}
                className="w-full p-3 mb-4 border rounded-lg"
              />
              <button className="bg-[#17acdd] text-white px-6 py-2 rounded-lg hover:bg-[#000271]">
                Subscribe
              </button>
            </form>
          </div>
        )}

        {/* Booking Form */}
        {showBookingForm && (
          <div className="mt-6 bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Booking Form</h3>
            <form onSubmit={handleBookingSubmit}>
              <select
                required
                value={bookingData.service}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setBookingData({ ...bookingData, service: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded-lg"
              >
                <option value="">Select Service</option>
                <option value="UX/UI">UX/UI</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Website">Website (All Types)</option>
                <option value="Static HTML with DOM manipulation">Static HTML</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Product Design">Product Design</option>
                <option value="Data Analytics">Data Analytics</option>
              </select>

              {bookingData.service === "Website" && (
                <select
                  required
                  value={websiteType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => setWebsiteType(e.target.value)}
                  className="w-full p-3 mb-4 border rounded-lg"
                >
                  <option value="">Select Website Type</option>
                  {websiteOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                placeholder="Your Name"
                required
                value={bookingData.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setBookingData({ ...bookingData, name: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded-lg"
              />

              <input
                type="email"
                placeholder="Your Email"
                required
                value={bookingData.email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setBookingData({ ...bookingData, email: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded-lg"
              />

              <button
                type="submit"
                className="bg-[#5adfe8] text-white px-6 py-2 rounded-lg hover:bg-[#17acdd]"
              >
                Submit Booking
              </button>
            </form>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Dashboard;
