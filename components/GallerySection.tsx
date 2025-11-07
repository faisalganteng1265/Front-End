'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';

// Memoize the image card component to prevent unnecessary re-renders
const ImageCard = memo(({ image, index, isVisible, onClick }: {
  image: any;
  index: number;
  isVisible: boolean;
  onClick?: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${onClick ? 'cursor-pointer' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{ y: -4 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        boxShadow: isHovered ? "0 20px 25px -5px rgba(16, 185, 129, 0.2)" : "none"
      }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <motion.img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover"
          loading="lazy"
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Dark overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-black/70 z-10 pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Text overlay on hover */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 pointer-events-none"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
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
        </motion.div>
      </div>

      {/* Border effect */}
      <motion.div
        className="absolute inset-0 border-2 rounded-2xl pointer-events-none"
        animate={{ borderColor: isHovered ? "rgba(16, 185, 129, 0.4)" : "rgba(16, 185, 129, 0)" }}
        transition={{ duration: 0.3 }}
      />
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
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              index={index}
              isVisible={isVisible}
              onClick={() => handleCardClick(index)}
            />
          ))}
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
