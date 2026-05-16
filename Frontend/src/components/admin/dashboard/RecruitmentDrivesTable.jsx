import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers, ChevronRight, CheckCircle2, X, Users, BarChart2,
    TrendingUp, Clock, Target, Award, Activity, Zap,
    ArrowUpRight, Calendar, Building2, PauseCircle, PlayCircle,
    AlertCircle, Eye,
} from "lucide-react";

// ── mock data ──────────────────────────────────────────────────────────────────
const recruitmentDrives = [
    {
        name: "Senior ML Engineer",
        position: "AI Div",
        date: "12 Apr 2026",
        registered: 1200,
        completed: 950,
        avg: 88,
        sentiment: "Positive",
        status: "Active",
        topScore: 98,
        passRate: 74,
        shortlisted: 42,
        duration: "3 weeks",
        description: "End-to-end ML engineering assessment covering model design, MLOps, and system architecture for the AI Division's core platform team.",
        tags: ["Machine Learning", "Python", "MLOps", "System Design"],
        timeline: [
            { label: "Applications Open", date: "12 Apr 2026", done: true },
            { label: "Assessment Phase", date: "19 Apr 2026", done: true },
            { label: "Shortlisting",     date: "26 Apr 2026", done: true },
            { label: "Interviews",       date: "3 May 2026",  done: false },
            { label: "Offers",           date: "10 May 2026", done: false },
        ],
    },
    {
        name: "QA Specialist",
        position: "AI Div",
        date: "12 Apr 2026",
        registered: 1200,
        completed: 950,
        avg: 88,
        sentiment: "Positive",
        status: "On-Hold",
        topScore: 95,
        passRate: 68,
        shortlisted: 31,
        duration: "2 weeks",
        description: "Comprehensive quality assurance assessment testing automated testing skills, bug tracking, and CI/CD pipeline integration.",
        tags: ["QA", "Selenium", "JIRA", "Automation"],
        timeline: [
            { label: "Applications Open", date: "12 Apr 2026", done: true },
            { label: "Assessment Phase",  date: "19 Apr 2026", done: true },
            { label: "Shortlisting",      date: "26 Apr 2026", done: false },
            { label: "Interviews",        date: "3 May 2026",  done: false },
            { label: "Offers",            date: "10 May 2026", done: false },
        ],
    },
    {
        name: "Frontend Dev Q2",
        position: "AI Div",
        date: "12 Apr 2026",
        registered: 1200,
        completed: 950,
        avg: 88,
        sentiment: "Positive",
        status: "Active",
        topScore: 99,
        passRate: 81,
        shortlisted: 55,
        duration: "2 weeks",
        description: "React-focused frontend engineering assessment covering modern patterns, performance optimization, and accessible UI design.",
        tags: ["React", "TypeScript", "CSS", "Accessibility"],
        timeline: [
            { label: "Applications Open", date: "12 Apr 2026", done: true },
            { label: "Assessment Phase",  date: "17 Apr 2026", done: true },
            { label: "Shortlisting",      date: "24 Apr 2026", done: true },
            { label: "Interviews",        date: "1 May 2026",  done: true },
            { label: "Offers",            date: "8 May 2026",  done: false },
        ],
    },
    {
        name: "Marketing Lead",
        position: "AI Div",
        date: "12 Apr 2026",
        registered: 1200,
        completed: 950,
        avg: 88,
        sentiment: "Positive",
        status: "Active",
        topScore: 93,
        passRate: 70,
        shortlisted: 28,
        duration: "1 week",
        description: "Strategic marketing assessment evaluating campaign planning, data-driven decision making, and brand positioning skills.",
        tags: ["Marketing", "Analytics", "Strategy", "Branding"],
        timeline: [
            { label: "Applications Open", date: "12 Apr 2026", done: true },
            { label: "Assessment Phase",  date: "15 Apr 2026", done: true },
            { label: "Shortlisting",      date: "19 Apr 2026", done: true },
            { label: "Interviews",        date: "22 Apr 2026", done: true },
            { label: "Offers",            date: "26 Apr 2026", done: true },
        ],
    },
    {
        name: "Data Scientist",
        position: "AI Div",
        date: "12 Apr 2026",
        registered: 1100,
        completed: 870,
        avg: 85,
        sentiment: "Positive",
        status: "Completed",
        topScore: 97,
        passRate: 78,
        shortlisted: 38,
        duration: "3 weeks",
        description: "Rigorous data science evaluation covering statistical modeling, Python/R proficiency, and real-world ML problem solving.",
        tags: ["Python", "Statistics", "ML", "Data Viz"],
        timeline: [
            { label: "Applications Open", date: "12 Apr 2026", done: true },
            { label: "Assessment Phase",  date: "19 Apr 2026", done: true },
            { label: "Shortlisting",      date: "26 Apr 2026", done: true },
            { label: "Interviews",        date: "3 May 2026",  done: true },
            { label: "Offers",            date: "8 May 2026",  done: true },
        ],
    },
    {
        name: "DevOps Engineer",
        position: "AI Div",
        date: "12 Apr 2026",
        registered: 900,
        completed: 720,
        avg: 82,
        sentiment: "Positive",
        status: "On-Hold",
        topScore: 91,
        passRate: 62,
        shortlisted: 19,
        duration: "2 weeks",
        description: "DevOps engineering assessment covering infrastructure-as-code, container orchestration, and production incident response.",
        tags: ["Kubernetes", "Terraform", "AWS", "CI/CD"],
        timeline: [
            { label: "Applications Open", date: "12 Apr 2026", done: true },
            { label: "Assessment Phase",  date: "19 Apr 2026", done: true },
            { label: "Shortlisting",      date: "26 Apr 2026", done: false },
            { label: "Interviews",        date: "3 May 2026",  done: false },
            { label: "Offers",            date: "10 May 2026", done: false },
        ],
    },
];

