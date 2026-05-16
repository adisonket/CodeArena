import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Plus, Search, X, ChevronRight, ChevronDown,
  SlidersHorizontal, Users, Star, BarChart2, Clock,
  Calendar, CheckCircle2, AlertCircle, Download,
  ArrowUpRight, Mic, MicOff, Camera, CameraOff,
  MessageSquare, FileText, User, Briefcase,
  TrendingUp, Award, Play, Pause, MoreHorizontal,
  Filter, RefreshCw, Send, ThumbsUp, ThumbsDown,
  ClipboardList, Zap, Eye, Edit3, Copy,
  PhoneOff, CircleDot, Timer, MapPin, Link2,
  ChevronLeft, Hash, BookOpen,
} from "lucide-react";

// ── mock data ─────────────────────────────────────────────────────────────────
const INTERVIEWS = [
  {
    id: "i001", candidate: "Aryan Mehta", role: "Senior ML Engineer",
    drive: "Senior ML Engineer Drive", avatar: "AM",
    scheduledAt: "2026-05-14T10:00:00Z", duration: 60,
    status: "Scheduled", type: "Technical", round: "Round 2",
    interviewer: "Dr. Priya Nair", interviewerRole: "ML Lead",
    score: null, recommendation: null,
    assessmentScore: 91, rank: 3,
    tags: ["Machine Learning", "Python", "System Design"],
    location: "Google Meet", meetLink: "meet.google.com/xyz-abc-def",
    notes: "",
  },
  {
    id: "i002", candidate: "Sanya Kapoor", role: "Frontend Dev Q2",
    drive: "Frontend Dev Q2 Drive", avatar: "SK",
    scheduledAt: "2026-05-13T14:30:00Z", duration: 45,
    status: "Completed", type: "Technical", round: "Round 1",
    interviewer: "Rohan Verma", interviewerRole: "Frontend Architect",
    score: 87, recommendation: "Strong Hire",
    assessmentScore: 95, rank: 1,
    tags: ["React", "TypeScript", "CSS"],
    location: "Google Meet", meetLink: "meet.google.com/abc-xyz-123",
    notes: "Excellent problem-solving approach. Strong grasp of React internals.",
  },
  {
    id: "i003", candidate: "Karan Joshi", role: "Data Scientist",
    drive: "Data Scientist Drive", avatar: "KJ",
    scheduledAt: "2026-05-13T11:00:00Z", duration: 60,
    status: "Completed", type: "HR", round: "HR Round",
    interviewer: "Meena Shah", interviewerRole: "HR Manager",
    score: 72, recommendation: "Hire",
    assessmentScore: 83, rank: 7,
    tags: ["Python", "Statistics", "ML"],
    location: "Zoom", meetLink: "zoom.us/j/123456789",
    notes: "Good culture fit. Salary expectations within range.",
  },
  {
    id: "i004", candidate: "Preethi Rajan", role: "QA Specialist",
    drive: "QA Specialist Drive", avatar: "PR",
    scheduledAt: "2026-05-15T09:00:00Z", duration: 45,
    status: "Scheduled", type: "Technical", round: "Round 1",
    interviewer: "Amit Choudhary", interviewerRole: "QA Lead",
    score: null, recommendation: null,
    assessmentScore: 88, rank: 2,
    tags: ["QA", "Selenium", "JIRA"],
    location: "Google Meet", meetLink: "meet.google.com/pqr-stu-vwx",
    notes: "",
  },
  {
    id: "i005", candidate: "Nikhil Tiwari", role: "DevOps Engineer",
    drive: "DevOps Engineer Drive", avatar: "NT",
    scheduledAt: "2026-05-12T15:00:00Z", duration: 60,
    status: "No-Show", type: "Technical", round: "Round 1",
    interviewer: "Suresh Kumar", interviewerRole: "DevOps Architect",
    score: null, recommendation: "No Hire",
    assessmentScore: 79, rank: 5,
    tags: ["Kubernetes", "AWS", "Terraform"],
    location: "Google Meet", meetLink: "meet.google.com/nop-qrs-tuv",
    notes: "Candidate did not join. Reschedule requested.",
  },
  {
    id: "i006", candidate: "Divya Sharma", role: "Senior ML Engineer",
    drive: "Senior ML Engineer Drive", avatar: "DS",
    scheduledAt: "2026-05-14T13:00:00Z", duration: 90,
    status: "In Progress", type: "Technical", round: "Final Round",
    interviewer: "Dr. Priya Nair", interviewerRole: "ML Lead",
    score: null, recommendation: null,
    assessmentScore: 97, rank: 1,
    tags: ["Deep Learning", "MLOps", "Python"],
    location: "Google Meet", meetLink: "meet.google.com/abc-def-ghi",
    notes: "",
  },
  {
    id: "i007", candidate: "Rahul Gupta", role: "Marketing Lead",
    drive: "Marketing Lead Drive", avatar: "RG",
    scheduledAt: "2026-05-11T10:00:00Z", duration: 30,
    status: "Completed", type: "HR", round: "Final Round",
    interviewer: "Meena Shah", interviewerRole: "HR Manager",
    score: 90, recommendation: "Strong Hire",
    assessmentScore: 88, rank: 2,
    tags: ["Marketing", "Analytics", "Strategy"],
    location: "Office", meetLink: "",
    notes: "Outstanding communication. Immediate joiner.",
  },
  {
    id: "i008", candidate: "Tanvi Bhat", role: "Frontend Dev Q2",
    drive: "Frontend Dev Q2 Drive", avatar: "TB",
    scheduledAt: "2026-05-16T11:30:00Z", duration: 60,
    status: "Scheduled", type: "Design", round: "Round 2",
    interviewer: "Rohan Verma", interviewerRole: "Frontend Architect",
    score: null, recommendation: null,
    assessmentScore: 93, rank: 2,
    tags: ["React", "Figma", "Accessibility"],
    location: "Google Meet", meetLink: "meet.google.com/uvw-xyz-abc",
    notes: "",
  },
];

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
  Scheduled:   { cls: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/25",   dot: "#818cf8" },
  Completed:   { cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25", dot: "#4ade80" },
  "In Progress":{ cls: "bg-amber-500/15 text-amber-400 border border-amber-500/25",      dot: "#fbbf24" },
  "No-Show":   { cls: "bg-rose-500/15 text-rose-400 border border-rose-500/25",          dot: "#f87171" },
};

const TYPE_META = {
  Technical: { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)" },
  HR:        { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)"  },
  Design:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)"  },
};

