"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "YOUR BUSINESS. YOUR DIGITAL WORLD.",
    title: "Your brand deserves a beautiful store.",
    description:
      "Create a stunning online storefront, showcase your products, and give your customers a shopping experience worth coming back for.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2200&q=90",
    imageAlt: "Beautiful contemporary fashion retail store",
  },
  {
    eyebrow: "SELL YOUR STYLE",
    title: "Make every product impossible to ignore.",
    description:
      "Bring your catalogue to life with beautiful product displays and a storefront designed around your business.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2200&q=90",
    imageAlt: "Premium fashion collection displayed in a boutique",
  },
  {
    eyebrow: "BUILT FOR AMBITIOUS BUSINESSES",
    title: "Turn your vision into an online destination.",
    description:
      "Build your digital presence, organise your products, and create a home for your brand on the internet.",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2200&q=90",
    imageAlt: "Shopping bags and products ready for online retail",
  },
];

const features = [
  {
    number: "01",
    icon: "✳",
    title: "Your Brand, Your Identity",
    description:
      "Create a storefront that reflects your business with your own name, visual identity, and product presentation.",
  },
  {
    number: "02",
    icon: "▦",
    title: "A Beautiful Product Catalogue",
    description:
      "Showcase your products with images, pricing, descriptions, and an organised shopping experience.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Designed to Grow With You",
    description:
      "Build the foundation for a digital business that can expand as your products, customers, and ambitions grow.",
  },
];

export default function StoreFrontPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const currentSlide = slides[activeSlide];

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900 mt-26">
      {/* Announcement bar */}
      <div className="bg-[#000271] px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white sm:text-sm">
        A better way to bring your business online.
        <span className="ml-2 text-cyan-300">Discover Olatinn Store Front ↗</span>
      </div>

      {/* Main navigation */}
      <header className="relative z-20 border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-12 mt-6">
          <Link
            href="/store-front"
            className="shrink-0 text-xl font-extrabold tracking-tight sm:text-2xl"
          >
            <span className="text-[#000271]">OLATINN</span>
            <span className="text-[#17acdd]">.</span>
          </Link>

          {/* Responsive Navigation */}
<nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
  <a
    href="#features"
    className="transition hover:text-[#17acdd]"
  >
    Features
  </a>

  <a
    href="#experience"
    className="transition hover:text-[#17acdd]"
  >
    The Experience
  </a>

  <a
    href="#how-it-works"
    className="transition hover:text-[#17acdd]"
  >
    How It Works
  </a>
</nav>

{/* Mobile Menu Toggle */}
<button
  type="button"
  onClick={() => setMenuOpen((open) => !open)}
  aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
  aria-expanded={menuOpen}
  aria-controls="mobile-navigation"
  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#000271] transition hover:border-[#17acdd] hover:bg-cyan-50 lg:hidden"
>
  <span className="relative flex h-5 w-6 flex-col items-center justify-center">
    <span
      className={`absolute h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
        menuOpen ? "rotate-45" : "-translate-y-2"
      }`}
    />

    <span
      className={`absolute h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
        menuOpen ? "scale-x-0 opacity-0" : "opacity-100"
      }`}
    />

    <span
      className={`absolute h-0.5 w-6 rounded-full bg-current transition-all duration-300 ${
        menuOpen ? "-rotate-45" : "translate-y-2"
      }`}
    />
  </span>
</button>

{/* Mobile Dropdown */}
<div
  id="mobile-navigation"
  className={`absolute left-0 right-0 top-full z-50 border-b border-slate-200 bg-white shadow-xl transition-all duration-300 lg:hidden ${
    menuOpen
      ? "visible translate-y-0 opacity-100"
      : "invisible -translate-y-2 pointer-events-none opacity-0"
  }`}
  aria-hidden={!menuOpen}
