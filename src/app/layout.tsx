import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import UserChatWidget from "./components/chat/ChatBox";
import { BlogProvider } from "./context/BlogContext";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
      
        

        <Navbar />
        <main className="min-h-screen">
          <BlogProvider>{children}</BlogProvider>
        </main>
        <UserChatWidget />
        <Footer />
      </body>
    </html>
  );
}
