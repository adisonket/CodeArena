import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Search, Plus, ChevronRight, Calendar, Users, BarChart2,
    X, Eye, Edit3, CheckCircle2, PauseCircle, PlayCircle, AlertCircle,
    Download, ChevronDown, SlidersHorizontal, Code2, Star, ArrowUpRight,
    Lock, Globe, Layers, Timer, Trophy, ClipboardList, FileText,
    Briefcase, AlignLeft, CheckSquare, Sparkles, Gauge,
} from "lucide-react";

// ── mock data ──────────────────────────────────────────────────────────────────
const INITIAL_DRIVES = [
    {
        _id: "d001", title: "Senior ML Engineer", tag: "Engineering", status: "Active", visibility: "Private",
        startDate: "2026-05-01T00:00:00.000Z", endDate: "2026-05-25T00:00:00.000Z",
        totalCandidates: 24, attempted: 18, avgScore: 81, topScore: 96,
        duration: 90, questionCount: 32, mcqCount: 20, codeCount: 12,
        marksPerMcq: 2, marksPerCode: 5, type: "Assessment",
        createdAt: "2026-04-20T10:00:00.000Z", difficulty: "Hard",
        tags: ["Python", "ML", "System Design"], completionRate: 75,
    },
    {
        _id: "d002", title: "Frontend Dev Q2", tag: "Design & Dev", status: "Active", visibility: "Public",
        startDate: "2026-04-28T00:00:00.000Z", endDate: "2026-06-01T00:00:00.000Z",
        totalCandidates: 41, attempted: 29, avgScore: 74, topScore: 91,
        duration: 60, questionCount: 25, mcqCount: 18, codeCount: 7,
        marksPerMcq: 1, marksPerCode: 4, type: "Assessment",
        createdAt: "2026-04-10T09:00:00.000Z", difficulty: "Medium",
        tags: ["React", "CSS", "TypeScript"], completionRate: 71,
    },
    {
        _id: "d003", title: "DevOps Engineer", tag: "Infrastructure", status: "Completed", visibility: "Private",
        startDate: "2026-03-10T00:00:00.000Z", endDate: "2026-04-10T00:00:00.000Z",
        totalCandidates: 17, attempted: 17, avgScore: 68, topScore: 88,
        duration: 75, questionCount: 28, mcqCount: 20, codeCount: 8,
        marksPerMcq: 1, marksPerCode: 5, type: "Assessment",
        createdAt: "2026-03-01T08:00:00.000Z", difficulty: "Hard",
        tags: ["Kubernetes", "AWS", "Terraform"], completionRate: 100,
    },
    {
        _id: "d004", title: "Data Scientist", tag: "Analytics", status: "Completed", visibility: "Private",
        startDate: "2026-03-01T00:00:00.000Z", endDate: "2026-04-01T00:00:00.000Z",
        totalCandidates: 33, attempted: 33, avgScore: 85, topScore: 98,
        duration: 120, questionCount: 40, mcqCount: 28, codeCount: 12,
        marksPerMcq: 2, marksPerCode: 6, type: "Assessment",
        createdAt: "2026-02-20T11:00:00.000Z", difficulty: "Hard",
        tags: ["Python", "PyTorch", "SQL"], completionRate: 100,
    },
    {
        _id: "d005", title: "QA Specialist", tag: "Quality", status: "On-Hold", visibility: "Public",
        startDate: "2026-05-15T00:00:00.000Z", endDate: "2026-06-15T00:00:00.000Z",
        totalCandidates: 12, attempted: 0, avgScore: 0, topScore: 0,
        duration: 45, questionCount: 20, mcqCount: 15, codeCount: 5,
        marksPerMcq: 1, marksPerCode: 3, type: "Quiz",
        createdAt: "2026-05-08T14:00:00.000Z", difficulty: "Easy",
        tags: ["Selenium", "Jest", "Postman"], completionRate: 0,
    },
    {
        _id: "d006", title: "Backend Engineer – Node", tag: "Engineering", status: "Draft", visibility: "Private",
        startDate: "2026-06-01T00:00:00.000Z", endDate: "2026-07-01T00:00:00.000Z",
        totalCandidates: 0, attempted: 0, avgScore: 0, topScore: 0,
        duration: 90, questionCount: 35, mcqCount: 22, codeCount: 13,
        marksPerMcq: 2, marksPerCode: 5, type: "Assessment",
        createdAt: "2026-05-11T16:00:00.000Z", difficulty: "Medium",
        tags: ["Node.js", "PostgreSQL", "Redis"], completionRate: 0,
    },
];

// ── helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
    Active:    { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25", dot: "#4ade80", Icon: PlayCircle },
    Completed: { cls: "bg-sky-500/15 text-sky-400 border border-sky-500/25",             dot: "#38bdf8", Icon: CheckCircle2 },
    "On-Hold": { cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25",       dot: "#fbbf24", Icon: PauseCircle },
    Draft:     { cls: "bg-white/10 text-white/40 border border-white/10",                dot: "#6b7280", Icon: Edit3 },
};
const DIFF_STYLE = {
    Easy:         { cls: "text-emerald-400", bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)" },
    Intermediate: { cls: "text-amber-400",   bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)" },
    Medium:       { cls: "text-amber-400",   bg: "rgba(251,191,36,0.08)",  border: "rgba(251,191,36,0.2)" },
    Hard:         { cls: "text-rose-400",    bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
};
const TAG_COLORS = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f59e0b","#10b981","#0ea5e9"];
const tagColor   = (s) => TAG_COLORS[s.charCodeAt(0) % TAG_COLORS.length];
const fmt        = (iso) => new Date(iso).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" });
const scoreColor = (s) => s >= 85 ? "#4ade80" : s >= 70 ? "#facc15" : s > 0 ? "#f87171" : "#374151";
const daysLeft   = (end) => { const d = Math.ceil((new Date(end) - Date.now()) / 86400000); return d > 0 ? `${d}d left` : "Ended"; };

// ── Shared form sub-components ─────────────────────────────────────────────────
const FIELD_BG = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" };

const Field = ({ label, icon: Icon, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
            {Icon && <Icon size={10} className="text-indigo-400" />}
            {label}
        </label>
        {children}
        {error && <p className="text-[10px] text-rose-400 mt-0.5">{error}</p>}
    </div>
);

const TInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    error,
    ...rest
  }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`
        w-full px-3 py-2.5 rounded-xl text-xs
        bg-white/[0.04]
        text-white/80
        placeholder-white/20
        outline-none transition
        border
        appearance-none
        [&::-webkit-calendar-picker-indicator]:opacity-100
        [&::-webkit-calendar-picker-indicator]:cursor-pointer
        [&::-webkit-calendar-picker-indicator]:invert
        ${
          error
            ? "border-rose-500/50 focus:border-rose-500/70"
            : "border-white/8 focus:border-indigo-500/50"
        }
      `}
      {...rest}
    />
  );

const SInput = ({ value, onChange, children, error }) => (
    <div className="relative">
        <select value={value} onChange={onChange}
            className={`w-full appearance-none px-3 py-2.5 pr-8 rounded-xl text-xs outline-none cursor-pointer transition
                ${error ? "border border-rose-500/50" : "border border-white/8 focus:border-indigo-500/50"}`}
            style={{ ...FIELD_BG, color:"rgba(255,255,255,0.75)" }}>
            {children}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
);

// ── MiniBar ────────────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color }) => (
    <div className="h-1 rounded-full overflow-hidden w-full" style={{ background:"rgba(255,255,255,0.06)" }}>
        <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
            transition={{ duration:0.9, ease:"easeOut" }}
            className="h-full rounded-full" style={{ background:color }} />
    </div>
);

// ── Create Drive Modal ─────────────────────────────────────────────────────────
const EMPTY = {
    title:"", tag:"", type:"Assessment", startDate:"", endDate:"",
    difficulty:"Intermediate", duration:"", visibility:"Private",
    mcqCount:"", codeCount:"", marksPerMcq:"", marksPerCode:"",
};

