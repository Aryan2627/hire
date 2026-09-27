'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Shield, CheckCircle2, ChevronRight, Send, AlertTriangle } from 'lucide-react';
import questionsDb from '@/questions.json';

export default function ExamPage() {
  const router = useRouter();
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(40 * 60);

  const handleNextSection = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    
    const isLastSection = currentSectionIdx >= questionsDb.sections.length - 1;
    
    const payload = {
      answers,
      currentSectionIndex: isLastSection ? currentSectionIdx : currentSectionIdx + 1
    };

    if (isLastSection) {
      await fetch('/api/exam/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      window.location.reload();
    } else {
      await fetch('/api/exam/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setCurrentSectionIdx(prev => prev + 1);
      setTimeLeft(40 * 60);
      setSubmitting(false);
      window.scrollTo(0, 0);
    }
  }, [submitting, currentSectionIdx, answers]);

  useEffect(() => {
    fetch('/api/exam/status')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok || d.error) {
          throw new Error(d.error || 'Server error occurred while fetching status.');
        }
        return d;
      })
      .then(d => {
        setStatusData(d);
        setCurrentSectionIdx(d.currentSectionIndex || 0);
        setAnswers(d.answers || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (loading || !!errorMsg || statusData?.status === 'COMPLETED') return;
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [loading, errorMsg, statusData?.status, handleNextSection]);

  const handleOptionSelect = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-cyan-500 font-bold">ESTABLISHING SECURE CONNECTION...</div></div>;
  }

  if (errorMsg) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-red-900/50 bg-red-950/20 backdrop-blur-md p-8 rounded-2xl text-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">System Error</h2>
          <p className="text-red-400 mb-6 font-sans text-sm">{errorMsg}</p>
          <div className="text-xs text-red-500 font-mono">Check if Vercel DATABASE_URL is configured correctly.</div>
        </div>
      </div>
    );
  }

  if (statusData?.status === 'COMPLETED') {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-green-900/50 bg-green-950/20 backdrop-blur-md p-8 rounded-2xl text-center shadow-[0_0_30px_rgba(22,163,74,0.1)]">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Evaluation Complete</h2>
          <p className="text-slate-400 mb-6 font-sans">Your responses have been securely encrypted and submitted for automated evaluation. You may now close this window.</p>
          <div className="text-xs text-slate-500 font-mono">STATUS: 200 OK | SESSION TERMINATED</div>
        </div>
      </div>
    );
  }

  const currentSection = questionsDb.sections[currentSectionIdx];
  const isLastSection = currentSectionIdx >= questionsDb.sections.length - 1;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505]">
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Shield className="text-cyan-500 w-6 h-6" />
          <div>
            <div className="text-sm font-bold text-white tracking-widest uppercase">ProcGen Assessment</div>
            <div className="text-xs text-slate-400">Candidate: {statusData?.email}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            Section {currentSectionIdx + 1} of {questionsDb.sections.length}
          </div>
          <div className={`flex items-center gap-2 font-bold text-lg px-4 py-1.5 rounded-lg border ${timeLeft < 300 ? 'bg-red-950/50 border-red-900 text-red-500' : 'bg-slate-900 border-slate-700 text-cyan-400'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 border-b border-slate-800 pb-4">
            <h1 className="text-3xl font-bold text-white mb-2">{currentSection.title}</h1>
            <p className="text-slate-400 font-sans text-sm">Attempt all questions. You can skip this section or submit early to proceed.</p>
          </div>

          <div className="space-y-8 mb-12">
            {currentSection.questions.map((q: any, idx: number) => (
              <div key={q.id} className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700 transition-colors">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-200 font-sans text-base leading-relaxed mb-5 font-medium">{q.text}</p>
                    
                    {q.type === 'textarea' ? (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={(e) => handleOptionSelect(q.id, e.target.value)}
                        className="w-full h-48 bg-slate-950 border border-slate-700 text-slate-300 p-4 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans text-sm"
                        placeholder="Enter your detailed deployment strategy..."
                      ></textarea>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options?.map((opt: string) => {
                          const isSelected = answers[q.id] === opt;
                          return (
                            <div 
                              key={opt}
                              onClick={() => handleOptionSelect(q.id, opt)}
                              className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border transition-all ${isSelected ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'}`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-cyan-500' : 'border-slate-600'}`}>
                                {isSelected && <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>}
                              </div>
                              <span className="font-sans text-sm">{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center bg-slate-900/80 p-6 rounded-xl border border-slate-800 sticky bottom-6 shadow-2xl backdrop-blur-md">
            <button 
              onClick={handleNextSection}
              disabled={submitting}
              className="text-slate-400 hover:text-slate-200 font-bold text-sm tracking-wider uppercase transition-colors"
            >
              Skip Section
            </button>
            <button 
              onClick={handleNextSection}
              disabled={submitting}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(8,145,178,0.4)] disabled:opacity-50"
            >
              {submitting ? 'PROCESSING...' : (isLastSection ? 'SUBMIT EXAM' : 'NEXT SECTION')}
              {isLastSection ? <Send className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
