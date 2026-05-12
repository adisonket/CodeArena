import React from "react";

import {
    Clock,
    Eye,
    Server,
    Trophy,
    FileText,
    Plug,
} from "lucide-react";

import NotificationPanel from "./NotificationPanel";

const headerNav = [
    {
        label: "Overview",
        Icon: Eye,
    },
    {
        label: "Drives",
        Icon: Server,
    },
    {
        label: "Results",
        Icon: Trophy,
    },
    {
        label: "Reports",
        Icon: FileText,
    },
    {
        label: "Integrations",
        Icon: Plug,
    },
];

const Header = ({ now }) => {
    const fmt = (d) =>
        d.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        }) +
        " " +
        d.toLocaleTimeString("en-US", {
            hour12: false,
        });

    return (
        <header
            className="flex items-center justify-between px-6 py-3 border-b border-white/5 backdrop-blur-sm sticky top-0 z-50"
            style={{
                background:
                    "rgba(13,10,26,0.88)",
            }}
        >
            <div className="flex items-center gap-3">
                <span className="text-white font-bold text-base tracking-wide">
                    CodeArena
                </span>

                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full border border-purple-500/40 text-purple-400 uppercase tracking-widest">
                    Pro
                </span>
            </div>

            <nav className="hidden md:flex items-center gap-1">
                {headerNav.map(
                    ({ label, Icon }) => (
                        <button
                            key={label}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/45 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Icon size={13} />
                            {label}
                        </button>
                    )
                )}
            </nav>

            <div className="flex items-center gap-3">
                <span className="text-white/35 text-[11px] hidden lg:flex items-center gap-1.5">
                    <Clock size={12} />
                    {fmt(now)}
                </span>

                {/* notification */}
                <NotificationPanel />

                {/* avatar */}
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{
                        background:
                            "linear-gradient(135deg,#6366f1,#8b5cf6,#a855f7)",
                    }}
                >
                    AH
                </div>
            </div>
        </header>
    );
};

export default Header;