// src/components/admin/dashboard/NotificationPanel.jsx

import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import {
    Bell,
    CheckCircle2,
    Info,
    AlertTriangle,
    TrendingUp,
    ShieldCheck,
    Zap,
    Clock,
    X,
    ChevronRight,
} from "lucide-react";

const NOTIFS_INIT = [
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
        Icon: Info,
        title: "New Candidate Registered",
        body: "Frontend Dev Q2",
        time: "8m ago",
        read: false,
        color: "#818cf8",
    },
    {
        id: 3,
        Icon: AlertTriangle,
        title: "Drive On Hold",
        body: "QA drive paused.",
        time: "22m ago",
        read: false,
        color: "#facc15",
    },
    {
        id: 4,
        Icon: TrendingUp,
        title: "Weekly Report Ready",
        body: "+9.2% this week",
        time: "1h ago",
        read: true,
        color: "#a855f7",
    },
    {
        id: 5,
        Icon: ShieldCheck,
        title: "System Health OK",
        body: "All services stable.",
        time: "2h ago",
        read: true,
        color: "#22d3ee",
    },
    {
        id: 6,
        Icon: Zap,
        title: "Queue Spike",
        body: "Queue depth hit 48.",
        time: "3h ago",
        read: true,
        color: "#f472b6",
    },
];

const NotificationPanel = () => {
    const [open, setOpen] = useState(false);

    const [notifications, setNotifications] =
        useState(NOTIFS_INIT);

    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (
                ref.current &&
                !ref.current.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handler
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handler
            );
        };
    }, []);

    const unread = notifications.filter(
        (n) => !n.read
    ).length;

    const markAllRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({
                ...n,
                read: true,
            }))
        );
    };

    const dismiss = (id) => {
        setNotifications((prev) =>
            prev.filter((n) => n.id !== id)
        );
    };

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() =>
                    setOpen((prev) => !prev)
                }
                className="relative w-8 h-8 rounded-lg flex items-center justify-center text-white/45 hover:text-white hover:bg-white/5 transition-all"
            >
                <Bell size={16} />

                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-indigo-500 text-[9px] font-bold text-white flex items-center justify-center">
                        {unread}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 8,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 8,
                            scale: 0.97,
                        }}
                        className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
                        style={{
                            background:
                                "rgba(17,12,30,0.97)",
                            backdropFilter:
                                "blur(24px)",
                        }}
                    >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Bell
                                    size={14}
                                    className="text-purple-400"
                                />

                                <span className="text-white font-semibold text-sm">
                                    Notifications
                                </span>
                            </div>

                            <button
                                onClick={markAllRead}
                                className="text-[10px] text-purple-400"
                            >
                                Mark all read
                            </button>
                        </div>

                        <div
                            className="
                                    h-72
                                    overflow-y-auto
                                    overscroll-contain
                                    scrollbar-thin
                                    divide-y
                                    divide-white/[0.04]
                                    pr-1
                                "
                            onWheel={(e) => e.stopPropagation()}
                        >
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`relative flex gap-3 px-4 py-3 group hover:bg-white/[0.03] ${
                                        n.read
                                            ? "opacity-50"
                                            : ""
                                    }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                        style={{
                                            background: `${n.color}18`,
                                        }}
                                    >
                                        <n.Icon
                                            size={14}
                                            style={{
                                                color: n.color,
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-white text-[12px] font-semibold">
                                            {n.title}
                                        </p>

                                        <p className="text-white/45 text-[11px]">
                                            {n.body}
                                        </p>

                                        <p className="text-white/25 text-[10px] mt-1 flex items-center gap-1">
                                            <Clock size={9} />
                                            {n.time}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            dismiss(
                                                n.id
                                            )
                                        }
                                        className="opacity-0 group-hover:opacity-100 text-white/25 hover:text-white"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="px-4 py-2 border-t border-white/5 flex justify-center">
                            <button className="text-[11px] text-purple-400 flex items-center gap-1">
                                View all
                                <ChevronRight
                                    size={11}
                                />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationPanel;