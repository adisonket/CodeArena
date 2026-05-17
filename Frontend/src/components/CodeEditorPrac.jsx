import { useState, useCallback } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const langLabel = (lang) => {
  const map = {
    python3: 'Python', nodejs: 'JavaScript', java: 'Java',
    cpp17: 'C++', c: 'C', php: 'PHP', typescript: 'TypeScript', go: 'Go', sql: 'SQL',
  };
  return map[lang] || lang;
};

const monacoLang = (lang) => {
  const map = {
    python3: 'python', nodejs: 'javascript', cpp17: 'cpp',
    java: 'java', c: 'c', php: 'php', typescript: 'typescript', go: 'go', sql: 'sql',
  };
  return map[lang] || 'plaintext';
};

const mapQuestionLanguage = (lang = '') => {
  switch (lang.toLowerCase()) {
    case 'python':      return 'python3';
    case 'javascript':  return 'nodejs';
    case 'java':        return 'java';
    case 'c++':         return 'cpp17';
    case 'c':           return 'c';
    case 'php':         return 'php';
    case 'typescript':  return 'typescript';
    case 'go':          return 'go';
    case 'sql':         return 'sql';
    default:            return 'python3';
  }
};

// ─── CodeEditorPrac ───────────────────────────────────────────────────────────
// Fully controlled — code and output state live in PracticeSet.
// Only manages UI-only state (run status, timing text).
// ─────────────────────────────────────────────────────────────────────────────

const CodeEditorPrac = ({
  currentQuestion,
  currentIndex,
  code,
  output,
  onCodeChange,
  onOutputChange,
}) => {
  const language = mapQuestionLanguage(currentQuestion?.language);

  const [runStatus, setRunStatus] = useState('idle');
  const [metaText, setMetaText] = useState('');

  const runCode = useCallback(async () => {
    setRunStatus('running');
    onOutputChange('Running…');
    setMetaText('');

    try {
      const res = await axios.post(`${API_URL}/api/compiler/run`, {
        code,
        language,
        input: '',
      });

      const d = res.data?.data || {};
      const finalOutput = d.stdout || d.stderr || d.compile_output || 'No output';

      onOutputChange(finalOutput);
      setMetaText(`${d.time || 0}s • ${d.memory || 0} KB`);
      setRunStatus('success');
    } catch (err) {
      setRunStatus('error');
      const msg =
        typeof err.response?.data?.error === 'object'
          ? JSON.stringify(err.response.data.error, null, 2)
          : err.response?.data?.error || err.message || 'Execution failed';
      onOutputChange(msg);
    }
  }, [code, language, onOutputChange]);

  const clearEditor = () => {
    onCodeChange('');
    onOutputChange('Run code to see output here…');
    setMetaText('');
    setRunStatus('idle');
  };

  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('codearena-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#000814',
        'editor.lineHighlightBackground': '#111111',
        'editorCursor.foreground': '#ffffff',
        'editorLineNumber.foreground': '#666666',
        'editor.selectionBackground': '#264F78',
      },
    });
  };

  const statusColor =
    runStatus === 'running' ? 'bg-yellow-400 animate-pulse'
    : runStatus === 'success' ? 'bg-[#22C55E]'
    : runStatus === 'error'   ? 'bg-red-400'
    : 'bg-white/30';

  return (
    <main className="h-full min-h-0 flex flex-col bg-[#0b1220]/70 overflow-hidden">

      {/* Toolbar */}
      <div className="h-16 shrink-0 border-b border-white/10 bg-[#050816]/70 backdrop-blur-xl px-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#A1A1AA] font-semibold">
            Code Editor
          </p>
          <p className="text-xs text-[#6C63FF] font-mono mt-0.5 max-w-xs truncate">
            Q{currentIndex + 1} — {currentQuestion?.question?.slice(0, 55)}…
          </p>
        </div>

        <div className="px-5 py-2 rounded-2xl border border-indigo-500/30 bg-[#111827] text-white font-semibold text-sm shadow-inner">
          {langLabel(language)}
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
            disabled={runStatus === 'running'}
            className="rounded-xl bg-[#6C63FF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#7b73ff] transition-all shadow-[0_0_0_1px_rgba(108,99,255,0.16),_0_10px_30px_rgba(0,0,0,0.28)] disabled:opacity-50"
          >
            ▶ Run
          </button>
        </div>
      </div>

      {/* Editor + Output */}
      <div className="flex-1 min-h-0 overflow-hidden grid grid-rows-[minmax(0,1fr)_180px]">

        <div className="min-h-0 bg-[#07101d] overflow-hidden">
          <Editor
            height="100%"
            beforeMount={handleEditorWillMount}
            theme="codearena-dark"
            language={monacoLang(language)}
            value={code}
            onChange={(value) => onCodeChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              autoClosingBrackets: 'always',
              autoClosingQuotes: 'always',
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              tabSize: 4,
              wordWrap: 'on',
            }}
          />
        </div>

        <div className="border-t border-white/10 bg-[#050816]/80 flex flex-col min-h-0 overflow-hidden">
          <div className="h-11 shrink-0 px-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#A1A1AA]">
              <span className={`h-2.5 w-2.5 rounded-full transition-all ${statusColor}`} />
              Output
            </div>
            <div className="text-xs text-[#A1A1AA] font-mono">{metaText}</div>
          </div>
          <pre className="min-h-0 flex-1 overflow-auto scrollbar-thin p-4 font-mono text-[13px] leading-7 text-slate-200 whitespace-pre-wrap">
            {output || 'Run code to see output here…'}
          </pre>
        </div>

      </div>
    </main>
  );
};

export default CodeEditorPrac;