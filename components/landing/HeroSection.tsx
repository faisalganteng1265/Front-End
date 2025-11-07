'use client';

import Galaxy from './Galaxy';

export default function HeroSection() {

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-gray-900">
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <Galaxy
          hueShift={200}
          density={1.2}
          starSpeed={0.5}
          glowIntensity={0.3}
          twinkleIntensity={0.2}
          rotationSpeed={0.05}
          mouseRepulsion={true}
          repulsionStrength={2}
          transparent={true}
          mouseInteraction={true}
        />
      </div>

      {/* Main Content - AICAMPUS Text */}
      <div className="relative z-10 text-center px-6">
        <h1
          className="text-[15vw] md:text-[12vw] lg:text-[10vw] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 leading-none tracking-tighter animate-pulse"
          style={{ fontFamily: 'Agency FB, sans-serif' }}
        >
          AICAMPUS
        </h1>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-emerald-500 to-teal-500 -z-10 animate-pulse"></div>
      </div>

      {/* Scroll Down Arrow */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <svg
          className="w-6 h-6 text-emerald-400/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
