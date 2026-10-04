'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    education: '',
    experience: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/exam');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to register candidate');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-slate-900">Candidate Registration</h1>
          <button 
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/');
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Restart / Logout
          </button>
        </div>
        <p className="text-slate-500 mb-6">Please enter your details before starting the assessment.</p>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              minLength={2}
              maxLength={100}
              pattern="^[a-zA-Z\s\-]+$"
              title="Name must only contain letters, spaces, and hyphens"
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 invalid:focus:border-red-500" 
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 invalid:focus:border-red-500" 
              placeholder="john@example.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              required 
              pattern="^\+?[0-9]{10,15}$"
              title="Enter a valid 10 to 15 digit phone number (can start with +)"
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 invalid:focus:border-red-500" 
              placeholder="+12345678900" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">College / Education</label>
            <input 
              type="text" 
              required 
              minLength={3}
              maxLength={150}
              value={formData.education} 
              onChange={e => setFormData({...formData, education: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 invalid:focus:border-red-500" 
              placeholder="University of Technology" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
            <input 
              type="number" 
              required 
              min="0"
              max="50"
              step="0.5"
              title="Enter a numerical value (e.g., 0 for fresher, 2.5 for 2.5 years)"
              value={formData.experience} 
              onChange={e => setFormData({...formData, experience: e.target.value})} 
              className="w-full p-3 border rounded-lg outline-none focus:border-blue-500 invalid:focus:border-red-500" 
              placeholder="e.g. 2 or 0.5 (for fresher use 0)" 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl mt-6 transition-all disabled:opacity-50">
            {loading ? 'Registering...' : 'Start Assessment'}
          </button>
        </form>
      </div>
    </div>
  );
}
