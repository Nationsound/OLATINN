
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiArrowUpRight } from "react-icons/fi";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

const navLinks = [
  { label: "Store Front", href: "/store-front" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Our Designs", href: "/designs" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const closeMenu = () => setIsOpen(false);

  const menuVariants = {
    closed: {
      x: "100%",
      transition: {
        duration: reduceMotion ? 0 : 0.3,
        ease: "easeInOut" as const,
      },
    },
    open: {
      x: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  const linkVariants = {
    closed: {
      opacity: 0,
      x: 20,
    },
    open: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: reduceMotion ? 0 : 0.08 + index * 0.06,
        duration: reduceMotion ? 0 : 0.3,
      },
    }),
  };

  return (
    <motion.nav
      initial={reduceMotion ? false : { y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.6,
        ease: "easeOut",
      }}
      className="fixed left-0 top-0 z-50 w-full"
    >
      {/* Desktop and tablet navbar */}
      <div className="hidden items-center justify-between border-b border-white/10 bg-[var(--primary)]/95 px-6 text-white shadow-lg shadow-black/10 backdrop-blur-xl md:flex lg:px-10">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Olatinn home"
          className="group flex shrink-0 items-center"
        >
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            <Image
              src="/images/main.png"
              alt="OLATINN Logo"
              width={120}
              height={42}
              priority
              className="h-auto w-[88px] rounded-full object-contain lg:w-[105px]"
            />
          </motion.div>
        </Link>

        {/* Navigation links */}
        <ul className="ml-6 flex items-center gap-4 font-medium lg:gap-7">
          {navLinks.map((link, index) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(`${link.href}/`));

            return (
              <motion.li
                key={link.href}
                initial={
                  reduceMotion ? false : { opacity: 0, y: -10 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.35,
                  delay: reduceMotion ? 0 : index * 0.06,
                }}
              >
                <Link
                  href={link.href}
                  className={`group relative flex items-center gap-1 whitespace-nowrap py-2 text-sm transition-colors duration-300 lg:text-[15px] ${
                    isActive
                      ? "text-cyan-300"
                      : "text-white/85 hover:text-cyan-300"
                  }`}
                >
                  {link.label}

                  {/* Animated underline */}
                  <motion.span
                    className="absolute -bottom-0.5 left-0 h-[2px] rounded-full bg-[var(--btn)]"
                    initial={false}
                    animate={{
                      width: isActive ? "100%" : "0%",
                    }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.25,
                      ease: "easeOut",
                    }}
                  />

                  {!isActive && (
                    <span className="absolute -bottom-0.5 left-0 h-[2px] w-0 rounded-full bg-[var(--btn)] transition-all duration-300 ease-out group-hover:w-full" />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>

        {/* Authentication buttons */}
        <div className="ml-5 flex shrink-0 items-center gap-2 lg:gap-3">
          <Link
            href="/signin"
            className="rounded-xl border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:border-[var(--btn)] hover:bg-white/10"
          >
            Sign In
          </Link>

          <motion.div
            whileHover={reduceMotion ? undefined : { y: -2, scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            <Link
              href="/signup"
              className="group flex items-center gap-2 rounded-xl bg-[var(--btn)] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-black/10 transition-colors duration-300 hover:bg-[var(--btn-hover)]"
            >
              Sign Up
              <FiArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Mobile navbar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[var(--secondary)]/95 px-5 py-3 text-white shadow-lg backdrop-blur-xl md:hidden">
        <Link
          href="/"
          onClick={closeMenu}
          aria-label="Olatinn home"
          className="flex items-center"
        >
          <Image
            src="/images/main.png"
            alt="OLATINN Logo"
            width={100}
            height={36}
            priority
            className="h-auto w-[85px] rounded-full object-contain"
          />
        </Link>

        <motion.button
          type="button"
          onClick={() => setIsOpen((previous) => !previous)}
          whileTap={reduceMotion ? undefined : { scale: 0.88 }}
          className="relative z-[70] flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 transition-colors hover:bg-white/10"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="olatinn-mobile-menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOpen ? "close" : "open"}
              initial={reduceMotion ? false : { rotate: -45, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { rotate: 45, opacity: 0, scale: 0.7 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
              className="flex items-center justify-center"
            >
              {isOpen ? <FiX size={25} /> : <FiMenu size={25} />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Mobile overlay and sliding drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation menu overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              onClick={closeMenu}
              className="fixed inset-0 z-40 cursor-default bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.div
              id="olatinn-mobile-menu"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="fixed right-0 top-0 z-[60] flex h-[100dvh] w-[min(86vw,360px)] flex-col overflow-y-auto border-l border-white/10 bg-[var(--secondary)] px-6 pb-8 pt-24 text-white shadow-2xl md:hidden"
            >
              {/* Drawer heading */}
              <div className="mb-6 border-b border-white/10 pb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                  Explore Olatinn
                </p>
                <p className="mt-2 text-xl font-bold">
                  Technology & Innovation
                </p>
              </div>

              {/* Staggered links */}
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, index) => {
                  const isActive =
                    pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

                  return (
                    <motion.li
                      key={link.href}
                      custom={index}
                      variants={linkVariants}
                      initial="closed"
                      animate="open"
                      exit={{
                        opacity: 0,
                        x: 15,
                        transition: { duration: reduceMotion ? 0 : 0.12 },
                      }}
                    >
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className={`group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? "bg-white/10 text-cyan-300"
                            : "text-white/85 hover:bg-white/10 hover:text-cyan-300"
                        }`}
                      >
                        <span>{link.label}</span>
                        <FiArrowUpRight
                          size={16}
                          className="opacity-40 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100"
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Mobile authentication */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.3,
                  delay: reduceMotion ? 0 : 0.25,
                }}
                className="mt-auto grid grid-cols-2 gap-3 border-t border-white/10 pt-6"
              >
                <Link
                  href="/signin"
                  onClick={closeMenu}
                  className="flex items-center justify-center rounded-xl border border-white/20 px-4 py-3 text-sm font-semibold transition hover:border-cyan-300 hover:bg-white/5"
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-1 rounded-xl bg-[var(--btn)] px-4 py-3 text-sm font-bold transition hover:bg-[var(--btn-hover)]"
                >
                  Sign Up <FiArrowUpRight size={16} />
                </Link>
              </motion.div>

              <p className="mt-5 text-center text-[10px] uppercase tracking-[0.16em] text-white/35">
                Innovation. Creativity. Possibility.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;