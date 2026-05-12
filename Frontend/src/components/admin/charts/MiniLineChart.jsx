import React from "react";

const MiniLineChart = ({
    data = [],
    color = "#a855f7",
    height = 60,
}) => {
    if (!data.length) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);

    const range = max - min || 1;

    const w = 180;
    const h = height;

    const pts = data
        .map((v, i) => {
            const x = (i / (data.length - 1)) * w;

            const y =
                h - ((v - min) / range) * (h - 10) - 5;

            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            height={h}
            preserveAspectRatio="none"
        >
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pts}
            />

            {data.map((v, i) => {
                const x = (i / (data.length - 1)) * w;

                const y =
                    h - ((v - min) / range) * (h - 10) - 5;

                return (
                    <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill={color}
                    />
                );
            })}
        </svg>
    );
};

export default MiniLineChart;