const REC_META = {
  "Strong Hire": { color: "#4ade80", bg: "rgba(74,222,128,0.1)",  border: "rgba(74,222,128,0.25)"  },
  "Hire":        { color: "#818cf8", bg: "rgba(129,140,248,0.1)", border: "rgba(129,140,248,0.25)" },
  "No Hire":     { color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.25)" },
};

const AVATAR_COLORS = ["#6366f1","#8b5cf6","#a855f7","#ec4899","#f59e0b","#10b981","#0ea5e9","#f43f5e"];
const avatarColor = (s) => AVATAR_COLORS[s.charCodeAt(0) % AVATAR_COLORS.length];

const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const fmtDateTime = (iso) => `${fmtDate(iso)} · ${fmtTime(iso)}`;

const isToday = (iso) => {
  const d = new Date(iso);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
};

// ── MiniBar ───────────────────────────────────────────────────────────────────
const MiniBar = ({ pct, color }) => (
  <div className="h-1 rounded-full overflow-hidden w-full" style={{ background: "rgba(255,255,255,0.06)" }}>
    <motion.div
      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
      transition={{ duration: 0.9, ease: "easeOut" }}
      className="h-full rounded-full" style={{ background: color }}
    />
  </div>
);

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ initials, size = 36, pulse = false }) => {
  const color = avatarColor(initials);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full flex items-center justify-center font-bold"
        style={{
          width: size, height: size, fontSize: size * 0.32,
          background: `${color}22`, border: `1.5px solid ${color}50`, color,
        }}
      >
        {initials}
      </div>
      {pulse && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#0a0816] animate-pulse" />
      )}
    </div>
  );
};

