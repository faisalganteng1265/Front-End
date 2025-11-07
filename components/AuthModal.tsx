'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuccessPopupProps {
  message: string;
  onClose: () => void;
}

function SuccessPopup({ message, onClose }: SuccessPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-700/50 relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Success gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-lime-500 to-green-500"></div>

        <div className="p-8 text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-green-500/40 rounded-full"></div>
              <div className="relative bg-green-500/20 backdrop-blur-md rounded-full p-4 border border-green-500/50">
                <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Message */}
          <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
          <p className="text-gray-300 text-sm mb-6">{message}</p>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/50 hover:scale-105"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayMode, setDisplayMode] = useState(true); // true = login, false = register
  const [panelOrder, setPanelOrder] = useState<'login' | 'register'>('login'); // Separate state for panel order
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right'>('left'); // Track animation direction
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleModeSwitch = () => {
    // Set animation direction based on CURRENT panel position (before change)
    setAnimationDirection(panelOrder === 'login' ? 'left' : 'right');

    setIsTransitioning(true);
    setError('');

    // Phase 1: Fade out content (200ms)
    // Phase 2: Panel expands to full width (400ms)
    setTimeout(() => {
      // Change content AND panel order while panel is full width
      setDisplayMode(!isLogin);
      setIsLogin(!isLogin);
      setPanelOrder(isLogin ? 'register' : 'login');
      setEmail('');
      setPassword('');
      setUsername('');
    }, 500); // After expand

    // Phase 3: Panel returns to normal + content fades in (400ms)
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000); // Total animation time
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Check if input is email or username
        const isEmail = email.includes('@');
        let loginEmail = email;

        if (!isEmail) {
          // Input is username, fetch email from profiles table
          const { supabase } = await import('@/lib/supabase');

          // Try exact match first (case-sensitive)
          let { data, error: fetchError } = await supabase
            .from('profiles')
            .select('email, username')
            .eq('username', email)
            .maybeSingle();

          // If not found, try case-insensitive
          if (!data || fetchError) {
            const result = await supabase
              .from('profiles')
              .select('email, username')
              .ilike('username', email)
              .maybeSingle();

            data = result.data;
            fetchError = result.error;
          }

          console.log('[AuthModal] Username lookup:', {
            inputUsername: email,
            foundData: data,
            error: fetchError
          });

          if (fetchError) {
            console.error('[AuthModal] Database error:', fetchError);
            setError(`Database error: ${fetchError.message}. Try using email to login.`);
            setLoading(false);
            return;
          }

          if (!data || !data.email) {
            setError(`Username "${email}" not found. Please use email to login or check your username.`);
            setLoading(false);
            return;
          }

          loginEmail = data.email;
          console.log('[AuthModal] Found email for username:', loginEmail);
        }

        const { error } = await signIn(loginEmail, password);
        if (error) {
          setError(error.message);
        } else {
          onClose();
          setEmail('');
          setPassword('');
        }
      } else {
        if (!username) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          setError('');
          setSuccessMessage('Sign up successful! Please check your email for verification.');
          setShowSuccessPopup(true);
          setEmail('');
          setPassword('');
          setUsername('');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <SuccessPopup
          message={successMessage}
          onClose={() => {
            setShowSuccessPopup(false);
            setIsLogin(true);
          }}
        />
      )}

      {/* Auth Modal */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={handleOverlayClick}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl relative overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition-colors z-[60] bg-white/80 backdrop-blur-sm rounded-full p-2 hover:bg-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Form Panel - Order changes based on panelOrder */}
          <div
            className={`w-full p-12 flex flex-col justify-center bg-white relative transition-all duration-500 ease-in-out ${
              isTransitioning ? 'md:w-0 opacity-0' : 'md:w-1/2 opacity-100'
            } ${panelOrder === 'register' ? 'md:order-1' : 'md:order-2'}`}
          >
            <div className={`w-full max-w-sm mx-auto transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {displayMode ? 'Login' : 'Registration'}
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                {displayMode ? 'Welcome back to AICampus!' : 'Join AICampus today'}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Username"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type={isLogin ? 'text' : 'email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder={isLogin ? 'Email or Username' : 'Email'}
                    required
                  />
                </div>

                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Password"
                    required
                    minLength={6}
                  />
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-sm text-green-500 hover:text-green-600 font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-green-500/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isLogin ? 'Login' : 'Register'}</span>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Welcome Panel - Order changes based on panelOrder with organic curved shape */}
          <div
            className={`w-full bg-gradient-to-br from-green-500 via-lime-500 to-green-400 flex flex-col justify-center items-center text-white overflow-hidden ${
              panelOrder === 'register' ? 'md:order-2' : 'md:order-1'
            } ${
              isTransitioning
                ? 'md:absolute md:top-0 md:bottom-0 md:z-50 md:rounded-3xl p-12 transition-all duration-500 ease-in-out'
                : 'md:relative md:z-0 md:w-1/2 p-12 transition-all duration-500 ease-in-out'
            } ${
              isTransitioning
                ? (panelOrder === 'login' ? 'md:left-0 md:right-0' : 'md:left-0 md:right-0')
                : ''
            } ${
              isTransitioning ? '' : (panelOrder === 'register' ? 'md:rounded-l-[150px]' : 'md:rounded-r-[150px]')
            }`}
            style={
              isTransitioning
                ? animationDirection === 'left'
                  ? { animation: 'expandFromLeft 0.5s ease-in-out' }
                  : { animation: 'expandFromRight 0.5s ease-in-out' }
                : undefined
            }
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 transition-all duration-700"></div>

            <div className={`relative z-10 text-center transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {displayMode ? 'Hello, Welcome!' : 'Welcome Back!'}
              </h1>
              <p className="text-lg mb-8 text-white/90">
                {displayMode ? 'Don\'t have an account?' : 'Already have an account?'}
              </p>
              <button
                onClick={handleModeSwitch}
                className="px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-green-500 transition-all duration-300 font-medium"
              >
                {displayMode ? 'Register' : 'Login'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
