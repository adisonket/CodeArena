import React from "react";

const MultiLineChart = ({
    series = [],
    height = 140,
}) => {
    const allVals = series.flatMap((s) => s.data);

    const max = Math.max(...allVals);
    const min = Math.min(...allVals);

    const range = max - min || 1;

    const w = 300;
    const h = height;

    const colors = [
        "#818cf8",
        "#f472b6",
        "#facc15",
    ];

    return (
        <svg
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            height={h}
        >
            {series.map((s, si) => {
                const pts = s.data
                    .map((v, i) => {
                        const x =
                            (i / (s.data.length - 1)) * w;

                        const y =
                            h -
                            ((v - min) / range) *
                                (h - 20) -
                            10;

                        return `${x},${y}`;
                    })
                    .join(" ");

                return (
                    <g key={si}>
                        <polyline
                            fill="none"
                            stroke={
                                colors[
                                    si % colors.length
                                ]
                            }
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={pts}
                        />

                        {s.data.map((v, i) => {
                            const x =
                                (i /
                                    (s.data.length - 1)) *
                                w;

                            const y =
                                h -
                                ((v - min) / range) *
                                    (h - 20) -
                                10;

                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill={
                                        colors[
                                            si %
                                                colors.length
                                        ]
                                    }
                                />
                            );
                        })}
                    </g>
                );
            })}
        </svg>
    );
};

export default MultiLineChart;