"use client";

import type { CSSProperties } from "react";

type WhatsAppChatButtonProps = {
  whatsappNumber?: string | null;
  storeName?: string;
  className?: string;
};

export default function WhatsAppChatButton({
  whatsappNumber,
  storeName = "our store",
  className = "",
}: WhatsAppChatButtonProps) {
  // Accept numbers entered with spaces, brackets, or hyphens.
  // Store the number in international format, including country code.
  const normalizedNumber = (whatsappNumber ?? "").replace(
    /[\s()+.-]/g,
    ""
  );

  // WhatsApp expects the international number without the + sign.
  const isValidNumber = /^[1-9]\d{7,14}$/.test(normalizedNumber);

  if (!isValidNumber) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "WhatsApp button is hidden because the store phone number is missing or invalid.",
        { whatsappNumber }
      );
    }

    return null;
  }

  const message = `Hello ${storeName}, I would like to enquire about your products.`;

  const whatsappUrl =
    `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;

  const buttonStyle: CSSProperties = {
    backgroundColor: "#25D366",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.22)",
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${storeName} on WhatsApp`}
      title={`Chat with ${storeName} on WhatsApp`}
      className={[
        "inline-flex items-center justify-center gap-3",
        "rounded-full px-5 py-4",
        "font-semibold text-white",
        "transition duration-200 hover:scale-105 hover:brightness-95",
        "focus:outline-none focus:ring-4 focus:ring-green-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={buttonStyle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="27"
        height="27"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.85 11.85 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.59 5.96L.05 24l6.27-1.64a11.94 11.94 0 0 0 5.76 1.47h.01c6.58 0 11.93-5.35 11.93-11.93a11.85 11.85 0 0 0-3.5-8.42ZM12.09 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.97.99-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.25c0-5.46 4.44-9.9 9.9-9.9a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>

      <span className="text-sm sm:text-base">Chat on WhatsApp</span>
    </a>
  );
}