'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Building, Clock, XCircle } from 'lucide-react';

// Target Dates: Starts Oct 4, 2026 1:00 PM IST | Ends Oct 6, 2026 1:00 PM IST
const TARGET_DATE_START = new Date('2026-10-04T13:00:00+05:30').getTime();
const TARGET_DATE_END = new Date('2026-10-06T13:00:00+05:30').getTime();

type PortalStatus = 'LOCKED' | 'LIVE' | 'EXPIRED';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [portalStatus, setPortalStatus] = useState<PortalStatus>('LOCKED');
  const [countdown, setCountdown] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatch by waiting for client render
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateStatus = () => {
      const now = new Date().getTime();
      
      if (now < TARGET_DATE_START) {
        setPortalStatus('LOCKED');
        const distance = TARGET_DATE_START - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown(`${days}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
      } else if (now >= TARGET_DATE_START && now <= TARGET_DATE_END) {
        setPortalStatus('LIVE');
        setCountdown('');
      } else {
        setPortalStatus('EXPIRED');
        setCountdown('');
      }
    };

    updateStatus(); // Initial call
    const interval = setInterval(updateStatus, 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (portalStatus !== 'LIVE') return;
    
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

  const isFormDisabled = !mounted || portalStatus !== 'LIVE';

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

        {mounted && portalStatus === 'LOCKED' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1 text-sm font-semibold">
              <Clock className="w-4 h-4" /> Assessment Starts In:
            </div>
            <div className="text-2xl font-bold font-mono tracking-wider">{countdown}</div>
            <div className="text-xs text-blue-600 mt-2">Oct 4, 2026 • 1:00 PM IST</div>
          </div>
        )}

        {mounted && portalStatus === 'EXPIRED' && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1 text-sm font-semibold">
              <XCircle className="w-5 h-5 text-red-600" /> Assessment Closed
            </div>
            <div className="text-sm text-red-600 mt-1">The 48-hour testing window has permanently expired.</div>
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
              disabled={isFormDisabled}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border px-4 py-2.5 rounded-md focus:outline-none transition-shadow ${isFormDisabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
              placeholder="id@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Access Code</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isFormDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
              <input 
                type="password" 
                required 
                disabled={isFormDisabled}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-md border focus:outline-none transition-shadow ${isFormDisabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent'}`}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isFormDisabled || loading}
            className={`w-full font-medium py-2.5 px-4 rounded-md transition-colors flex justify-center items-center gap-2 mt-2 ${portalStatus === 'EXPIRED' ? 'bg-red-600 text-white cursor-not-allowed opacity-50' : (isFormDisabled ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white')}`}
          >
            {!mounted ? (
               'Loading...'
            ) : portalStatus === 'LOCKED' ? (
              <><Clock className="w-4 h-4" /> Portal Locked</>
            ) : portalStatus === 'EXPIRED' ? (
              <><XCircle className="w-4 h-4" /> Link Expired</>
            ) : loading ? (
              'Authenticating...'
            ) : (
              <>Start Assessment <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
