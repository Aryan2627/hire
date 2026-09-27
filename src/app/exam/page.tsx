'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Building, CheckCircle2, ChevronRight, Send, AlertTriangle, AlertOctagon, Code2 } from 'lucide-react';
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
  const [warnings, setWarnings] = useState(0);

  const answersRef = useRef(answers);
  const currentSectionIdxRef = useRef(currentSectionIdx);
  
  useEffect(() => {
    answersRef.current = answers;
    currentSectionIdxRef.current = currentSectionIdx;
  }, [answers, currentSectionIdx]);

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

  const suspendTest = useCallback(async () => {
    setSubmitting(true);
    await fetch('/api/exam/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: answersRef.current, currentSectionIndex: currentSectionIdxRef.current, status: 'SUSPENDED' })
    });
    window.location.reload();
  }, []);

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
    if (loading || !!errorMsg || statusData?.status === 'COMPLETED' || statusData?.status === 'SUSPENDED') return;
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          if (newWarnings >= 3) {
            suspendTest();
          } else {
            alert(`WARNING: You have switched windows! This is a strict violation. (${newWarnings}/3 warnings). The test will be suspended on your third warning.`);
          }
          return newWarnings;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [loading, errorMsg, statusData?.status, suspendTest]);

  useEffect(() => {
    if (loading || !!errorMsg || statusData?.status === 'COMPLETED' || statusData?.status === 'SUSPENDED') return;
    
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
    return <div className="flex-1 flex items-center justify-center"><div className="text-gray-500 font-medium">Loading Assessment...</div></div>;
  }

  if (errorMsg) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full border border-red-200 bg-white p-8 rounded-xl text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">System Error</h2>
          <p className="text-gray-600 mb-6 text-sm">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (statusData?.status === 'SUSPENDED') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full border border-red-200 bg-white p-8 rounded-xl text-center shadow-sm">
          <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Suspended</h2>
          <p className="text-gray-600 mb-6">Your session has been terminated due to multiple window switching violations. This incident has been logged.</p>
        </div>
      </div>
    );
  }

  if (statusData?.status === 'COMPLETED') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full border border-gray-200 bg-white p-8 rounded-xl text-center shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluation Complete</h2>
          <p className="text-gray-600 mb-6">Your responses have been successfully submitted for evaluation. You may now close this window.</p>
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
    <div className="flex-1 flex flex-col bg-gray-50">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Building className="text-blue-600 w-6 h-6" />
          <div>
            <div className="text-sm font-semibold text-gray-900">ProcGen Assessment</div>
            <div className="text-xs text-gray-500">{statusData?.email}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm font-medium text-gray-500 hidden sm:block">
            Section {currentSectionIdx + 1} of {questionsDb.sections.length}
          </div>
          <div className={`flex items-center gap-2 font-semibold text-lg px-4 py-1.5 rounded-md border ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-700'}`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          {warnings > 0 && (
             <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm mb-6 flex items-center gap-3">
               <AlertTriangle className="w-5 h-5 flex-shrink-0" />
               <div><strong>Warning:</strong> You have switched windows {warnings}/3 times. Your test will be suspended upon reaching 3 violations.</div>
             </div>
          )}

          <div className="mb-8 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentSection.title}</h1>
            <p className="text-gray-500 text-sm">Attempt all questions. You can skip this section or submit early to proceed.</p>
          </div>

          <div className="space-y-6 mb-24">
            {currentSection.questions.map((q: any, idx: number) => (
              <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 text-base leading-relaxed mb-5 font-medium">{q.text}</p>
                    
                    {q.type === 'code_editor' ? (
                      <div className="rounded-md overflow-hidden border border-gray-300">
                        <div className="bg-gray-100 text-gray-600 text-xs px-4 py-2 font-mono flex items-center gap-2 border-b border-gray-300">
                          <Code2 className="w-4 h-4 text-gray-500" />
                          {q.language?.toUpperCase() || 'CODE'}
                        </div>
                        <textarea
                          value={answers[q.id] || ''}
                          onChange={(e) => handleOptionSelect(q.id, e.target.value)}
                          className="w-full h-64 bg-[#1e1e1e] text-[#d4d4d4] p-4 focus:outline-none transition-colors font-mono text-sm resize-y"
                          placeholder={`// Write your ${q.language} code here...`}
                          spellCheck="false"
                        ></textarea>
                      </div>
                    ) : q.type === 'textarea' ? (
                      <textarea
                        value={answers[q.id] || ''}
                        onChange={(e) => handleOptionSelect(q.id, e.target.value)}
                        className="w-full h-48 bg-white border border-gray-300 text-gray-900 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-y"
                        placeholder="Type your answer here..."
                      ></textarea>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options?.map((opt: string) => {
                          const isSelected = answers[q.id] === opt;
                          return (
                            <div 
                              key={opt}
                              onClick={() => handleOptionSelect(q.id, opt)}
                              className={`flex items-center gap-3 p-4 rounded-md cursor-pointer border transition-colors ${isSelected ? 'bg-blue-50 border-blue-500 text-blue-800' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                            >
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-blue-600' : 'border-gray-300'}`}>
                                {isSelected && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                              </div>
                              <span className="text-sm">{opt}</span>
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
        </div>
      </main>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={handleNextSection}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors"
          >
            Skip Section
          </button>
          <button 
            onClick={handleNextSection}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Processing...' : (isLastSection ? 'Submit Assessment' : 'Next Section')}
            {isLastSection ? <Send className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
