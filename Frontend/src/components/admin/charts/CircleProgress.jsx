import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const CircleProgress = ({
    pct = 75,
    size = 80,
    stroke = 8,
    color = "#a855f7",
    bg = "rgba(255,255,255,0.08)",
    label,
}) => {
    const [count, setCount] = useState(0);

    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dashOffset = circ - (pct / 100) * circ;

    useEffect(() => {
        let current = 0;

        const duration = 1200;
        const stepTime = 16;
        const increment = pct / (duration / stepTime);

        const timer = setInterval(() => {
            current += increment;

            if (current >= pct) {
                current = pct;
                clearInterval(timer);
            }

            setCount(Math.floor(current));
        }, stepTime);

        return () => clearInterval(timer);
    }, [pct]);

    return (
        <div
            className="relative flex items-center justify-center"
            style={{
                width: size,
                height: size,
            }}
        >
            <svg
                width={size}
                height={size}
                className="-rotate-90 overflow-visible"
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={bg}
                    strokeWidth={stroke}
                />

                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: dashOffset }}
                    transition={{
                        duration: 1.4,
                        ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                        filter: `drop-shadow(0 0 8px ${color})`,
                    }}
                />
            </svg>

            <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="absolute text-[12px] font-extrabold text-white tabular-nums"
            >
                {label ?? `${count}%`}
            </motion.span>
        </div>
    );
};

export default CircleProgress;