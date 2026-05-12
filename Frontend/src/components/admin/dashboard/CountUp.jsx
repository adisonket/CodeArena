// src/components/admin/dashboard/CountUp.jsx

import React, { useEffect, useState } from "react";

const CountUp = ({
    end = 1000,
    duration = 1400,
    prefix = "",
    suffix = "",
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;

        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;

            if (start >= end) {
                start = end;
                clearInterval(timer);
            }

            setCount(Math.floor(start));
        }, 16);

        return () => clearInterval(timer);
    }, [end, duration]);

    return (
        <span>
            {prefix}
            {count.toLocaleString()}
            {suffix}
        </span>
    );
};

export default CountUp;