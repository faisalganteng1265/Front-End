'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllProjects } from '@/lib/supabase/projects';
import type { Project } from '@/types/projects';
import ProjectList from '@/components/fitur-6/ProjectList';
import CreateProjectModal from '@/components/fitur-6/CreateProjectModal';
import MyProjectsTab from '@/components/fitur-6/MyProjectsTab';
import MyApplicationsTab from '@/components/fitur-6/MyApplicationsTab';
import { Plus, Briefcase, Users, FileText } from 'lucide-react';
import StaggeredMenu from '@/components/StaggeredMenu';
import Image from 'next/image';
import ProfileModal from '@/components/ProfileModal';
import UserProfile from '@/components/UserProfile';
import { supabase } from '@/lib/supabase';
import ParticleBackground from '@/components/ParticleBackground';

type TabType = 'all' | 'my-projects' | 'my-applications';

export default function ProjectCollaborationPage() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Project['status'] | 'all'>('all');

  useEffect(() => {
    loadProjects();
  }, [filterStatus]);


  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects(filterStatus === 'all' ? undefined : filterStatus);
      setProjects(data);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      console.error('Error details:', error?.message, error?.details, error?.hint);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    loadProjects();
    setIsCreateModalOpen(false);
  };


  const pageContent = (
    <div className="min-h-screen bg-0">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Logo - Top Left */}
      <div className="fixed top-3 sm:top-4 left-3 sm:left-4 z-[1005]">
        <a
          href="/"
          aria-label="Go to home page"
          className="block transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <Image
            src="/AICAMPUS.png"
            alt="AI Campus Logo"
            width={50}
            height={40}
            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300"
          />
        </a>
      </div>

      {/* Language Toggle Buttons */}
      <div className="fixed top-4 sm:top-6 md:top-8 right-4 sm:right-8 md:right-80 z-[9999] flex gap-2">
        <button
          onClick={() => setLanguage('id')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            language === 'id'
              ? 'bg-white text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
            language === 'en'
              ? 'bg-white text-black'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          EN
        </button>
      </div>

      {/* Top Left Navigation */}
      <div className="fixed top-14 sm:top-16 md:top-4 left-3 sm:left-4 md:left-40 z-[1005] md:pt-1 flex flex-col md:flex-row items-start md:items-center gap-2 sm:gap-3 md:gap-4">
        {user && (
          <>
            <UserProfile position="inline" />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-lg text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105 flex items-center gap-1.5 sm:gap-2 shadow-lg cursor-pointer"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('projects.buttons.createProject')}</span>
              <span className="sm:hidden">Create</span>
            </button>
          </>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 sm:pt-28 md:pt-8 bg-0">

        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4"style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.99)' }}>
              {t('projects.title')}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              {t('projects.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs sm:text-sm">{t('projects.stats.totalProjects')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{projects.length}</p>
              </div>
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs sm:text-sm">{t('projects.stats.openProjects')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {projects.filter(p => p.status === 'open').length}
                </p>
              </div>
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-green-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs sm:text-sm">{t('projects.stats.activeCollaborators')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {projects.reduce((acc, p) => acc + (p.members?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {t('projects.tabs.all')}
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('my-projects')}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-projects'
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t('projects.tabs.myProjects')}
              </button>
              <button
                onClick={() => setActiveTab('my-applications')}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg border-2px text-sm sm:text-base font-semibold transition-all cursor-pointer ${
                  activeTab === 'my-applications'
                    ? 'bg-white text-black shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {t('projects.tabs.myApplications')}
              </button>
            </>
          )}
        </div>

        {/* Filter by Status */}
        {activeTab === 'all' && (
          <div className="mb-4 sm:mb-6">
            <label className="text-white text-sm sm:text-base font-semibold mb-2 block">{t('projects.filter.status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Project['status'] | 'all')}
              className="bg-white/10 border border-white/20 text-white text-sm sm:text-base rounded-lg px-3 py-2 sm:px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="all" className="bg-gray-900 text-white cursor-pointer">{t('projects.status.all')}</option>
              <option value="open" className="bg-gray-900 text-white cursor-pointer">{t('projects.status.open')}</option>
              <option value="in_progress" className="bg-gray-900 text-white cursor-pointer">{t('projects.status.inProgress')}</option>
              <option value="completed" className="bg-gray-900 text-white cursor-pointer">{t('projects.status.completed')}</option>
              <option value="cancelled" className="bg-gray-900 text-white cursor-pointer">{t('projects.status.cancelled')}</option>
            </select>
          </div>
        )}

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
            { label: 'Smart Task Manager', ariaLabel: 'Go to feature 5', link: '/fitur-5' },
            { label: 'Project Colabollator', ariaLabel: 'Go to feature 6', link: '/fitur-6', color: '#22c55e' },
          ]}
          displaySocials={false}
          displayItemNumbering={true}
          logoUrl="/AICAMPUS.png"
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          accentColor="#ffffff"
          changeMenuColorOnOpen={true}
          isFixed={true}
        />  

        {/* Content based on active tab */}
        <div className="mt-8">
          {activeTab === 'all' && (
            <ProjectList
              projects={projects}
              loading={loading}
              onRefresh={loadProjects}
            />
          )}
          {activeTab === 'my-projects' && user && (
            <MyProjectsTab userId={user.id} onRefresh={loadProjects} />
          )}
          {activeTab === 'my-applications' && user && (
            <MyApplicationsTab userId={user.id} />
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {user && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleProjectCreated}
          userId={user.id}
        />
      )}

    </div>
  );

  // Add CSS for fade-in animation
  return (
    <>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      {pageContent}
    </>
  );
}