const statusStyles = {
    Active:    "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    "On-Hold": "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    Completed: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
};

const statusDot = {
    Active:    "#4ade80",
    "On-Hold": "#fbbf24",
    Completed: "#818cf8",
};

const scoreColor = (s) =>
    s >= 85 ? "#4ade80" : s >= 70 ? "#facc15" : "#f87171";

// ── MiniBar ──────────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color }) => (
    <div className="h-1 rounded-full overflow-hidden w-full"
        style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: color }}
        />
    </div>
);

// ── Drive Drawer ──────────────────────────────────────────────────────────────
const DriveDrawer = ({ drive: d, onClose }) => {
    const [tab, setTab] = useState("overview");
    if (!d) return null;
    const completionPct = Math.round((d.completed / d.registered) * 100);

    return (
        <AnimatePresence>
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.aside
                key="drawer"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 260 }}
                className="fixed right-0 top-0 h-full w-full max-w-[440px] z-50 flex flex-col border-l border-white/8 overflow-y-auto"
                style={{ background: "rgba(10,8,22,0.99)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* sticky header */}
                <div
                    className="sticky top-0 z-10 px-6 py-5 border-b border-white/6"
                    style={{ background: "rgba(10,8,22,0.96)" }}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{
                                    background: "rgba(99,102,241,0.15)",
                                    border: "1px solid rgba(99,102,241,0.35)",
                                }}
                            >
                                <Layers size={16} className="text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-sm">{d.name}</p>
                                <p className="text-white/35 text-[11px] mt-0.5">
                                    {d.position} · {d.duration}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${statusStyles[d.status]}`}
                            >
                                <span
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: statusDot[d.status] }}
                                />
                                {d.status}
                            </span>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-1 mt-4">
                        {["overview", "pipeline", "timeline"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition border ${
                                    tab === t
                                        ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                                        : "text-white/35 border-transparent hover:text-white/60"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 px-6 py-5 space-y-5">
                    {tab === "overview" && (
                        <>
                            {/* key stats */}
                            <div className="grid grid-cols-2 gap-2.5">
                                {[
                                    { label: "Registered",   val: d.registered,        Icon: Users,      color: "#818cf8" },
                                    { label: "Completed",    val: d.completed,          Icon: CheckCircle2, color: "#4ade80" },
                                    { label: "Avg Score",    val: d.avg,                Icon: BarChart2,  color: scoreColor(d.avg) },
                                    { label: "Top Score",    val: d.topScore,           Icon: Award,      color: "#fbbf24" },
                                    { label: "Pass Rate",    val: `${d.passRate}%`,     Icon: TrendingUp, color: scoreColor(d.passRate) },
                                    { label: "Shortlisted",  val: d.shortlisted,        Icon: Target,     color: "#38bdf8" },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                                        style={{ background: "rgba(255,255,255,0.025)" }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                            style={{
                                                background: `${item.color}18`,
                                                border: `1px solid ${item.color}35`,
                                            }}
                                        >
                                            <item.Icon size={14} style={{ color: item.color }} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-base leading-none">
                                                {item.val}
                                            </p>
                                            <p className="text-white/30 text-[10px] mt-0.5">{item.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* completion bar */}
                            <div
                                className="rounded-xl p-4 border border-white/5"
                                style={{ background: "rgba(255,255,255,0.02)" }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">
                                        Completion Rate
                                    </p>
                                    <span className="text-white font-bold text-sm">{completionPct}%</span>
                                </div>
                                <MiniBar pct={completionPct} color="#818cf8" />
                                <p className="text-white/25 text-[10px] mt-2">
                                    {d.completed} of {d.registered} candidates completed
                                </p>
                            </div>

                            {/* description */}
                            <section>
                                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">
                                    About This Drive
                                </p>
                                <p className="text-white/55 text-xs leading-relaxed">
                                    {d.description}
                                </p>
                            </section>

                            {/* tags */}
                            <section>
                                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">
                                    Skills Assessed
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {d.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                                            style={{
                                                background: "rgba(99,102,241,0.1)",
                                                borderColor: "rgba(99,102,241,0.25)",
                                                color: "#a5b4fc",
                                            }}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* meta */}
                            <section>
                                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">
                                    Drive Details
                                </p>
                                <div className="space-y-2.5">
                                    {[
                                        { Icon: Calendar,   label: "Started",   val: d.date },
                                        { Icon: Clock,      label: "Duration",  val: d.duration },
                                        { Icon: Building2,  label: "Division",  val: d.position },
                                        { Icon: CheckCircle2, label: "Sentiment", val: d.sentiment, color: "#4ade80" },
                                    ].map(({ Icon, label, val, color }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <div
                                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                                style={{
                                                    background: "rgba(255,255,255,0.04)",
                                                    border: "1px solid rgba(255,255,255,0.07)",
                                                }}
                                            >
                                                <Icon size={12} className="text-indigo-400" />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between">
                                                <p className="text-white/35 text-[11px]">{label}</p>
                                                <p
                                                    className="text-xs font-medium"
                                                    style={{ color: color || "rgba(255,255,255,0.65)" }}
                                                >
                                                    {val}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}

                    {tab === "pipeline" && (
                        <div className="space-y-3">
                            {[
                                { label: "Registered",  val: d.registered,                                 color: "#818cf8", pct: 100 },
                                { label: "Completed",   val: d.completed,                                  color: "#6366f1", pct: Math.round((d.completed / d.registered) * 100) },
                                { label: "Passed",      val: Math.round(d.completed * (d.passRate / 100)), color: "#4ade80", pct: d.passRate },
                                { label: "Shortlisted", val: d.shortlisted,                                color: "#fbbf24", pct: Math.round((d.shortlisted / d.registered) * 100) },
                            ].map((stage, i) => (
                                <motion.div
                                    key={stage.label}
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className="rounded-xl p-4 border border-white/5"
                                    style={{ background: "rgba(255,255,255,0.025)" }}
                                >
                                    <div className="flex items-center justify-between mb-2.5">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ background: stage.color }}
                                            />
                                            <p className="text-white/60 text-[11px] font-semibold uppercase tracking-wider">
                                                {stage.label}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-white font-bold text-sm">{stage.val}</span>
                                            <span className="text-white/30 text-[10px] ml-1">({stage.pct}%)</span>
                                        </div>
                                    </div>
                                    <MiniBar pct={stage.pct} color={stage.color} />
                                </motion.div>
                            ))}

                            <div
                                className="rounded-xl p-4 border border-indigo-500/15 flex items-center gap-3"
                                style={{ background: "rgba(99,102,241,0.06)" }}
                            >
                                <Activity size={14} className="text-indigo-400 shrink-0" />
                                <p className="text-white/50 text-[11px]">
                                    Avg Score: <span className="text-white font-bold">{d.avg}</span> ·
                                    Top Score: <span className="text-white font-bold">{d.topScore}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {tab === "timeline" && (
                        <div className="space-y-2">
                            {d.timeline.map((step, i) => {
                                const isLast = i === d.timeline.length - 1;
                                const isCurrent =
                                    step.done && (isLast || !d.timeline[i + 1]?.done);
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className="flex gap-3"
                                    >
                                        <div className="flex flex-col items-center">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                                                style={{
                                                    background: step.done
                                                        ? isCurrent
                                                            ? "rgba(99,102,241,0.2)"
                                                            : "rgba(74,222,128,0.15)"
                                                        : "rgba(255,255,255,0.05)",
                                                    border: step.done
                                                        ? isCurrent
                                                            ? "1px solid rgba(99,102,241,0.5)"
                                                            : "1px solid rgba(74,222,128,0.4)"
                                                        : "1px solid rgba(255,255,255,0.1)",
                                                }}
                                            >
                                                {step.done ? (
                                                    isCurrent ? (
                                                        <Zap size={11} className="text-indigo-400" />
                                                    ) : (
                                                        <CheckCircle2 size={11} className="text-emerald-400" />
                                                    )
                                                ) : (
                                                    <Clock size={11} className="text-white/20" />
                                                )}
                                            </div>
                                            {!isLast && (
                                                <div
                                                    className="w-px flex-1 mt-1"
                                                    style={{
                                                        background: step.done
                                                            ? "rgba(74,222,128,0.2)"
                                                            : "rgba(255,255,255,0.06)",
                                                        minHeight: "24px",
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="pb-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <p
                                                    className="text-xs font-semibold"
                                                    style={{
                                                        color: step.done
                                                            ? isCurrent
                                                                ? "#a5b4fc"
                                                                : "rgba(255,255,255,0.75)"
                                                            : "rgba(255,255,255,0.25)",
                                                    }}
                                                >
                                                    {step.label}
                                                </p>
                                                {isCurrent && (
                                                    <span
                                                        className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                                        style={{
                                                            background: "rgba(99,102,241,0.2)",
                                                            color: "#a5b4fc",
                                                            border: "1px solid rgba(99,102,241,0.3)",
                                                        }}
                                                    >
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className="text-[10px] mt-0.5"
                                                style={{
                                                    color: step.done
                                                        ? "rgba(255,255,255,0.3)"
                                                        : "rgba(255,255,255,0.15)",
                                                }}
                                            >
                                                {step.date}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* sticky footer */}
                <div
                    className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
                    style={{ background: "rgba(10,8,22,0.96)" }}
                >
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                        <Eye size={13} /> View Results
                    </button>
                    <button
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                    >
                        <ArrowUpRight size={13} /> Open Drive
                    </button>
                </div>
            </motion.aside>
        </AnimatePresence>
    );
};

// ── Main Table ────────────────────────────────────────────────────────────────
const RecruitmentDrivesTable = () => {
    const [selected, setSelected] = useState(null);

    return (
        <>
            <div
                className="xl:col-span-2 rounded-2xl border border-white/5 overflow-hidden"
                style={{ background: "rgba(255,255,255,0.025)" }}
            >
                {/* header */}
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                        <Layers size={14} className="text-purple-400" />
                        Recent Recruitment Drives
                    </h3>
                    <button className="text-purple-400 text-xs hover:text-purple-300 flex items-center gap-0.5 transition">
                        View all
                        <ChevronRight size={12} />
                    </button>
                </div>

                {/* table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-white/30 border-b border-white/5">
                                {[
                                    "Drive Name",
                                    "Position",
                                    "Started",
                                    "Registered",
                                    "Completed",
                                    "Avg Score",
                                    "Sentiment",
                                    "Status",
                                    "",
                                ].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-3 font-medium whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recruitmentDrives.map((d, i) => (
                                <motion.tr
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.05 + 0.4 }}
                                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                                >
                                    <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                                        {d.name}
                                    </td>
                                    <td className="px-4 py-3 text-white/45">{d.position}</td>
                                    <td className="px-4 py-3 text-white/45 whitespace-nowrap">
                                        {d.date}
                                    </td>
                                    <td className="px-4 py-3 text-white/65">{d.registered}</td>
                                    <td className="px-4 py-3 text-white/65">{d.completed}</td>
                                    <td className="px-4 py-3 text-white/65">{d.avg}</td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-emerald-400">
                                            <CheckCircle2 size={11} />
                                            {d.sentiment}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyles[d.status]}`}
                                        >
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelected(d)}
                                            className="text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all text-[11px] flex items-center gap-0.5"
                                        >
                                            Details
                                            <ChevronRight size={11} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <DriveDrawer drive={selected} onClose={() => setSelected(null)} />
        </>
    );
};

export default RecruitmentDrivesTable;