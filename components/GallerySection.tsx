'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Memoize the image card component to prevent unnecessary re-renders
const ImageCard = memo(({ image, index, isVisible, onClick }: {
  image: any;
  index: number;
  isVisible: boolean;
  onClick?: () => void;
}) => {
  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl ${onClick ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          priority={index < 2}
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/70 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Text overlay on hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3
            className="text-xl font-bold text-white mb-2 text-center"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            {image.title}
          </h3>
          <p
            className="text-sm text-white/90 text-center leading-relaxed"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            {image.description}
          </p>
        </div>
      </div>

      {/* Border effect */}
      <div className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none group-hover:border-emerald-400/40 transition-colors duration-300" />

      {/* Shadow on hover */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.2)" }} />
    </motion.div>
  );
});

ImageCard.displayName = 'ImageCard';

// Simplified particles component with fewer animations
const FloatingParticles = memo(() => {
  // Reduced from 12 to 6 particles
  const particles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 20 + (i * 15),
      top: 20 + (i * 12),
      size: 2 + (i % 2),
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-emerald-400/10"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
});

FloatingParticles.displayName = 'FloatingParticles';

export default function GallerySection() {
  const router = useRouter();
  
  const images = useMemo(() => [
    {
      src: '/FOTO2.jpg',
      alt: 'AI Campus Guide',
      title: 'AI Campus Guide',
      description: 'Hampir semua mahasiswa menggunakan AI untuk navigasi kampus yang lebih mudah'
    },
    {
      src: '/FOTO3.jpg',
      alt: 'Event Recommender',
      title: 'Event Recommender',
      description: 'Rekomendasi event yang sesuai dengan minat dan kebutuhan kamu'
    },
    {
      src: '/FOTO4.jpg',
      alt: 'Peer Connect',
      title: 'Peer Connect AI',
      description: 'Menghubungkan kamu dengan orang yang memiliki minat yang sama'
    },
    {
      src: '/FOTO5.png',
      alt: 'Smart Schedule',
      title: 'Smart Schedule Builder',
      description: 'Atur jadwal sesuai keinginan kamu agar lebih efisien dan terorganisir'
    },
  ], []);

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (index: number) => {
    switch (index) {
      case 0:
        router.push('/fitur-1');
        break;
      case 1:
        router.push('/fitur-2');
        break;
      case 2:
        router.push('/fitur-4');
        break;
      case 3:
        router.push('/fitur-3');
        break;
      default:
        break;
    }
  };

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #0d3d2f, #0a0a0a)' }}>
      {/* Reduced background effects - only 2 simple blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-900 opacity-8 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-900 opacity-10 rounded-full filter blur-3xl"></div>

      {/* Simplified particles - no animation */}
      <FloatingParticles />

      {/* Minimal decorative elements - removed animations */}
      <div className="absolute top-20 left-10 w-16 h-16 border-2 border-emerald-500/10 rotate-45"></div>
      <div className="absolute bottom-20 right-16 w-12 h-12 border-2 border-teal-500/10 rounded-full"></div>

      {/* Simple corner decorations only */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-emerald-500/15"></div>
      <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-emerald-500/15"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-emerald-500/15"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-emerald-500/15"></div>

      <div className="max-w-7xl mx-auto relative z-10" ref={sectionRef}>
        {/* Gallery Grid - Custom Layout: 2 center (top-bottom), 2 sides (left-right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Box */}
          <div className="lg:row-span-2 lg:self-center">
            <ImageCard
              key={0}
              image={images[0]}
              index={0}
              isVisible={isVisible}
              onClick={() => handleCardClick(0)}
            />
          </div>

          {/* Center Column - 2 boxes stacked */}
          <div className="flex flex-col gap-6 lg:gap-8">
            <ImageCard
              key={1}
              image={images[1]}
              index={1}
              isVisible={isVisible}
              onClick={() => handleCardClick(1)}
            />
            <ImageCard
              key={2}
              image={images[2]}
              index={2}
              isVisible={isVisible}
              onClick={() => handleCardClick(2)}
            />
          </div>

          {/* Right Box */}
          <div className="lg:row-span-2 lg:self-center">
            <ImageCard
              key={3}
              image={images[3]}
              index={3}
              isVisible={isVisible}
              onClick={() => handleCardClick(3)}
            />
          </div>
        </div>

        {/* Hover Me text below photos */}
        <motion.div
          className="text-center mt-8"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <p
            className="text-sm text-emerald-400/60"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            Hover Me
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        /* Removed most animations to improve performance */
      `}</style>
    </section>
  );
}
