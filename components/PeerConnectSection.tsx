'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PeerConnectSection() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('group');
  const [lastClickTime, setLastClickTime] = useState(0);

  // Auto-rotate tabs every 2 seconds, but delay 3 seconds after manual click
  useEffect(() => {
    const tabs = ['group', 'private', 'call'];
    const interval = setInterval(() => {
      const now = Date.now();
      // If less than 3 seconds have passed since last click, don't auto-rotate
      if (now - lastClickTime < 3000) {
        return;
      }
      
      setActiveTab((current) => {
        const currentIndex = tabs.indexOf(current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [lastClickTime]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setLastClickTime(Date.now());
  };

  return (
    <section id="peerconnect" className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              {t('peerconnect.title')}
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            {t('peerconnect.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          <div className="order-2 lg:order-1 lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
              <div className="flex">
                <button
                  onClick={() => handleTabClick('group')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'group'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('peerconnect.groupChat')}
                </button>
                <button
                  onClick={() => handleTabClick('private')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'private'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('peerconnect.privateChat')}
                </button>
                <button
                  onClick={() => handleTabClick('call')}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'call'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t('peerconnect.videoCall')}
                </button>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              {activeTab === 'group' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('peerconnect.groupChat')}</h3>
                  <p className="text-gray-300 mb-4">
                    {t('peerconnect.groupChatDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.groupFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.groupFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.groupFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'private' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('peerconnect.privateChat')}</h3>
                  <p className="text-gray-300 mb-4">
                    {t('peerconnect.privateChatDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'call' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('peerconnect.videoCall')}</h3>
                  <p className="text-gray-300 mb-4">
                    {t('peerconnect.videoCallDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-2xl opacity-20"></div>
              <div className="relative bg-gray-800/50 rounded-2xl p-2 border border-gray-700">
                <Image
                  src={
                    activeTab === 'group'
                      ? '/ChatPeerConnect.png'
                      : activeTab === 'private'
                      ? '/PrivatePeerConnect.png'
                      : '/CallPeerConnect.png'
                  }
                  alt="PeerConnect Interface"
                  width={2400}
                  height={1500}
                  className="w-full h-auto rounded-xl transition-opacity duration-300"
                  priority
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => handleTabClick('group')}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    activeTab === 'group'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-10'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label="Group Chat"
                />
                <button
                  onClick={() => handleTabClick('private')}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    activeTab === 'private'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-10'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label="Private Chat"
                />
                <button
                  onClick={() => handleTabClick('call')}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                    activeTab === 'call'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-10'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label="Video Call"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}