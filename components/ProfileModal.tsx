'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  nama: string;
  universitas: string;
  jurusan: string;
  minat: string;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'profile'>('account');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Account data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Profile data
  const [userData, setUserData] = useState<UserData>({
    nama: '',
    universitas: '',
    jurusan: '',
    minat: '',
  });

  useEffect(() => {
    if (user && isOpen) {
      // Load user data
      setEmail(user.email || '');
      setUsername(user.user_metadata?.username || '');
      loadUserData();
    }
  }, [user, isOpen]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error loading user data:', error);
      }

      if (data) {
        setUserData({
          nama: data.nama || '',
          universitas: data.universitas || '',
          jurusan: data.jurusan || '',
          minat: data.minat || '',
        });
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Update email if changed
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
      }

      // Update username
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { username: username },
      });
      if (metadataError) throw metadataError;

      // Update password if provided
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (newPassword.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;
        setNewPassword('');
        setConfirmPassword('');
      }

      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username, email })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      setSuccess('Account updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Check if user data exists
      const { data: existingData } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (existingData) {
        // Update existing data
        const { error } = await supabase
          .from('user_data')
          .update({
            nama: userData.nama,
            universitas: userData.universitas,
            jurusan: userData.jurusan,
            minat: userData.minat,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user?.id);

        if (error) throw error;
      } else {
        // Insert new data
        const { error } = await supabase.from('user_data').insert([
          {
            user_id: user?.id,
            nama: userData.nama,
            universitas: userData.universitas,
            jurusan: userData.jurusan,
            minat: userData.minat,
          },
        ]);

        if (error) throw error;
      }

      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-700/50 relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative gradient background */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-lime-500 to-green-500"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>

          {/* Tab Switcher */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-800/50 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('account');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === 'account'
                  ? 'bg-gradient-to-r from-green-500 to-lime-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Account
            </button>
            <button
              onClick={() => {
                setActiveTab('profile');
                setError('');
                setSuccess('');
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-green-500 to-lime-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Data Diri
            </button>
          </div>

          {/* Account Tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleUpdateAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter email"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Changing email will require verification
                </p>
              </div>

              <div className="border-t border-gray-700/50 pt-4 mt-4">
                <h3 className="text-white font-semibold mb-3">Change Password (Optional)</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Enter new password (min 6 characters)"
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={userData.nama}
                  onChange={(e) => setUserData({ ...userData, nama: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Universitas</label>
                <select
                  value={userData.universitas}
                  onChange={(e) => setUserData({ ...userData, universitas: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Pilih Universitas</option>
                  <option value="Universitas Sebelas Maret (UNS)">Universitas Sebelas Maret (UNS)</option>
                  <option value="Universitas Gadjah Mada (UGM)">Universitas Gadjah Mada (UGM)</option>
                  <option value="Institut Teknologi Bandung (ITB)">Institut Teknologi Bandung (ITB)</option>
                  <option value="Universitas Indonesia (UI)">Universitas Indonesia (UI)</option>
                  <option value="Institut Teknologi Sepuluh Nopember (ITS)">Institut Teknologi Sepuluh Nopember (ITS)</option>
                  <option value="Universitas Brawijaya (UB)">Universitas Brawijaya (UB)</option>
                  <option value="Universitas Diponegoro (UNDIP)">Universitas Diponegoro (UNDIP)</option>
                  <option value="Universitas Airlangga (UNAIR)">Universitas Airlangga (UNAIR)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jurusan</label>
                <input
                  type="text"
                  value={userData.jurusan}
                  onChange={(e) => setUserData({ ...userData, jurusan: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Contoh: Teknik Informatika"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Minat</label>
                <textarea
                  value={userData.minat}
                  onChange={(e) => setUserData({ ...userData, minat: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="Contoh: Web Development, AI, Machine Learning"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tuliskan minat atau bidang yang kamu minati
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
