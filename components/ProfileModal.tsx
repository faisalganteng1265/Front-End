'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
      loadUserProfile();
      loadUserData();
    }
  }, [user, isOpen]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        return;
      }

      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        setAvatarPreview(data.avatar_url);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    setUploadingAvatar(true);

    try {
      // Delete old avatar if exists
      if (avatarUrl) {
        const oldPath = avatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      throw new Error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
      }

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
        .update({
          username,
          email,
          avatar_url: newAvatarUrl,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update local state
      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);

      setSuccess('Account updated successfully!');

      // Reload page after 1 second to refresh UserProfile component
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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

  const getInitial = () => {
    return username.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      style={{ zIndex: 99999 }}
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
              {/* Avatar Upload Section */}
              <div className="flex flex-col items-center mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Profile Picture</label>

                {/* Avatar Preview */}
                <div className="relative mb-4">
                  {avatarPreview ? (
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 shadow-lg shadow-green-500/50">
                      <Image
                        src={avatarPreview}
                        alt="Avatar"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-lime-500 flex items-center justify-center text-white font-bold text-5xl shadow-lg">
                      {getInitial()}
                    </div>
                  )}

                  {/* Camera Icon Button */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition-all hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Click the camera icon to upload a new avatar<br />
                  (Max 2MB, JPG/PNG/GIF)
                </p>
              </div>

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
                <h3 className="text-white font-semibold mb-3">Change Password</h3>

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
                disabled={loading || uploadingAvatar}
                className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50"
              >
                {uploadingAvatar ? 'Uploading Avatar...' : loading ? 'Saving...' : 'Save Changes'}
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
                  placeholder="Contoh : Teknik Informatika"
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
