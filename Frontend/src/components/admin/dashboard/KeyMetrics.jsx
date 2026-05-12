// src/components/admin/dashboard/KeyMetrics.jsx

import React from "react";

import {
    UserCircle2,
    CheckCircle2,
    Star,
    MessageSquare,
    BarChart3,
} from "lucide-react";

const metrics = [
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

const KeyMetrics = () => {
    return (
        <>
            <p className="text-white/45 font-semibold text-[11px] uppercase tracking-widest flex items-center gap-2">
                <BarChart3
                    size={12}
                    className="text-purple-400"
                />
                Key Metrics
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {metrics.map((m, i) => (
                    <div
                        key={i}
                        className="rounded-2xl p-4 border border-white/5"
                        style={{
                            background:
                                "rgba(255,255,255,0.03)",
                        }}
                    >
                        <m.Icon
                            size={20}
                            className="text-purple-400 opacity-70"
                        />

                        <p className="text-white text-2xl font-bold mt-2">
                            {m.value}
                        </p>

                        <p className="text-white/40 text-xs mt-1">
                            {m.label}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
};

export default KeyMetrics;