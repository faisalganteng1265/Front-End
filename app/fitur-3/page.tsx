'use client';

import SmartScheduleBuilder from '@/components/SmartScheduleBuilder';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Fitur3() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      {/* Language Toggle Buttons */}
      <div className="fixed top-4 sm:top-6 md:top-8 right-4 sm:right-8 md:right-80 z-[9999] flex gap-2">
        <button
          onClick={() => setLanguage('id')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            language === 'id'
              ? 'bg-white text-gray-800 shadow-lg'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            language === 'en'
              ? 'bg-white text-gray-800 shadow-lg'
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
        >
          EN
        </button>
      </div>

      <SmartScheduleBuilder />
    </div>
  );
}
