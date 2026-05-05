import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
// import { useAuth } from '../context/AuthContext'; // adjust path if needed

const CodeEditor = ({ currentQuestion }) => {
  const token = localStorage.getItem('token');          // pull JWT from your auth context
  const [code, setCode] = useState(`# Write your solution here\n\n`);
  const [output, setOutput] = useState('Run code to see output here...');
  const [status, setStatus] = useState('idle');
  const [metaText, setMetaText] = useState('');
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | done | error
  const [aiReview, setAiReview] = useState('');
  const editorRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const skulptLoaded = useRef(false);
  const outputRef = useRef('');   // track output for submit

  // keep outputRef in sync
  useEffect(() => { outputRef.current = output; }, [output]);

  // reset editor when question changes
  useEffect(() => {
    setCode(`# Write your solution here\n\n`);
    setOutput('Run code to see output here...');
    setStatus('idle');
    setMetaText('');
    setSubmitState('idle');
    setAiReview('');
  }, [currentQuestion?.id]);

  // Load Skulpt
  useEffect(() => {
    const loadSkulpt = async () => {
      if (!skulptLoaded.current) {
        const [skulpt, stdlib] = await Promise.all([
          import('https://cdn.skypack.dev/skulpt'),
          import('https://cdn.skypack.dev/skulpt-stdlib')
        ]);
        window.Sk = skulpt.Sk;
        window.Sk.builtinFiles = stdlib.builtinFiles;
        skulptLoaded.current = true;
      }
    };
    loadSkulpt();
  }, []);

  const renderLineNumbers = useCallback(() => {
    if (!editorRef.current || !lineNumbersRef.current) return;
    const count = Math.max(1, code.split('\n').length);
    lineNumbersRef.current.innerHTML = Array.from(
      { length: count },
      (_, i) => `<div class="pr-4">${i + 1}</div>`
    ).join('');
  }, [code]);

  useEffect(() => { renderLineNumbers(); }, [code, renderLineNumbers]);

  const syncScroll = useCallback(() => {
    if (lineNumbersRef.current && editorRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  }, []);

  const runCode = useCallback(async () => {
    if (!window.Sk) return;
    setOutput('');
    setStatus('running');
    setMetaText('Running...');
    const start = performance.now();
    let collected = '';

    window.Sk.configure({
      output: (text) => {
        collected += text;
        setOutput((prev) => prev + text);
      },
      read: (file) => {
        if (window.Sk.builtinFiles?.files[file] === undefined)
          throw `File not found: '${file}'`;
        return window.Sk.builtinFiles.files[file];
      },
      __future__: window.Sk.python3
    });

    try {
      await window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, code, true)
      );
      setStatus('success');
      setMetaText(((performance.now() - start) / 1000).toFixed(3) + 's');
      if (!collected.trim()) setOutput('Code executed successfully with no output.');
    } catch (err) {
      setStatus('error');
      setMetaText(((performance.now() - start) / 1000).toFixed(3) + 's');
      const errMsg = err.toString();
      setOutput(errMsg);
      collected = errMsg;
    }
    outputRef.current = collected;
  }, [code]);

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    setSubmitState('loading');
    setAiReview('');
    try {
      const res = await axios.post(
        '/api/practice/submit',
        {
          questionId: currentQuestion.id,
          questionTitle: currentQuestion.title,
          code,
          output: outputRef.current
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiReview(res.data.submission.aiReview);
      setSubmitState('done');
    } catch (err) {
      setSubmitState('error');
      // TEMPORARY: log full error details
      console.error('Submit error status:', err.response?.status);
      console.error('Submit error data:', err.response?.data);
      console.error('Submit error message:', err.message);
      setAiReview(
        `Error ${err.response?.status}: ${JSON.stringify(err.response?.data) || err.message}`
      );
    }
  };

  const clearEditor = () => {
    setCode('');
    setOutput('Run code to see output here...');
    setMetaText('');
    setStatus('idle');
    setSubmitState('idle');
    setAiReview('');
    editorRef.current?.focus();
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const newCode = code.slice(0, start) + '    ' + code.slice(end);
      setCode(newCode);
      setTimeout(() => {
        editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 4;
      }, 0);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
  }, [code, runCode]);

  return (
    <main className="h-full min-h-0 flex flex-col bg-[#0b1220]/70 overflow-hidden">

      {/* Toolbar */}
      <div className="h-16 shrink-0 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl px-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#A1A1AA] font-semibold">Editor</p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            {currentQuestion ? `Q${currentQuestion.id}: ${currentQuestion.title}` : 'Code Playground'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearEditor}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#A1A1AA] hover:bg-white/10 hover:text-white transition-all"
          >
            Clear
          </button>
          <button
            onClick={runCode}
            disabled={status === 'running'}
            className="rounded-xl bg-[#6C63FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7b73ff] transition-all shadow-[0_0_0_1px_rgba(108,99,255,0.16),_0_10px_30px_rgba(0,0,0,0.28)] disabled:opacity-50"
          >
            ▶ Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitState === 'loading' || status === 'running'}
            className="rounded-xl bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#16a34a] transition-all shadow-[0_0_0_1px_rgba(34,197,94,0.16),_0_10px_30px_rgba(0,0,0,0.28)] disabled:opacity-50"
          >
            {submitState === 'loading' ? 'Submitting...' : '✓ Submit'}
          </button>
        </div>
      </div>

      {/* Editor + Output + AI Review */}
      <div className="flex-1 min-h-0 overflow-hidden grid grid-rows-[minmax(0,1fr)_180px]">

        {/* Code area */}
        <div className="min-h-0 grid grid-cols-[56px_minmax(0,1fr)] bg-[#07101d] overflow-hidden">
          <div
            ref={lineNumbersRef}
            className="overflow-hidden border-r border-white/10 bg-navy/50 py-4 text-right text-[13px] leading-7 font-mono text-muted/50 select-none"
          />
          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={syncScroll}
            onKeyDown={handleKeyDown}
            spellCheck="false"
            className="min-h-0 h-full w-full resize-none overflow-auto scrollbar-thin bg-transparent p-4 font-mono text-[13px] leading-7 text-slate-100 outline-none"
            placeholder="# Write Python code here"
          />
        </div>

        {/* Output panel */}
        <div className="border-t border-white/10 bg-[#050816]/80 flex flex-col min-h-0 overflow-hidden">
          <div className="h-11 shrink-0 px-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#A1A1AA]">
              <span
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  status === 'running' ? 'bg-yellow-400 animate-pulseDot' :
                  status === 'success' ? 'bg-[#22C55E]' :
                  status === 'error'   ? 'bg-red-400' :
                  'bg-white/30'
                }`}
              />
              Output
            </div>
            <div className="text-xs text-[#A1A1AA] font-mono">{metaText}</div>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto scrollbar-thin p-4 font-mono text-[13px] leading-7 text-slate-200 whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      </div>

      {/* AI Review Panel — slides in after submit */}
      {(submitState === 'done' || submitState === 'error') && (
        <div className="shrink-0 border-t border-[#6C63FF]/30 bg-[#0d0d2b]/90 backdrop-blur-xl">
          <div className="px-5 py-3 flex items-center gap-2 border-b border-white/10">
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#6C63FF]">
              🐇 CodeRabbit Review
            </span>
            {submitState === 'done' && (
              <span className="ml-auto text-[11px] text-[#22C55E] font-mono">Saved to DB ✓</span>
            )}
          </div>
          <div className="px-5 py-4 max-h-48 overflow-y-auto scrollbar-thin">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
              {aiReview}
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default CodeEditor;