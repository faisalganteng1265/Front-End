'use client';

import { useEffect } from 'react';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import GallerySection from '@/components/landing/GallerySection';
import WhyBetterSection from '@/components/landing/WhyBetterSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';
import Chatbot from '@/components/landing/Chatbot';

export default function Home() {
  useEffect(() => {
    // Ensure page starts at top on initial load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <GallerySection />
      <HowItWorksSection />
      <FAQSection />
      <Footer />
      <Chatbot />
    </div>
  );
}
