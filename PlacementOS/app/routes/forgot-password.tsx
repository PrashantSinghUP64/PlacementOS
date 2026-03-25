import { useState } from 'react';
import { resetPassword } from '../lib/auth';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await resetPassword(email);
    setIsLoading(false);
    
    if (error) {
      if (error.status === 429) toast.error('Too many requests. Please try again later.');
      else toast.error(error.message);
    } else {
      setSent(true);
      toast.success('Password reset link sent! Check your email.');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"></div>
            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/200/20 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2 text-white">Check your email!</h2>
            <p className="text-gray-400 mb-8">A password reset link has been sent to {email}.</p>
            <Link to="/login" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-colors">Return to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600"></div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-white">Reset Password</h2>
            <Link to="/login" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Back to Login</Link>
        </div>
        <p className="text-gray-400 text-sm mb-6">Enter your email address to receive a secure password reset link.</p>
        
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full p-3 bg-gray-950 border border-gray-800 rounded-xl text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none disabled:opacity-50"
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
