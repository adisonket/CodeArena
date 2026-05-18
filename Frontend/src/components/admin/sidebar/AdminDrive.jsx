import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Search, Plus, ChevronRight, Calendar, Users, BarChart2,
    X, Eye, Edit3, CheckCircle2, PauseCircle, PlayCircle, AlertCircle,
    Download, ChevronDown, SlidersHorizontal, Code2, Star, ArrowUpRight,
    Lock, Globe, Layers, Timer, Trophy, ClipboardList, FileText,
    Briefcase, AlignLeft, CheckSquare, Sparkles, Gauge, Wand2, Bot,
    RefreshCw, ChevronLeft, Trash2, Check, AlertTriangle,
} from "lucide-react";
import axios from "axios";
import { useEffect } from "react";
import { CalendarDays } from "lucide-react";
import CreateDriveModal from "../drive/CreateDriveModal";
import { useSearchParams } from "react-router-dom";


// ── mock data ──────────────────────────────────────────────────────────────────
const INITIAL_DRIVES = [];

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
const tagColor = (s) => {

    if (!s || typeof s !== "string") {
        return TAG_COLORS[0];
    }

    return TAG_COLORS[
        s.charCodeAt(0) % TAG_COLORS.length
    ];
};
const fmt        = (iso) => new Date(iso).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" });
const scoreColor = (s) => s >= 85 ? "#4ade80" : s >= 70 ? "#facc15" : s > 0 ? "#f87171" : "#374151";
const daysLeft   = (end) => { const d = Math.ceil((new Date(end) - Date.now()) / 86400000); return d > 0 ? `${d}d left` : "Ended"; };

// ── Shared form sub-components ─────────────────────────────────────────────────
const FIELD_BG = { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)" };

/* Dark-themed global overrides injected once */
const DARK_INPUT_STYLE = `
  .dark-input, .dark-select {
    color-scheme: dark;
  }
  .dark-input::-webkit-calendar-picker-indicator {
    filter: invert(1) brightness(0.7);
    opacity: 0.6;
    cursor: pointer;
  }
  .dark-select option {
    background: #0f0d1f;
    color: rgba(255,255,255,0.8);
  }
`;

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
    icon: Icon,
    ...rest
}) => {
    const isDate = type === "datetime-local";

    return (
        <div className="relative">
            {Icon && (
                <Icon
                    size={15}
                    className={`absolute top-1/2 -translate-y-1/2 text-white/35 pointer-events-none z-10 ${
                        isDate ? "left-3" : "left-3"
                    }`}
                />
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`dark-input w-full ${
                    Icon ? "pl-10" : "pl-3"
                } ${
                    isDate ? "pr-10" : "pr-3"
                } py-2.5 rounded-xl text-xs text-white/80 placeholder-white/20 outline-none transition border ${
                    error
                        ? "border-rose-500/50 focus:border-rose-500/70"
                        : "border-white/8 focus:border-indigo-500/50"
                }`}
                {...rest}
            />

            {isDate && (
                <CalendarDays
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none"
                />
            )}
        </div>
    );
};

const SInput = ({ value, onChange, children, error }) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className={`dark-select w-full appearance-none px-3 py-2.5 pr-8 rounded-xl text-xs outline-none cursor-pointer transition ${
                error ? "border border-rose-500/50" : "border border-white/8 focus:border-indigo-500/50"
            }`}
            style={{ background:"rgba(8,6,18,0.85)", color:"rgba(255,255,255,0.75)", colorScheme:"dark" }}
        >
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

// ── AI Prompt suggestions ──────────────────────────────────────────────────────
const AI_SUGGESTIONS = [
    "Generate 20 MCQ questions on React hooks, closures, and async/await with varying difficulty levels.",
    "Create 5 coding problems covering data structures (arrays, trees, graphs) suitable for senior engineers.",
    "Write 15 aptitude questions on logical reasoning, number series, and probability for campus hiring.",
    "Generate questions testing REST API design, system design basics, and database normalization.",
    "Create a balanced question set covering DSA, OOP concepts, and problem-solving for intermediate developers.",
];

// ── Create Drive Modal ─────────────────────────────────────────────────────────
const EMPTY = {
    title:"", 
    tag:"", 
    type:"Assessment", 
    startDate:"", 
    endDate:"",
    difficulty:"Intermediate", 
    duration:"", 
    visibility:"Private",

    mcqCount:"",
    codeCount:"",

    marksPerMcq:"",
    marksPerCode:"",

    aiPrompt:"",

    emailTitle:"",
    emailBody:"",
};



// ── Detail Drawer ──────────────────────────────────────────────────────────────
const DriveDrawer = ({
    drive,
    onClose,
    onEdit,
}) => {
    if (!drive) return null;
    const st   = STATUS_STYLE[drive.status] ?? STATUS_STYLE.Draft;
    const diff = DIFF_STYLE[drive.difficulty] ?? DIFF_STYLE.Medium;
    const [tab, setTab] = useState("overview");
    const [candidates, setCandidates]   = useState([]);
    const [candLoading, setCandLoading] = useState(false);
    const [candError, setCandError]     = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [allCandidates, setAllCandidates] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [fetchingCandidates, setFetchingCandidates] = useState(false);    

    const fetchCandidates = async () => {

        try {
    
            setCandLoading(true);
    
            const res = await axios.get(
                `http://localhost:4000/api/drives/${drive._id}/candidates`
            );
    
            setCandidates(
                res.data.candidates ?? res.data
            );
    
        } catch (err) {
    
            setCandError(
                "Failed to load candidates."
            );
    
        } finally {
    
            setCandLoading(false);
        }
    };

    useEffect(() => {

        if (
            tab !== "candidates" ||
            !drive?._id
        ) return;
    
        fetchCandidates();
    
    }, [tab, drive?._id]);

    const fetchAllCandidates = async () => {
        try {
            setFetchingCandidates(true);
    
            const res = await axios.get(
                "http://localhost:4000/api/candidates",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
    
            const fetchedCandidates = Array.isArray(res.data)
                ? res.data
                : res.data.candidates || [];

            const assignedIds = candidates.map((c) => c._id);

            const availableCandidates = fetchedCandidates.filter(
                (candidate) => !assignedIds.includes(candidate._id)
            );

            setAllCandidates(availableCandidates);


        } catch (err) {
            console.error(err);
        } finally {
            setFetchingCandidates(false);
        }
    };

    const openAssignModal = async () => {

        setSelectedCandidates([]);
    
        setAllCandidates([]);
    
        setShowAssignModal(true);
    
        await fetchAllCandidates();
    };

    const toggleCandidate = (id) => {
        setSelectedCandidates((prev) =>
            prev.includes(id)
                ? prev.filter((c) => c !== id)
                : [...prev, id]
        );
    };

    const assignCandidatesToDrive = async () => {
        try {
            setAssignLoading(true);
    
            await axios.post(
                `http://localhost:4000/api/drives/${drive._id}/assign-candidates`,
                {
                    candidateIds: selectedCandidates,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
    
            setShowAssignModal(false);
            setSelectedCandidates([]);
            await fetchCandidates();
    
        } catch (err) {
            console.error(err);
        } finally {
            setAssignLoading(false);
        }
    };

    const deleteDrive = async () => {

        try {
    
            setDeleteLoading(true);
    
            await axios.delete(
                `http://localhost:4000/api/drives/${drive._id}`
            );
    
            setShowDeleteModal(false);
    
            onClose();
    
            window.location.reload();
    
        } catch (err) {
    
            console.error(err);
    
        } finally {
    
            setDeleteLoading(false);
        }
    };

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
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">
                                    Enrolled Candidates
                                </p>

                                {candidates.length > 0 && (
                                    <div className="flex items-center gap-3">

                                        <span className="text-white/25 text-[10px]">
                                            {candidates.length} total
                                        </span>

                                        <button
                                            onClick={openAssignModal}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition"
                                        >
                                            <Plus size={11} />
                                            Assign
                                        </button>

                                    </div>
                                )}
                            </div>
                            {candLoading && (
                                <div className="flex justify-center py-12">
                                    <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                                </div>
                            )}
                            {candError && !candLoading && (
                                <div className="flex flex-col items-center py-10 gap-2 text-center">
                                    <AlertCircle size={22} className="text-rose-400/60" />
                                    <p className="text-rose-400/70 text-xs">{candError}</p>
                                </div>
                            )}
                            {!candLoading && !candError && candidates.length === 0 && (
                                <div className="flex flex-col items-center py-14 gap-3 text-center">
                                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                                        style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.18)" }}>
                                        <Users size={18} className="text-indigo-400/60" />
                                    </div>
                                    <p className="text-white/40 text-sm font-semibold">No candidates enrolled yet</p>
                                    <p className="text-white/20 text-xs max-w-[220px]">Candidates will appear here once they join this drive.</p>

                                    <button
                                        onClick={openAssignModal}
                                        className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition"
                                    >
                                        <Plus size={12} />
                                        Assign Candidates
                                    </button>
                                    
                                </div>

                                
                            )}
                            {!candLoading && !candError && candidates.length > 0 && (
                                <div className="space-y-2">
                                    {candidates.map((c, i) => {
                                        const initials = `${c.firstName?.[0]??""}${c.lastName?.[0]??""}`.toUpperCase();
                                        const st = STATUS_STYLE[c.status] ?? STATUS_STYLE["Active"];
                                        const score = c.avgScore ?? c.score ?? null;
                                        return (
                                            <motion.div key={c._id ?? i}
                                                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                                                transition={{ delay: i * 0.035 }}
                                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-white/5 hover:border-indigo-500/20 hover:bg-white/[0.02] transition group"
                                                style={{ background:"rgba(255,255,255,0.018)" }}>
                                                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 text-[11px] font-bold text-white/70 border border-white/8"
                                                    style={{ background:"rgba(99,102,241,0.14)" }}>
                                                    {c?.picture ? (
                                                        <img src={c.picture.startsWith("http") ? c.picture : `http://localhost:4000${c.picture}`}
                                                            alt={`${c.firstName} ${c.lastName}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                                                    ) : (initials || <Users size={13} className="text-indigo-400" />)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white/85 text-xs font-semibold truncate">{c.firstName} {c.lastName}</p>
                                                    <p className="text-white/30 text-[10px] truncate">{c.email}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    {score !== null ? (
                                                        <><p className="text-xs font-bold" style={{ color:scoreColor(score) }}>{score}</p>
                                                        <p className="text-white/20 text-[9px]">score</p></>
                                                    ) : <p className="text-white/20 text-[10px]">—</p>}
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${st.cls}`}>
                                                    {c.status ?? "Enrolled"}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            <AnimatePresence>
                                {showAssignModal && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.96, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.96, y: 20 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-full max-w-2xl rounded-3xl border border-white/10 overflow-hidden"
                                            style={{
                                                background: "rgba(15,15,25,0.96)",
                                                backdropFilter: "blur(20px)",
                                            }}
                                        >

                                            {/* Header */}
                                            <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">

                                                <div>
                                                    <h3 className="text-white text-lg font-semibold">
                                                        Assign Candidates
                                                    </h3>

                                                    <p className="text-white/35 text-xs mt-1">
                                                        Select candidates to assign to this drive
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">

                                                    {allCandidates.length > 0 && (
                                                        <button
                                                            onClick={() => {

                                                                if (
                                                                    selectedCandidates.length === allCandidates.length
                                                                ) {

                                                                    setSelectedCandidates([]);

                                                                } else {

                                                                    setSelectedCandidates(
                                                                        allCandidates.map((c) => c._id)
                                                                    );
                                                                }
                                                            }}
                                                            className="px-3 py-2 rounded-xl border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold hover:bg-indigo-500/10 transition"
                                                        >
                                                            {selectedCandidates.length === allCandidates.length
                                                                ? "Deselect All"
                                                                : "Select All"}
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => setShowAssignModal(false)}
                                                        className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5"
                                                    >
                                                        ✕
                                                    </button>

                                                </div>
                                            </div>

                                            {/* Candidate List */}
                                            <div className="max-h-[420px] overflow-y-auto px-6 py-4 space-y-2">

                                                {fetchingCandidates ? (
                                                    <div className="flex justify-center py-12">
                                                        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                                                    </div>
                                                ) : (
                                                    allCandidates.map((candidate) => {

                                                        const selected = selectedCandidates.includes(candidate._id);

                                                        return (
                                                            <button
                                                                key={candidate._id}
                                                                onClick={() => toggleCandidate(candidate._id)}
                                                                className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition text-left
                                                                             ${selected
                                                                        ? "border-indigo-500/40 bg-indigo-500/10"
                                                                        : "border-white/6 hover:border-white/15 hover:bg-white/[0.03]"
                                                                    }`}
                                                            >

                                                                <div
                                                                    className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-xs font-bold text-white border border-white/10 shrink-0"
                                                                    style={{
                                                                        background: "rgba(99,102,241,0.18)",
                                                                    }}
                                                                >
                                                                    {candidate?.picture ? (
                                                                        <img
                                                                            src={
                                                                                candidate.picture.startsWith("http")
                                                                                    ? candidate.picture
                                                                                    : `http://localhost:4000${candidate.picture}`
                                                                            }
                                                                            alt={`${candidate.firstName} ${candidate.lastName}`}
                                                                            referrerPolicy="no-referrer"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <>
                                                                            {candidate.firstName?.[0]}
                                                                            {candidate.lastName?.[0]}
                                                                        </>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white/85 text-sm font-semibold truncate">
                                                                        {candidate.firstName} {candidate.lastName}
                                                                    </p>

                                                                    <p className="text-white/35 text-xs truncate">
                                                                        {candidate.email}
                                                                    </p>
                                                                </div>

                                                                <div
                                                                    className={`w-5 h-5 rounded-md border flex items-center justify-center
                                                                                ${selected
                                                                            ? "bg-indigo-500 border-indigo-400"
                                                                            : "border-white/20"
                                                                        }`}
                                                                >
                                                                    {selected && (
                                                                        <Check size={12} className="text-white" />
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="px-6 py-4 border-t border-white/6 flex items-center justify-between">
                                                <p className="text-white/35 text-xs">
                                                    {selectedCandidates.length} selected
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setShowAssignModal(false)}
                                                        className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white/60 hover:bg-white/5"
                                                    >
                                                        Cancel
                                                    </button>

                                                    <button
                                                        onClick={assignCandidatesToDrive}
                                                        disabled={assignLoading || selectedCandidates.length === 0}
                                                        className="px-5 py-2 rounded-xl text-xs font-semibold text-white disabled:opacity-50"
                                                        style={{
                                                            background:
                                                                "linear-gradient(135deg,#6366f1,#8b5cf6)",
                                                        }}
                                                    >
                                                        {assignLoading
                                                            ? "Assigning..."
                                                            : "Assign Candidates"}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {tab === "settings" && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <Lock size={20} className="text-indigo-400" />
                            </div>
                            <p className="text-white font-semibold text-sm">Drive Settings</p>
                            <p className="text-white/30 text-xs max-w-[200px]">Configure proctoring, time limits, access and scoring.</p>
                            <button
                                onClick={() => onEdit(drive)}
                                className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition"
                            >
                                Edit Settings <Edit3 size={12} />
                            </button>
                        </div>
                    )}
                </div>

                <div
                    className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
                    style={{ background: "rgba(10,8,22,0.96)" }}
                >
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-rose-500/20 text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/40 transition"
                    >
                        <Trash2 size={13} />
                        Delete Drive
                    </button>

                    <button
                        onClick={() => onEdit(drive)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                        style={{
                            background:
                                "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        }}
                    >
                        <Edit3 size={13} />
                        Edit Drive
                    </button>
                </div>
            </motion.aside>
            <AnimatePresence>

                {showDeleteModal && (

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[130] flex items-center justify-center p-4"
                        style={{
                            background:
                                "radial-gradient(circle at top, rgba(99,102,241,0.12), rgba(0,0,0,0.88))",
                            backdropFilter: "blur(18px)",
                        }}
                    >

                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.92,
                                y: 24,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.92,
                                y: 24,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 22,
                            }}
                            className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(12,12,24,0.96), rgba(18,18,32,0.98))",
                                boxShadow:
                                    "0 20px 80px rgba(0,0,0,0.55)",
                            }}
                        >

                            {/* glow */}

                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background:
                                        "radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 35%)",
                                }}
                            />

                            {/* HEADER */}

                            <div className="relative px-7 pt-7 pb-6 border-b border-white/6">

                                <button
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    className="absolute top-5 right-5 w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition"
                                >
                                    <X size={16} />
                                </button>

                                <div className="flex items-start gap-5">

                                    <div
                                        className="w-16 h-16 rounded-3xl flex items-center justify-center shrink-0"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, rgba(244,63,94,0.18), rgba(225,29,72,0.08))",
                                            border:
                                                "1px solid rgba(244,63,94,0.24)",
                                            boxShadow:
                                                "0 10px 30px rgba(244,63,94,0.18)",
                                        }}
                                    >
                                        <Trash2
                                            size={24}
                                            className="text-rose-400"
                                        />
                                    </div>

                                    <div>

                                        <p className="text-rose-400 text-xs font-semibold uppercase tracking-[0.18em]">
                                            Danger Zone
                                        </p>

                                        <h2 className="text-white text-2xl font-bold mt-2">
                                            Delete Drive
                                        </h2>

                                        <p className="text-white/40 text-sm leading-relaxed mt-2 max-w-[380px]">
                                            This permanently removes the
                                            drive configuration from your
                                            recruitment workflow.
                                        </p>

                                    </div>
                                </div>
                            </div>

                            {/* DRIVE CARD */}

                            <div className="relative px-7 py-6">

                                <div
                                    className="rounded-3xl border border-white/8 p-5"
                                    style={{
                                        background:
                                            "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                                    }}
                                >

                                    <div className="flex items-center gap-4">

                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12))",
                                                border:
                                                    "1px solid rgba(99,102,241,0.2)",
                                            }}
                                        >
                                            <Zap
                                                size={20}
                                                className="text-indigo-400"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">

                                            <h3 className="text-white font-semibold text-lg truncate">
                                                {drive.title}
                                            </h3>

                                            <p className="text-white/35 text-sm mt-1">
                                                {drive.tag}
                                            </p>

                                        </div>

                                        <div
                                            className="px-3 py-1 rounded-full text-[11px] font-semibold border"
                                            style={{
                                                background:
                                                    "rgba(99,102,241,0.08)",
                                                borderColor:
                                                    "rgba(99,102,241,0.18)",
                                                color: "#a5b4fc",
                                            }}
                                        >
                                            {drive.status}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mt-6">

                                        {[
                                            {
                                                label: "Candidates",
                                                value:
                                                    drive.totalCandidates || 0,
                                            },
                                            {
                                                label: "Questions",
                                                value:
                                                    drive.questionCount || 0,
                                            },
                                            {
                                                label: "Duration",
                                                value:
                                                    `${drive.duration || 0}m`,
                                            },
                                        ].map((item) => (

                                            <div
                                                key={item.label}
                                                className="rounded-2xl border border-white/6 p-3"
                                                style={{
                                                    background:
                                                        "rgba(255,255,255,0.025)",
                                                }}
                                            >
                                                <p className="text-white/25 text-[10px] uppercase tracking-wider">
                                                    {item.label}
                                                </p>

                                                <p className="text-white font-bold text-lg mt-1">
                                                    {item.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* warning */}

                                <div
                                    className="mt-5 rounded-2xl border border-amber-500/10 p-4"
                                    style={{
                                        background:
                                            "rgba(251,191,36,0.05)",
                                    }}
                                >
                                    <div className="flex gap-3">

                                        <AlertTriangle
                                            size={18}
                                            className="text-amber-400 shrink-0 mt-0.5"
                                        />

                                        <p className="text-amber-100/70 text-xs leading-relaxed">
                                            Candidate submissions and interview
                                            results will no longer be linked to
                                            this drive after deletion.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* FOOTER */}

                            <div className="relative px-7 py-5 border-t border-white/6 flex items-center justify-end gap-3">

                                <button
                                    onClick={() =>
                                        setShowDeleteModal(false)
                                    }
                                    className="px-5 py-2.5 rounded-2xl text-sm font-semibold border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={deleteDrive}
                                    disabled={deleteLoading}
                                    className="px-6 py-2.5 rounded-2xl text-sm font-semibold text-white disabled:opacity-50 transition hover:scale-[1.02]"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,#ef4444,#f43f5e)",
                                        boxShadow:
                                            "0 10px 30px rgba(244,63,94,0.25)",
                                    }}
                                >
                                    {deleteLoading
                                        ? "Deleting..."
                                        : "Delete Drive"}
                                </button>

                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
    const [drives, setDrives]         = useState([]);
    const [search, setSearch]         = useState("");
    const [filterStatus, setStatus]   = useState("All");
    const [sortBy, setSortBy]         = useState("date");
    const [viewMode, setViewMode]     = useState("grid");
    const [selected, setSelected]     = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editingDrive, setEditingDrive] = useState(null);
    const [loading, setLoading]       = useState(true);
    const statuses = ["All","Active","Completed","On-Hold","Draft"];

    const [searchParams] = useSearchParams();

    useEffect(() => {

        const driveId =
            searchParams.get("drive");
    
        if (
            driveId &&
            drives.length > 0
        ) {
    
            const foundDrive =
                drives.find(
                    (d) => d._id === driveId
                );
    
            if (foundDrive) {
    
                setSelected(
                    foundDrive
                );
            }
        }
    
    }, [searchParams, drives]);


    useEffect(() => {
        const fetchDrives = async () => {
            try {
                const res = await axios.get("http://localhost:4000/api/drives");
                setDrives(res.data.drives);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchDrives();
    }, []);

    useEffect(() => {

        const selectedDriveId =
            localStorage.getItem(
                "selectedDriveId"
            );
    
        if (
            selectedDriveId &&
            drives.length > 0
        ) {
    
            const foundDrive =
                drives.find(
                    (d) =>
                        d._id === selectedDriveId
                );
    
            if (foundDrive) {
    
                setSelected(foundDrive);
    
                // cleanup
                localStorage.removeItem(
                    "selectedDriveId"
                );
            }
        }
    
    }, [drives]);

    const filtered = drives
        .filter(d => {
            const q = search.toLowerCase();
            const matchQ = !q || d.title.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q) || (d.tags||[]).some(t=>t.toLowerCase().includes(q));
            return matchQ && (filterStatus==="All" || d.status===filterStatus);
        })
        .sort((a,b) => {
            if (sortBy==="score")      return b.avgScore-a.avgScore;
            if (sortBy==="candidates") return b.totalCandidates-a.totalCandidates;
            return new Date(b.createdAt)-new Date(a.createdAt);
        });

    const active    = drives.filter(d=>d.status==="Active").length;
    const completed = drives.filter(d=>d.status==="Completed").length;
    const cands     = drives.reduce((s,d)=>s+d.totalCandidates,0);
    const scored    = drives.filter(d=>d.avgScore>0);
    const avg       = scored.length ? Math.round(scored.reduce((s,d)=>s+d.avgScore,0)/scored.length) : 0;

    const exportCSV = () => {
        const headers = ["Drive Name","Type","Status","Candidates","Attempted","Average Score","Top Score","Completion Rate","Duration","Questions","Difficulty","Visibility","Created Date"];
        const rows = filtered.map(d=>[d.title,d.type,d.status,d.totalCandidates,d.attempted,d.avgScore,d.topScore,`${d.completionRate}%`,`${d.duration} min`,d.questionCount,d.difficulty,d.visibility,fmt(d.createdAt)]);
        const csvContent = [headers.join(","),...rows.map(row=>row.map(f=>`"${f}"`).join(","))].join("\n");
        const blob = new Blob([csvContent],{type:"text/csv;charset=utf-8;"});
        const url  = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href  = url;
        link.setAttribute("download",`drives_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

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
                            style={{ background:"rgba(255,255,255,0.04)", colorScheme:"dark" }}>
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
                            {loading ? (
                                <div className="col-span-full flex justify-center py-20">
                                    <div className="w-10 h-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                                </div>
                            ) : filtered.length === 0
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
                                <button onClick={exportCSV} className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition">
                                    Export CSV <Download size={11} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <DriveDrawer
                    drive={selected}
                    onClose={() => setSelected(null)}
                    onEdit={(drive) => {

                        setEditingDrive(drive);

                        setShowCreate(true);

                        setSelected(null);
                    }}
                />
            </div>

            <AnimatePresence>
                {showCreate && (
                    <CreateDriveModal
                    editData={editingDrive}
                    onClose={() => {
                
                        setShowCreate(false);
                
                        setEditingDrive(null);
                    }}
                
                    onSave={(updatedDrive) => {
                
                        if (editingDrive) {
                
                            setDrives((prev) =>
                                prev.map((d) =>
                                    d._id === updatedDrive._id
                                        ? updatedDrive
                                        : d
                                )
                            );
                
                        } else {
                
                            setDrives((prev) => [
                                updatedDrive,
                                ...prev,
                            ]);
                        }
                
                        setEditingDrive(null);
                    }}
                />
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminDrive;