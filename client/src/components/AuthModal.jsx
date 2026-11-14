import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  Loader2, 
  Check, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, loginWithGoogle, resetPassword } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(null); // { name, isNew }

  const dismissTimerRef = useRef(null);

  // Keyboard accessibility (ESC to close) & background scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  // Safe confetti celebration trigger
  const fireConfetti = () => {
    try {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#A855F7', '#EC4899', '#06B6D4', '#EAB308'],
          disableForReducedMotion: true
        });
      }
    } catch (e) {
      // Graceful fallback if canvas is restricted
    }
  };

  const triggerSuccess = (displayName, isNew = false) => {
    setLoginSuccess({ name: displayName, isNew });
    fireConfetti();
    dismissTimerRef.current = setTimeout(() => {
      setLoginSuccess(null);
      onClose();
    }, 2000);
  };

  // Email format validation
  const isValidEmail = (emailStr) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    setError('');
    setMessage('');

    const cleanEmail = email.trim();

    // 1. Forgot password flow
    if (isForgotPass) {
      if (!cleanEmail) {
        setError('Please enter your email address.');
        return;
      }
      if (!isValidEmail(cleanEmail)) {
        setError('Please enter a valid email address (e.g. name@domain.com).');
        return;
      }

      setLoading(true);
      try {
        const res = await resetPassword(cleanEmail);
        if (res.success) {
          setMessage(res.message || 'Password reset link sent to your email!');
        } else {
          setError(res.error || 'Failed to send reset email.');
        }
      } catch (err) {
        setError(err.message || 'Failed to process request.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Email format validation for login/register
    if (!cleanEmail) {
      setError('Please provide an email address.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // 3. Password presence
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // 4. Register flow
    if (isRegister) {
      const cleanName = name.trim();
      if (!cleanName || cleanName.length < 2) {
        setError('Please enter your full name (at least 2 characters).');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }

      setLoading(true);
      try {
        const res = await register(cleanName, cleanEmail, password, rememberMe);
        if (res.success) {
          triggerSuccess(cleanName, true);
        } else {
          setError(res.error || 'Registration failed. Please check your details.');
        }
      } catch (err) {
        setError(err.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
    } else {
      // 5. Login flow
      setLoading(true);
      try {
        const res = await login(cleanEmail, password, rememberMe);
        if (res.success) {
          triggerSuccess(res.user?.name || cleanEmail.split('@')[0], false);
        } else {
          setError(res.error || 'Incorrect email or password.');
        }
      } catch (err) {
        setError(err.message || 'Authentication error. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) return; // Prevent duplicate submissions

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await loginWithGoogle();
      if (res?.success) {
        triggerSuccess(res.user?.name || 'Voyager', false);
      } else if (res?.error) {
        setError(res.error);
      }
    } catch (err) {
      setError(err.message || 'Google sign-in error.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success Animation Screen
  if (loginSuccess) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
      >
        <div 
          className="relative w-full max-w-md rounded-3xl p-8 sm:p-10 bg-[#0d0d14] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_60px_rgba(168,85,247,0.4)] flex flex-col items-center text-center motion-safe:animate-fadeSlideUp"
        >
          <style>{`
            @keyframes fadeSlideUp { 
              from { opacity: 0; transform: translateY(20px) scale(0.96); } 
              to { opacity: 1; transform: translateY(0) scale(1); } 
            }
            @keyframes popIn { 
              0% { transform: scale(0); opacity: 0; } 
              60% { transform: scale(1.15); } 
              100% { transform: scale(1); opacity: 1; } 
            }
            @keyframes ringPulse { 
              0%, 100% { box-shadow: 0 0 0 0 rgba(168,85,247,0.6); } 
              50% { box-shadow: 0 0 0 16px rgba(168,85,247,0); } 
            }
            @keyframes sparkle { 
              0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); } 
              50% { opacity: 1; transform: scale(1) rotate(180deg); } 
            }
            @keyframes progressBar { 
              from { width: 0%; } 
              to { width: 100%; } 
            }
            .animate-fadeSlideUp {
              animation: fadeSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @media (prefers-reduced-motion: reduce) {
              .animate-fadeSlideUp, * {
                animation: none !important;
                transition: none !important;
              }
            }
          `}</style>

          {/* Animated ring + checkmark */}
          <div className="relative mb-5">
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center motion-safe:ringPulse"
              style={{ animation: 'ringPulse 1.6s ease-in-out infinite' }}
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#0d0d14] flex items-center justify-center">
                <Check 
                  size={36} 
                  className="text-emerald-400" 
                  strokeWidth={3}
                  style={{ animation: 'popIn 0.45s cubic-bezier(0.175,0.885,0.32,1.275) 0.15s both' }} 
                />
              </div>
            </div>
            {/* Sparkles */}
            {['-top-2 -right-1', 'top-0 -left-3', '-bottom-1 right-0'].map((pos, i) => (
              <Sparkles 
                key={i} 
                size={16} 
                className="absolute text-yellow-400 pointer-events-none"
                style={{ 
                  animation: `sparkle 1.2s ease-in-out ${i * 0.25}s infinite` 
                }} 
              />
            ))}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
            {loginSuccess.isNew ? '🎉 Account Created!' : '✈️ Welcome Back!'}
          </h2>
          <p className="text-purple-300 font-semibold text-base sm:text-lg mb-1 truncate max-w-full">
            {loginSuccess.name}
          </p>
          <p className="text-white/60 text-xs sm:text-sm">
            {loginSuccess.isNew ? 'Your TRIPONA journey begins now' : 'Ready to plan your next adventure?'}
          </p>

          {/* Countdown progress bar */}
          <div className="w-full mt-6 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 rounded-full"
              style={{ animation: 'progressBar 2s linear forwards' }} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl p-5 sm:p-7 bg-[#0d0d14] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95),0_0_40px_rgba(168,85,247,0.3)] transition-all"
        style={{ animation: 'fadeSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors disabled:opacity-40"
          aria-label="Close authentication modal"
          type="button"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-orange-500 mx-auto mb-2.5 flex items-center justify-center p-[1px] shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <div className="w-full h-full rounded-full bg-[#0d0d14] flex items-center justify-center">
              <Sparkles size={18} className="text-pink-300" />
            </div>
          </div>
          <h3 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-white font-heading">
            {isForgotPass ? 'Reset Password' : isRegister ? 'Create TRIPONA Account' : 'Welcome to TRIPONA'}
          </h3>
          <p className="text-xs text-[#A5A5A5] mt-1 max-w-xs mx-auto">
            {isForgotPass
              ? 'Enter your email to receive recovery instructions'
              : isRegister
              ? 'Sign up for access to AI trip planning, itineraries & bookings'
              : 'Sign in to access your saved journeys & bookings'}
          </p>
        </div>

        {/* Feedback messages */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs leading-relaxed space-y-1">
            <div className="flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-400 mt-0.5" />
              <div className="font-medium flex-1">{error}</div>
            </div>
            {error.includes('Firebase') && (
              <p className="text-[11px] text-white/70 pl-6">
                To enable Google OAuth popups for this domain, add <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">tripona.joshclickss.workers.dev</code> in{' '}
                <a
                  href="https://console.firebase.google.com/project/triponaai/authentication/settings"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline font-semibold"
                >
                  Firebase Console &rarr; Authorized Domains
                </a>.
              </p>
            )}
          </div>
        )}

        {!isForgotPass && (
          <>
            {/* Google SSO Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-3 transition-colors mb-3 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-white/10" />
              <span className="px-3 text-[10px] uppercase tracking-wider text-white/40 font-mono">or with email</span>
              <div className="flex-1 border-t border-white/10" />
            </div>
          </>
        )}

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && !isForgotPass && (
            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Alexander Scott"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-white/70 mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@domain.com"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {!isForgotPass && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-white/70">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPass(true);
                      setError('');
                      setMessage('');
                    }}
                    className="text-[10px] text-purple-300 hover:text-purple-200 underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={isRegister ? 'At least 6 characters' : 'Enter your password'}
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 transition-all disabled:opacity-50"
                />
                {/* Password visibility toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 p-1 rounded transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Remember Me Option */}
          {!isForgotPass && (
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-white/70 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/10 border border-white/20 text-purple-600 focus:ring-purple-400 focus:ring-offset-0 focus:ring-1 cursor-pointer"
                />
                <span>Remember me on this device</span>
              </label>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>
                  {isForgotPass ? 'Sending Link...' : isRegister ? 'Creating Account...' : 'Authenticating...'}
                </span>
              </span>
            ) : (
              <span>
                {isForgotPass ? 'Send Password Reset Email' : isRegister ? 'Create Account & Sign In' : 'Sign In'}
              </span>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center mt-5 text-xs text-white/60">
          {isForgotPass ? (
            <button
              type="button"
              onClick={() => {
                setIsForgotPass(false);
                setError('');
                setMessage('');
              }}
              className="text-purple-300 hover:text-purple-200 font-semibold underline underline-offset-2"
            >
              Back to Sign In
            </button>
          ) : (
            <>
              {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setMessage('');
                }}
                className="text-purple-300 hover:text-purple-200 font-semibold underline underline-offset-2 ml-1"
              >
                {isRegister ? 'Sign In' : 'Create an Account'}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
