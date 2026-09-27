'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Shield, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        router.push('/exam');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-[#050505] z-0"></div>
      
      <div className="relative z-10 w-full max-w-md border border-slate-800 bg-slate-950/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl shadow-cyan-900/20">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-950 to-slate-900 border border-cyan-800/50 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/30">
            <Shield className="text-cyan-400 w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">ProcGen Careers</h1>
        <p className="text-center text-slate-400 text-sm mb-8 font-sans">AI/ML Intern Assessment Portal</p>

        {error && (
          <div className="bg-red-950/50 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Candidate Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-sans"
              placeholder="id@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Access Token</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-sans"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Authenticating...' : (
              <>Initiate Assessment <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-600">
          SECURE ENCRYPTED CHANNEL
        </div>
      </div>
    </div>
  );
}
