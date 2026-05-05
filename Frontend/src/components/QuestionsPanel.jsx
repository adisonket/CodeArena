import { useState } from 'react';
import QuestionCard from './QuestionCard';

const questions = [
  {
    id: 1,
    title: "What will be the output?",
    code: `def func(a, b=[]):
    b.append(a)
    return b
print(func(1))
print(func(2))`,
    options: ["[1] and [2]", "[1] and [1, 2]", "[1] and [1]", "Error"],
    correct: "b"
  },
  {
    id: 2,
    title: "What does this output?",
    code: `x = "10"
y = 5
print(x * y)`,
    options: ["50", "1010101010", "Error", "None"],
    correct: "b"
  },
  {
    id: 3,
    title: "What happens here?",
    code: `a = [1, 2, 3]
b = a
b += [4]
print(a)`,
    options: ["[1, 2, 3]", "[1, 2, 3, 4]", "Error", "None"],
    correct: "b"
  }
];

const QuestionsPanel = ({ onQuestionChange }) => {
  const [current, setCurrent] = useState(0);

  const goTo = (idx) => {
    setCurrent(idx);
    onQuestionChange?.(questions[idx]);
  };

  const q = questions[current];

  return (
    <aside className="h-full min-h-0 border-r border-white/10 bg-[#050816]/80 backdrop-blur-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/5 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#A1A1AA] font-semibold">
              Practice Workspace
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white">Python Questions</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-[#A1A1AA]">
            <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E] animate-pulseDot" />
            {questions.length} MCQs
          </div>
        </div>
      </div>

      {/* Question number pills */}
      <div className="px-4 pt-4 shrink-0 flex gap-2 flex-wrap">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all
              ${idx === current
                ? 'bg-[#6C63FF] text-white shadow-[0_0_12px_rgba(108,99,255,0.4)]'
                : 'bg-white/5 text-[#A1A1AA] border border-white/10 hover:bg-white/10'
              }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Current question */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4">
        <QuestionCard
          question={q}
          index={current + 1}
          delay={0}
        />
      </div>

      {/* Prev / Next */}
      <div className="px-4 py-4 border-t border-white/10 shrink-0 flex justify-between gap-3">
        <button
          disabled={current === 0}
          onClick={() => goTo(current - 1)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-[#A1A1AA]
            hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>
        <button
          disabled={current === questions.length - 1}
          onClick={() => goTo(current + 1)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm text-[#A1A1AA]
            hover:bg-white/10 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </aside>
  );
};

export { questions };
export default QuestionsPanel;