
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, ArrowRight, Github, Chrome, Loader2, Video, ShoppingBag } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [role, setRole] = useState<'host' | 'viewer'>('viewer');
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await login(role);
    } catch (err) {
      setError('An error occurred during Google login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 mb-6 transform hover:scale-110 transition-transform duration-300">
            <ShoppingBag size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            TOKSHOP<span className="text-primary italic">.</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3">The future of live shopping is here.</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="p-10">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome back
              </h2>
              <p className="text-slate-400 mt-2">
                Sign in to access your account
              </p>
            </div>

            {/* Role Selection */}
            <div className="mb-10">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block text-center">I want to join as a:</label>
               <div className="grid grid-cols-2 gap-4">
                 <button 
                   type="button"
                   onClick={() => setRole('viewer')}
                   className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl transition-all duration-300 border-2 ${role === 'viewer' ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                 >
                   <div className={`p-3 rounded-xl transition-colors ${role === 'viewer' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <ShoppingBag size={24} />
                   </div>
                   <span className="text-sm font-bold">Shopper</span>
                 </button>
                 <button 
                   type="button"
                   onClick={() => setRole('host')}
                   className={`flex flex-col items-center justify-center gap-3 py-6 rounded-2xl transition-all duration-300 border-2 ${role === 'host' ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200 hover:bg-slate-50'}`}
                 >
                   <div className={`p-3 rounded-xl transition-colors ${role === 'host' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <Video size={24} />
                   </div>
                   <span className="text-sm font-bold">Creator</span>
                 </button>
               </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-medium p-4 rounded-xl mb-6 border border-red-100 animate-shake">
                {error}
              </div>
            )}

            <button
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  <Chrome size={24} />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              By continuing, you agree to our <span className="text-slate-900 underline cursor-pointer">Terms</span> and <span className="text-slate-900 underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Secure Encryption</span>
          </div>
          <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
          <span className="text-[10px] font-bold uppercase tracking-wider">24/7 Support</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
