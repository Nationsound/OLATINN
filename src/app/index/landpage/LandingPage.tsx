
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Typewriter } from "react-simple-typewriter";
import Link from "next/link";

const slides = [
  {
    id: 1,
    eyebrow: "OLUSOLA ADEBAYO TECH & INNOVATION",
    text: "Welcome to OLATINN Limited.",
    description:
      "Technology, creativity, and innovation come together to create digital experiences for businesses and individuals.",
    bg: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=85",
    label: "Our Vision",
    ecosystem: [],
  },
  {
    id: 2,
    eyebrow: "DISCOVER OUR ECOSYSTEM",
    text: "Ideas Into Digital Experiences.",
    description:
      "Discover tools designed to support online commerce and simplify everyday digital tasks.",
    bg: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=2200&q=85",
    label: "Explore Our Platforms",
    ecosystem: [
      {
        name: "Olatinn Store Front",
        subtitle: "Digital Commerce",
        description: "Create a store and showcase your products online.",
        icon: "↗",
        available: true,
        href: "/store-front",
      },
      {
        name: "Olatinn Image Converter",
        subtitle: "Creative Tools",
        description: "A simpler way to handle everyday image conversions.",
        icon: "◈",
        available: false,
        href: "#",
      },
    ],
  },
  {
    id: 3,
    eyebrow: "THE NEXT GENERATION OF DIGITAL TOOLS",
    text: "Innovation for What Comes Next.",
    description:
      "Our growing ecosystem brings together emerging technology and communication tools to unlock new possibilities.",
    bg: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2200&q=85",
    label: "Coming Soon",
    ecosystem: [
      {
        name: "Olatinn AI Interviewer",
        subtitle: "Artificial Intelligence",
        description: "AI-powered interview preparation and practice.",
        icon: "✳",
        available: false,
        href: "#",
      },
      {
        name: "Olatinn Mailer",
        subtitle: "Digital Communication",
        description: "A new approach to everyday email workflows.",
        icon: "✉",
        available: false,
        href: "#",
      },
    ],
  },
];

export default function LandingPage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIndex((previous) => (previous + 1) % slides.length);
    }, 8000);

    return () => clearTimeout(timer);
  }, [index]);

  const currentSlide = slides[index];

  return (
    <main className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-[#000271] text-white">
      {/* Background slider */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide.id}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${currentSlide.bg}")` }}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* Cinematic overlays */}
      <div className="absolute inset-0 bg-[#00052b]/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#00052b]/95 via-[#000b42]/80 to-[#000b42]/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#00052b]/80 via-transparent to-[#00052b]/35" />

      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full border border-cyan-300/10" />
      <div className="pointer-events-none absolute -right-16 top-1/3 h-64 w-64 rounded-full border border-cyan-300/10" />
      <div className="pointer-events-none absolute bottom-20 left-1/4 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Minimal brand header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400 text-xl font-black text-[#000271] shadow-lg shadow-cyan-500/20">
              O
            </span>
            <span>
              <span className="block text-xl font-black tracking-[0.18em]">
                OLATINN
              </span>
              <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.18em] text-white/65 sm:text-[10px]">
                Technology & Innovation
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-md sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-xs font-medium tracking-wide text-white/80">
              Building digital possibilities
            </span>
          </div>
        </div>
      </header>

      {/* Main slide content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5 pb-24 pt-28 sm:px-8 sm:pb-28 lg:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              {/* Text and primary actions */}
              <div className="max-w-2xl">
                <div className="mb-6 flex items-center gap-3">
                  <span className="h-[2px] w-10 bg-cyan-400" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300 sm:text-xs sm:tracking-[0.25em]">
                    {currentSlide.eyebrow}
                  </p>
                </div>

                <h1 className="min-h-[2.4em] text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl md:text-6xl xl:text-7xl">
                  <Typewriter
                    key={currentSlide.id}
                    words={[currentSlide.text]}
                    loop={1}
                    cursor
                    cursorStyle="|"
                    typeSpeed={40}
                    deleteSpeed={20}
                    delaySpeed={700}
                  />
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">
                  {currentSlide.description}
                </p>

                {index === 0 && (
                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => setIndex(1)}
                      className="inline-flex items-center gap-3 rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-extrabold text-[#000271] shadow-lg shadow-cyan-500/20 transition hover:-translate-y-1 hover:bg-white sm:px-7"
                    >
                      Discover Our Ecosystem
                      <span aria-hidden="true">↗</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIndex(1)}
                      className="rounded-full border border-white/35 px-6 py-3.5 text-sm font-bold text-white transition hover:border-cyan-300 hover:bg-white/10"
                    >
                      Explore Our Platforms
                    </button>
                  </div>
                )}

                {index !== 0 && (
                  <div className="mt-7 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/60">
                    <span className="h-px w-8 bg-cyan-400" />
                    {currentSlide.label}
                  </div>
                )}
              </div>

              {/* Ecosystem cards appear on slides 2 and 3 */}
              {currentSlide.ecosystem.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {currentSlide.ecosystem.map((item, cardIndex) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 28 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.2 + cardIndex * 0.12,
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={(event) => {
                          if (!item.available) event.preventDefault();
                        }}
                        aria-disabled={!item.available}
                        className={`group relative flex min-h-[160px] flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-[#000b42]/55 p-5 backdrop-blur-xl transition duration-300 sm:p-6 ${
                          item.available
                            ? "hover:-translate-y-1 hover:border-cyan-300/60 hover:bg-[#000b42]/75"
                            : "cursor-default"
                        }`}
                      >
                        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-cyan-300/10 transition group-hover:scale-125" />

                        <div className="relative flex items-start justify-between gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-xl text-cyan-300">
                            {item.icon}
                          </div>

                          <span
                            className={`rounded-full px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider ${
                              item.available
                                ? "bg-cyan-400 text-[#000271]"
                                : "border border-white/20 bg-white/5 text-white/70"
                            }`}
                          >
                            {item.available ? "Explore" : "Coming Soon"}
                          </span>
                        </div>

                        <div className="relative mt-5">
                          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-cyan-300/90">
                            {item.subtitle}
                          </p>
                          <h2 className="mt-2 text-lg font-extrabold text-white sm:text-xl">
                            {item.name}
                          </h2>
                          <p className="mt-2 text-xs leading-6 text-slate-300 sm:text-sm">
                            {item.description}
                          </p>
                        </div>

                        {item.available && (
                          <span className="absolute bottom-5 right-5 text-lg text-cyan-300 transition group-hover:translate-x-1">
                            ↗
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom slide controls */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-8 lg:px-12">
          <div className="flex items-center gap-4">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-pressed={index === slideIndex}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === slideIndex
                    ? "w-12 bg-cyan-400"
                    : "w-6 bg-white/35 hover:bg-white/75"
                }`}
              />
            ))}

            <span className="ml-2 text-xs font-semibold tracking-[0.15em] text-white/70">
              0{index + 1}
              <span className="mx-2 text-white/30">/</span>
              0{slides.length}
            </span>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
            Innovation. Creativity. Possibility.
          </p>
        </div>
      </div>
    </main>
  );
}