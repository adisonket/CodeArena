import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    Search,
    Plus,
    ChevronRight,
    Calendar,
    Users,
    Clock,
    BarChart2,
    Filter,
    X,
    Eye,
    Edit3,
    Trash2,
    Copy,
    MoreHorizontal,
    CheckCircle2,
    PauseCircle,
    PlayCircle,
    AlertCircle,
    Download,
    ChevronDown,
    SlidersHorizontal,
    Code2,
    Star,
    ArrowUpRight,
    Lock,
    Globe,
    Tag,
    Layers,
    Timer,
    Trophy,
    ClipboardList,
} from "lucide-react";

// ── mock data ──────────────────────────────────────────────────────────────────
const DRIVES = [
    {
        _id: "d001",
        title: "Senior ML Engineer",
        tag: "Engineering",
        status: "Active",
        visibility: "Private",
        startDate: "2026-05-01T00:00:00.000Z",
        endDate: "2026-05-25T00:00:00.000Z",
        totalCandidates: 24,
        attempted: 18,
        avgScore: 81,
        topScore: 96,
        duration: 90,
        questionCount: 32,
        createdAt: "2026-04-20T10:00:00.000Z",
        difficulty: "Hard",
        tags: ["Python", "ML", "System Design"],
        completionRate: 75,
    },
    {
        _id: "d002",
        title: "Frontend Dev Q2",
        tag: "Design & Dev",
        status: "Active",
        visibility: "Public",
        startDate: "2026-04-28T00:00:00.000Z",
        endDate: "2026-06-01T00:00:00.000Z",
        totalCandidates: 41,
        attempted: 29,
        avgScore: 74,
        topScore: 91,
        duration: 60,
        questionCount: 25,
        createdAt: "2026-04-10T09:00:00.000Z",
        difficulty: "Medium",
        tags: ["React", "CSS", "TypeScript"],
        completionRate: 71,
    },
    {
        _id: "d003",
        title: "DevOps Engineer",
        tag: "Infrastructure",
        status: "Completed",
        visibility: "Private",
        startDate: "2026-03-10T00:00:00.000Z",
        endDate: "2026-04-10T00:00:00.000Z",
        totalCandidates: 17,
        attempted: 17,
        avgScore: 68,
        topScore: 88,
        duration: 75,
        questionCount: 28,
        createdAt: "2026-03-01T08:00:00.000Z",
        difficulty: "Hard",
        tags: ["Kubernetes", "AWS", "Terraform"],
        completionRate: 100,
    },
    {
        _id: "d004",
        title: "Data Scientist",
        tag: "Analytics",
        status: "Completed",
        visibility: "Private",
        startDate: "2026-03-01T00:00:00.000Z",
        endDate: "2026-04-01T00:00:00.000Z",
        totalCandidates: 33,
        attempted: 33,
        avgScore: 85,
        topScore: 98,
        duration: 120,
        questionCount: 40,
        createdAt: "2026-02-20T11:00:00.000Z",
        difficulty: "Hard",
        tags: ["Python", "PyTorch", "SQL"],
        completionRate: 100,
    },
    {
        _id: "d005",
        title: "QA Specialist",
        tag: "Quality",
        status: "On-Hold",
        visibility: "Public",
        startDate: "2026-05-15T00:00:00.000Z",
        endDate: "2026-06-15T00:00:00.000Z",
        totalCandidates: 12,
        attempted: 0,
        avgScore: 0,
        topScore: 0,
        duration: 45,
        questionCount: 20,
        createdAt: "2026-05-08T14:00:00.000Z",
        difficulty: "Easy",
        tags: ["Selenium", "Jest", "Postman"],
        completionRate: 0,
    },
    {
        _id: "d006",
        title: "Backend Engineer – Node",
        tag: "Engineering",
        status: "Draft",
        visibility: "Private",
        startDate: "2026-06-01T00:00:00.000Z",
        endDate: "2026-07-01T00:00:00.000Z",
        totalCandidates: 0,
        attempted: 0,
        avgScore: 0,
        topScore: 0,
        duration: 90,
        questionCount: 35,
        createdAt: "2026-05-11T16:00:00.000Z",
        difficulty: "Medium",
        tags: ["Node.js", "PostgreSQL", "Redis"],
        completionRate: 0,
    },
];

