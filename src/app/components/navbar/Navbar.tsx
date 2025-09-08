"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiMenu, FiX } from "react-icons/fi"; // Burger + Close icons

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); 

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50"> 
      {/* Desktop Navbar */}
      <div className="hidden md:flex justify-between items-center px-8 py-2 bg-[var(--primary)] text-white shadow-md">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/images/olatin.png" 
          alt="OLATINN Logo" 
          width={60} 
          height={20}
          className="rounded-full" />
        </Link>

        {/* Links */}
        <ul className="flex gap-8 font-medium">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/services">Services</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li><Link href="/designs">Our Designs</Link></li>
          <li><Link href="/contact">Contact</Link></li>
        </ul>

        {/* Auth Buttons */}
        <div className="flex gap-4">
          <Link
            href="/signin"
            className="px-4 py-2 rounded-lg bg-[var(--btn)] hover:bg-[var(--btn-hover)] transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-[var(--btn)] hover:bg-[var(--btn-hover)] transition"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="flex md:hidden justify-between items-center px-6 py-4 bg-[var(--secondary)] text-white">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/images/olatin.png" 
          alt="OLATINN Logo" 
          width={60} 
          height={20}
          className="rounded-full" />
        </Link>

        {/* Burger Icon */}
        <button onClick={toggleMenu}>
          {isOpen ? <FiX size={28} /> : <FiMenu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed top-0 left-0 h-full w-64 bg-[var(--secondary)] text-white shadow-lg z-40 p-6 flex flex-col gap-6">
          <Link href="/about" onClick={toggleMenu}>About</Link>
          <Link href="/services" onClick={toggleMenu}>Services</Link>
          <Link href="/blog" onClick={toggleMenu}>Blog</Link>
          <Link href="/designs" onClick={toggleMenu}>Our Designs</Link>
          <Link href="/contact" onClick={toggleMenu}>Contact</Link>
          <Link
            href="/signin"
            className="px-4 py-2 rounded-lg bg-[var(--btn)] hover:bg-[var(--btn-hover)] transition"
            onClick={toggleMenu}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-[var(--btn)] hover:bg-[var(--btn-hover)] transition"
            onClick={toggleMenu}
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