>
  <nav className="mx-auto flex max-w-[1440px] flex-col px-5 py-4 sm:px-8">
    <a
      href="#features"
      onClick={() => setMenuOpen(false)}
      tabIndex={menuOpen ? 0 : -1}
      className="border-b border-slate-100 px-3 py-4 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-[#17acdd]"
    >
      Features
    </a>

    <a
      href="#experience"
      onClick={() => setMenuOpen(false)}
      tabIndex={menuOpen ? 0 : -1}
      className="border-b border-slate-100 px-3 py-4 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-[#17acdd]"
    >
      The Experience
    </a>

    <a
      href="#how-it-works"
      onClick={() => setMenuOpen(false)}
      tabIndex={menuOpen ? 0 : -1}
      className="px-3 py-4 text-sm font-semibold text-slate-700 transition hover:bg-cyan-50 hover:text-[#17acdd]"
    >
      How It Works
    </a>

    <Link
      href="/signin"
      onClick={() => setMenuOpen(false)}
      tabIndex={menuOpen ? 0 : -1}
      className="mt-4 flex items-center justify-center rounded-xl bg-[#000271] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#17acdd]"
    >
      Build Your Store
      <span className="ml-2">↗</span>
    </Link>
  </nav>
</div>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="hidden px-3 py-2 text-sm font-semibold text-[#000271] transition hover:text-[#17acdd] sm:inline-flex"
            >
              Sign In
            </Link>

            <Link
              href="/signin"
              className="rounded-full bg-[#000271] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#17acdd] sm:px-6"
            >
              Build Your Store
              <span className="ml-2">↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero carousel */}
      <section className="relative isolate min-h-[650px] overflow-hidden bg-[#071127] sm:min-h-[720px] lg:min-h-[760px]">
        {/* Background slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index !== activeSlide}
          >
            <img
              src={slide.image}
              alt={slide.imageAlt}
              className="h-full w-full object-cover"
            />
          </div>
        ))}

        {/* Image overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03091d]/95 via-[#03091d]/75 to-[#03091d]/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#03091d]/65 via-transparent to-[#03091d]/10" />

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-[650px] max-w-[1440px] flex-col justify-center px-6 py-20 sm:min-h-[720px] sm:px-10 lg:min-h-[760px] lg:px-16">
          <div className="max-w-3xl">
            <div className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-cyan-300" />
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200 sm:text-sm">
                {currentSlide.eyebrow}
              </p>
            </div>

            <h1
              key={`heading-${activeSlide}`}
              className="max-w-3xl text-5xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl"
            >
              {activeSlide === 0 ? (
                <>
                  Your brand deserves a{" "}
                  <span className="text-cyan-300">beautiful store.</span>
                </>
              ) : activeSlide === 1 ? (
                <>
                  Make every product{" "}
                  <span className="text-cyan-300">impossible to ignore.</span>
                </>
              ) : (
                <>
                  Turn your vision into an{" "}
                  <span className="text-cyan-300">online destination.</span>
                </>
              )}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              {currentSlide.description}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/signin"
                className="group inline-flex items-center rounded-full bg-[#17acdd] px-7 py-4 font-bold text-white shadow-xl shadow-cyan-950/20 transition hover:bg-white hover:text-[#000271]"
              >
                Create Your Store
                <span className="ml-3 text-xl transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <a
                href="/store-front/shop"
                className="inline-flex items-center rounded-full border border-white/40 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-[#000271]"
              >
                Explore the Experience
              </a>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
              <span className="flex items-center gap-2">
                <span className="text-cyan-300">✓</span>
                Your own brand identity
              </span>
              <span className="flex items-center gap-2">
                <span className="text-cyan-300">✓</span>
                Beautiful product displays
              </span>
              <span className="flex items-center gap-2">
                <span className="text-cyan-300">✓</span>
                Mobile-friendly design
              </span>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="mt-14 flex items-center gap-5 sm:absolute sm:bottom-12 sm:right-12 sm:mt-0 lg:right-16">
            <div className="flex items-center gap-3">
              {slides.map((slide, index) => (
                <button
                  key={slide.image}
                  type="button"
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-pressed={index === activeSlide}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeSlide
                      ? "w-12 bg-cyan-300"
                      : "w-6 bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>

            <span className="text-sm font-medium tracking-widest text-white">
              0{activeSlide + 1}
              <span className="mx-2 text-white/40">/</span>
              0{slides.length}
            </span>

            <button
              type="button"
              onClick={() =>
                setActiveSlide((current) => (current + 1) % slides.length)
              }
              aria-label="Next slide"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-xl text-white transition hover:bg-white hover:text-[#000271]"
            >
              →
            </button>
          </div>
        </div>

        {/* Floating store card */}
        <div className="absolute bottom-28 right-10 z-10 hidden w-64 rounded-2xl border border-white/30 bg-white/95 p-4 shadow-2xl backdrop-blur-lg xl:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-xl text-[#000271]">
              ✳
            </div>
            <div>
              <p className="text-sm font-bold text-[#000271]">
                Your Storefront
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Your brand, beautifully presented
              </p>
            </div>
          </div>

          <div className="mt-4 h-px bg-slate-200" />

          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Built around your brand</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                Made for your business
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#000271] text-white">
              ↗
            </span>
          </div>
        </div>
      </section>

      {/* Intro strip */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-[1440px] gap-8 px-6 py-10 sm:px-10 md:grid-cols-3 lg:px-16">
          <div>
            <p className="text-sm font-semibold text-[#17acdd]">
              A NEW WAY TO SELL
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#000271]">
              More than a product page.
            </h2>
          </div>

          <p className="text-sm leading-7 text-slate-600">
            Your online store is where your products, brand identity, and
            customer experience come together.
          </p>

          <p className="text-sm leading-7 text-slate-600">
            Olatinn Store Front is being designed to help businesses build that
            presence through one connected platform.
          </p>
        </div>
      </section>

      {/* Experience section */}
      <section
        id="experience"
        className="overflow-hidden bg-[#f6f9fc] py-20 sm:py-28"
      >
        <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-6 sm:px-10 lg:grid-cols-2 lg:px-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#17acdd]">
              A Store That Feels Like You
            </p>

            <h2 className="mt-5 max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-[#000271] sm:text-5xl">
              Your products deserve the spotlight.
            </h2>

            <p className="mt-6 max-w-xl leading-8 text-slate-600">
              Give your customers a polished place to discover what you sell.
              From fashion and accessories to electronics, beauty, and everyday
              essentials, your storefront should make your products shine.
            </p>

            <div className="mt-8 space-y-5">
              {[
                {
                  title: "A consistent brand experience",
                  description:
                    "Bring your business identity into your digital storefront.",
                },
                {
                  title: "Clear product presentation",
                  description:
                    "Help customers explore your catalogue with less friction.",
                },
                {
                  title: "A responsive shopping experience",
                  description:
                    "Design for customers browsing on phones, tablets, and desktops.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-[#000271]">
                    ✓
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/signin"
              className="mt-9 inline-flex items-center rounded-full bg-[#000271] px-7 py-4 font-semibold text-white transition hover:bg-[#17acdd]"
            >
              Start Building
              <span className="ml-3">→</span>
            </Link>
          </div>

          {/* Large visual storefront preview */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -right-8 -top-8 h-48 w-48 rounded-full bg-cyan-200/50 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-48 w-48 rounded-full bg-indigo-200/50 blur-3xl" />

            <div className="relative rounded-[28px] border border-white bg-white p-4 shadow-2xl shadow-slate-300/50 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#17acdd]">
                    Store preview
                  </p>
                  <h3 className="mt-1 text-xl font-extrabold text-[#000271]">
                    THE EVERYDAY EDIT
                  </h3>
                </div>

                <span className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-bold text-[#000271]">
                  ONLINE
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="group overflow-hidden rounded-2xl bg-slate-100">
                  <div className="h-44 overflow-hidden sm:h-56">
                    <img
                      src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85"
                      alt="Red sneaker product display"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-sm font-bold text-slate-900">
                      Signature Sneakers
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Product preview
                    </p>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-2xl bg-slate-100">
                  <div className="h-44 overflow-hidden sm:h-56">
                    <img
                      src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85"
                      alt="Designer handbag product display"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <p className="text-sm font-bold text-slate-900">
                      Everyday Bag
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Product preview
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#000271] p-4 text-white sm:p-5">
                <div>
                  <p className="text-xs text-cyan-200">YOUR BUSINESS</p>
                  <p className="mt-1 font-bold">Your own digital destination.</p>
                </div>
                <span className="text-2xl text-cyan-300">↗</span>
              </div>
            </div>

            <div className="absolute -left-5 top-1/2 hidden -translate-y-1/2 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:block">
              <p className="text-xs text-slate-500">Your next chapter</p>
              <p className="mt-1 font-bold text-[#000271]">
                Starts online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#17acdd]">
                Everything Starts Here
              </p>
              <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-[#000271] sm:text-5xl">
                Built for your next big move.
              </h2>
            </div>

            <p className="max-w-md leading-7 text-slate-600">
              The essentials for creating a compelling online presence, with
              room to grow as your business evolves.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-3xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-2 hover:border-cyan-200 hover:shadow-xl hover:shadow-slate-200/60 sm:p-9"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#000271] text-2xl text-cyan-300 transition group-hover:bg-[#17acdd] group-hover:text-white">
                    {feature.icon}
                  </span>
                  <span className="text-sm font-bold tracking-widest text-slate-300">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-8 text-xl font-bold text-[#000271]">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
                  {feature.description}
                </p>

                <div className="mt-7 h-1 w-12 rounded-full bg-[#17acdd] transition-all group-hover:w-20" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-[#f6f9fc] py-20 sm:py-28"
      >
        <div className="mx-auto max-w-[1440px] px-6 sm:px-10 lg:px-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#17acdd]">
              Your Journey
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#000271] sm:text-5xl">
              From idea to online.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              A simple vision: make building your business storefront feel
              approachable, organised, and professional.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Create your store",
                description:
                  "Begin with your business details and establish your store identity.",
              },
              {
                number: "02",
                title: "Bring in your products",
                description:
                  "Organise your catalogue with product images, prices, and descriptions.",
              },
              {
                number: "03",
                title: "Prepare to showcase",
                description:
                  "Review your storefront and prepare the customer-facing experience.",
              },
            ].map((step) => (
              <div key={step.number} className="relative">
                <p className="text-5xl font-extrabold tracking-tight text-cyan-200">
                  {step.number}
                </p>
                <h3 className="mt-5 text-xl font-bold text-[#000271]">
                  {step.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 py-16 sm:px-10 sm:py-24">
        <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[32px] bg-[#000271] px-7 py-14 text-center sm:px-14 sm:py-20">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
              Your Business, Beautifully Online
            </p>

            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              Give your business a place to shine.
            </h2>

            <p className="mx-auto mt-6 max-w-2xl leading-8 text-blue-100">
              Your products have a story. Your business has a vision. Build the
              storefront that brings them together with Olatinn.
            </p>

            <Link
              href="/signin"
              className="mt-9 inline-flex items-center rounded-full bg-white px-8 py-4 font-bold text-[#000271] transition hover:bg-cyan-100"
            >
              Build Your Store
              <span className="ml-3 text-xl">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-6 py-8 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
          <Link
            href="/store-front"
            className="text-xl font-extrabold tracking-tight text-[#000271]"
          >
            OLATINN<span className="text-[#17acdd]">.</span>
          </Link>

          <p className="text-sm text-slate-500">
            Store Front · Powered by Olatinn
          </p>

          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Olatinn. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}