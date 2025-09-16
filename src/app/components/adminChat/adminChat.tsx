"use client";
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  sender: "user" | "admin";
  text: string;
}

let socket: Socket;

const AdminChat: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom safely
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Connect socket only once
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000");

    // Register as admin
    socket.emit("register", { type: "admin", name: "Admin" });

    // Listen to messages
    const handleMessage = (payload: { message: string; senderType: "user" | "admin" }) => {
      setMessages((prevMessages) => [...prevMessages, { text: payload.message, sender: payload.senderType }]);
    };

    socket.on("receive_message", handleMessage);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: Message = { text: input, sender: "admin" };
    setMessages((prevMessages) => [...prevMessages, newMsg]);

    socket.emit("send_message", { to: "user", message: input, senderType: "admin" });
    setInput("");
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#17acdd] text-white p-3 rounded-full shadow-lg hover:bg-[#1e90ff] transition"
        >
          💬 Admin Chat
        </button>
      )}

      {open && (
        <div className="w-96 bg-white rounded-xl shadow-lg flex flex-col border border-[#17acdd]">
          <div className="bg-[#17acdd] text-white p-3 font-bold text-lg rounded-t-xl flex justify-between items-center">
            Olatinn Support
            <button onClick={() => setOpen(false)} className="ml-2 font-bold hover:text-gray-200">
              ✖
            </button>
          </div>

          <div className="flex-1 p-3 overflow-y-auto h-80 space-y-2 bg-[#f9faff]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.sender === "admin"
                    ? "bg-[#4CAF50] text-white self-end"
                    : "bg-[#1e90ff] text-white self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex border-t border-[#17acdd]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 outline-none border-none focus:ring-0"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-[#17acdd] text-white px-4 font-semibold hover:bg-[#1e90ff] transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChat;
