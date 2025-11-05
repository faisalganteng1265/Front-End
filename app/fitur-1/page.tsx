'use client';

import ChatInterface from '@/components/ChatInterface';
import StaggeredMenu from '@/components/StaggeredMenu';
import PixelBlast from '@/components/PixelBlast';

export default function Fitur1() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* PixelBlast Background */}
      <div className="fixed inset-0 z-0">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#22c55e"
          patternScale={2}
          patternDensity={0.8}
          enableRipples={true}
          rippleIntensityScale={2}
          rippleSpeed={0.4}
          speed={0.3}
          transparent={false}
          edgeFade={0.3}
        />
      </div>

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'Event Recomend', ariaLabel: 'Go to feature 2', link: '/fitur-2' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' }
        ]}
        displaySocials={false}
        displayItemNumbering={true}
        logoUrl="/logo.png"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#ffffff"
        changeMenuColorOnOpen={true}
        isFixed={true}
      />

      {/* Full Screen Chat Interface with Header */}
      <div className="relative h-screen flex flex-col">
        {/* Header Section */}
        <div className="py-6 px-3 relative z-10 flex-shrink-0">
          <div className="max-w-full mx-auto">
            <div className="text-center mb-4">
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 blur-2xl bg-green-500/60 rounded-full"></div>
                  <div className="relative bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20">
                    <span className="text-5xl">💬</span>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.5), 0 0 60px rgba(34, 197, 94, 0.3)' }}>
                AI CAMPUS CHATBOT
              </h1>
              <p className="text-gray-300 text-sm" style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.8)' }}>
                Asisten virtual cerdas untuk membantu menjawab semua pertanyaan seputar kampus
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface - Takes remaining height */}
        <div className="flex-1 px-4 pb-4">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
