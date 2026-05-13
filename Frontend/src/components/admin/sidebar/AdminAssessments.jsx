import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Plus, Search, X, ChevronRight, ChevronDown,
  SlidersHorizontal, Code2, CheckSquare, Timer, Star, Layers,
  BarChart2, Download, AlertCircle, Eye, Edit3, Copy, Trash2,
  Lock, Globe, Zap, Filter, BookOpen, TrendingUp, Users,
  CheckCircle2, Clock, MoreHorizontal, ArrowUpRight, Sparkles,
  FileText, PauseCircle, PlayCircle, Tag,
} from "lucide-react";

// ── mock data ──────────────────────────────────────────────────────────────────
const INITIAL_ASSESSMENTS = [
  {
    _id: "a001", title: "Advanced React Patterns", category: "Frontend",
    status: "Published", visibility: "Public",
    mcqCount: 15, codeCount: 5, duration: 90,
    totalMarks: 55, passingScore: 65,
    totalAttempts: 142, avgScore: 78, topScore: 98, passRate: 72,
    difficulty: "Hard", tags: ["React", "Hooks", "Performance"],
    createdAt: "2026-04-15T10:00:00.000Z", updatedAt: "2026-05-01T10:00:00.000Z",
    usedInDrives: 3, type: "Technical",
  },
  {
    _id: "a002", title: "Python Data Structures", category: "Backend",
    status: "Published", visibility: "Private",
    mcqCount: 20, codeCount: 8, duration: 120,
    totalMarks: 80, passingScore: 60,
    totalAttempts: 89, avgScore: 82, topScore: 99, passRate: 85,
    difficulty: "Medium", tags: ["Python", "DSA", "Algorithms"],
    createdAt: "2026-03-20T09:00:00.000Z", updatedAt: "2026-04-28T08:00:00.000Z",
    usedInDrives: 5, type: "Technical",
  },
  {
    _id: "a003", title: "System Design Fundamentals", category: "Architecture",
    status: "Draft", visibility: "Private",
    mcqCount: 10, codeCount: 0, duration: 45,
    totalMarks: 20, passingScore: 70,
    totalAttempts: 0, avgScore: 0, topScore: 0, passRate: 0,
    difficulty: "Hard", tags: ["Scalability", "Databases", "API"],
    createdAt: "2026-05-05T14:00:00.000Z", updatedAt: "2026-05-05T14:00:00.000Z",
    usedInDrives: 0, type: "Conceptual",
  },
  {
    _id: "a004", title: "SQL & Query Optimization", category: "Database",
    status: "Published", visibility: "Public",
    mcqCount: 18, codeCount: 6, duration: 75,
    totalMarks: 66, passingScore: 55,
    totalAttempts: 211, avgScore: 69, topScore: 95, passRate: 61,
    difficulty: "Medium", tags: ["SQL", "PostgreSQL", "Indexes"],
    createdAt: "2026-02-10T11:00:00.000Z", updatedAt: "2026-04-12T09:00:00.000Z",
    usedInDrives: 7, type: "Technical",
  },
  {
    _id: "a005", title: "DevOps & CI/CD Pipelines", category: "Infrastructure",
    status: "Archived", visibility: "Private",
    mcqCount: 25, codeCount: 3, duration: 60,
    totalMarks: 40, passingScore: 65,
    totalAttempts: 47, avgScore: 63, topScore: 89, passRate: 53,
    difficulty: "Easy", tags: ["Docker", "Jenkins", "GitHub Actions"],
    createdAt: "2026-01-15T08:00:00.000Z", updatedAt: "2026-03-01T10:00:00.000Z",
    usedInDrives: 2, type: "Practical",
  },
  {
    _id: "a006", title: "TypeScript Mastery", category: "Frontend",
    status: "Published", visibility: "Public",
    mcqCount: 22, codeCount: 10, duration: 100,
    totalMarks: 94, passingScore: 60,
    totalAttempts: 73, avgScore: 75, topScore: 97, passRate: 68,
    difficulty: "Medium", tags: ["TypeScript", "Generics", "Types"],
    createdAt: "2026-04-01T12:00:00.000Z", updatedAt: "2026-05-08T10:00:00.000Z",
    usedInDrives: 4, type: "Technical",
  },
];

// ── helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  Published: { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25", dot: "#4ade80", Icon: PlayCircle },
  Draft:     { cls: "bg-white/10 text-white/40 border border-white/10",                dot: "#6b7280", Icon: Edit3 },
  Archived:  { cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25",       dot: "#fbbf24", Icon: PauseCircle },
};
const DIFF_STYLE = {
  Easy:   { cls: "text-emerald-400", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)" },
  Medium: { cls: "text-amber-400",   bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)" },
  Hard:   { cls: "text-rose-400",    bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
};
const TAG_COLORS = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f59e0b","#10b981","#0ea5e9"];
const tagColor   = (s) => TAG_COLORS[s.charCodeAt(0) % TAG_COLORS.length];
const fmt        = (iso) => new Date(iso).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" });
const scoreColor = (s) => s >= 85 ? "#4ade80" : s >= 65 ? "#facc15" : s > 0 ? "#f87171" : "#374151";

// ── MiniBar ────────────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color }) => (
  <div className="h-1 rounded-full overflow-hidden w-full" style={{ background:"rgba(255,255,255,0.06)" }}>
    <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
      transition={{ duration:0.9, ease:"easeOut" }}
      className="h-full rounded-full" style={{ background:color }} />
  </div>
);

// ── Circular progress ──────────────────────────────────────────────────────────
const CircleStat = ({ value, color, size = 52, stroke = 5 }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration:1, ease:"easeOut" }} />
    </svg>
  );
};

