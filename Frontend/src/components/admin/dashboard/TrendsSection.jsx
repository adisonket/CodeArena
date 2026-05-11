// src/components/admin/dashboard/TrendsSection.jsx

import React from "react";

import {
    TrendingUp,
    BarChart3,
} from "lucide-react";

import CircleProgress from "../charts/CircleProgress";
import MiniLineChart from "../charts/MiniLineChart";
import MultiLineChart from "../charts/MultiLineChart";
import AreaChart from "../charts/AreaChart";

const trendA = [
    15, 20, 18, 35, 50,
    45, 60, 72, 68, 80,
];

const trendB = [
    3, 8, 12, 6, 20,
    30, 22, 35, 40, 38,
];

const reviewData = [
    20, 45, 35, 60, 80,
    70, 90, 75, 85, 95,
];

const skillSeries = [
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

const TrendsSection = () => {
    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* FEEDBACK TRENDS */}

            <div
                className="rounded-2xl border border-white/5 p-5"
                style={{
                    background:
                        "rgba(255,255,255,0.025)",
                }}
            >
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <TrendingUp
                        size={14}
                        className="text-purple-400"
                    />
                    Assessment Trends
                </h3>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            pct: 15,
                            data: trendA,
                            color: "#a855f7",
                            label: "Positive",
                        },
                        {
                            pct: 3,
                            data: trendB,
                            color: "#818cf8",
                            label: "Flagged",
                        },
                    ].map((t, i) => (
                        <div
                            key={i}
                            className="rounded-xl p-3 border border-white/5"
                            style={{
                                background:
                                    "rgba(255,255,255,0.02)",
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <CircleProgress
                                    pct={t.pct}
                                    size={42}
                                    stroke={4}
                                    color={t.color}
                                />

                                <span className="text-white/45 text-[11px]">
                                    {t.label}
                                </span>
                            </div>

                            <MiniLineChart
                                data={t.data}
                                color={t.color}
                                height={50}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* SKILL PERFORMANCE */}

            <div
                className="rounded-2xl border border-white/5 p-5"
                style={{
                    background:
                        "rgba(255,255,255,0.025)",
                }}
            >
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <BarChart3
                        size={14}
                        className="text-purple-400"
                    />
                    Skill Performance
                </h3>

                <MultiLineChart
                    series={skillSeries}
                    height={130}
                />
            </div>

            {/* REVIEW TREND */}

            <div
                className="rounded-2xl border border-white/5 p-5"
                style={{
                    background:
                        "rgba(255,255,255,0.025)",
                }}
            >
                <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                    <TrendingUp
                        size={14}
                        className="text-purple-400"
                    />
                    Review Trend
                </h3>

                <AreaChart
                    data={reviewData}
                    color="#a855f7"
                    height={100}
                />
            </div>
        </div>
    );
};

export default TrendsSection;