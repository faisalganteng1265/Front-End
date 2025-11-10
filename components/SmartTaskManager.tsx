'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ====================================
// TypeScript Interfaces
// ====================================

interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  completed: boolean;
  created_at: string;
}

// ====================================
// Main Component
// ====================================

export default function SmartTaskManager() {
  const { user, loading } = useAuth();

  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');

  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
  });

  // Get unique categories from tasks
  const getUniqueCategories = (): string[] => {
    const cats = new Set(tasks.map(t => t.category).filter(c => c));
    return Array.from(cats);
  };

  const getCategoryColor = (index: number): string => {
    const colors = [
      '#FF6F3C', '#06D6A0', '#118AB2', '#FFD60A', '#EF476F',
      '#9C89B8', '#06A77D', '#F77F00', '#4EA8DE', '#C9ADA7'
    ];
    return colors[index % colors.length];
  };

  // ====================================
  // Fetch Tasks from Supabase
  // ====================================

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setIsLoading(false);
    }
  };

  // ====================================
  // Task CRUD Operations
  // ====================================

  const handleAddTask = async () => {
    if (!user || !newTask.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            priority: newTask.priority,
            deadline: newTask.deadline,
            completed: false,
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setTasks(prev => [data[0], ...prev]);
      }

      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        deadline: '',
      });
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Gagal menambahkan tugas. Silakan coba lagi.');
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('Gagal mengubah status tugas. Silakan coba lagi.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Gagal menghapus tugas. Silakan coba lagi.');
    }
  };

  // ====================================
  // Filter Tasks
  // ====================================

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = filterCategory === 'all' || task.category === filterCategory;
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.completed) ||
      (filterStatus === 'pending' && !task.completed);
    return categoryMatch && statusMatch;
  });

  // ====================================
  // Statistics
  // ====================================

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).length,
  };

  // ====================================
  // Render Functions
  // ====================================

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-lime-500';
      default: return 'bg-gray-500';
    }
  };

  const renderTaskList = () => (
    <div className="flex flex-col h-full">
      {/* Filters */}
      <div className="bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-xl p-4 border-b border-cyan-500/30 shadow-xl">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 scale-105'
                  : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border border-slate-600/30'
              }`}
            >
              📚 Semua Matkul
            </button>
            {getUniqueCategories().map((cat, index) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 whitespace-nowrap border ${
                  filterCategory === cat
                    ? 'text-white shadow-lg border-transparent scale-105'
                    : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border-slate-600/30'
                }`}
                style={filterCategory === cat ? {
                  background: `linear-gradient(135deg, ${getCategoryColor(index)}, ${getCategoryColor(index)}dd)`,
                  boxShadow: `0 4px 20px ${getCategoryColor(index)}60`
                } : {}}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg border-transparent scale-105'
                  : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border-slate-600/30'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                filterStatus === 'pending'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg border-transparent scale-105'
                  : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border-slate-600/30'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                filterStatus === 'completed'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg border-transparent scale-105'
                  : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700/50 border-slate-600/30'
              }`}
            >
              Selesai
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-br from-slate-900/40 to-blue-900/40">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center animate-fade-in">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 animate-pulse"></div>
                <svg className="w-full h-full text-cyan-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Tugas</h3>
              <p className="text-cyan-300 mb-6">Klik tombol + untuk menambahkan tugas baru</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, index) => {
              const isOverdue = !task.completed && new Date(task.deadline) < new Date();

              const categoryIndex = getUniqueCategories().indexOf(task.category);

              return (
                <div
                  key={task.id}
                  className="bg-gradient-to-r from-slate-800/60 to-blue-800/60 backdrop-blur-md rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 animate-slide-in group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleComplete(task.id)}
                      className={`flex-shrink-0 w-7 h-7 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
                        task.completed
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500 shadow-lg shadow-emerald-500/50'
                          : 'border-cyan-400 hover:border-cyan-300 bg-slate-900/50'
                      }`}
                    >
                      {task.completed && (
                        <svg className="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3 className={`text-lg font-bold text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                          {task.title}
                        </h3>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors hover:scale-110"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      {task.description && (
                        <p className={`text-slate-200 text-sm mb-4 ${task.completed ? 'line-through opacity-60' : ''}`}>
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        {/* Category Badge */}
                        {task.category && (
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold text-white shadow-lg border border-white/20"
                            style={{ backgroundColor: getCategoryColor(categoryIndex) }}
                          >
                            📖 {task.category}
                          </span>
                        )}

                        {/* Priority Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/20 ${
                          task.priority === 'high'
                            ? 'bg-gradient-to-r from-red-500 to-pink-500'
                            : task.priority === 'medium'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}>
                          {task.priority === 'high' && '🔴'}
                          {task.priority === 'medium' && '🟡'}
                          {task.priority === 'low' && '🟢'}
                          {task.priority.toUpperCase()}
                        </span>

                        {/* Deadline */}
                        {task.deadline && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            isOverdue
                              ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-400/30'
                              : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border-blue-400/30'
                          }`}>
                            📅 {new Date(task.deadline).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Button */}
      <div className="p-4 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-xl border-t border-cyan-500/30 shadow-xl">
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2 group border border-cyan-400/30"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Tugas Baru
        </button>
      </div>
    </div>
  );

  const renderStatistics = () => {
    // Prepare data for pie chart
    const pieChartData = {
      labels: ['Selesai', 'Pending', 'Terlambat'],
      datasets: [
        {
          data: [stats.completed, stats.pending, stats.overdue],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',   // emerald-500
            'rgba(251, 191, 36, 0.8)',   // amber-400
            'rgba(239, 68, 68, 0.8)',    // red-500
          ],
          borderColor: [
            'rgba(16, 185, 129, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };

    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(132, 204, 22, 0.5)',
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? Math.round((context.raw / total) * 100) : 0;
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
          }
        },
      },
    };

    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-cyan-500/30 bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-xl shadow-xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Statistik
          </h2>
        </div>
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4 bg-gradient-to-br from-slate-900/40 to-blue-900/40">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 backdrop-blur-md rounded-2xl p-3 border border-cyan-400/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-cyan-200 text-xs font-semibold">Total</h3>
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/30 to-teal-600/30 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-emerald-200 text-xs font-semibold">Selesai</h3>
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>

            <div className="bg-gradient-to-br from-amber-600/30 to-orange-600/30 backdrop-blur-md rounded-2xl p-3 border border-amber-400/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-amber-200 text-xs font-semibold">Pending</h3>
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>

            <div className="bg-gradient-to-br from-red-600/30 to-pink-600/30 backdrop-blur-md rounded-2xl p-3 border border-red-400/30 hover:scale-[1.02] transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-red-200 text-xs font-semibold">Terlambat</h3>
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{stats.overdue}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-gradient-to-br from-slate-800/60 to-blue-800/60 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30">
            <h3 className="text-white font-bold text-sm mb-3">Distribusi Tugas</h3>
            {stats.total > 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-40 h-40">
                  <Pie data={pieChartData} options={pieChartOptions} />
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center">
                <p className="text-cyan-300 text-sm">Belum ada data untuk ditampilkan</p>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="bg-gradient-to-br from-slate-800/60 to-blue-800/60 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30">
            <h3 className="text-white font-bold text-sm mb-3">Progress Keseluruhan</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-cyan-300">Completion Rate</span>
                  <span className="text-white font-semibold">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-900/60 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-emerald-500/50"
                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-gradient-to-br from-slate-800/60 to-blue-800/60 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30">
            <h3 className="text-white font-bold text-sm mb-3">Tugas per Mata Kuliah</h3>
            {getUniqueCategories().length === 0 ? (
              <div className="text-center py-6">
                <p className="text-cyan-300 text-xs">Belum ada kategori</p>
                <p className="text-slate-400 text-xs mt-1">Tambahkan tugas untuk melihat statistik</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getUniqueCategories().map((cat, index) => {
                  const count = tasks.filter(t => t.category === cat).length;
                  return (
                    <div key={cat} className="group hover:scale-[1.02] transition-all duration-300">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">📖</span>
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-white font-semibold text-xs truncate">{cat}</span>
                          <span className="text-cyan-300 text-xs ml-2">{count}</span>
                        </div>
                      </div>
                      <div className="w-20 bg-slate-900/60 rounded-full h-2 ml-7">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                            backgroundColor: getCategoryColor(index),
                            boxShadow: `0 0 10px ${getCategoryColor(index)}80`
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/95 to-blue-900/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl p-4">
        <h1 className="text-3xl font-bold text-white text-left flex items-center justify-start">
          <Image
            src="/AICAMPUS.png"
            alt="Smart Task Manager"
            width={40}
            height={40}
            className="mr-3"
          />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Smart Task Manager</span>
        </h1>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden bg-gradient-to-br from-slate-950/60 to-blue-950/60">
        {/* Left Side - Task List */}
        <div className="w-[65%] flex flex-col border-r border-cyan-500/20">
          {renderTaskList()}
        </div>

        {/* Right Side - Statistics */}
        <div className="w-[35%] bg-gradient-to-br from-slate-900/40 to-blue-900/40 backdrop-blur-xl border-l border-cyan-500/20 overflow-hidden">
          {renderStatistics()}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-3xl p-8 max-w-2xl w-full border border-cyan-500/30 animate-fade-in shadow-2xl shadow-cyan-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Tambah Tugas Baru</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-cyan-300 hover:text-white transition-colors hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-cyan-200 font-semibold mb-2">Judul Tugas</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Contoh: Mengerjakan PR Matematika"
                  className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 border border-cyan-600/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-cyan-200 font-semibold mb-2">Deskripsi</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detail tugas..."
                  rows={3}
                  className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 border border-cyan-600/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-cyan-200 font-semibold mb-2">Mata Kuliah</label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    placeholder="Contoh: Matematika, Fisika, dll"
                    list="categories-list"
                    className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 border border-cyan-600/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                  <datalist id="categories-list">
                    {getUniqueCategories().map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-cyan-200 font-semibold mb-2">Prioritas</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 border border-cyan-600/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  >
                    <option value="low">🟢 Rendah</option>
                    <option value="medium">🟡 Sedang</option>
                    <option value="high">🔴 Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-cyan-200 font-semibold mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full bg-slate-800/50 text-white rounded-xl px-4 py-3 border border-cyan-600/30 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border border-cyan-400/30"
                >
                  Tambah Tugas
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800/50 text-slate-200 py-3 rounded-xl font-bold hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.02] border border-slate-600/30"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.4);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out forwards;
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
}
