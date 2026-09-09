"use client";

import React, { useEffect, useState } from "react";

type Slide = {
  title: string;
  description: string;
  image: string;
};

const SLIDES: Slide[] = [
  {
    title: "Run your entire marketplace from one dashboard",
    description:
      "Manage sellers, couriers, products and orders across your whole network without switching tools.",
    image:
      "https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Real-time insights into orders & payouts",
    description:
      "Track commissions, transactions and payouts as they happen, with clear reporting at every level.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
  },
  {
    title: "Keep every seller & courier in sync",
    description:
      "Onboard partners, resolve enquiries and push updates instantly across the whole platform.",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1600&auto=format&fit=crop",
  },
];

export default function AuthSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative hidden h-full w-full overflow-hidden lg:block">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.title}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{ opacity: index === active ? 1 : 0 }}
          aria-hidden={index !== active}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.75) 100%)",
            }}
          />
          <div className="relative flex h-full flex-col justify-end p-12 text-white">
            <h2 className="max-w-md text-3xl font-bold leading-tight">{slide.title}</h2>
            <p className="mt-4 max-w-md text-sm text-white/80">{slide.description}</p>
          </div>
        </div>
      ))}

      <div className="absolute bottom-8 left-12 z-10 flex gap-2">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setActive(index)}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: index === active ? 28 : 12,
              background: index === active ? "#ffffff" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
