import React from "react";
import { motion } from "framer-motion";

import {
    Layers,
    ChevronRight,
    CheckCircle2,
} from "lucide-react";

import {
    recruitmentDrives as drives,
    statusStyles as statusStyle,
} from "../data/dashboardData";

const RecruitmentDrivesTable = () => {
    return (
        <div
            className="xl:col-span-2 rounded-2xl border border-white/5 overflow-hidden"
            style={{
                background:
                    "rgba(255,255,255,0.025)",
            }}
        >
            {/* header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                    <Layers
                        size={14}
                        className="text-purple-400"
                    />
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
                        {drives.map((d, i) => (
                            <motion.tr
                                key={i}
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    delay:
                                        i * 0.05 + 0.4,
                                }}
                                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors group"
                            >
                                <td className="px-4 py-3 text-white font-medium whitespace-nowrap">
                                    {d.name}
                                </td>

                                <td className="px-4 py-3 text-white/45">
                                    {d.position}
                                </td>

                                <td className="px-4 py-3 text-white/45 whitespace-nowrap">
                                    {d.date}
                                </td>

                                <td className="px-4 py-3 text-white/65">
                                    {d.registered}
                                </td>

                                <td className="px-4 py-3 text-white/65">
                                    {d.completed}
                                </td>

                                <td className="px-4 py-3 text-white/65">
                                    {d.avg}
                                </td>

                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-1 text-emerald-400">
                                        <CheckCircle2
                                            size={11}
                                        />
                                        {d.sentiment}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusStyle[d.status]}`}
                                    >
                                        {d.status}
                                    </span>
                                </td>

                                <td className="px-4 py-3">
                                    <button className="text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-all text-[11px] flex items-center gap-0.5">
                                        Details
                                        <ChevronRight
                                            size={11}
                                        />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecruitmentDrivesTable;