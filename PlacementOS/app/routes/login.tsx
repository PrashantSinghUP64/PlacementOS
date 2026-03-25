import { useState } from 'react';
import { Navigate } from 'react-router';
import { Link } from 'react-router';
import { signIn, signUp, sendOTP, signInWithGoogle, verifyOTP } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function meta({}: any) {
  return [
    { title: "Login — PlacementOS" },
    { name: "description", content: "Sign in or create your PlacementOS account" },
  ];
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOTPMode, setIsOTPMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    
    if (error) {
      if (error.status === 429) toast.error('Too many requests. Please try again in an hour (Supabase limit).');
      else toast.error(error.message);
    } else {
      toast.success('Successfully logged in!');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error('Please enter an email and password first.');
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    
    if (error) {
      if (error.status === 429) toast.error('Too many requests. Please try again in an hour (Supabase rate limit).');
      else toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to verify your account.', { duration: 6000 });
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await sendOTP(email);
    setIsLoading(false);
    
    if (error) {
      if (error.status === 429) toast.error('Too many OTP requests. Please try again later.');
      else toast.error(error.message);
    } else {
      setOtpSent(true);
      toast.success('OTP sent! Please check your email inbox.');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await verifyOTP(email, otp);
    setIsLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('OTP verified!');
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signInWithGoogle();
    // No need to setIsLoading(false) because it redirects away immediately
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col p-6 items-center justify-center font-sans">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"></div>
        
        <h2 className="text-3xl font-black mb-6 text-white text-center">Welcome Back</h2>

        {!isOTPMode ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
              />
            </div>
            <div className="pt-2 flex gap-3">
              <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Log In'}
              </button>
              <button 
                type="button" 
                onClick={handleSignUp} 
                disabled={isLoading}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign Up
              </button>
            </div>
          </form>
        ) : !otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <p className="text-gray-400 text-sm mb-4 text-center">We'll send a one-time password to your email.</p>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
            />
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-gray-400 text-sm mb-4 text-center">Check your email for the 6-digit code.</p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              disabled={isLoading}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-center tracking-[0.5em] focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50 text-xl font-mono"
            />
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-8 flex flex-col space-y-3 pt-6 border-t border-gray-800">
          <button 
            onClick={() => { setIsOTPMode(!isOTPMode); setOtpSent(false); }} 
            disabled={isLoading}
            className="w-full bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white font-medium p-3 rounded-xl transition-all disabled:opacity-50"
          >
            {isOTPMode ? 'Use Password' : 'Login Without Password (OTP)'}
          </button>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold p-3 rounded-xl shadow flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          
          <Link to="/forgot-password" className="text-center text-sm text-gray-400 hover:text-white pt-3 transition-colors">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
}

