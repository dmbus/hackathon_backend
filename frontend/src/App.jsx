import axios from 'axios';
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

// Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API || "AIzaSyCvMsgVadULWHUBTh8pJ-sj9nBKp4QPwek",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sprache-f18c6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sprache-f18c6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sprache-f18c6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID || "116869406648",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:116869406648:web:b3fa6ac0920b29f55c394d"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// API Configuration
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return 'https://api.sprache.app';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
});

// --- Assets: Brand Icons ---
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const GithubIcon = () => (
  <svg className="w-5 h-5 fill-slate-700" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5 fill-slate-800" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.82 3.05-1.5 4.14-.14 2.82 2.38-1.78 4.2 2.06 9.6 1.18 1.67-1.15 3.15-1.28 3.32zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const SocialButton = ({ icon: Icon, onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 flex justify-center items-center p-4 rounded-full bg-white border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md hover:bg-slate-50 hover:scale-[1.02] active:scale-95 focus:ring-2 focus:ring-indigo-500 focus:outline-none group"
    aria-label={`Sign in with ${label}`}
  >
    <div className="group-hover:scale-110 transition-transform duration-200">
      <Icon />
    </div>
  </button>
);

const InputField = ({ label, type, placeholder, icon: Icon, id, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="space-y-2 group">
      <label
        htmlFor={id}
        className="block text-sm font-semibold uppercase tracking-wider text-slate-400 pl-1"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon size={20} />
        </div>
        <input
          id={id}
          value={value}
          onChange={onChange}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          required
          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all duration-200 font-medium shadow-sm hover:border-slate-300"
          placeholder={placeholder}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  const handleSocialLogin = async (providerName) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
      } else if (providerName === 'github') {
        provider = new GithubAuthProvider();
      } else {
        throw new Error('Unsupported provider');
      }

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send token to backend
      const response = await api.post('/auth/firebase-login', { idToken });

      console.log('Social Login Success:', response.data);
      setSuccess('Successfully logged in with ' + providerName + '!');
      localStorage.setItem('token', idToken);

    } catch (err) {
      console.error('Social Login Error:', err);
      setError(err.response?.data?.detail || err.message || 'Social login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name })
      };

      const response = await api.post(endpoint, payload);

      console.log('Success:', response.data);
      setSuccess(isLogin ? 'Successfully logged in!' : 'Account created successfully!');

      // Store token
      localStorage.setItem('token', response.data.idToken);

    } catch (err) {
      console.error('API Error:', err);
      let errorMsg = 'An unexpected error occurred. Please try again.';

      if (err.response) {
        // Server responded with a status code outside the 2xx range
        errorMsg = err.response.data?.detail || `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        // Request was made but no response was received
        errorMsg = `Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running.`;
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-indigo-100 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-rose-50 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">

          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-sm border border-indigo-100">
              <Sparkles size={28} strokeWidth={2} />
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-slate-500 text-lg">
              {isLogin ? 'Ready to continue your journey?' : 'Start your experience today.'}
            </p>
          </div>

          <div className="px-8 pb-10">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium animate-fade-in-down">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-sm font-medium animate-fade-in-down">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="animate-fade-in-down">
                  <InputField
                    id="name"
                    label="Full Name"
                    type="text"
                    placeholder="Jane Doe"
                    icon={User}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              )}

              <InputField
                id="email"
                label="Email Address"
                type="email"
                placeholder="hello@example.com"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
              />

              <div className="space-y-1">
                <InputField
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                />
                {isLogin && (
                  <div className="flex justify-end pt-1">
                    <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 ${isLoading ? 'cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </span>
                ) : (
                  <>
                    <span>{isLogin ? 'Sign In' : 'Get Started'}</span>
                    <ArrowRight size={20} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="flex space-x-4">
              <SocialButton icon={GoogleIcon} label="Google" onClick={() => handleSocialLogin('google')} />
              <SocialButton icon={AppleIcon} label="Apple" onClick={() => { }} />
              <SocialButton icon={GithubIcon} label="GitHub" onClick={() => handleSocialLogin('github')} />
            </div>
          </div>

          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 text-center">
            <p className="text-slate-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button
                onClick={toggleMode}
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors ml-1 focus:outline-none focus:underline"
              >
                {isLogin ? 'Sign up' : 'Log in'}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="font-mono text-sm text-slate-400 opacity-80">
            Secure Authentication
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