// ── Interview Card ────────────────────────────────────────────────────────────
const InterviewCard = ({ interview: iv, onClick }) => {
  const sm = STATUS_META[iv.status] ?? STATUS_META.Scheduled;
  const tm = TYPE_META[iv.type]     ?? TYPE_META.Technical;
  const today = isToday(iv.scheduledAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      onClick={onClick}
      className="rounded-2xl border border-white/[0.06] overflow-hidden cursor-pointer group"
      style={{ background: "rgba(255,255,255,0.025)" }}
    >
      {/* top accent bar */}
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${avatarColor(iv.avatar)},${avatarColor(iv.avatar)}55,transparent)` }} />

      <div className="p-5 space-y-4">
        {/* header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <Avatar initials={iv.avatar} pulse={iv.status === "In Progress"} />
            <div>
              <p className="text-white font-bold text-sm leading-tight group-hover:text-indigo-200 transition">{iv.candidate}</p>
              <p className="text-white/35 text-[10px] mt-0.5">{iv.role}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shrink-0 ${sm.cls}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
            {iv.status}
          </span>
        </div>

        {/* meta chips */}
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
            style={{ background: tm.bg, borderColor: tm.border, color: tm.color }}>
            {iv.type}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[10px] border border-white/10 text-white/40 flex items-center gap-1">
            <Hash size={8} /> {iv.round}
          </span>
          {today && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border border-amber-500/30 text-amber-400"
              style={{ background: "rgba(251,191,36,0.08)" }}>
              Today
            </span>
          )}
        </div>

        {/* time & duration */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Scheduled", val: fmtDateTime(iv.scheduledAt), Icon: Calendar },
            { label: "Duration",  val: `${iv.duration} min`,        Icon: Timer },
          ].map((s, i) => (
            <div key={i} className="rounded-xl p-2.5 border border-white/[0.05] flex flex-col gap-1"
              style={{ background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-1 text-white/25">
                <s.Icon size={9} /><p className="text-[9px] uppercase tracking-wider">{s.label}</p>
              </div>
              <p className="text-white text-[10px] font-semibold leading-snug">{s.val}</p>
            </div>
          ))}
        </div>

        {/* interviewer */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/5"
          style={{ background: "rgba(255,255,255,0.02)" }}>
          <User size={11} className="text-indigo-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-white/70 text-[11px] font-medium truncate">{iv.interviewer}</p>
            <p className="text-white/25 text-[10px]">{iv.interviewerRole}</p>
          </div>
          {iv.score !== null && (
            <div className="text-right shrink-0">
              <p className="text-white font-bold text-sm" style={{ color: iv.score >= 80 ? "#4ade80" : iv.score >= 65 ? "#facc15" : "#f87171" }}>{iv.score}</p>
              <p className="text-white/25 text-[9px]">Score</p>
            </div>
          )}
        </div>

        {/* recommendation or assessment score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-white/25 text-[10px]">Assessment:</span>
            <span className="text-white/70 text-[10px] font-bold">{iv.assessmentScore}</span>
            <span className="text-white/20 text-[10px]">· Rank #{iv.rank}</span>
          </div>
          {iv.recommendation ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{
                background: REC_META[iv.recommendation]?.bg,
                borderColor: REC_META[iv.recommendation]?.border,
                color: REC_META[iv.recommendation]?.color,
              }}>
              {iv.recommendation}
            </span>
          ) : (
            <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Interview Drawer ──────────────────────────────────────────────────────────
const InterviewDrawer = ({ interview: iv, onClose }) => {
  const [tab, setTab] = useState("details");
  const [note, setNote] = useState(iv?.notes || "");

  if (!iv) return null;

  const sm = STATUS_META[iv.status] ?? STATUS_META.Scheduled;
  const tm = TYPE_META[iv.type]     ?? TYPE_META.Technical;

  return (
    <AnimatePresence>
      <motion.div key="ov"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside key="dr"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 h-full w-full max-w-[460px] z-50 flex flex-col border-l border-white/8 overflow-y-auto"
        style={{ background: "rgba(10,8,22,0.99)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* sticky header */}
        <div className="sticky top-0 z-10 px-6 py-5 border-b border-white/6"
          style={{ background: "rgba(10,8,22,0.96)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar initials={iv.avatar} size={40} pulse={iv.status === "In Progress"} />
              <div>
                <p className="text-white font-bold text-sm">{iv.candidate}</p>
                <p className="text-white/35 text-[11px] mt-0.5">{iv.role} · {iv.round}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${sm.cls}`}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
                {iv.status}
              </span>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/6 transition">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* tabs */}
          <div className="flex gap-1 mt-4">
            {["details", "feedback", "candidate"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition border ${tab === t
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "text-white/35 border-transparent hover:text-white/60"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 px-6 py-5 space-y-5">

          {/* ── DETAILS TAB ── */}
          {tab === "details" && (<>

            {/* if in progress — live banner */}
            {iv.status === "In Progress" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl p-3.5 flex items-center gap-3 border border-amber-500/25"
                style={{ background: "rgba(251,191,36,0.06)" }}>
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <div className="flex-1">
                  <p className="text-amber-300 text-xs font-semibold">Interview in progress</p>
                  <p className="text-amber-400/50 text-[10px] mt-0.5">Session started at {fmtTime(iv.scheduledAt)}</p>
                </div>
                <a href={`https://${iv.meetLink}`} target="_blank" rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1.5"
                  style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  <Video size={11} /> Join
                </a>
              </motion.div>
            )}

            {/* score + recommendation */}
            {iv.status === "Completed" && (
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { label: "Interview Score", val: iv.score ?? "—", color: iv.score >= 80 ? "#4ade80" : iv.score >= 65 ? "#facc15" : "#f87171", Icon: Star },
                  { label: "Assessment Score", val: iv.assessmentScore, color: "#818cf8", Icon: BarChart2 },
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
            )}

            {/* recommendation badge */}
            {iv.recommendation && (
              <div className="rounded-xl p-4 border flex items-center gap-3"
                style={{
                  background: REC_META[iv.recommendation]?.bg ?? "rgba(255,255,255,0.02)",
                  borderColor: REC_META[iv.recommendation]?.border ?? "rgba(255,255,255,0.05)",
                }}>
                {iv.recommendation === "Strong Hire" && <ThumbsUp size={16} style={{ color: REC_META[iv.recommendation]?.color }} />}
                {iv.recommendation === "Hire"        && <CheckCircle2 size={16} style={{ color: REC_META[iv.recommendation]?.color }} />}
                {iv.recommendation === "No Hire"     && <ThumbsDown size={16} style={{ color: REC_META[iv.recommendation]?.color }} />}
                <div>
                  <p className="text-xs font-bold" style={{ color: REC_META[iv.recommendation]?.color }}>{iv.recommendation}</p>
                  <p className="text-white/30 text-[10px] mt-0.5">Recommendation by {iv.interviewer}</p>
                </div>
              </div>
            )}

            {/* schedule info */}
            <section>
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Schedule</p>
              <div className="space-y-2.5">
                {[
                  { Icon: Calendar, label: "Date & Time", val: fmtDateTime(iv.scheduledAt) },
                  { Icon: Timer,    label: "Duration",    val: `${iv.duration} minutes` },
                  { Icon: MapPin,   label: "Location",    val: iv.location },
                  { Icon: Hash,     label: "Round",       val: iv.round },
                  { Icon: Video,    label: "Type",        val: iv.type, color: tm.color },
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

            {/* interviewer */}
            <section>
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Interviewer</p>
              <div className="rounded-xl p-3.5 border border-white/5 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.025)" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }}>
                  {iv.interviewer.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{iv.interviewer}</p>
                  <p className="text-white/35 text-[10px] mt-0.5">{iv.interviewerRole}</p>
                </div>
              </div>
            </section>

            {/* meet link */}
            {iv.meetLink && (
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Meeting Link</p>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/5"
                  style={{ background: "rgba(255,255,255,0.02)" }}>
                  <Link2 size={12} className="text-indigo-400 shrink-0" />
                  <p className="text-indigo-300 text-[11px] flex-1 truncate">{iv.meetLink}</p>
                  <button className="text-white/30 hover:text-white/70 transition">
                    <Copy size={12} />
                  </button>
                </div>
              </section>
            )}

            {/* tags */}
            <section>
              <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Skills Focus</p>
              <div className="flex flex-wrap gap-1.5">
                {iv.tags.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                    style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                    {t}
                  </span>
                ))}
              </div>
            </section>
          </>)}

          {/* ── FEEDBACK TAB ── */}
          {tab === "feedback" && (
            <div className="space-y-4">
              {iv.status === "Completed" && iv.notes ? (
                <>
                  <div className="rounded-xl p-4 border border-indigo-500/15"
                    style={{ background: "rgba(99,102,241,0.05)" }}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-500/10">
                      <MessageSquare size={13} className="text-indigo-400" />
                      <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">Interviewer Notes</p>
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">{iv.notes}</p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Skill Ratings</p>
                    {[
                      { skill: "Technical Knowledge", score: 88 },
                      { skill: "Problem Solving",     score: 82 },
                      { skill: "Communication",       score: 90 },
                      { skill: "Culture Fit",         score: 85 },
                    ].map((s) => (
                      <div key={s.skill} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-white/50 text-[11px]">{s.skill}</span>
                          <span className="text-white/70 text-[11px] font-bold">{s.score}</span>
                        </div>
                        <MiniBar pct={s.score} color={s.score >= 85 ? "#4ade80" : s.score >= 70 ? "#facc15" : "#f87171"} />
                      </div>
                    ))}
                  </div>
                </>
              ) : iv.status === "Completed" ? (
                <div className="space-y-3">
                  <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold">Add Feedback</p>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Write your interview feedback here…"
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl text-xs text-white/70 placeholder-white/20 border border-white/6 outline-none focus:border-indigo-500/40 resize-none transition"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                  />
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    <Send size={12} /> Submit Feedback
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <MessageSquare size={20} className="text-indigo-400" />
                  </div>
                  <p className="text-white font-semibold text-sm">No feedback yet</p>
                  <p className="text-white/30 text-xs max-w-[200px]">
                    Feedback will be available once the interview is completed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── CANDIDATE TAB ── */}
          {tab === "candidate" && (
            <div className="space-y-4">
              {/* candidate header */}
              <div className="rounded-xl p-4 border border-white/5 flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.025)" }}>
                <Avatar initials={iv.avatar} size={52} />
                <div>
                  <p className="text-white font-bold text-base">{iv.candidate}</p>
                  <p className="text-white/40 text-xs mt-0.5">{iv.role}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-white/30 text-[10px]">Drive:</span>
                    <span className="text-indigo-300 text-[10px]">{iv.drive}</span>
                  </div>
                </div>
              </div>

              {/* performance */}
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-3">Performance</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Assessment Score", val: iv.assessmentScore, color: "#818cf8",  Icon: ClipboardList },
                    { label: "Drive Rank",       val: `#${iv.rank}`,      color: "#fbbf24",  Icon: Award },
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
              </section>

              {/* assessment score bar */}
              <div className="rounded-xl p-4 border border-white/5"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/40 text-[11px] font-semibold uppercase tracking-widest">Assessment Score</p>
                  <span className="text-white font-bold text-sm">{iv.assessmentScore}/100</span>
                </div>
                <MiniBar pct={iv.assessmentScore} color="#818cf8" />
              </div>

              {/* skills */}
              <section>
                <p className="text-white/35 text-[10px] uppercase tracking-widest font-semibold mb-2">Skill Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {iv.tags.map((t) => (
                    <span key={t} className="px-2.5 py-1 rounded-lg text-[11px] font-medium border"
                      style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.25)", color: "#a5b4fc" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </section>

              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                <Eye size={13} /> View Full Profile
              </button>
            </div>
          )}
        </div>

        {/* sticky footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-white/6 flex gap-2"
          style={{ background: "rgba(10,8,22,0.96)" }}>
          {iv.status === "Scheduled" || iv.status === "In Progress" ? (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                <RefreshCw size={13} /> Reschedule
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Video size={13} /> Join Interview
              </button>
            </>
          ) : (
            <>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/50 hover:bg-white/5 hover:text-white transition">
                <Copy size={13} /> Duplicate
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white transition"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <Edit3 size={13} /> Edit
              </button>
            </>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ── Table Row ─────────────────────────────────────────────────────────────────
const TableRow = ({ iv, i, onClick }) => {
  const sm = STATUS_META[iv.status] ?? STATUS_META.Scheduled;
  const tm = TYPE_META[iv.type]     ?? TYPE_META.Technical;
  return (
    <motion.tr
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
      onClick={onClick}
      className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group"
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar initials={iv.avatar} size={30} pulse={iv.status === "In Progress"} />
          <div>
            <p className="text-white font-semibold text-xs">{iv.candidate}</p>
            <p className="text-white/30 text-[10px] mt-0.5">{iv.role}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${sm.cls}`}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: sm.dot }} />
          {iv.status}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
          style={{ background: tm.bg, borderColor: tm.border, color: tm.color }}>
          {iv.type}
        </span>
      </td>
      <td className="px-5 py-3.5 text-white/50 text-xs">{fmtDate(iv.scheduledAt)}</td>
      <td className="px-5 py-3.5 text-white/50 text-xs">{iv.round}</td>
      <td className="px-5 py-3.5 text-white/50 text-xs">{iv.interviewer}</td>
      <td className="px-5 py-3.5">
        {iv.score !== null
          ? <span className="font-bold text-xs" style={{ color: iv.score >= 80 ? "#4ade80" : iv.score >= 65 ? "#facc15" : "#f87171" }}>{iv.score}</span>
          : <span className="text-white/20 text-xs">—</span>}
      </td>
      <td className="px-5 py-3.5">
        {iv.recommendation
          ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ background: REC_META[iv.recommendation]?.bg, borderColor: REC_META[iv.recommendation]?.border, color: REC_META[iv.recommendation]?.color }}>
              {iv.recommendation}
            </span>
          : <span className="text-white/20 text-xs">—</span>}
      </td>
      <td className="px-5 py-3.5">
        <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
      </td>
    </motion.tr>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminInterview = () => {
  const [interviews]    = useState(INTERVIEWS);
  const [search, setSearch]         = useState("");
  const [filterStatus, setStatus]   = useState("All");
  const [filterType, setType]       = useState("All");
  const [sortBy, setSortBy]         = useState("date");
  const [viewMode, setViewMode]     = useState("grid");
  const [selected, setSelected]     = useState(null);

  const statuses = ["All", "Scheduled", "In Progress", "Completed", "No-Show"];
  const types    = ["All", "Technical", "HR", "Design"];

  const filtered = interviews
    .filter((iv) => {
      const q = search.toLowerCase();
      const matchQ = !q || iv.candidate.toLowerCase().includes(q) || iv.role.toLowerCase().includes(q) || iv.round.toLowerCase().includes(q);
      const matchS = filterStatus === "All" || iv.status === filterStatus;
      const matchT = filterType   === "All" || iv.type   === filterType;
      return matchQ && matchS && matchT;
    })
    .sort((a, b) => {
      if (sortBy === "score") return (b.score ?? 0) - (a.score ?? 0);
      if (sortBy === "assessment") return b.assessmentScore - a.assessmentScore;
      return new Date(b.scheduledAt) - new Date(a.scheduledAt);
    });

  // summary stats
  const total       = interviews.length;
  const scheduled   = interviews.filter((iv) => iv.status === "Scheduled").length;
  const inProgress  = interviews.filter((iv) => iv.status === "In Progress").length;
  const completed   = interviews.filter((iv) => iv.status === "Completed").length;
  const scored      = interviews.filter((iv) => iv.score !== null);
  const avgScore    = scored.length ? Math.round(scored.reduce((s, iv) => s + iv.score, 0) / scored.length) : 0;
  const strongHires = interviews.filter((iv) => iv.recommendation === "Strong Hire").length;
  const todayCount  = interviews.filter((iv) => isToday(iv.scheduledAt)).length;

  return (
    <>
      <div className="w-full flex flex-col space-y-4">

        {/* page header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Video size={15} className="text-indigo-400" />
              <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest">Interviews</p>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Interview Hub</h2>
            <p className="text-white/35 text-xs mt-0.5">
              {total} interviews · {todayCount} today · {inProgress > 0 && <span className="text-amber-400">{inProgress} live</span>}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            <Plus size={13} /> Schedule Interview
          </motion.button>
        </div>

        {/* summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",        value: total,                    color: "#818cf8", Icon: Video },
            { label: "Scheduled",    value: scheduled + inProgress,   color: "#4ade80", Icon: Calendar },
            { label: "Avg Score",    value: avgScore || "—",          color: "#facc15", Icon: Star },
            { label: "Strong Hires", value: strongHires,              color: "#38bdf8", Icon: ThumbsUp },
          ].map((s, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-3 border border-white/5 flex items-center gap-3"
              style={{ background: "rgba(255,255,255,0.025)" }}
            >
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

        {/* today's interviews quick bar */}
        {interviews.filter((iv) => isToday(iv.scheduledAt)).length > 0 && (
          <div className="rounded-2xl border border-indigo-500/15 px-5 py-4"
            style={{ background: "rgba(99,102,241,0.05)" }}>
            <div className="flex items-center gap-2 mb-3">
              <CircleDot size={12} className="text-indigo-400" />
              <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">Today's Schedule</p>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {interviews.filter((iv) => isToday(iv.scheduledAt)).map((iv) => {
                const sm = STATUS_META[iv.status];
                return (
                  <button key={iv.id} onClick={() => setSelected(iv)}
                    className="shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/6 hover:bg-white/5 transition text-left"
                    style={{ background: "rgba(255,255,255,0.02)" }}>
                    <Avatar initials={iv.avatar} size={28} pulse={iv.status === "In Progress"} />
                    <div>
                      <p className="text-white text-[11px] font-semibold whitespace-nowrap">{iv.candidate}</p>
                      <p className="text-white/30 text-[9px] whitespace-nowrap">{fmtTime(iv.scheduledAt)} · {iv.round}</p>
                    </div>
                    <span className={`ml-1 w-1.5 h-1.5 rounded-full shrink-0`} style={{ background: sm?.dot }} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search candidates, roles, rounds…"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/25 border border-white/6 outline-none focus:border-indigo-500/40 transition"
              style={{ background: "rgba(255,255,255,0.04)" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                <X size={12} />
              </button>
            )}
          </div>

          {/* status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {statuses.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition border ${filterStatus === s
                  ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                  : "text-white/35 border-white/6 hover:bg-white/4 hover:text-white/60"}`}>
                {s}
              </button>
            ))}
          </div>

          {/* type filter */}
          <div className="relative">
            <select value={filterType} onChange={(e) => setType(e.target.value)}
              className="appearance-none pl-8 pr-6 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              {types.map((t) => <option key={t} value={t}>Type: {t}</option>)}
            </select>
            <Filter size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>

          {/* sort */}
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2.5 rounded-xl text-xs text-white/60 border border-white/6 outline-none cursor-pointer"
              style={{ background: "rgba(255,255,255,0.04)" }}>
              <option value="date">Sort: Date</option>
              <option value="score">Sort: Score</option>
              <option value="assessment">Sort: Assessment</option>
            </select>
            <SlidersHorizontal size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>

          {/* view toggle */}
          <div className="flex gap-1 p-1 rounded-xl border border-white/6" style={{ background: "rgba(255,255,255,0.03)" }}>
            {[{ key: "grid", Icon: Users }, { key: "table", Icon: BarChart2 }].map(({ key, Icon }) => (
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
              {filtered.length === 0
                ? <div className="col-span-full flex flex-col items-center py-16 text-white/20 gap-2">
                    <AlertCircle size={28} />
                    <p className="text-sm">No interviews match your filters.</p>
                  </div>
                : filtered.map((iv) => (
                    <InterviewCard key={iv.id} interview={iv} onClick={() => setSelected(iv)} />
                  ))}
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/5 overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-white/30 border-b border-white/5">
                      {["Candidate", "Status", "Type", "Date", "Round", "Interviewer", "Score", "Recommendation", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3.5 font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0
                      ? <tr><td colSpan={9} className="px-5 py-12 text-center text-white/25">No interviews match your filters.</td></tr>
                      : filtered.map((iv, i) => (
                          <TableRow key={iv.id} iv={iv} i={i} onClick={() => setSelected(iv)} />
                        ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
                <p className="text-white/25 text-[11px]">Showing {filtered.length} of {interviews.length} interviews</p>
                <button className="text-indigo-400 text-[11px] hover:text-indigo-300 flex items-center gap-1 transition">
                  Export CSV <Download size={11} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <InterviewDrawer interview={selected} onClose={() => setSelected(null)} />
    </>
  );
};

export default AdminInterview;