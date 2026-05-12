// src/components/admin/dashboard/SystemHealth.jsx

import React from "react";

import {
    Cpu,
    Wifi,
    ShieldCheck,
    Zap,
    AlertTriangle,
} from "lucide-react";

import { motion } from "framer-motion";

const systems = [
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

const SystemHealth = () => {
    return (
        <div
            className="rounded-2xl border border-white/5 p-5"
            style={{
                background:
                    "rgba(255,255,255,0.025)",
            }}
        >
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Cpu
                    size={14}
                    className="text-purple-400"
                />
                System Health
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {systems.map((s, i) => (
                    <div
                        key={i}
                        className="rounded-xl p-4 border border-white/5"
                        style={{
                            background:
                                "rgba(255,255,255,0.02)",
                        }}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-white/40 text-xs">
                                {s.label}
                            </p>

                            <s.Icon
                                size={12}
                                style={{
                                    color: s.color,
                                }}
                            />
                        </div>

                        <p className="text-white text-lg font-bold mb-2">
                            {s.val}
                        </p>

                        <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                            <motion.div
                                initial={{
                                    width: 0,
                                }}
                                animate={{
                                    width: `${s.bar}%`,
                                }}
                                transition={{
                                    duration: 0.8,
                                }}
                                className="h-full rounded-full"
                                style={{
                                    background:
                                        s.color,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SystemHealth;