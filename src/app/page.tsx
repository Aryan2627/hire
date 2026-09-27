'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Building, Clock } from 'lucide-react';

// Target Date: October 4, 2026, 1:00 PM IST
const TARGET_DATE = new Date('2026-10-04T13:00:00+05:30').getTime();

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [isLive, setIsLive] = useState(false);
  const [countdown, setCountdown] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = TARGET_DATE - now;

      if (distance <= 0) {
        setIsLive(true);
        setCountdown('');
        clearInterval(interval);
      } else {
        setIsLive(false);
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setCountdown(`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
      }
    }, 1000);

    // Initial check
    const initialDistance = TARGET_DATE - new Date().getTime();
    if (initialDistance <= 0) setIsLive(true);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLive) return;
    
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
    <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Building className="w-7 h-7" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">ProcGen Assessment</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Please sign in to begin your test.</p>

        {mounted && !isLive && countdown && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1 text-sm font-semibold">
              <Clock className="w-4 h-4" /> Assessment Starts In:
            </div>
            <div className="text-2xl font-bold font-mono tracking-wider">{countdown}</div>
            <div className="text-xs text-blue-600 mt-2">Oct 4, 2026 • 1:00 PM IST</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md text-sm mb-6 flex items-center gap-2">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Candidate Email</label>
            <input 
              type="email" 
              required 
              disabled={!mounted || !isLive}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border px-4 py-2.5 rounded-md focus:outline-none transition-shadow ${!mounted || !isLive ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
              placeholder="id@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Access Code</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${!mounted || !isLive ? 'text-gray-300' : 'text-gray-400'}`} />
              <input 
                type="password" 
                required 
                disabled={!mounted || !isLive}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-md border focus:outline-none transition-shadow ${!mounted || !isLive ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!mounted || !isLive || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
          >
            {(!mounted || !isLive) ? (
              <><Clock className="w-4 h-4" /> Portal Locked</>
            ) : loading ? 'Authenticating...' : (
              <>Start Assessment <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
