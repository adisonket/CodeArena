import { useEffect, useState, useRef } from "react";
import LoadingBar from "react-top-loading-bar";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import SoftBackdrop from "../../components/SoftBackdrop";
import LenisScroll from "../../components/lenis";
import Hero from "../../components/Hero";
import Features from "../../components/Features";
import Pricing from "../../components/Pricing";
import Faq from "../../components/Faq";
import CTA from "../../components/CTA";

export default function Home() {
    const [msg, setMsg] = useState("Loading...");
    const ref = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                ref.current.continuousStart();
                const res = await fetch("http://localhost:4000/api/test");
                const data = await res.json();
                setMsg(data.message);
                ref.current.complete();
            } catch (err) {
                console.error(err);
                ref.current.complete();
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <LoadingBar
                ref={ref}
                color="#6366f1"
                height={3}
            />

            <SoftBackdrop />
            <LenisScroll />
            <Navbar />

            <h2 style={{ textAlign: "center" }}>{msg}</h2>

            <Hero />
            <Features />
            <Pricing />
            <Faq />
            <CTA />

            <Footer />
        </>
    );
}