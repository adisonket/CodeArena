import React, { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    Filter,
    ChevronRight,
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    BookOpen,
    Code2,
    FileText,
    Shield,
    ShieldCheck,
    ShieldOff,
    Calendar,
    Star,
    MoreHorizontal,
    ArrowLeft,
    BadgeCheck,
    Clock,
    TrendingUp,
    Briefcase,
    GraduationCap,
    X,
    Eye,
    Download,
    UserCheck,
    UserX,
    ChevronDown,
    SlidersHorizontal,
    Hash,
} from "lucide-react";
import SoftBackdrop from "../../SoftBackdrop";
import LenisScroll from "../../lenis";
import axios from "axios";


// ── helpers ────────────────────────────────────────────────────────────────────
const statusStyle = {
    Active:    { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25", dot: "#4ade80" },
    "On-Hold": { cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25",       dot: "#fbbf24" },
    Completed: { cls: "bg-sky-500/15 text-sky-400 border border-sky-500/25",             dot: "#38bdf8" },
};

const fmt = (iso) =>
    new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

const initials = (f, l) => `${f?.[0] ?? ""}${l?.[0] ?? ""}`.toUpperCase();

const scoreColor = (s) => s >= 90 ? "#4ade80" : s >= 75 ? "#facc15" : "#f87171";

// ── Avatar ─────────────────────────────────────────────────────────────────────
const Avatar = ({ candidate, size = 40, className = "" }) => {
    const colors = ["#6366f1", "#8b5cf6", "#a855f7", "#ec4899", "#f59e0b", "#10b981"];
    const idx = candidate._id.charCodeAt(0) % colors.length;
    const bg = colors[idx];
    return (
        <div
            // className={`rounded-full flex items-center justify-center font-bold text-white shrink-0 ${className}`}\
            className={`rounded-full overflow-hidden flex items-center justify-center font-bold text-white shrink-0 ${className}`}
            style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${bg}99)`, fontSize: size * 0.35 }}
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
                initials(candidate.firstName, candidate.lastName)
            )}
        </div>
    );
};

// ── ScoreRing ──────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 64, stroke = 5 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = scoreColor(score);
    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                    strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
            </svg>
            <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
        </div>
    );
};

// ── MiniBar ────────────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color }) => (
    <div className="h-1 rounded-full bg-white/8 overflow-hidden w-full">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full" style={{ background: color }} />
    </div>
);

// ── Candidate Detail Drawer ────────────────────────────────────────────────────
const CandidateDrawer = ({ candidate, onClose }) => {
    if (!candidate) return null;
    const st = statusStyle[candidate.status] ?? statusStyle["Active"];

    return (
        <>
        <AnimatePresence>
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.aside
                key="drawer"
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col border-l border-white/8 overflow-y-auto"
                style={{ background: "rgba(12,9,24,0.98)", backdropFilter: "blur(24px)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* drawer header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/6 sticky top-0 z-10"
                    style={{ background: "rgba(12,9,24,0.95)" }}>
                    <div className="flex items-center gap-3">
                        <Avatar candidate={candidate} size={42} />
                        <div>
                            <p className="text-white font-bold text-base leading-tight">
                                {candidate.firstName} {candidate.lastName}
                            </p>
                            <p className="text-white/40 text-[11px] mt-0.5">{candidate.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
                        <X size={16} />
                    </button>
                </div>

                <div className="flex-1 px-6 py-5 space-y-6">

                    {/* score + status row */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Avg Score", val: candidate.avgScore, node: <ScoreRing score={candidate.avgScore} size={48} /> },
                            { label: "Completion", val: `${candidate.completionRate}%`, node: null },
                            { label: "Status", val: candidate.status, node: null },
                        ].map((item, i) => (
                            <div key={i} className="rounded-xl p-3 border border-white/6 flex flex-col items-center gap-2"
                                style={{ background: "rgba(255,255,255,0.025)" }}>
                                {item.node ?? null}
                                {!item.node && (
                                    i === 2
                                        ? <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${st.cls}`}>{item.val}</span>
                                        : <p className="text-white font-bold text-lg">{item.val}</p>
                                )}
                                <p className="text-white/35 text-[10px]">{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* drive */}
                    <div className="rounded-xl p-4 border border-indigo-500/20 flex items-center gap-3"
                        style={{ background: "rgba(99,102,241,0.07)" }}>
                        <Briefcase size={16} className="text-indigo-400 shrink-0" />
                        <div>
                            <p className="text-white/40 text-[10px] mb-0.5">Applied Drive</p>
                            <p className="text-white font-semibold text-sm">{candidate.drive}</p>
                        </div>
                    </div>

                    {/* contact */}
                    <section>
                        <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Contact & Profile</p>
                        <div className="space-y-2.5">
                            {[
                                { Icon: Mail,    val: candidate.email,    label: "Email" },
                                { Icon: Phone,   val: candidate.phone || "—", label: "Phone" },
                                { Icon: MapPin,  val: candidate.location || "—", label: "Location" },
                                { Icon: Linkedin, val: candidate.linkedin || "—", label: "LinkedIn" },
                                { Icon: Github,  val: candidate.github || "—", label: "GitHub" },
                            ].map(({ Icon, val, label }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                                        <Icon size={13} className="text-indigo-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white/30 text-[10px]">{label}</p>
                                        <p className="text-white/80 text-xs truncate">{val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* bio */}
                    {candidate.bio && (
                        <section>
                            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Bio</p>
                            <p className="text-white/55 text-xs leading-relaxed">{candidate.bio}</p>
                        </section>
                    )}

                    {/* skills */}
                    {candidate.skills.length > 0 && (
                        <section>
                            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                                {candidate.skills.map((sk) => (
                                    <span key={sk} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                                        style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                                        {sk}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* education */}
                    {candidate.education.length > 0 && (
                        <section>
                            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Education</p>
                            <div className="space-y-3">
                                {candidate.education.map((ed, i) => (
                                    <div key={ed._id ?? i} className="rounded-xl p-4 border border-white/6"
                                        style={{ background: "rgba(255,255,255,0.02)" }}>
                                        <div className="flex items-start gap-3">
                                            <GraduationCap size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                                {/* degree + current badge */}
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-white font-semibold text-xs">{ed.degree}</p>
                                                    {ed.current && (
                                                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                {/* institution */}
                                                <p className="text-white/55 text-[11px] mt-0.5">{ed.institution}</p>
                                                {/* university + year row */}
                                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                    {ed.university && (
                                                        <div className="flex items-center gap-1 text-white/35 text-[10px]">
                                                            <BookOpen size={10} className="text-indigo-400" />
                                                            <span>{ed.university}</span>
                                                        </div>
                                                    )}
                                                    {ed.year && (
                                                        <div className="flex items-center gap-1 text-white/35 text-[10px]">
                                                            <Calendar size={10} className="text-indigo-400" />
                                                            <span>{ed.year}</span>
                                                        </div>
                                                    )}
                                                    {ed.cgpa && (
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                                                            style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc" }}>
                                                            CGPA {ed.cgpa}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* attached docs */}
                                                {ed.docs?.length > 0 && (
                                                    <div className="mt-3 space-y-1.5">
                                                        {ed.docs.map((doc, j) => (
                                                            <a
                                                                key={doc._id ?? j}
                                                                href={`http://localhost:4000${doc.path}`}
                                                                download={doc.name}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-white/6 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition group"
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <FileText size={11} className="text-indigo-400 shrink-0" />
                                                                    <span className="text-white/60 text-[10px] truncate">{doc.name}</span>
                                                                    {doc.size && (
                                                                        <span className="text-white/25 text-[9px] shrink-0">{doc.size}</span>
                                                                    )}
                                                                </div>
                                                                <Download size={10} className="text-indigo-400/60 group-hover:text-indigo-300 shrink-0 transition" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* security */}
                    <section>
                        <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Security & Account</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Email Verified", val: candidate.isVerified, TrueIcon: ShieldCheck, FalseIcon: ShieldOff, trueColor: "#4ade80", falseColor: "#f87171" },
                                { label: "2FA Enabled",    val: candidate.twoFactorEnabled, TrueIcon: Shield, FalseIcon: ShieldOff, trueColor: "#818cf8", falseColor: "#f87171" },
                            ].map(({ label, val, TrueIcon, FalseIcon, trueColor, falseColor }) => {
                                const Icon = val ? TrueIcon : FalseIcon;
                                const color = val ? trueColor : falseColor;
                                return (
                                    <div key={label} className="rounded-xl p-3 border border-white/6 flex items-center gap-2"
                                        style={{ background: "rgba(255,255,255,0.02)" }}>
                                        <Icon size={14} style={{ color }} />
                                        <div>
                                            <p className="text-white/35 text-[10px]">{label}</p>
                                            <p className="text-xs font-semibold" style={{ color }}>{val ? "Yes" : "No"}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl p-3 border border-white/6"
                            style={{ background: "rgba(255,255,255,0.02)" }}>
                            <Calendar size={13} className="text-white/30" />
                            <p className="text-white/40 text-[11px]">Registered on <span className="text-white/60">{fmt(candidate.createdAt)}</span></p>
                        </div>
                    </section>

                    {/* resume */}
                    {candidate.resumeOriginalName && (
                        <section>
                            <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Resume</p>
                            <div className="flex items-center justify-between rounded-xl p-3 border border-white/6"
                                style={{ background: "rgba(255,255,255,0.02)" }}>
                                <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-indigo-400" />
                                    <p className="text-white/70 text-xs truncate max-w-[180px]">{candidate.resumeOriginalName}</p>
                                </div>
                                    <a
                                        href={`http://localhost:4000${candidate.resumeUrl}`}
                                        download={candidate.resumeOriginalName}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-[11px] transition"
                                    >
                                        <Download size={12} /> Download
                                    </a>
                            </div>
                        </section>
                    )}
                </div>

                {/* drawer footer actions */}
                <div className="px-6 py-4 border-t border-white/6 flex gap-2 sticky bottom-0"
                    style={{ background: "rgba(12,9,24,0.95)" }}>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                        <Eye size={13} /> View Full Profile
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        <UserCheck size={13} /> Shortlist
                    </button>
                </div>
            </motion.aside>
        </AnimatePresence>
        </>
    );
};
// ── Count Animation ────────────────────────────────────────────────────────

const CountUp = ({ value, duration = 1.2 }) => {
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;

        const controls = animate(0, value, {
            duration,
            ease: "easeOut",
            onUpdate(latest) {
                if (node) {
                    node.textContent = Math.round(latest);
                }
            },
        });

        return () => controls.stop();
    }, [value, duration]);

    return <span ref={ref}>0</span>;
};

// ── Main CandidatesPage ────────────────────────────────────────────────────────
const CandidatesPage = () => {
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [selected, setSelected] = useState(null);
    const [sortBy, setSortBy] = useState("name");
    const [candidates, setCandidates] = useState([]);

    const statuses = ["All", "Active", "On-Hold", "Completed"];

    useEffect(() => {

        const fetchCandidates = async () => {
    
            try {
    
                const res = await axios.get(
                    "http://localhost:4000/api/candidates"
                );
    
                setCandidates(res.data.candidates);
    
            } catch (error) {
    
                console.log(error);
    
            } finally {
    
                setLoading(false);
            }
        };
    
        fetchCandidates();
    
    }, []);

    const filtered = candidates
        .filter((c) => {
            const q = search.toLowerCase();
            const name = `${c.firstName} ${c.lastName}`.toLowerCase();
            const matchQ = !q || name.includes(q) || c.email.includes(q) || c.drive.toLowerCase().includes(q);
            const matchS = filterStatus === "All" || c.status === filterStatus;
            return matchQ && matchS;
        })
        .sort((a, b) => {
            if (sortBy === "score") return b.avgScore - a.avgScore;
            if (sortBy === "date")  return new Date(b.createdAt) - new Date(a.createdAt);
            return `${a.firstName}${a.lastName}`.localeCompare(`${b.firstName}${b.lastName}`);
        });

    const totalActive    = candidates.filter(c => c.status === "Active").length;
    const totalCompleted = candidates.filter(c => c.status === "Completed").length;
    const avgScore =
    candidates.length > 0
        ? Math.round(
              candidates.reduce((s, c) => s + c.avgScore, 0) /
              candidates.length
          )
        : 0;

    const exportCSV = () => {

        const headers = [
            "Name",
            "Email",
            "Phone",
            "Location",
            "Drive",
            "Status",
            "Average Score",
            "Completion Rate",
            "2FA Enabled",
            "Verified",
            "Registered Date",
        ];
    
        const rows = filtered.map((c) => [
            `${c.firstName} ${c.lastName}`,
            c.email,
            c.phone || "",
            c.location || "",
            c.drive || "",
            c.status || "",
            c.avgScore || 0,
            `${c.completionRate || 0}%`,
            c.twoFactorEnabled ? "Yes" : "No",
            c.isVerified ? "Yes" : "No",
            fmt(c.createdAt),
        ]);
    
        const csvContent = [
            headers.join(","),
            ...rows.map((row) =>
                row.map((field) => `"${field}"`).join(",")
            ),
        ].join("\n");
    
        const blob = new Blob(
            [csvContent],
            { type: "text/csv;charset=utf-8;" }
        );
    
        const url = URL.createObjectURL(blob);
    
        const link = document.createElement("a");
    
        link.href = url;
    
        link.setAttribute(
            "download",
            `candidates_${Date.now()}.csv`
        );
    
        document.body.appendChild(link);
    
        link.click();
    
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="w-full flex flex-col space-y-3 ">

                {/* page header */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Users size={16} className="text-indigo-400" />
                            <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">Candidates</p>
                        </div>
                        <h2 className="text-2xl font-extrabold text-white tracking-tight">Candidate Pool</h2>
                        <p className="text-white/35 text-xs mt-0.5">{candidates.length} total candidates across all drives</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                        <UserCheck size={13} /> Invite Candidate
                    </button>
                </div>

                {/* summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total", value: candidates.length, color: "#818cf8", Icon: Users },
                        { label: "Active", value: totalActive, color: "#4ade80", Icon: UserCheck },
                        { label: "Completed", value: totalCompleted, color: "#38bdf8", Icon: BadgeCheck },
                        { label: "Avg Score", value: avgScore, color: "#facc15", Icon: Star },
                    ].map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            className="rounded-2xl p-3 border border-white/5 flex items-center gap-3"
                            style={{ background: "rgba(255,255,255,0.025)" }}>
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: `${s.color}18`, border: `1px solid ${s.color}35` }}>
                                <s.Icon size={16} style={{ color: s.color }} />
                            </div>
                            <div>
                                <p className="text-white font-bold text-xl leading-none">
                                    <CountUp value={s.value} />
                                </p>
                                <p className="text-white/35 text-[11px] mt-0.5">{s.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* search + filter bar */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, drive…"
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/25 border border-white/6 outline-none focus:border-indigo-500/40 transition"
                            style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* status filter pills */}
                    <div className="flex items-center gap-1.5">
                        {statuses.map((s) => (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border ${filterStatus === s
                                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                        : "text-white/35 border-white/6 hover:bg-white/4 hover:text-white/60"
                                    }`}>
                                {s}
                            </button>
                        ))}
                    </div>

                    {/* sort */}
                    <div className="relative">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-8 pr-8 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer transition focus:border-indigo-500/40"
                            style={{ background: "rgba(255,255,255,0.04)" }}>
                            <option value="name">Sort: Name</option>
                            <option value="score">Sort: Score</option>
                            <option value="date">Sort: Date</option>
                        </select>
                        <SlidersHorizontal size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                </div>

                {/* candidates table */}
                <div className="rounded-2xl border border-white/5 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.025)" }}>
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-white/30 border-b border-white/5">
                                {["Candidate", "Drive", "Avg Score", "Completion", "Status", "Registered", "2FA", ""].map(h => (
                                    <th key={h} className="text-left px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-5 py-12 text-center text-white/25 text-xs">
                                            No candidates match your filters.
                                        </td>
                                    </tr>
                                ) : filtered.map((c, i) => {
                                    const st = statusStyle[c.status] ?? statusStyle["Active"];
                                    return (
                                        <motion.tr key={c._id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => setSelected(c)}
                                            className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group">
                                            {/* candidate */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <Avatar candidate={c} size={32} />
                                                    <div>
                                                        <p className="text-white font-semibold">{c.firstName} {c.lastName}</p>
                                                        <p className="text-white/35 text-[10px] mt-0.5">{c.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* drive */}
                                            <td className="px-5 py-3.5 text-white/50 whitespace-nowrap">{c.drive}</td>
                                            {/* score */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold" style={{ color: scoreColor(c.avgScore) }}>{c.avgScore}</span>
                                                    <div className="w-14">
                                                        <MiniBar pct={c.avgScore} color={scoreColor(c.avgScore)} />
                                                    </div>
                                                </div>
                                            </td>
                                            {/* completion */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white/60">{c.completionRate}%</span>
                                                    <div className="w-14">
                                                        <MiniBar pct={c.completionRate} color="#818cf8" />
                                                    </div>
                                                </div>
                                            </td>
                                            {/* status */}
                                            <td className="px-5 py-3.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${st.cls}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dot }} />
                                                    {c.status}
                                                </span>
                                            </td>
                                            {/* date */}
                                            <td className="px-5 py-3.5 text-white/35 whitespace-nowrap">{fmt(c.createdAt)}</td>
                                            {/* 2fa */}
                                            <td className="px-5 py-3.5">
                                                {c.twoFactorEnabled
                                                    ? <Shield size={13} className="text-indigo-400" />
                                                    : <ShieldOff size={13} className="text-white/20" />}
                                            </td>
                                            {/* arrow */}
                                            <td className="px-5 py-3.5">
                                                <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {/* table footer */}
                    <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                        <p className="text-white/25 text-[11px]">Showing {filtered.length} of {candidates.length} candidates</p>
                        <button
                            onClick={exportCSV}
                            className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition"
                        >
                            Export CSV <Download size={11} />
                        </button>
                    </div>
                </div>

                {/* detail drawer */}
                <CandidateDrawer candidate={selected} onClose={() => setSelected(null)} />
            </div>
        </>
        
    );
};

export default CandidatesPage;