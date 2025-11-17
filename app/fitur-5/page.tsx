'use client';

import { useState } from 'react';
import SmartTaskManager from '@/components/SmartTaskManager';
import StaggeredMenu from '@/components/StaggeredMenu';
import Particles from '@/components/Particles';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Fitur5Page() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      <Particles />

      {/* Language Toggle Buttons */}
      <div className="fixed top-4 sm:top-6 md:top-8 right-4 sm:right-8 md:right-80 z-[9999] flex gap-2">
        <button
          onClick={() => setLanguage('id')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
            language === 'id'
              ? 'bg-white text-black shadow-lg'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
            language === 'en'
              ? 'bg-white text-black shadow-lg'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          EN
        </button>
      </div>

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1' },
          { label: 'Event Recomend', ariaLabel: 'Go to feature 2', link: '/fitur-2' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4' },
          { label: 'Smart Task Manager', ariaLabel: 'Go to feature 5', link: '/fitur-5', color: '#06b6d4' },
          { label: 'Project Colabollator', ariaLabel: 'Go to feature 6', link: '/fitur-6' }
        ]}
       displaySocials={false}
          displayItemNumbering={true}
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          accentColor="#ffffff"
          changeMenuColorOnOpen={true}
          isFixed={true}
          logoUrl=""
      />

      <SmartTaskManager />
    </div>
  );
}
