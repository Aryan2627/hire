'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, Building, Clock, XCircle, Mail, ShieldCheck } from 'lucide-react';

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
  const [countdown, setCountdown] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
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
        setCountdown({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0'),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0'),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0'),
          seconds: Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0')
        });
      } else if (now >= TARGET_DATE_START && now <= TARGET_DATE_END) {
        setPortalStatus('LIVE');
      } else {
        setPortalStatus('EXPIRED');
      }
    };

    updateStatus();
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
        router.push('/onboarding');
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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 overflow-hidden font-sans">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-400/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header/Logo */}
      <div className="relative z-10 flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-6">
          <Building className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">ProcGen Portal</h1>
        <p className="text-slate-500 mt-2 font-medium">Secure Candidate Assessment Platform</p>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white">
        
        {/* Dynamic Status Banners */}
        <div className="mb-8">
          {mounted && portalStatus === 'LOCKED' && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="flex items-center justify-center gap-2 mb-3 text-sm font-semibold text-slate-300 uppercase tracking-widest">
                <Clock className="w-4 h-4 text-blue-400" /> Starts In
              </div>
              <div className="flex justify-center gap-3 font-mono">
                {Object.entries(countdown).map(([unit, value]) => (
                  <div key={unit} className="flex flex-col items-center">
                    <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                      {value}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mounted && portalStatus === 'EXPIRED' && (
            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl text-center">
              <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <div className="font-bold text-red-900 mb-1">Assessment Closed</div>
              <div className="text-sm text-red-600">The 48-hour testing window has permanently expired.</div>
            </div>
          )}

          {mounted && portalStatus === 'LIVE' && !error && (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-emerald-900 text-sm">Connection Secure</div>
                <div className="text-xs text-emerald-700 mt-0.5">Your session is encrypted and monitored.</div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-2xl text-sm flex items-start gap-3">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <div className="pt-0.5 font-medium">{error}</div>
            </div>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Common Access ID</label>
            <div className="relative group">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isFormDisabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
              <input 
                type="text" 
                required 
                disabled={isFormDisabled}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none ${
                  isFormDisabled 
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
                placeholder="candidate"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Access Password</label>
            <div className="relative group">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isFormDisabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-blue-500'}`} />
              <input 
                type="password" 
                required
                disabled={isFormDisabled}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-12 pr-4 py-3.5 rounded-xl border transition-all duration-200 outline-none ${
                  isFormDisabled 
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-white border-slate-200 text-slate-900 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
                }`}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isFormDisabled || loading}
            className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex justify-center items-center gap-2 mt-4 shadow-lg ${
              portalStatus === 'EXPIRED' 
                ? 'bg-red-500/10 text-red-500 shadow-none cursor-not-allowed' 
                : isFormDisabled 
                  ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-xl hover:shadow-blue-600/20 active:scale-[0.98]'
            }`}
          >
            {!mounted ? (
               'Loading...'
            ) : portalStatus === 'LOCKED' ? (
              <><Clock className="w-5 h-5" /> Portal Locked</>
            ) : portalStatus === 'EXPIRED' ? (
              <><XCircle className="w-5 h-5" /> Link Expired</>
            ) : loading ? (
              'Verifying Credentials...'
            ) : (
              <>Initiate Assessment <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
      
      {/* Footer text */}
      <div className="relative z-10 mt-10 text-center text-sm font-medium text-slate-400">
        &copy; 2026 ProcGen Platform. All rights reserved.
      </div>
    </div>
  );
}
