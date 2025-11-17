'use client';

import type { Project } from '@/types/projects';
import { Calendar, Users, Briefcase, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

const statusColors = {
  open: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { t } = useLanguage();

  const statusLabels = {
    open: t('projects.status.open'),
    in_progress: t('projects.status.inProgress'),
    completed: t('projects.status.completed'),
    cancelled: t('projects.status.cancelled'),
  };
  const totalRolesNeeded = project.roles?.reduce((acc, role) => acc + role.required_count, 0) || 0;
  const totalRolesFilled = project.roles?.reduce((acc, role) => acc + role.filled_count, 0) || 0;

  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-red-400';
    if (value < 70) return 'bg-yellow-400';
    return 'bg-green-400';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all cursor-pointer group hover:scale-105 hover:shadow-2xl flex flex-col h-full"
    >
      {/* Header - Fixed height */}
      <div className="flex justify-between items-start mb-4 min-h-[3.5rem]">
        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2 flex-1 mr-2 overflow-hidden">
          {project.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[project.status]} shrink-0 h-fit`}>
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Description - Fixed height with 3 lines max */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3 h-[4.5rem] overflow-hidden">
        {project.description}
      </p>

      {/* Stats - Fixed height */}
      <div className="space-y-2 mb-4 min-h-[5.5rem]">
        <div className="flex items-center text-gray-300 text-sm">
          <Users className="w-4 h-4 mr-2 text-blue-400 shrink-0" />
          <span className="truncate">
            {totalRolesFilled}/{totalRolesNeeded} {t('projects.card.members')}
          </span>
        </div>
        <div className="flex items-center text-gray-300 text-sm">
          <Briefcase className="w-4 h-4 mr-2 text-purple-400 shrink-0" />
          <span className="truncate">{project.roles?.length || 0} {t('projects.card.roles')}</span>
        </div>
        {project.deadline && (
          <div className="flex items-center text-gray-300 text-sm">
            <Clock className="w-4 h-4 mr-2 text-orange-400 shrink-0" />
            <span className="truncate">{t('projects.card.deadline')} {new Date(project.deadline).toLocaleDateString('id-ID')}</span>
          </div>
        )}
      </div>

      {/* Roles Preview - Fixed height */}
      <div className="mb-4 min-h-[2rem]">
        {project.roles && project.roles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.roles.slice(0, 3).map((role) => (
              <span
                key={role.id}
                className="px-2 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full border border-blue-400/30 truncate max-w-[8rem]"
                title={role.role_name}
              >
                {role.role_name}
              </span>
            ))}
            {project.roles.length > 3 && (
              <span className="px-2 py-1 bg-gray-500/30 text-gray-300 text-xs rounded-full">
                +{project.roles.length - 3} {t('projects.card.more')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar - Fixed height */}
      <div className="mt-auto">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-semibold text-gray-300">{t('projects.card.progress')}</span>
          <span className="text-xs font-bold text-white">{project.progress || 0}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(project.progress || 0)}`}
            style={{ width: `${project.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Footer - Fixed height */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center text-gray-400 text-xs">
          <Calendar className="w-3 h-3 mr-1 shrink-0" />
          <span className="truncate">{t('projects.card.created')} {new Date(project.created_at).toLocaleDateString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
}
