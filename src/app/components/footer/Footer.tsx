import React from "react";
import Link from "next/link";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-[#333b69] text-white py-10 mt-5">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & About */}
        <div>
          <h2 className="text-2xl font-bold mb-4">OLATINN</h2>
          <p className="text-sm leading-6 text-gray-300">
            Olusola Adebayo Tech and Innovation Limited — delivering tech
            solutions, innovation, and creative designs that empower businesses
            and individuals.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li><Link href="/about" className="hover:text-[var(--primary)]">About</Link></li>
            <li><Link href="/services" className="hover:text-[var(--primary)]">Services</Link></li>
            <li><Link href="/blog" className="hover:text-[var(--primary)]">Blog</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--primary)]">Contact</Link></li>
          </ul>
        </div>

        {/* Legal & Policy Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li><Link href="/brand-guidelines" className="hover:text-[var(--primary)]">Brand Guidelines</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-[var(--primary)]">Privacy Policy</Link></li>
            <li><Link href="/terms-of-services" className="hover:text-[var(--primary)]">Terms of Service</Link></li>
            <li><Link href="/cookie-policy" className="hover:text-[var(--primary)]">Cookie Policy</Link></li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Connect with Us</h3>
          <div className="flex gap-4">
            <a href="#" target="_blank" className="p-2 bg-white/10 rounded-full hover:bg-[var(--primary)] transition">
              <FaFacebookF />
            </a>
            <a href="#" target="_blank" className="p-2 bg-white/10 rounded-full hover:bg-[var(--primary)] transition">
              <FaTwitter />
            </a>
            <a href="#" target="_blank" className="p-2 bg-white/10 rounded-full hover:bg-[var(--primary)] transition">
              <FaInstagram />
            </a>
            <a href="#" target="_blank" className="p-2 bg-white/10 rounded-full hover:bg-[var(--primary)] transition">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center mt-10 text-sm text-gray-400 border-t border-gray-600 pt-6">
        © {new Date().getFullYear()} OLATINN. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
