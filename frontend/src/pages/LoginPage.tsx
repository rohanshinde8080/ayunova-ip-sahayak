import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@ipsakti.ai');
  const [password, setPassword] = useState('demo123');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginDemo } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = async () => {
    setIsLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#051814] to-[#040e1a] flex flex-col justify-between p-4 sm:p-6 text-white relative overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-3/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-lg shadow-emerald-500/30 overflow-hidden shrink-0 flex items-center justify-center ring-2 ring-emerald-500/30">
            <img
              src="/ayunova_logo.png"
              alt="IP SHAKTI SAHAYAK Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl text-white tracking-tight">IP SHAKTI SAHAYAK</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                Official Copilot
              </span>
            </div>
            <p className="text-xs text-slate-400">Ayurveda IPR &amp; Regulatory Guidance Copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>SIH 2026 | PS SIH26045</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto bg-white/95 text-slate-900 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_40px_rgba(16,185,129,0.15)] border border-emerald-500/25 relative z-10 animate-slide-up">
        <div className="text-center space-y-3 mb-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-white p-2 shadow-lg shadow-emerald-500/15 border border-emerald-500/25 flex items-center justify-center ring-4 ring-emerald-500/10">
            <img
              src="/ayunova_logo.png"
              alt="IP SHAKTI SAHAYAK Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 border border-emerald-300/80 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ministry of Ayush &amp; AIIA Supported</span>
          </div>
          <h2 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            IP SHAKTI SAHAYAK
          </h2>
          <p className="text-xs text-slate-500 -mt-1 font-medium">
            AI Assistant for Ayurveda IP &amp; Regulatory Guidance
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-700/60 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="demo@ipsakti.ai"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/15 font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-700/60 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="demo123"
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/15 font-medium transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
              />
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/40 border border-emerald-200/80 rounded-2xl text-xs space-y-1.5 text-slate-600 font-mono shadow-2xs">
            <div className="font-bold text-slate-700">Pre-configured Demo Credentials:</div>
            <div className="flex justify-between items-center">
              <span>Innovator:</span>
              <span className="text-emerald-800 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded">demo@ipsakti.ai / demo123</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Admin:</span>
              <span className="text-emerald-800 font-bold bg-emerald-100/60 px-1.5 py-0.5 rounded">admin@ipsakti.ai / admin123</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              Instant Judge Access
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoMode}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-slate-950 via-[#0a1524] to-slate-900 hover:from-slate-900 hover:to-slate-800 text-white border border-emerald-500/30 hover:border-emerald-400 font-bold text-xs rounded-xl shadow-md shadow-slate-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Continue in Demo Mode (No Login Required)</span>
          </button>
        </form>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-3 relative z-10">
        Smart India Hackathon 2026 • Problem Statement PS SIH26045 • All India Institute of Ayurveda
      </div>
    </div>
  );
};
