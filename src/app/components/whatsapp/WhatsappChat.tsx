"use client";

import React from "react";

interface WhatsappChatProps {
  phoneNumber: string; // Include country code, e.g. "2348012345678"
  message?: string;
}

const WhatsappChat: React.FC<WhatsappChatProps> = ({ phoneNumber, message }) => {
  const whatsappLink = `https://wa.me/${phoneNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center z-50 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M20.52 3.48a11.94 11.94 0 0 0-16.94 0 11.97 11.97 0 0 0-3.5 8.5c.01 2.12.56 4.21 1.63 6.1L2 22l4.92-1.41a11.93 11.93 0 0 0 6.1 1.63c2.92 0 5.67-1.13 7.72-3.18a11.94 11.94 0 0 0 0-16.94zm-8.52 17.52a9.93 9.93 0 0 1-5.37-1.47l-.38-.23-2.9.83.78-2.82-.25-.37a9.92 9.92 0 1 1 8.14 4.66zM16 14.5c-.26 0-1.44-.71-1.66-.79-.22-.08-.38-.12-.54.12-.16.23-.62.79-.76.95-.14.16-.27.18-.5.06-.22-.12-.93-.34-1.77-1.1-.65-.58-1.09-1.29-1.22-1.51-.13-.23-.01-.35.1-.46.1-.1.22-.27.33-.4.11-.13.15-.22.22-.37.07-.15.03-.28-.02-.39-.05-.11-.54-1.3-.74-1.78-.2-.48-.4-.41-.54-.42-.14-.01-.3-.01-.46-.01s-.38.06-.58.28c-.2.22-.77.75-.77 1.83s.79 2.13.9 2.28c.11.15 1.56 2.38 3.78 3.34.53.23.94.37 1.26.47.53.16 1.01.14 1.39.08.42-.07 1.44-.58 1.64-1.14.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.27-.24-.11-1.41-.65-1.63-.73z" />
      </svg>
    </a>
  );
};

export default WhatsappChat;