// ── helpers ────────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
    Active: { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25", dot: "#4ade80", Icon: PlayCircle },
    Completed: { cls: "bg-sky-500/15 text-sky-400 border border-sky-500/25", dot: "#38bdf8", Icon: CheckCircle2 },
    "On-Hold": { cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25", dot: "#fbbf24", Icon: PauseCircle },
    Draft: { cls: "bg-white/10 text-white/40 border border-white/10", dot: "#6b7280", Icon: Edit3 },
};

const DIFF_STYLE = {
    Easy: { cls: "text-emerald-400", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.2)" },
    Medium: { cls: "text-amber-400", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
    Hard: { cls: "text-rose-400", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.2)" },
};

const TAG_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9"];
const tagColor = (str) => TAG_COLORS[str.charCodeAt(0) % TAG_COLORS.length];

const fmt = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

const scoreColor = (s) => s >= 85 ? "#4ade80" : s >= 70 ? "#facc15" : s > 0 ? "#f87171" : "#374151";

const daysLeft = (end) => {
    const d = Math.ceil((new Date(end) - Date.now()) / 86400000);
    return d > 0 ? `${d}d left` : "Ended";
};

// ── MiniBar ────────────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color }) => (
    <div className="h-1 rounded-full bg-white/8 overflow-hidden w-full">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full" style={{ background: color }} />
    </div>
);

// ── Radial progress ────────────────────────────────────────────────────────────
const RadialPct = ({ pct, size = 44, stroke = 4 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const color = pct >= 85 ? "#4ade80" : pct >= 60 ? "#facc15" : pct > 0 ? "#f87171" : "#374151";
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
            </svg>
            <span className="absolute font-bold" style={{ fontSize: size * 0.22, color }}>{pct}%</span>
        </div>
    );
};

// ── Drawer ─────────────────────────────────────────────────────────────────────
const DriveDrawer = ({ drive, onClose }) => {
    if (!drive) return null;
    const st = STATUS_STYLE[drive.status] ?? STATUS_STYLE.Draft;
    const diff = DIFF_STYLE[drive.difficulty];
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <AnimatePresence>
            <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.aside key="drawer"
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col border-l border-white/8 overflow-y-auto"
                style={{ background: "rgba(10,8,22,0.99)", backdropFilter: "blur(24px)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* header */}
                <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/6"
                    style={{ background: "rgba(10,8,22,0.96)" }}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${tagColor(drive.title)}22`, border: `1px solid ${tagColor(drive.title)}40` }}>
                                <Zap size={16} style={{ color: tagColor(drive.title) }} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm leading-tight">{drive.title}</p>
                                <p className="text-white/35 text-[11px] mt-0.5">{drive.tag}</p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
                            <X size={15} />
                        </button>
                    </div>

                    {/* tabs */}
                    <div className="flex items-center gap-1 mt-4">
                        {["overview", "candidates", "settings"].map(t => (
                            <button key={t} onClick={() => setActiveTab(t)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition border ${activeTab === t
                                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                    : "text-white/35 border-transparent hover:text-white/60"}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 px-6 py-5 space-y-5">
                    {activeTab === "overview" && (
                        <>
                            {/* stat cards */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { label: "Candidates", val: drive.totalCandidates, Icon: Users, color: "#818cf8" },
                                    { label: "Attempted", val: drive.attempted, Icon: ClipboardList, color: "#4ade80" },
                                    { label: "Avg Score", val: drive.avgScore || "—", Icon: BarChart2, color: scoreColor(drive.avgScore) },
                                    { label: "Top Score", val: drive.topScore || "—", Icon: Trophy, color: "#fbbf24" },
                                ].map((item, i) => (
                                    <div key={i} className="rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                                        style={{ background: "rgba(255,255,255,0.025)" }}>
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ background: `${item.color}18`, border: `1px solid ${item.color}35` }}>
                                            <item.Icon size={14} style={{ color: item.color }} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-base leading-none">{item.val}</p>
                                            <p className="text-white/30 text-[10px] mt-0.5">{item.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* completion bar */}
                            <div className="rounded-xl p-4 border border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">Completion Rate</p>
                                    <span className="text-white font-bold text-sm">{drive.completionRate}%</span>
                                </div>
                                <MiniBar pct={drive.completionRate} color={scoreColor(drive.completionRate)} />
                            </div>

                            {/* meta */}
                            <section>
                                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Drive Details</p>
                                <div className="space-y-2.5">
                                    {[
                                        { Icon: st.Icon, label: "Status", val: drive.status, color: drive.status === "Active" ? "#4ade80" : drive.status === "Completed" ? "#38bdf8" : drive.status === "On-Hold" ? "#fbbf24" : "#6b7280" },
                                        { Icon: Globe, label: "Visibility", val: drive.visibility },
                                        { Icon: Timer, label: "Duration", val: `${drive.duration} minutes` },
                                        { Icon: Code2, label: "Questions", val: `${drive.questionCount} questions` },
                                        { Icon: Calendar, label: "Start", val: fmt(drive.startDate) },
                                        { Icon: Calendar, label: "End", val: fmt(drive.endDate) },
                                    ].map(({ Icon, label, val, color }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                                <Icon size={12} className="text-indigo-400" />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between">
                                                <p className="text-white/35 text-[11px]">{label}</p>
                                                <p className="text-xs font-medium" style={{ color: color || "rgba(255,255,255,0.65)" }}>{val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* difficulty + tags */}
                            <section>
                                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Difficulty & Tags</p>
                                <div className="flex flex-wrap gap-1.5 items-center">
                                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                                        style={{ background: diff.bg, borderColor: diff.border, color: diff.cls.replace("text-", "") }}>
                                        {drive.difficulty}
                                    </span>
                                    {drive.tags.map(t => (
                                        <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                                            style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === "candidates" && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <Users size={20} className="text-indigo-400" />
                            </div>
                            <p className="text-white font-semibold text-sm">{drive.totalCandidates} candidates enrolled</p>
                            <p className="text-white/30 text-xs max-w-[220px]">View and manage all candidates for this drive from the Candidates section.</p>
                            <button className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition">
                                Open Candidates <ArrowUpRight size={12} />
                            </button>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                                <Lock size={20} className="text-indigo-400" />
                            </div>
                            <p className="text-white font-semibold text-sm">Drive Settings</p>
                            <p className="text-white/30 text-xs max-w-[200px]">Configure proctoring, time limits, access and scoring rules.</p>
                            <button className="mt-2 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/10 transition">
                                Edit Settings <Edit3 size={12} />
                            </button>
                        </div>
                    )}
                </div>

                {/* footer */}
                <div className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
                    style={{ background: "rgba(10,8,22,0.96)" }}>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                        <Eye size={13} /> Preview Drive
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        <Edit3 size={13} /> Edit Drive
                    </button>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
};

// ── DriveCard ──────────────────────────────────────────────────────────────────
const DriveCard = ({ drive, onClick }) => {
    const st = STATUS_STYLE[drive.status] ?? STATUS_STYLE.Draft;
    const diff = DIFF_STYLE[drive.difficulty];
    const accent = tagColor(drive.title);
    const isLive = drive.status === "Active";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.18 } }}
            onClick={onClick}
            className="rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer group transition-all"
            style={{ background: "rgba(255,255,255,0.025)" }}
        >
            {/* top accent bar */}
            <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${accent},${accent}55,transparent)` }} />

            <div className="p-5 space-y-4">
                {/* title row */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
                            <Zap size={15} style={{ color: accent }} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm leading-tight group-hover:text-indigo-200 transition">{drive.title}</p>
                            <p className="text-white/30 text-[10px] mt-0.5">{drive.tag}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${st.cls}`}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                            {drive.status}
                        </span>
                    </div>
                </div>

                {/* stats row */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: "Candidates", val: drive.totalCandidates, Icon: Users },
                        { label: "Questions", val: drive.questionCount, Icon: Code2 },
                        { label: "Duration", val: `${drive.duration}m`, Icon: Timer },
                    ].map((s, i) => (
                        <div key={i} className="rounded-xl p-2.5 border border-white/[0.05] flex flex-col gap-1"
                            style={{ background: "rgba(255,255,255,0.02)" }}>
                            <div className="flex items-center gap-1 text-white/25">
                                <s.Icon size={10} />
                                <p className="text-[9px] uppercase tracking-wider">{s.label}</p>
                            </div>
                            <p className="text-white font-bold text-sm">{s.val}</p>
                        </div>
                    ))}
                </div>

                {/* completion */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-white/30 text-[10px]">Completion</span>
                        <span className="text-white/50 text-[11px] font-semibold">{drive.completionRate}%</span>
                    </div>
                    <MiniBar pct={drive.completionRate} color={scoreColor(drive.completionRate)} />
                </div>

                {/* footer */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                            style={{ background: diff.bg, borderColor: diff.border, color: diff.cls.replace("text-", "") }}>
                            {drive.difficulty}
                        </span>
                        {drive.visibility === "Private"
                            ? <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/30 flex items-center gap-1"><Lock size={9} /> Private</span>
                            : <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/30 flex items-center gap-1"><Globe size={9} /> Public</span>
                        }
                    </div>
                    <div className="flex items-center gap-1 text-white/25 text-[10px]">
                        {isLive && <span className="text-amber-400 font-semibold">{daysLeft(drive.endDate)}</span>}
                        {!isLive && <span className="text-white/25">{fmt(drive.createdAt)}</span>}
                        <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ── Main AdminDrive ────────────────────────────────────────────────────────────
const AdminDrive = () => {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [sortBy, setSortBy] = useState("date");
    const [viewMode, setViewMode] = useState("grid"); // grid | table
    const [selected, setSelected] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const statuses = ["All", "Active", "Completed", "On-Hold", "Draft"];
    const [newDrive, setNewDrive] = useState({
        title: "",
        type: "Assessment",
        difficulty: "Intermediate",
        date: "",
        duration: "",
        mcqs: "",
        codeQuestions: "",
        mcqMarks: "",
        codeMarks: "",
    });


    const filtered = DRIVES
        .filter((d) => {
            const q = search.toLowerCase();
            const matchQ = !q || d.title.toLowerCase().includes(q) || d.tag.toLowerCase().includes(q) || d.tags.some(t => t.toLowerCase().includes(q));
            const matchS = filterStatus === "All" || d.status === filterStatus;
            return matchQ && matchS;
        })
        .sort((a, b) => {
            if (sortBy === "score") return b.avgScore - a.avgScore;
            if (sortBy === "candidates") return b.totalCandidates - a.totalCandidates;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const totalActive = DRIVES.filter(d => d.status === "Active").length;
    const totalCompleted = DRIVES.filter(d => d.status === "Completed").length;
    const totalCandidates = DRIVES.reduce((s, d) => s + d.totalCandidates, 0);
    const overallAvg = Math.round(DRIVES.filter(d => d.avgScore > 0).reduce((s, d) => s + d.avgScore, 0) / DRIVES.filter(d => d.avgScore > 0).length);

    const handleCreateDrive = () => {

        if (!newDrive.title) return;

        const drive = {
            _id: crypto.randomUUID(),

            title: newDrive.title,

            tag: newDrive.type,

            status: "Draft",

            visibility: "Private",

            startDate: newDrive.date,

            endDate: newDrive.date,

            totalCandidates: 0,

            attempted: 0,

            avgScore: 0,

            topScore: 0,

            duration: Number(newDrive.duration),

            questionCount:
                Number(newDrive.mcqs) +
                Number(newDrive.codeQuestions),

            createdAt: new Date().toISOString(),

            difficulty: newDrive.difficulty,

            tags: [],

            completionRate: 0,
        };

        DRIVES.unshift(drive);

        setShowCreateModal(false);

        setNewDrive({
            title: "",
            type: "Assessment",
            difficulty: "Intermediate",
            date: "",
            duration: "",
            mcqs: "",
            codeQuestions: "",
            mcqMarks: "",
            codeMarks: "",
        });
    };

    return (
        <>
            <div className="w-full flex flex-col space-y-4">

                {/* page header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={15} className="text-indigo-400" />
                            <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">Drives</p>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Assessment Drives</h2>
                        <p className="text-white/35 text-xs mt-0.5">{DRIVES.length} drives · {totalCandidates} candidates enrolled</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        <Plus size={13} /> Create Drive
                    </button>
                </div>

                {/* summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Drives", value: DRIVES.length, color: "#818cf8", Icon: Layers },
                        { label: "Active", value: totalActive, color: "#4ade80", Icon: PlayCircle },
                        { label: "Completed", value: totalCompleted, color: "#38bdf8", Icon: CheckCircle2 },
                        { label: "Avg Score", value: overallAvg, color: "#facc15", Icon: Star },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className="rounded-2xl p-3 border border-white/5 flex items-center gap-3"
                            style={{ background: "rgba(255,255,255,0.025)" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
                                <s.Icon size={16} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                                <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* search + filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search drives, tags, categories…"
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/25 border border-white/6 outline-none focus:border-indigo-500/40 transition"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* status pills */}
                    <div className="flex items-center gap-1.5">
                        {statuses.map((s) => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border ${filterStatus === s
                                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                    : "text-white/35 border-white/6 hover:bg-white/4 hover:text-white/60"}`}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* sort */}
                    <div className="relative">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-8 pr-8 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer focus:border-indigo-500/40"
                            style={{ background: "rgba(255,255,255,0.04)" }}>
                            <option value="date">Sort: Date</option>
                            <option value="score">Sort: Avg Score</option>
                            <option value="candidates">Sort: Candidates</option>
                        </select>
                        <SlidersHorizontal size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>

                    {/* view toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-xl border border-white/6" style={{ background: "rgba(255,255,255,0.03)" }}>
                        {[
                            { key: "grid", Icon: Layers },
                            { key: "table", Icon: BarChart2 },
                        ].map(({ key, Icon }) => (
                            <button key={key} onClick={() => setViewMode(key)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${viewMode === key ? "bg-indigo-500/25 text-indigo-300" : "text-white/25 hover:text-white/60"}`}>
                                <Icon size={13} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* content */}
                <AnimatePresence mode="wait">
                    {viewMode === "grid" ? (
                        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filtered.length === 0 ? (
                                <div className="col-span-full flex flex-col items-center py-16 text-white/20 gap-2">
                                    <AlertCircle size={28} />
                                    <p className="text-sm">No drives match your filters.</p>
                                </div>
                            ) : filtered.map((d, i) => (
                                <DriveCard key={d._id} drive={d} onClick={() => setSelected(d)} />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="rounded-2xl border border-white/5 overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.025)" }}>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="text-white/30 border-b border-white/5">
                                        {["Drive", "Status", "Candidates", "Avg Score", "Completion", "Duration", "Difficulty", ""].map(h => (
                                            <th key={h} className="text-left px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence>
                                        {filtered.length === 0 ? (
                                            <tr><td colSpan={8} className="px-5 py-12 text-center text-white/25">No drives match your filters.</td></tr>
                                        ) : filtered.map((d, i) => {
                                            const st = STATUS_STYLE[d.status] ?? STATUS_STYLE.Draft;
                                            const diff = DIFF_STYLE[d.difficulty];
                                            return (
                                                <motion.tr key={d._id}
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                    transition={{ delay: i * 0.03 }}
                                                    onClick={() => setSelected(d)}
                                                    className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                                style={{ background: `${tagColor(d.title)}18`, border: `1px solid ${tagColor(d.title)}35` }}>
                                                                <Zap size={12} style={{ color: tagColor(d.title) }} />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-semibold">{d.title}</p>
                                                                <p className="text-white/30 text-[10px] mt-0.5">{d.tag}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${st.cls}`}>
                                                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                                                            {d.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-white/60">{d.totalCandidates}</td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold" style={{ color: scoreColor(d.avgScore) }}>{d.avgScore || "—"}</span>
                                                            {d.avgScore > 0 && <div className="w-12"><MiniBar pct={d.avgScore} color={scoreColor(d.avgScore)} /></div>}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white/50">{d.completionRate}%</span>
                                                            <div className="w-12"><MiniBar pct={d.completionRate} color="#818cf8" /></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-white/40 whitespace-nowrap">{d.duration}m</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                                                            style={{ background: diff.bg, borderColor: diff.border, color: diff.cls.replace("text-", "") }}>
                                                            {d.difficulty}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                                <p className="text-white/25 text-[11px]">Showing {filtered.length} of {DRIVES.length} drives</p>
                                <button className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition">
                                    Export CSV <Download size={11} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>

                    {showCreateModal && (

                        <>
                            {/* backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateModal(false)}
                                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
                            />

                            {/* modal */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 30 }}
                                transition={{
                                    duration: 0.25,
                                    ease: "easeOut",
                                }}
                                className="fixed left-1/2 top-1/2 z-50 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 p-7"
                                style={{
                                    background:
                                        "rgba(10,10,22,0.96)",
                                    backdropFilter: "blur(30px)",
                                    boxShadow:
                                        "0 0 60px rgba(99,102,241,0.15)",
                                }}
                            >

                                {/* header */}
                                <div className="flex items-center justify-between mb-6">

                                    <h2 className="text-2xl font-bold text-white">
                                        Create New Drive
                                    </h2>

                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-white/40 hover:text-white transition"
                                    >
                                        <X size={22} />
                                    </button>
                                </div>

                                {/* form */}
                                <div className="grid grid-cols-2 gap-4">

                                    {/* title */}
                                    <div className="col-span-2">
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Position Name
                                        </label>

                                        <input
                                            type="text"
                                            value={newDrive.title}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    title: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        />
                                    </div>

                                    {/* date */}
                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Date
                                        </label>

                                        <input
                                            type="date"
                                            value={newDrive.date}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    date: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        />
                                    </div>

                                    {/* type */}
                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Type
                                        </label>

                                        <select
                                            value={newDrive.type}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    type: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        >
                                            <option>Assessment</option>
                                            <option>Interview</option>
                                            {/* <option>Hybrid</option> */}
                                        </select>
                                    </div>

                                    {/* difficulty */}
                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Difficulty
                                        </label>

                                        <select
                                            value={newDrive.difficulty}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    difficulty: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        >
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </select>
                                    </div>

                                    {/* duration */}
                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Duration (Min)
                                        </label>

                                        <input
                                            type="number"
                                            value={newDrive.duration}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    duration: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        />
                                    </div>

                                    {/* mcq */}
                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Number of MCQs
                                        </label>

                                        <input
                                            type="number"
                                            value={newDrive.mcqs}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    mcqs: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        />
                                    </div>

                                    {/* code */}
                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Number of Code QS
                                        </label>

                                        <input
                                            type="number"
                                            value={newDrive.codeQuestions}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    codeQuestions:
                                                        e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        />
                                    </div>

                                    {/* marks */}
                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Marks per MCQ
                                        </label>

                                        <input
                                            type="number"
                                            value={newDrive.mcqMarks}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    mcqMarks: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-white/55 text-xs font-semibold uppercase">
                                            Marks per Code Q
                                        </label>

                                        <input
                                            type="number"
                                            value={newDrive.codeMarks}
                                            onChange={(e) =>
                                                setNewDrive({
                                                    ...newDrive,
                                                    codeMarks: e.target.value,
                                                })
                                            }
                                            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-indigo-500/40"
                                        />
                                    </div>

                                </div>

                                {/* button */}
                                <button
                                    onClick={handleCreateDrive}
                                    className="mt-7 w-full rounded-2xl py-4 text-sm font-bold text-white transition hover:scale-[1.01] active:scale-[0.99]"
                                    style={{
                                        background:
                                            "linear-gradient(135deg,#4f46e5,#7c3aed)",
                                    }}
                                >
                                    Save Drive
                                </button>
                            </motion.div>
                        </>
                    )}

                </AnimatePresence>

                {/* drawer */}
                <DriveDrawer drive={selected} onClose={() => setSelected(null)} />
            </div>
        </>
    );
};

export default AdminDrive;