const CreateDriveModal = ({ onClose, onSave }) => {
    const [form, setForm]     = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [step, setStep]     = useState(1);
    const [saving, setSaving] = useState(false);
    const [done, setDone]     = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const validate1 = () => {
        const e = {};
        if (!form.title.trim()) e.title = "Position name is required";
        if (!form.tag.trim())   e.tag   = "Category is required";
        if (!form.startDate)    e.startDate = "Start date required";
        if (!form.endDate)      e.endDate   = "End date required";
        if (form.startDate && form.endDate && form.endDate <= form.startDate)
            e.endDate = "End must be after start";
        if (!form.duration || isNaN(form.duration) || +form.duration <= 0)
            e.duration = "Enter a valid duration";
        return e;
    };
    const validate2 = () => {
        const e = {};
        if (form.mcqCount === "" || isNaN(form.mcqCount) || +form.mcqCount < 0)  e.mcqCount  = "Enter MCQ count";
        if (form.codeCount === "" || isNaN(form.codeCount) || +form.codeCount < 0) e.codeCount = "Enter code Q count";
        if ((+form.mcqCount||0) + (+form.codeCount||0) === 0) e.mcqCount = "Add at least 1 question";
        if (!form.marksPerMcq  || isNaN(form.marksPerMcq))  e.marksPerMcq  = "Required";
        if (!form.marksPerCode || isNaN(form.marksPerCode)) e.marksPerCode = "Required";
        return e;
    };

    const handleNext = () => {
        const e = validate1();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({}); setStep(2);
    };
    const handleSave = async () => {
        const e = validate2();
        if (Object.keys(e).length) { setErrors(e); return; }
        setSaving(true);
        await new Promise(r => setTimeout(r, 800));
        const d = {
            _id: `d${Date.now()}`, title: form.title.trim(), tag: form.tag.trim(),
            status:"Draft", visibility:form.visibility, type:form.type,
            startDate: new Date(form.startDate).toISOString(),
            endDate:   new Date(form.endDate).toISOString(),
            totalCandidates:0, attempted:0, avgScore:0, topScore:0,
            duration:+form.duration,
            questionCount: +form.mcqCount + +form.codeCount,
            mcqCount:+form.mcqCount, codeCount:+form.codeCount,
            marksPerMcq:+form.marksPerMcq, marksPerCode:+form.marksPerCode,
            createdAt: new Date().toISOString(), difficulty:form.difficulty,
            tags:[], completionRate:0,
        };
        setSaving(false); setDone(true);
        await new Promise(r => setTimeout(r, 900));
        onSave(d); onClose();
    };

    const totalQs    = (+form.mcqCount||0) + (+form.codeCount||0);
    const totalMarks = (+form.mcqCount||0)*(+form.marksPerMcq||0) + (+form.codeCount||0)*(+form.marksPerCode||0);

    return (
        <motion.div key="modal-bd"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }}
            onClick={onClose}>

            <motion.div
                initial={{ opacity:0, scale:0.93, y:20 }}
                animate={{ opacity:1, scale:1,    y:0 }}
                exit={{   opacity:0, scale:0.93, y:20 }}
                transition={{ type:"spring", damping:26, stiffness:280 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-[520px] rounded-3xl border border-white/[0.07] flex flex-col overflow-hidden"
                style={{ background:"rgba(11,8,24,0.99)", boxShadow:"0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)" }}>

                {/* top accent line */}
                <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7,transparent)" }} />

                {/* header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)" }}>
                            {done
                                ? <CheckCircle2 size={16} className="text-emerald-400" />
                                : <Zap size={16} className="text-indigo-400" />}
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-tight">
                                {done ? "Drive Created!" : "Create New Drive"}
                            </p>
                            <p className="text-white/30 text-[11px] mt-0.5">
                                {done ? "Adding to your drives list…"
                                    : step === 1 ? "Step 1 of 2 — Basic Info"
                                    : "Step 2 of 2 — Questions & Scoring"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/6 transition">
                        <X size={15} />
                    </button>
                </div>

                {/* step bar */}
                <div className="px-6 mb-1">
                    <div className="flex items-center gap-2">
                        {[1,2].map(s => (
                            <React.Fragment key={s}>
                                <div className={`flex items-center gap-1.5 text-[10px] font-semibold transition ${step >= s ? "text-indigo-300" : "text-white/20"}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold transition border
                                        ${step > s  ? "bg-indigo-500 border-indigo-400 text-white"
                                        : step === s ? "border-indigo-500/70 text-indigo-300 bg-indigo-500/10"
                                        : "border-white/10 text-white/20"}`} style={{ fontSize:10 }}>
                                        {step > s ? <CheckCircle2 size={10}/> : s}
                                    </div>
                                    {s === 1 ? "Basic Info" : "Questions"}
                                </div>
                                {s < 2 && <div className={`flex-1 h-px transition ${step > s ? "bg-indigo-500/50" : "bg-white/8"}`} />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* scrollable body */}
                <div className="px-6 pb-2 overflow-y-auto max-h-[440px]"
                    style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(99,102,241,0.2) transparent" }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 1 */}
                        {step === 1 && (
                            <motion.div key="s1"
                                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                                transition={{ duration:0.18 }} className="space-y-4 py-4">

                                <Field label="Position Name" icon={Briefcase} error={errors.title}>
                                    <TInput value={form.title} onChange={set("title")}
                                        placeholder="e.g. Senior React Engineer" error={errors.title} />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Category" icon={AlignLeft} error={errors.tag}>
                                        <TInput value={form.tag} onChange={set("tag")}
                                            placeholder="e.g. Engineering" error={errors.tag} />
                                    </Field>
                                    <Field label="Drive Type" icon={FileText}>
                                        <SInput value={form.type} onChange={set("type")}>
                                            <option>Assessment</option>
                                            <option>Interview</option>
                                        </SInput>
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Start Date" icon={Calendar} error={errors.startDate}>
                                        <TInput type="datetime-local" value={form.startDate} onChange={set("startDate")} error={errors.startDate} />
                                    </Field>
                                    <Field label="End Date" icon={Calendar} error={errors.endDate}>
                                        <TInput type="datetime-local" value={form.endDate} onChange={set("endDate")} error={errors.endDate} />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-3 ">
                                    <Field label="Difficulty" icon={Gauge}>
                                        <SInput value={form.difficulty} onChange={set("difficulty")}>
                                            <option >Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </SInput>
                                    </Field>
                                    <Field label="Duration (min)" icon={Timer} error={errors.duration}>
                                        <TInput type="number" value={form.duration} onChange={set("duration")}
                                            placeholder="e.g. 90" error={errors.duration} min="1" />
                                    </Field>
                                </div>

                            </motion.div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <motion.div key="s2"
                                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                                transition={{ duration:0.18 }} className="space-y-4 py-4">

                                {/* MCQ section */}
                                <div className="rounded-2xl border border-indigo-500/15 p-4 space-y-3"
                                    style={{ background:"rgba(99,102,241,0.05)" }}>
                                    <div className="flex items-center gap-2 pb-1 border-b border-indigo-500/10">
                                        <CheckSquare size={13} className="text-indigo-400" />
                                        <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">MCQ Questions</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Number of MCQs" error={errors.mcqCount}>
                                            <TInput type="number" value={form.mcqCount} onChange={set("mcqCount")}
                                                placeholder="e.g. 20" error={errors.mcqCount} min="0" />
                                        </Field>
                                        <Field label="Marks per MCQ" error={errors.marksPerMcq}>
                                            <TInput type="number" value={form.marksPerMcq} onChange={set("marksPerMcq")}
                                                placeholder="e.g. 2" error={errors.marksPerMcq} min="0" />
                                        </Field>
                                    </div>
                                </div>

                                {/* Code section */}
                                <div className="rounded-2xl border border-purple-500/15 p-4 space-y-3"
                                    style={{ background:"rgba(139,92,246,0.05)" }}>
                                    <div className="flex items-center gap-2 pb-1 border-b border-purple-500/10">
                                        <Code2 size={13} className="text-purple-400" />
                                        <p className="text-purple-300 text-[11px] font-bold uppercase tracking-widest">Coding Questions</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Number of Code Qs" error={errors.codeCount}>
                                            <TInput type="number" value={form.codeCount} onChange={set("codeCount")}
                                                placeholder="e.g. 5" error={errors.codeCount} min="0" />
                                        </Field>
                                        <Field label="Marks per Code Q" error={errors.marksPerCode}>
                                            <TInput type="number" value={form.marksPerCode} onChange={set("marksPerCode")}
                                                placeholder="e.g. 10" error={errors.marksPerCode} min="0" />
                                        </Field>
                                    </div>
                                </div>

                                {/* live summary */}
                                <AnimatePresence>
                                    {totalQs > 0 && (
                                        <motion.div
                                            initial={{ opacity:0, y:8, scale:0.97 }}
                                            animate={{ opacity:1, y:0, scale:1 }}
                                            exit={{   opacity:0, y:4, scale:0.97 }}
                                            className="rounded-xl p-3.5 border border-indigo-500/20 flex items-center gap-3"
                                            style={{ background:"rgba(99,102,241,0.08)" }}>
                                            <Sparkles size={14} className="text-indigo-400 shrink-0" />
                                            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                                                {[
                                                    { label:"Total Qs",    val: totalQs },
                                                    { label:"Total Marks", val: totalMarks || "—" },
                                                    { label:"Duration",    val: form.duration ? `${form.duration}m` : "—" },
                                                ].map(s => (
                                                    <div key={s.label}>
                                                        <p className="text-white font-bold text-sm">{s.val}</p>
                                                        <p className="text-white/30 text-[10px]">{s.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* footer actions */}
                <div className="px-6 py-5 border-t border-white/6 flex gap-2.5">
                    {step === 1 ? (
                        <>
                            <button onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/35 hover:text-white hover:bg-white/5 transition">
                                Cancel
                            </button>
                            <button onClick={handleNext}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
                                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                                Next — Questions <ChevronRight size={13} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => { setErrors({}); setStep(1); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/35 hover:text-white hover:bg-white/5 transition">
                                ← Back
                            </button>
                            <button onClick={handleSave} disabled={saving||done}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-60"
                                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                                {done
                                    ? <><CheckCircle2 size={13}/> Created!</>
                                    : saving
                                    ? <><motion.div animate={{ rotate:360 }}
                                        transition={{ repeat:Infinity, duration:0.7, ease:"linear" }}
                                        className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white" /> Saving…</>
                                    : <><Zap size={13}/> Save Drive</>
                                }
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ── Detail Drawer ──────────────────────────────────────────────────────────────
const DriveDrawer = ({ drive, onClose }) => {
    if (!drive) return null;
    const st   = STATUS_STYLE[drive.status] ?? STATUS_STYLE.Draft;
    const diff = DIFF_STYLE[drive.difficulty] ?? DIFF_STYLE.Medium;
    const [tab, setTab] = useState("overview");

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

                <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/6"
                    style={{ background:"rgba(10,8,22,0.96)" }}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background:`${tagColor(drive.title)}22`, border:`1px solid ${tagColor(drive.title)}40` }}>
                                <Zap size={16} style={{ color: tagColor(drive.title) }} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{drive.title}</p>
                                <p className="text-white/35 text-[11px] mt-0.5">{drive.tag}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
                            <X size={15} />
                        </button>
                    </div>
                    <div className="flex gap-1 mt-4">
                        {["overview","candidates","settings"].map(t => (
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
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { label:"Candidates", val:drive.totalCandidates, Icon:Users,         color:"#818cf8" },
                                { label:"Attempted",  val:drive.attempted,       Icon:ClipboardList, color:"#4ade80" },
                                { label:"Avg Score",  val:drive.avgScore||"—",   Icon:BarChart2,     color:scoreColor(drive.avgScore) },
                                { label:"Top Score",  val:drive.topScore||"—",   Icon:Trophy,        color:"#fbbf24" },
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

                        <div className="rounded-xl p-4 border border-white/5" style={{ background:"rgba(255,255,255,0.02)" }}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">Completion</p>
                                <span className="text-white font-bold text-sm">{drive.completionRate}%</span>
                            </div>
                            <MiniBar pct={drive.completionRate} color={scoreColor(drive.completionRate)} />
                        </div>

                        <section>
                            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Drive Details</p>
                            <div className="space-y-2.5">
                                {[
                                    { Icon:st.Icon, label:"Status",    val:drive.status,
                                      color:drive.status==="Active"?"#4ade80":drive.status==="Completed"?"#38bdf8":drive.status==="On-Hold"?"#fbbf24":"#6b7280" },
                                    { Icon:Globe,   label:"Visibility",val:drive.visibility },
                                    { Icon:Timer,   label:"Duration",  val:`${drive.duration} min` },
                                    { Icon:Code2,   label:"Questions", val:`${drive.questionCount} total` },
                                    { Icon:Calendar,label:"Start",     val:fmt(drive.startDate) },
                                    { Icon:Calendar,label:"End",       val:fmt(drive.endDate) },
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

                        <section>
                            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Difficulty & Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                                    style={{ background:diff.bg, borderColor:diff.border, color:diff.cls.replace("text-","") }}>
                                    {drive.difficulty}
                                </span>
                                {drive.tags.map(t => (
                                    <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                                        style={{ background:"rgba(99,102,241,0.1)", borderColor:"rgba(99,102,241,0.25)", color:"#a5b4fc" }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </>)}

                    {tab === "candidates" && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
                                <Users size={20} className="text-indigo-400" />
                            </div>
                            <p className="text-white font-semibold text-sm">{drive.totalCandidates} candidates enrolled</p>
                            <p className="text-white/30 text-xs max-w-[220px]">View and manage from the Candidates section.</p>
                            <button className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition">
                                Open Candidates <ArrowUpRight size={12} />
                            </button>
                        </div>
                    )}

                    {tab === "settings" && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.2)" }}>
                                <Lock size={20} className="text-indigo-400" />
                            </div>
                            <p className="text-white font-semibold text-sm">Drive Settings</p>
                            <p className="text-white/30 text-xs max-w-[200px]">Configure proctoring, time limits, access and scoring.</p>
                            <button className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition">
                                Edit Settings <Edit3 size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
                    style={{ background:"rgba(10,8,22,0.96)" }}>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                        <Eye size={13} /> Preview
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                        style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        <Edit3 size={13} /> Edit Drive
                    </button>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
};

// ── DriveCard ──────────────────────────────────────────────────────────────────
const DriveCard = ({ drive, onClick }) => {
    const st   = STATUS_STYLE[drive.status] ?? STATUS_STYLE.Draft;
    const diff = DIFF_STYLE[drive.difficulty] ?? DIFF_STYLE.Medium;
    const accent = tagColor(drive.title);
    const isLive = drive.status === "Active";

    return (
        <motion.div layout
            initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }}
            whileHover={{ y:-2, transition:{ duration:0.18 } }}
            onClick={onClick}
            className="rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer group"
            style={{ background:"rgba(255,255,255,0.025)" }}>
            <div className="h-[3px]" style={{ background:`linear-gradient(90deg,${accent},${accent}55,transparent)` }} />
            <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background:`${accent}18`, border:`1px solid ${accent}35` }}>
                            <Zap size={15} style={{ color:accent }} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight group-hover:text-indigo-200 transition">{drive.title}</p>
                            <p className="text-white/30 text-[10px] mt-0.5">{drive.tag}</p>
                        </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shrink-0 ${st.cls}`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background:st.dot }} />
                        {drive.status}
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label:"Candidates", val:drive.totalCandidates, Icon:Users },
                        { label:"Questions",  val:drive.questionCount,   Icon:Code2 },
                        { label:"Duration",   val:`${drive.duration}m`,  Icon:Timer },
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

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-white/30 text-[10px]">Completion</span>
                        <span className="text-white/50 text-[11px] font-semibold">{drive.completionRate}%</span>
                    </div>
                    <MiniBar pct={drive.completionRate} color={scoreColor(drive.completionRate)} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            style={{ background:diff.bg, borderColor:diff.border, color:diff.cls.replace("text-","") }}>
                            {drive.difficulty}
                        </span>
                        {drive.visibility==="Private"
                            ? <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/30 flex items-center gap-1"><Lock size={9}/> Private</span>
                            : <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/30 flex items-center gap-1"><Globe size={9}/> Public</span>}
                    </div>
                    <div className="flex items-center gap-1 text-[10px]">
                        {isLive && <span className="text-amber-400 font-semibold">{daysLeft(drive.endDate)}</span>}
                        {!isLive && <span className="text-white/25">{fmt(drive.createdAt)}</span>}
                        <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AdminDrive = () => {
    const [drives, setDrives]           = useState(INITIAL_DRIVES);
    const [search, setSearch]           = useState("");
    const [filterStatus, setStatus]     = useState("All");
    const [sortBy, setSortBy]           = useState("date");
    const [viewMode, setViewMode]       = useState("grid");
    const [selected, setSelected]       = useState(null);
    const [showCreate, setShowCreate]   = useState(false);

    const statuses = ["All","Active","Completed","On-Hold","Draft"];

    const filtered = drives
        .filter(d => {
            const q = search.toLowerCase();
            const matchQ = !q || d.title.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q) || d.tags.some(t=>t.toLowerCase().includes(q));
            return matchQ && (filterStatus==="All" || d.status===filterStatus);
        })
        .sort((a,b) => {
            if (sortBy==="score")      return b.avgScore-a.avgScore;
            if (sortBy==="candidates") return b.totalCandidates-a.totalCandidates;
            return new Date(b.createdAt)-new Date(a.createdAt);
        });

    const active   = drives.filter(d=>d.status==="Active").length;
    const completed= drives.filter(d=>d.status==="Completed").length;
    const cands    = drives.reduce((s,d)=>s+d.totalCandidates,0);
    const scored   = drives.filter(d=>d.avgScore>0);
    const avg      = scored.length ? Math.round(scored.reduce((s,d)=>s+d.avgScore,0)/scored.length) : 0;

    return (
        <>
            <div className="w-full flex flex-col space-y-4">

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={15} className="text-indigo-400"/>
                            <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">Drives</p>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Assessment Drives</h2>
                        <p className="text-white/35 text-xs mt-0.5">{drives.length} drives · {cands} candidates enrolled</p>
                    </div>
                    <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
                        style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        <Plus size={13}/> Create Drive
                    </motion.button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label:"Total Drives", value:drives.length, color:"#818cf8", Icon:Layers },
                        { label:"Active",       value:active,        color:"#4ade80", Icon:PlayCircle },
                        { label:"Completed",    value:completed,     color:"#38bdf8", Icon:CheckCircle2 },
                        { label:"Avg Score",    value:avg||"—",      color:"#facc15", Icon:Star },
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

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"/>
                        <input value={search} onChange={e=>setSearch(e.target.value)}
                            placeholder="Search drives, tags, categories…"
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
                            <option value="candidates">Sort: Candidates</option>
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

                <AnimatePresence mode="wait">
                    {viewMode==="grid" ? (
                        <motion.div key="grid" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.length===0
                                ? <div className="col-span-full flex flex-col items-center py-16 text-white/20 gap-2"><AlertCircle size={28}/><p className="text-sm">No drives match your filters.</p></div>
                                : filtered.map(d=><DriveCard key={d._id} drive={d} onClick={()=>setSelected(d)}/>)}
                        </motion.div>
                    ) : (
                        <motion.div key="table" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            className="rounded-2xl border border-white/5 overflow-hidden"
                            style={{ background:"rgba(255,255,255,0.025)" }}>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-white/30 border-b border-white/5">
                                        {["Drive","Status","Candidates","Avg Score","Completion","Duration","Difficulty",""].map(h=>(
                                            <th key={h} className="text-left px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length===0
                                        ? <tr><td colSpan={8} className="px-5 py-12 text-center text-white/25">No drives match your filters.</td></tr>
                                        : filtered.map((d,i)=>{
                                            const st=STATUS_STYLE[d.status]??STATUS_STYLE.Draft;
                                            const df=DIFF_STYLE[d.difficulty]??DIFF_STYLE.Medium;
                                            return (
                                                <motion.tr key={d._id}
                                                    initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                                                    onClick={()=>setSelected(d)}
                                                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                                style={{ background:`${tagColor(d.title)}18`, border:`1px solid ${tagColor(d.title)}35` }}>
                                                                <Zap size={12} style={{ color:tagColor(d.title) }}/>
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-semibold">{d.title}</p>
                                                                <p className="text-white/30 text-[10px] mt-0.5">{d.tag}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${st.cls}`}>
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background:st.dot }}/>{d.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-white/60">{d.totalCandidates}</td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold" style={{ color:scoreColor(d.avgScore) }}>{d.avgScore||"—"}</span>
                                                            {d.avgScore>0&&<div className="w-12"><MiniBar pct={d.avgScore} color={scoreColor(d.avgScore)}/></div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white/50">{d.completionRate}%</span>
                                                            <div className="w-12"><MiniBar pct={d.completionRate} color="#818cf8"/></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-white/40 whitespace-nowrap">{d.duration}m</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                                                            style={{ background:df.bg, borderColor:df.border, color:df.cls.replace("text-","") }}>
                                                            {d.difficulty}
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
                                <p className="text-white/25 text-[11px]">Showing {filtered.length} of {drives.length} drives</p>
                                <button className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition">
                                    Export CSV <Download size={11}/>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <DriveDrawer drive={selected} onClose={()=>setSelected(null)}/>
            </div>

            <AnimatePresence>
                {showCreate && (
                    <CreateDriveModal onClose={()=>setShowCreate(false)} onSave={d=>setDrives(prev=>[d,...prev])}/>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminDrive;