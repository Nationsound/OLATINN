"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 bg-[#333b69] text-white p-5 rounded-2xl shadow-lg max-w-md"
        >
          <p className="text-sm mb-3 leading-relaxed font-serif tracking-wide">
            We use cookies to enhance your browsing experience, serve
            personalized content, and analyze site traffic.{" "}
            <a
              href="/cookie-policy"
              className="underline text-[var(--primary)] hover:text-[#000271] transition"
            >
              Learn more
            </a>
          </p>

          <div className="flex gap-3 justify-end">
            <button
              onClick={handleDecline}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 text-sm rounded-md transition"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="bg-[var(--primary)] hover:bg-[#000271] px-4 py-2 text-sm rounded-md text-white transition"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
