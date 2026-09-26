"use client";

import { useEffect, useState } from "react";

const POINTS = ["Razorpay-secured checkout", "UPI, cards and wallets", "Ranks set on the server"];

function randomBeam() {
  return {
    angle: Math.floor(Math.random() * 360),
    shift: Math.floor(Math.random() * 40) - 20,
  };
}

export function TrustBand() {
  const [primary, setPrimary] = useState({ angle: 128, shift: -8 });
  const [secondary, setSecondary] = useState({ angle: 42, shift: 12 });

  useEffect(() => {
    const primaryTimer = window.setInterval(() => setPrimary(randomBeam()), 8500);
    const secondaryTimer = window.setInterval(() => setSecondary(randomBeam()), 11000);
    return () => {
      window.clearInterval(primaryTimer);
      window.clearInterval(secondaryTimer);
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-white/8 bg-[#f4f7fb] text-zinc-950">
      <div
        aria-hidden
        className="trust-beam-a pointer-events-none absolute -inset-[35%]"
        style={{
          background: `linear-gradient(${primary.angle}deg, transparent 18%, rgba(255,255,255,0.12) 34%, rgba(255,255,255,0.38) 48%, rgba(186,230,253,0.22) 52%, rgba(255,255,255,0.1) 68%, transparent 84%)`,
          translate: `${primary.shift}% 0`,
        }}
      />
      <div
        aria-hidden
        className="trust-beam-b pointer-events-none absolute -inset-[40%]"
        style={{
          background: `linear-gradient(${secondary.angle}deg, transparent 16%, rgba(255,255,255,0.08) 36%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0.08) 66%, transparent 86%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(186,230,253,0.55),transparent_42%)]" />

      <div
        className="trust-copy relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
        style={{ ["--shine-angle" as string]: `${primary.angle}deg` }}
      >
        <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl sm:leading-tight">
          Creators across India trust TopCreator to get discovered.
        </h2>
        <ul className="mt-6 flex flex-col gap-3 text-sm font-medium sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-2 sm:text-base">
          {POINTS.map((point) => (
            <li key={point} className="inline-flex items-center gap-2">
              <span aria-hidden>+</span>
              {point}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
