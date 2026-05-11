import React from "react";

const AreaChart = ({
    data = [],
    color = "#a855f7",
    height = 100,
}) => {
    if (!data.length) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);

    const range = max - min || 1;

    const w = 200;
    const h = height;

    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;

        const y =
            h - ((v - min) / range) * (h - 16) - 8;

        return `${x},${y}`;
    });

    const linePts = pts.join(" ");

    const areaPts = `
        0,${h}
        ${pts.join(" ")}
        ${w},${h}
    `;

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            height={h}
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient
                    id="ag"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                >
                    <stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity="0.35"
                    />

                    <stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity="0.02"
                    />
                </linearGradient>
            </defs>

            <polygon
                fill="url(#ag)"
                points={areaPts}
            />

            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={linePts}
            />
        </svg>
    );
};

export default AreaChart;