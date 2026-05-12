// src/components/admin/dashboard/GreetingSection.jsx

import React from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

const GreetingSection = ({ now }) => {
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
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <p className="text-white/35 text-xs mb-1 flex items-center gap-1.5">
                <Clock size={11} />
                {fmt(now)}
            </p>

            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                Welcome, Adhip Halder
            </h1>
        </motion.div>
    );
};

export default GreetingSection;