// ── Assessment Card ────────────────────────────────────────────────────────────
const AssessmentCard = ({ assessment: a, onClick }) => {
  const st   = STATUS_STYLE[a.status] ?? STATUS_STYLE.Draft;
  const diff = DIFF_STYLE[a.difficulty] ?? DIFF_STYLE.Medium;
  const accent = tagColor(a.title);

  return (
    <motion.div layout
      initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
      whileHover={{ y:-2, transition:{ duration:0.18 } }}
      onClick={onClick}
      className="rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer group"
      style={{ background:"rgba(255,255,255,0.025)" }}>
      <div className="h-[3px]" style={{ background:`linear-gradient(90deg,${accent},${accent}55,transparent)` }} />
      <div className="p-5 space-y-4">
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background:`${accent}18`, border:`1px solid ${accent}35` }}>
              <ClipboardList size={15} style={{ color:accent }} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight group-hover:text-indigo-200 transition line-clamp-1">{a.title}</p>
              <p className="text-white/30 text-[10px] mt-0.5">{a.category} · {a.type}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shrink-0 ${st.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background:st.dot }} />
            {a.status}
          </span>
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label:"Questions", val: a.mcqCount + a.codeCount, Icon: CheckSquare },
            { label:"Duration",  val: `${a.duration}m`,         Icon: Timer },
            { label:"Attempts",  val: a.totalAttempts,           Icon: Users },
          ].map((s,i) => (
            <div key={i} className="rounded-xl p-2.5 border border-white/[0.05] flex flex-col gap-1"
              style={{ background:"rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-1 text-white/25">
                <s.Icon size={10}/><p className="text-[9px] uppercase tracking-wider">{s.label}</p>
              </div>
              <p className="text-white font-bold text-sm">{s.val}</p>
            </div>
          ))}
        </div>

        {/* score + pass rate */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center shrink-0">
            <CircleStat value={a.passRate} color={scoreColor(a.passRate)} size={48} stroke={4} />
            <div className="absolute text-center">
              <p className="text-white font-bold text-[11px] leading-none">{a.passRate || "—"}{a.passRate ? "%" : ""}</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-white/30 text-[10px]">Avg Score</span>
              <span className="font-semibold text-[11px]" style={{ color:scoreColor(a.avgScore) }}>{a.avgScore || "—"}</span>
            </div>
            <MiniBar pct={a.avgScore} color={scoreColor(a.avgScore)} />
            <span className="text-white/20 text-[9px]">Pass rate</span>
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
              style={{ background:diff.bg, borderColor:diff.border, color:diff.cls.replace("text-","") }}>
              {a.difficulty}
            </span>
            {a.visibility === "Private"
              ? <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/30 flex items-center gap-1"><Lock size={9}/> Private</span>
              : <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/30 flex items-center gap-1"><Globe size={9}/> Public</span>}
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            {a.usedInDrives > 0 && (
              <span className="text-indigo-400/70">{a.usedInDrives} drive{a.usedInDrives > 1 ? "s" : ""}</span>
            )}
            <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Detail Drawer ──────────────────────────────────────────────────────────────
const AssessmentDrawer = ({ assessment: a, onClose }) => {
  const [tab, setTab] = useState("overview");
  if (!a) return null;
  const st   = STATUS_STYLE[a.status] ?? STATUS_STYLE.Draft;
  const diff = DIFF_STYLE[a.difficulty] ?? DIFF_STYLE.Medium;

  return (
    <AnimatePresence>
      <motion.div key="ov" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.aside key="dr"
        initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
        transition={{ type:"spring", damping:28, stiffness:260 }}
        className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col border-l border-white/8 overflow-y-auto"
        style={{ background:"rgba(10,8,22,0.99)" }}
        onClick={e => e.stopPropagation()}>

        {/* sticky header */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/6"
          style={{ background:"rgba(10,8,22,0.96)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${tagColor(a.title)}22`, border:`1px solid ${tagColor(a.title)}40` }}>
                <ClipboardList size={16} style={{ color: tagColor(a.title) }} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">{a.title}</p>
                <p className="text-white/35 text-[11px] mt-0.5">{a.category} · {a.type}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
              <X size={15} />
            </button>
          </div>
          <div className="flex gap-1 mt-4">
            {["overview","questions","drives"].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition border ${tab===t
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "text-white/35 border-transparent hover:text-white/60"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">
          {tab === "overview" && (<>
            {/* score cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label:"Total Attempts", val: a.totalAttempts, Icon: Users,       color:"#818cf8" },
                { label:"Avg Score",      val: a.avgScore||"—", Icon: BarChart2,   color: scoreColor(a.avgScore) },
                { label:"Top Score",      val: a.topScore||"—", Icon: Star,        color:"#fbbf24" },
                { label:"Pass Rate",      val: a.passRate ? `${a.passRate}%` : "—", Icon: TrendingUp, color: scoreColor(a.passRate) },
              ].map((item,i) => (
                <div key={i} className="rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                  style={{ background:"rgba(255,255,255,0.025)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background:`${item.color}18`, border:`1px solid ${item.color}35` }}>
                    <item.Icon size={14} style={{ color:item.color }} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base leading-none">{item.val}</p>
                    <p className="text-white/30 text-[10px] mt-0.5">{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* pass rate bar */}
            <div className="rounded-xl p-4 border border-white/5" style={{ background:"rgba(255,255,255,0.02)" }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">Pass Rate</p>
                <span className="text-white font-bold text-sm">{a.passRate}%</span>
              </div>
              <MiniBar pct={a.passRate} color={scoreColor(a.passRate)} />
            </div>

            {/* details */}
            <section>
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Assessment Details</p>
              <div className="space-y-2.5">
                {[
                  { Icon: st.Icon,       label:"Status",       val: a.status,     color: a.status==="Published"?"#4ade80":a.status==="Archived"?"#fbbf24":"#6b7280" },
                  { Icon: Globe,         label:"Visibility",   val: a.visibility },
                  { Icon: Timer,         label:"Duration",     val: `${a.duration} min` },
                  { Icon: CheckSquare,   label:"MCQ Count",    val: a.mcqCount },
                  { Icon: Code2,         label:"Code Count",   val: a.codeCount },
                  { Icon: BookOpen,      label:"Total Marks",  val: a.totalMarks },
                  { Icon: TrendingUp,    label:"Passing Score",val: `${a.passingScore}%` },
                  { Icon: Clock,         label:"Last Updated", val: fmt(a.updatedAt) },
                ].map(({ Icon,label,val,color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
                      <Icon size={12} className="text-indigo-400" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <p className="text-white/35 text-[11px]">{label}</p>
                      <p className="text-xs font-medium" style={{ color:color||"rgba(255,255,255,0.65)" }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* tags */}
            <section>
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Difficulty & Tags</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                  style={{ background:DIFF_STYLE[a.difficulty]?.bg, borderColor:DIFF_STYLE[a.difficulty]?.border, color:DIFF_STYLE[a.difficulty]?.cls.replace("text-","") }}>
                  {a.difficulty}
                </span>
                {a.tags.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                    style={{ background:"rgba(99,102,241,0.1)", borderColor:"rgba(99,102,241,0.25)", color:"#a5b4fc" }}>
                    {t}
                  </span>
                ))}
              </div>
            </section>
          </>)}

          {tab === "questions" && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-indigo-500/15 p-4 space-y-3"
                style={{ background:"rgba(99,102,241,0.05)" }}>
                <div className="flex items-center gap-2 pb-2 border-b border-indigo-500/10">
                  <CheckSquare size={13} className="text-indigo-400" />
                  <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">MCQ Questions</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Count</span>
                  <span className="text-white font-bold">{a.mcqCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Marks each</span>
                  <span className="text-white font-bold">{a.totalMarks > 0 ? Math.round((a.totalMarks - a.codeCount * 5) / (a.mcqCount || 1)) : "—"}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-purple-500/15 p-4 space-y-3"
                style={{ background:"rgba(139,92,246,0.05)" }}>
                <div className="flex items-center gap-2 pb-2 border-b border-purple-500/10">
                  <Code2 size={13} className="text-purple-400" />
                  <p className="text-purple-300 text-[11px] font-bold uppercase tracking-widest">Coding Questions</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Count</span>
                  <span className="text-white font-bold">{a.codeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50 text-xs">Total code marks</span>
                  <span className="text-white font-bold">{a.codeCount * 5}</span>
                </div>
              </div>
              <div className="rounded-xl p-3.5 border border-indigo-500/20 flex items-center gap-3"
                style={{ background:"rgba(99,102,241,0.08)" }}>
                <Sparkles size={14} className="text-indigo-400 shrink-0" />
                <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label:"Total Qs",    val: a.mcqCount + a.codeCount },
                    { label:"Total Marks", val: a.totalMarks },
                    { label:"Pass at",     val: `${a.passingScore}%` },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-white font-bold text-sm">{s.val}</p>
                      <p className="text-white/30 text-[10px]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "drives" && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
                <Zap size={20} className="text-indigo-400" />
              </div>
              <p className="text-white font-semibold text-sm">Used in {a.usedInDrives} drive{a.usedInDrives !== 1 ? "s" : ""}</p>
              <p className="text-white/30 text-xs max-w-[220px]">Navigate to Drives to see which drives use this assessment.</p>
              <button className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition">
                View Drives <ArrowUpRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* sticky footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
          style={{ background:"rgba(10,8,22,0.96)" }}>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
            <Copy size={13} /> Duplicate
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
            style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Edit3 size={13} /> Edit
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminAssessments = () => {
  const [assessments, setAssessments] = useState(INITIAL_ASSESSMENTS);
  const [search, setSearch]           = useState("");
  const [filterStatus, setStatus]     = useState("All");
  const [sortBy, setSortBy]           = useState("date");
  const [viewMode, setViewMode]       = useState("grid");
  const [selected, setSelected]       = useState(null);

  const statuses = ["All","Published","Draft","Archived"];

  const filtered = assessments
    .filter(a => {
      const q = search.toLowerCase();
      const matchQ = !q || a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q) || a.tags.some(t=>t.toLowerCase().includes(q));
      return matchQ && (filterStatus==="All" || a.status===filterStatus);
    })
    .sort((a,b) => {
      if (sortBy==="score")    return b.avgScore - a.avgScore;
      if (sortBy==="attempts") return b.totalAttempts - a.totalAttempts;
      if (sortBy==="pass")     return b.passRate - a.passRate;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const totalPublished = assessments.filter(a=>a.status==="Published").length;
  const totalAttempts  = assessments.reduce((s,a)=>s+a.totalAttempts, 0);
  const scoredA        = assessments.filter(a=>a.avgScore>0);
  const avg            = scoredA.length ? Math.round(scoredA.reduce((s,a)=>s+a.avgScore,0)/scoredA.length) : 0;
  const avgPass        = scoredA.length ? Math.round(scoredA.reduce((s,a)=>s+a.passRate,0)/scoredA.length) : 0;

  return (
    <>
      <div className="w-full flex flex-col space-y-4">

        {/* page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ClipboardList size={15} className="text-indigo-400"/>
              <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">Assessments</p>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Assessment Library</h2>
            <p className="text-white/35 text-xs mt-0.5">{assessments.length} assessments · {totalAttempts} total attempts</p>
          </div>
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            <Plus size={13}/> New Assessment
          </motion.button>
        </div>

        {/* summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label:"Total",      value: assessments.length, color:"#818cf8", Icon: Layers },
            { label:"Published",  value: totalPublished,     color:"#4ade80", Icon: CheckCircle2 },
            { label:"Avg Score",  value: avg||"—",           color:"#facc15", Icon: Star },
            { label:"Pass Rate",  value: avgPass ? `${avgPass}%` : "—", color:"#38bdf8", Icon: TrendingUp },
          ].map((s,i) => (
            <motion.div key={i} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
              className="rounded-2xl p-3 border border-white/5 flex items-center gap-3"
              style={{ background:"rgba(255,255,255,0.025)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background:`${s.color}18`, border:`1px solid ${s.color}35` }}>
                <s.Icon size={16} style={{ color:s.color }}/>
              </div>
              <div>
                <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search assessments, categories, tags…"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/25 border border-white/6 outline-none focus:border-indigo-500/40 transition"
              style={{ background:"rgba(255,255,255,0.04)" }}/>
            {search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"><X size={12}/></button>}
          </div>
          <div className="flex items-center gap-1.5">
            {statuses.map(s=>(
              <button key={s} onClick={()=>setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border ${filterStatus===s
                  ?"bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  :"text-white/35 border-white/6 hover:bg-white/4 hover:text-white/60"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="relative">
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer"
              style={{ background:"rgba(255,255,255,0.04)" }}>
              <option value="date">Sort: Date</option>
              <option value="score">Sort: Avg Score</option>
              <option value="attempts">Sort: Attempts</option>
              <option value="pass">Sort: Pass Rate</option>
            </select>
            <SlidersHorizontal size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"/>
          </div>
          <div className="flex gap-1 p-1 rounded-xl border border-white/6" style={{ background:"rgba(255,255,255,0.03)" }}>
            {[{key:"grid",Icon:Layers},{key:"table",Icon:BarChart2}].map(({key,Icon})=>(
              <button key={key} onClick={()=>setViewMode(key)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${viewMode===key?"bg-indigo-500/25 text-indigo-300":"text-white/25 hover:text-white/60"}`}>
                <Icon size={13}/>
              </button>
            ))}
          </div>
        </div>

        {/* content */}
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div key="grid" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.length === 0
                ? <div className="col-span-full flex flex-col items-center py-16 text-white/20 gap-2"><AlertCircle size={28}/><p className="text-sm">No assessments match your filters.</p></div>
                : filtered.map(a => <AssessmentCard key={a._id} assessment={a} onClick={()=>setSelected(a)}/>)}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ background:"rgba(255,255,255,0.025)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/30 border-b border-white/5">
                    {["Assessment","Status","Questions","Attempts","Avg Score","Pass Rate","Difficulty",""].map(h=>(
                      <th key={h} className="text-left px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={8} className="px-5 py-12 text-center text-white/25">No assessments match your filters.</td></tr>
                    : filtered.map((a,i) => {
                      const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.Draft;
                      const df = DIFF_STYLE[a.difficulty] ?? DIFF_STYLE.Medium;
                      return (
                        <motion.tr key={a._id}
                          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                          onClick={()=>setSelected(a)}
                          className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background:`${tagColor(a.title)}18`, border:`1px solid ${tagColor(a.title)}35` }}>
                                <ClipboardList size={12} style={{ color:tagColor(a.title) }}/>
                              </div>
                              <div>
                                <p className="text-white font-semibold">{a.title}</p>
                                <p className="text-white/30 text-[10px] mt-0.5">{a.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${st.cls}`}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background:st.dot }}/>{a.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-white/60">{a.mcqCount + a.codeCount}</td>
                          <td className="px-5 py-3.5 text-white/60">{a.totalAttempts}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold" style={{ color:scoreColor(a.avgScore) }}>{a.avgScore||"—"}</span>
                              {a.avgScore>0&&<div className="w-12"><MiniBar pct={a.avgScore} color={scoreColor(a.avgScore)}/></div>}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-white/50">{a.passRate||"—"}{a.passRate?"%":""}</span>
                              {a.passRate>0&&<div className="w-12"><MiniBar pct={a.passRate} color="#818cf8"/></div>}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                              style={{ background:df.bg, borderColor:df.border, color:df.cls.replace("text-","") }}>
                              {a.difficulty}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all"/>
                          </td>
                        </motion.tr>
                      );
                    })}
                </tbody>
              </table>
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-white/25 text-[11px]">Showing {filtered.length} of {assessments.length} assessments</p>
                <button className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition">
                  Export CSV <Download size={11}/>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AssessmentDrawer assessment={selected} onClose={()=>setSelected(null)} />
      </div>
    </>
  );
};

export default AdminAssessments;