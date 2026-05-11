// src/components/admin/dashboard/ActivityFeed.jsx

import React from "react";

import {
    Activity,
    CheckCircle2,
    MonitorPlay,
    ClipboardList,
    Users,
    Clock,
} from "lucide-react";

const activityFeed = [
    {
        action:
            "AI assessment completed",
        time: "1m ago",
        color: "#818cf8",
        Icon: CheckCircle2,
    },
    {
        action:
            "Interview started",
        time: "5m ago",
        color: "#a855f7",
        Icon: MonitorPlay,
    },
    {
        action:
            "Shortlist updated",
        time: "15m ago",
        color: "#f472b6",
        Icon: ClipboardList,
    },
    {
        action:
            "Candidate confirmed",
        time: "20m ago",
        color: "#facc15",
        Icon: Users,
    },
];

const ActivityFeed = () => {
    return (
        <div
            className="rounded-2xl border border-white/5 p-5"
            style={{
                background:
                    "rgba(255,255,255,0.025)",
            }}
        >
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Activity
                    size={14}
                    className="text-purple-400"
                />
                Live Activity Feed
            </h3>

            <div className="space-y-4">
                {activityFeed.map((a, i) => (
                    <div
                        key={i}
                        className="flex gap-3 items-start"
                    >
                        <div
                            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center"
                            style={{
                                background: `${a.color}20`,
                                border: `1px solid ${a.color}40`,
                            }}
                        >
                            <a.Icon
                                size={13}
                                style={{
                                    color: a.color,
                                }}
                            />
                        </div>

                        <div>
                            <p className="text-white/80 text-xs">
                                {a.action}
                            </p>

                            <p className="text-white/30 text-[10px] mt-1 flex items-center gap-1">
                                <Clock size={9} />
                                {a.time}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityFeed;