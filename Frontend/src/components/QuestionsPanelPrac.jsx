import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import QuestionCard from './QuestionCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// ─── QuestionsPanelPrac ───────────────────────────────────────────────────────
// Props:
//   domain, difficulty        — from PracticeSet (via nav state)
//   questions, currentIndex   — controlled from PracticeSet
//   answers                   — MCQ selections { index: string }
//   codes, outputs            — coding state { index: string } from PracticeSet
//   onQuestionsLoaded(qs)     — notify parent when questions arrive
//   onNavigate(index)         — change active question
//   onSelectAnswer(i, option) — store MCQ answer
// ─────────────────────────────────────────────────────────────────────────────

const QuestionsPanelPrac = ({
  domain,
  difficulty,
  questions,
  currentIndex,
  answers,
  codes,
  outputs,
  onQuestionsLoaded,
  onNavigate,
  onSelectAnswer,
  onSubmitComplete, 
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Analyze state — only for CODING questions
  const [analyzing, setAnalyzing] = useState(false);
  const [hint, setHint] = useState('');

  // Final submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

    // ── Fetch questions ──────────────────────────────────────────────────────
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        setError('');
        setHint('');
        setSubmitResult(null);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/ai/practice-generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // ← send token
                },
                body: JSON.stringify({ domain, difficulty }),
            });
            const data = await res.json();

            if (data.success) {
                onQuestionsLoaded(data.questions);
            } else {
                setError('Failed to generate questions.');
            }
        } catch (err) {
            console.error(err);
            setError('Unable to connect to server.');
        } finally {
            setLoading(false);
        }
    }, [domain, difficulty, onQuestionsLoaded]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Clear hint when navigating to a different question
  useEffect(() => {
    setHint('');
  }, [currentIndex]);

  // ── AI Analyze — CODING questions only ───────────────────────────────────
  const handleAnalyze = async () => {
    const q = questions[currentIndex];
    if (!q || q.type !== 'CODING') return;

    setAnalyzing(true);
    setHint('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${API_URL}/api/practice/analyze`,
        {
          type: 'CODING',
          question: q.question,
          code: codes[currentIndex] || '',
          output: outputs[currentIndex] || '',
          language: q.language || 'python3',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHint(res.data.hint || 'No hints available.');
    } catch (err) {
      setHint('Failed to get AI hints. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Final Submit — last question only ────────────────────────────────────
  const handleFinalSubmit = async () => {
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      const attempts = questions.map((q, i) => ({
        questionIndex: i,
        question: q.question,
        type: q.type,
        options: q.options || [],
        correctAnswer: q.answer || '',
        selectedAnswer: answers[i] || '',
        code: codes[i] || '',
        language: q.language || 'python3',
        output: outputs[i] || '',
      }));

      const res = await axios.post(
        `${API_URL}/api/practice/submit`,
        { domain, difficulty, attempts },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitResult({
        aiReview: res.data.submission.aiReview,
        stats: res.data.stats,
      });
      onSubmitComplete();
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitResult({
        aiReview: 'Submission failed. Please try again.',
        stats: null,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const mcqQuestions = questions.filter((q) => q.type === 'MCQ');
  const codingQuestions = questions.filter((q) => q.type === 'CODING');

  const mcqScore = questions.reduce((total, q, i) => {
    if (q.type === 'MCQ' && answers[i] === q.answer) return total + 1;
    return total;
  }, 0);

  const q = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCodingQuestion = q?.type === 'CODING';

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <aside className="h-full flex items-center justify-center text-white">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"
          />
          <p className="text-[#A1A1AA] text-sm">
            Generating AI Questions for{' '}
            <span className="text-white font-semibold">{domain}</span>…
          </p>
        </div>
      </aside>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <aside className="h-full flex items-center justify-center text-red-400 flex-col gap-4">
        <p className="text-sm">{error}</p>
        <button
          onClick={fetchQuestions}
          className="px-4 py-2 rounded-lg bg-[#6C63FF] text-white text-sm hover:opacity-90 transition-all"
        >
          Retry
        </button>
      </aside>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!questions.length) {
    return (
      <aside className="h-full flex items-center justify-center text-red-400 text-sm">
        No questions available.
      </aside>
    );
  }

  // ── Post-submit results view ──────────────────────────────────────────────
  if (submitResult) {
    return (
      <aside className="h-full border-r border-white/10 bg-[#050816]/80 backdrop-blur-xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-white/5 shrink-0">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#A1A1AA] font-semibold">
            Session Complete
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">{domain}</h1>
          <p className="text-xs text-[#A1A1AA] mt-0.5 capitalize">
            {difficulty} difficulty
          </p>
        </div>

        {/* Stats cards */}
        {submitResult.stats && (
          <div className="px-6 py-4 border-b border-white/10 shrink-0 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center">
              <p className="text-xs text-[#A1A1AA] mb-1">MCQ Score</p>
              <p className="text-xl font-bold text-amber-400">
                {submitResult.stats.correctMCQ} / {mcqQuestions.length}
              </p>
            </div>
            <div className="rounded-xl border border-[#6C63FF]/20 bg-[#6C63FF]/10 px-4 py-3 text-center">
              <p className="text-xs text-[#A1A1AA] mb-1">Coding Attempted</p>
              <p className="text-xl font-bold text-[#a89eff]">
                {submitResult.stats.attemptedCoding} / {codingQuestions.length}
              </p>
            </div>
          </div>
        )}

        {/* AI overall review */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
          <h3 className="text-xs text-[#6C63FF] font-semibold mb-3 uppercase tracking-widest">
            🤖 AI Overall Review
          </h3>
          <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white text-sm leading-7">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {submitResult.aiReview}
            </ReactMarkdown>
          </div>
        </div>
      </aside>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <aside className="h-full min-h-0 border-r border-white/10 bg-[#050816]/80 backdrop-blur-xl flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#A1A1AA] font-semibold">
              Practice Workspace
            </p>
            <h1 className="mt-1 text-2xl font-bold text-white whitespace-nowrap">
              {domain}
            </h1>
            <p className="text-xs text-[#A1A1AA] mt-0.5 capitalize">
              {difficulty} difficulty
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {mcqQuestions.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-400 font-semibold">
                MCQ: {mcqScore}/{mcqQuestions.length}
              </div>
            )}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-[#A1A1AA]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
              {questions.length} Qs
            </div>
          </div>
        </div>
      </div>

      {/* Question number pills */}
      <div className="px-4 pt-4 shrink-0 flex gap-2 flex-wrap">
        {questions.map((qItem, idx) => {
          const answered =
            qItem.type === 'MCQ'
              ? !!answers[idx]
              : !!(codes[idx]?.trim());

          return (
            <button
              key={idx}
              onClick={() => onNavigate(idx)}
              title={qItem.type}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
                ${
                  idx === currentIndex
                    ? 'bg-[#6C63FF] text-white shadow-[0_0_12px_rgba(108,99,255,0.4)]'
                    : answered
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-[#A1A1AA] border border-white/10 hover:bg-white/10'
                }`}
            >
              {answered ? '✓' : idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question type badge */}
      <div className="px-4 pt-3 shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
            isCodingQuestion
              ? 'bg-[#6C63FF]/15 border-[#6C63FF]/30 text-[#a89eff]'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
          }`}
        >
          {isCodingQuestion ? '⌨ Coding' : '◉ MCQ'}
        </span>
      </div>

      {/* Current question card */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-3">
        <QuestionCard
          question={q}
          index={currentIndex + 1}
          selectedAnswer={answers[currentIndex]}
          onAnswer={(option) => onSelectAnswer(currentIndex, option)}
          type={q?.type}
        />

        {/* AI hint panel — only appears after Analyze on a CODING question */}
        {hint && (
          <div className="mt-4 rounded-xl border border-[#6C63FF]/25 bg-[#6C63FF]/08 p-4">
            <h3 className="text-xs text-[#6C63FF] font-semibold mb-2 uppercase tracking-widest">
              🤖 AI Hints
            </h3>
            <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white text-xs leading-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{hint}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Navigation + action buttons */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0 flex flex-col gap-3">

        {/* Prev / Next navigation */}
        <div className="flex gap-3">
          <button
            disabled={currentIndex === 0}
            onClick={() => onNavigate(currentIndex - 1)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-[#A1A1AA]
            hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
          >
            ← Previous
          </button>
          <button
            disabled={isLastQuestion}
            onClick={() => onNavigate(currentIndex + 1)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-[#A1A1AA]
            hover:bg-white/10 hover:text-white transition-all disabled:opacity-30"
          >
            Next →
          </button>
        </div>

        {/* AI Analyze — only for CODING questions */}
        {isCodingQuestion && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="w-full rounded-xl border border-[#6C63FF]/30 bg-[#6C63FF]/10 py-2.5 text-sm font-semibold text-[#a89eff]
            hover:bg-[#6C63FF]/20 transition-all disabled:opacity-50"
          >
            {analyzing ? '🤖 Analyzing…' : '🤖 AI Analyze'}
          </button>
        )}

        {/* Submit — only on last question (Q10) */}
        {isLastQuestion && (
          <button
            onClick={handleFinalSubmit}
            disabled={submitting}
            className="w-full rounded-xl bg-[#22C55E] py-2.5 text-sm font-bold text-white
            hover:bg-[#16a34a] transition-all
            shadow-[0_0_0_1px_rgba(34,197,94,0.16),_0_10px_30px_rgba(0,0,0,0.28)]
            disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : '✓ Submit All 10 Questions'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default QuestionsPanelPrac;