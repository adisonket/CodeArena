// src/components/admin/data/dashboardData.js

import {
    Users,
    ClipboardList,
    Mic,
    UserCircle2,
    CheckCircle2,
    Star,
    MessageSquare,
    MonitorPlay,
    TrendingUp,
    ShieldCheck,
    Zap,
    AlertTriangle,
    Wifi,
} from "lucide-react";

/* =========================
   KPI CARDS
========================= */

export const kpiCards = [
    {
        label: "Total Candidates",
        value: "12850",
        sub: "+9.2% this week",
        pct: 73,
        color: "#8b5cf6",
        glow: "rgba(139,92,246,0.28)",
        Icon: Users,
    },
    {
        label: "Assessments Completed",
        value: "9420",
        sub: "73.3% completion rate",
        pct: 80,
        color: "#fb7185",
        glow: "rgba(244,63,94,0.28)",
        Icon: ClipboardList,
    },
    {
        label: "Interviews Conducted",
        value: "1510",
        sub: "Average sentiment: 8.4/10",
        pct: 85,
        color: "#facc15",
        glow: "rgba(250,204,21,0.22)",
        Icon: Mic,
    },
];

/* =========================
   KEY METRICS
========================= */

export const keyMetrics = [
    {
        label: "Total Candidates",
        value: "103",
        Icon: UserCircle2,
    },
    {
        label: "Interview Completion Rate",
        value: "29%",
        Icon: CheckCircle2,
    },
    {
        label: "Average Score",
        value: "3.25",
        Icon: Star,
    },
    {
        label: "Feedback Response Rate",
        value: "69%",
        Icon: MessageSquare,
    },
];

/* =========================
   RECRUITMENT DRIVES
========================= */

export const recruitmentDrives = [
    {
        name: "Senior ML Engineer",
        position: "AI Div",
        date: "12 Apr 2026",
        registered: 1200,
        completed: 950,
        avg: 88,
        sentiment: "Positive",
        status: "Active",
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
    },
];

/* =========================
   STATUS STYLES
========================= */

export const statusStyles = {
    Active:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",

    Completed:
        "bg-sky-500/15 text-sky-400 border border-sky-500/25",

    "On-Hold":
        "bg-amber-500/15 text-amber-400 border border-amber-500/25",
};

/* =========================
   ACTIVITY FEED
========================= */

export const activityFeed = [
    {
        action: "AI assessment completed",
        time: "1m ago",
        color: "#818cf8",
        Icon: CheckCircle2,
    },
    {
        action: "Interview started",
        time: "5m ago",
        color: "#a855f7",
        Icon: MonitorPlay,
    },
    {
        action: "Shortlist updated",
        time: "15m ago",
        color: "#f472b6",
        Icon: ClipboardList,
    },
    {
        action: "Candidate confirmed",
        time: "20m ago",
        color: "#facc15",
        Icon: Users,
    },
];

/* =========================
   NOTIFICATIONS
========================= */

export const notificationsData = [
    {
        id: 1,
        Icon: CheckCircle2,
        title: "Assessment Completed",
        body: "Candidate scored 94/100.",
        time: "1m ago",
        read: false,
        color: "#4ade80",
    },
    {
        id: 2,
        Icon: TrendingUp,
        title: "Weekly Report Ready",
        body: "+9.2% this week",
        time: "1h ago",
        read: false,
        color: "#a855f7",
    },
    {
        id: 3,
        Icon: ShieldCheck,
        title: "System Health OK",
        body: "All services stable.",
        time: "2h ago",
        read: true,
        color: "#22d3ee",
    },
    {
        id: 4,
        Icon: Zap,
        title: "Queue Spike",
        body: "Queue depth hit 48.",
        time: "3h ago",
        read: true,
        color: "#f472b6",
    },
];

/* =========================
   TREND DATA
========================= */

export const trendA = [
    15, 20, 18, 35, 50,
    45, 60, 72, 68, 80,
];

export const trendB = [
    3, 8, 12, 6, 20,
    30, 22, 35, 40, 38,
];

export const reviewData = [
    20, 45, 35, 60, 80,
    70, 90, 75, 85, 95,
];

/* =========================
   SKILL PERFORMANCE
========================= */

export const skillSeries = [
    {
        label: "Coding",
        data: [55, 72, 68, 85, 90, 95],
    },
    {
        label: "Communication",
        data: [80, 65, 75, 60, 70, 68],
    },
    {
        label: "Problem Solving",
        data: [60, 58, 72, 80, 62, 88],
    },
];

/* =========================
   SYSTEM HEALTH
========================= */

export const systemHealth = [
    {
        label: "API Latency",
        val: "48ms",
        bar: 95,
        color: "#22d3ee",
        Icon: Wifi,
    },
    {
        label: "Model Uptime",
        val: "99.9%",
        bar: 99,
        color: "#4ade80",
        Icon: ShieldCheck,
    },
    {
        label: "Queue Depth",
        val: "12",
        bar: 24,
        color: "#facc15",
        Icon: Zap,
    },
    {
        label: "Error Rate",
        val: "0.02%",
        bar: 2,
        color: "#f87171",
        Icon: AlertTriangle,
    },
];