import React, { useState, useEffect, useRef } from "react";
import SoftBackdrop from "../../components/SoftBackdrop";
import LenisScroll from "../../components/lenis";
import Header from "../../components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import * as faceapi from "face-api.js";
import vapi from "../../lib/vapi";

const CustomModal = ({ isOpen, title, message, type, onClose, onConfirm }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#0f1117]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden text-center">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${type === "danger" ? "bg-red-500" : "bg-indigo-500"}`} />
                        <div className="space-y-4">
                            <h3 className={`text-xl font-bold tracking-tight ${type === "danger" ? "text-red-400" : "text-indigo-300"}`}>{title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row gap-3">
                            {onConfirm && (
                                <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Confirm</button>
                            )}
                            <button onClick={onClose} className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">{onConfirm ? "Cancel" : "Close"}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const DeviceSetupModal = ({ isOpen, onClose, onConfirm, isModelsLoaded }) => {
    const previewVideoRef = useRef(null);
    const [error, setError] = useState(null);
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        let stream = null; let audioContext = null; let analyser = null; let animationFrameId; let isComponentActive = true;

        const setupDevices = async () => {
            try {
                setError(null);
                const rawStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (!isComponentActive) { rawStream.getTracks().forEach((track) => track.stop()); return; }
                stream = rawStream;
                if (previewVideoRef.current) previewVideoRef.current.srcObject = stream;

                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const checkAudioLevel = () => {
                    if (!isComponentActive) return;
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                    setAudioLevel(Math.min((sum / dataArray.length) * 2, 100));
                    animationFrameId = requestAnimationFrame(checkAudioLevel);
                };
                checkAudioLevel();
            } catch (err) {
                if (isComponentActive) setError("Camera or Microphone access denied. Please allow permissions in your browser.");
            }
        };
        if (isOpen) setupDevices();

        return () => {
            isComponentActive = false;
            if (stream) stream.getTracks().forEach((track) => track.stop());
            if (audioContext && audioContext.state !== "closed") audioContext.close();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-[#0f1117]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold tracking-tight text-indigo-300 text-center">Device Setup & Test</h3>
                            {error ? (
                                <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">{error}</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 relative">
                                        <video ref={previewVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between text-xs text-gray-400 font-mono uppercase tracking-wider">
                                            <span>Microphone Signal</span>
                                            <span>{Math.round(audioLevel)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${audioLevel}%` }} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 text-center">Speak to test your microphone and verify your camera angle before starting.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={onConfirm}
                                disabled={!!error || !isModelsLoaded}
                                className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                            >
                                {!isModelsLoaded ? "Loading AI..." : "Start Interview"}
                            </button>
                            <button onClick={onClose} className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const WaveBar = ({ color = "bg-violet-400" }) => (
    <div className="flex items-center gap-1 h-7 mt-1">
        {[0, 0.1, 0.2, 0.13, 0.06].map((delay, i) => (
            <motion.span
                key={i}
                className={`block w-1 h-4 rounded-full ${color}`}
                style={{ transformOrigin: "center" }}
                animate={{ scaleY: [0.4, 1.3, 0.4] }}
                transition={{ repeat: Infinity, duration: 0.7, delay, ease: "easeInOut" }}
            />
        ))}
    </div>
);


const Interview = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Retrieve the drive details passed from DrivePreview
    const drive = location.state?.drive;

    const [elapsed, setElapsed] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [candidateSpeaking, setCandidateSpeaking] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [candidateAnswer, setCandidateAnswer] = useState("");
    const [sessionStarted, setSessionStarted] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [status, setStatus] = useState("idle");
    const isEndingInterview = useRef(false);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [cameraError, setCameraError] = useState("");
    const [callActive, setCallActive] = useState(false);

    const [isSetupModalOpen, setIsSetupModalOpen] = useState(true);

    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info",
        onConfirm: null,
    });

    const closeModal = () =>
        setModalConfig((prev) => ({ ...prev, isOpen: false }));

    const triggerAlert = (
        title,
        message,
        type = "info",
        onConfirm = null
    ) => {
        setModalConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
        });
    };

    const violations = useRef({
        tab: 0,
        keyboard: 0,
        noFace: 0,
        fullscreen: 0,
    });

    // Submits the interview result to the backend so the drive unlocks "View Result"
    const submitInterviewResult = async (finalStatus = "Completed", reason = "") => {
        try {
            const token = localStorage.getItem("token");
            await fetch("http://localhost:4000/api/auth/submit-result", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    driveId: drive?._id,
                    score: 0, // Mock score for Interview or can be updated by AI later
                    timeTaken: elapsed,
                    status: finalStatus,
                    violations: violations.current,
                    terminationReason: reason
                })
            });
        } catch (err) {
            console.error("Failed to submit interview result", err);
        }
    };

    // Helper to terminate and submit results simultaneously
    const terminateInterview = async (reason) => {
        isEndingInterview.current = true;
        setStatus("ended");
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        if (document.fullscreenElement) await document.exitFullscreen().catch(()=>{});
        window.speechSynthesis.cancel();
        try { await vapi.stop(); } catch (e) { }

        await submitInterviewResult("Terminated", reason);
        
        triggerAlert(
            "Interview Terminated",
            reason,
            "danger",
            () => navigate("/drive")
        );
    };

    const startActualInterview = async () => {
        setIsSetupModalOpen(false);
        setSessionStarted(true);
        setStatus("active");
        startVapiInterview();
    
        try {
            await document.documentElement.requestFullscreen();
        } catch (err) {
            console.warn("Fullscreen rejected");
        }
    };

    const startVapiInterview = async () => {
        try {
            await vapi.start(import.meta.env.VITE_VAPI_ASSISTANT_ID);
            setCallActive(true);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        vapi.on("call-start", () => {
            console.log("CALL STARTED");
        });
    
        vapi.on("call-end", () => {
            console.log("CALL ENDED");
            setCallActive(false);
        });
    
        vapi.on("speech-start", () => {
            console.log("AI SPEAKING");
            setAiSpeaking(true);
        });
    
        vapi.on("speech-end", () => {
            console.log("AI STOPPED");
            setAiSpeaking(false);
        });
    
        vapi.on("message", (message) => {
            console.log("VAPI MESSAGE:", message);
    
            if (message.type === "transcript") {
                if (message.role === "assistant") {
                    setCurrentQuestion(message.transcript);
                }
    
                if (message.role === "user") {
                    setCandidateSpeaking(true);
                    setCandidateAnswer((prev) =>
                        prev ? `${prev} ${message.transcript}` : message.transcript
                    );
    
                    setTimeout(() => {
                        setCandidateSpeaking(false);
                    }, 1200);
                }
            }
        });
    
        vapi.on("error", (e) => {
            console.log("VAPI ERROR:", e);
        });
    
        return () => {
            vapi.stop();
        };
    }, []);

    useEffect(() => {
        if (status !== "active") return;

        const handleViolation = (reason) => {
            violations.current.tab += 1;
            if (violations.current.tab >= 3) {
                terminateInterview(`${reason}. Multiple violations detected.`);
                return;
            }
            triggerAlert("Warning", `${reason}. Warning ${violations.current.tab}/2`, "danger");
        };

        const handleVisibility = () => {
            if (document.hidden) {
                handleViolation("Tab switching detected");
            }
        };

        const handleFullscreen = () => {
            if (isEndingInterview.current) return;

            if (!document.fullscreenElement) {
                violations.current.fullscreen += 1;

                if (violations.current.fullscreen >= 3) {
                    terminateInterview("Multiple fullscreen violations detected.");
                    return;
                }

                triggerAlert(
                    "Warning",
                    `Fullscreen exit detected. Warning ${violations.current.fullscreen}/2. Click Continue to resume interview.`,
                    "danger",
                    async () => {
                        try {
                            await document.documentElement.requestFullscreen();
                        } catch (err) {
                            console.error("Failed to re-enter fullscreen");
                        }
                    }
                );
            }
        };

        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (
                key === "f12" ||
                (e.altKey && key === "tab") ||
                ((e.ctrlKey || e.metaKey) && ["c", "v", "u", "p"].includes(key))
            ) {
                e.preventDefault();
                handleViolation("Restricted shortcut detected");
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        document.addEventListener("fullscreenchange", handleFullscreen);
        document.addEventListener("keydown", handleKeyDown, true);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibility);
            document.removeEventListener("fullscreenchange", handleFullscreen);
            document.removeEventListener("keydown", handleKeyDown, true);
        };
    }, [status]);

    useEffect(() => {
        const timer = setInterval(() => setElapsed((p) => p + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "/models";
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                ]);
                setIsModelsLoaded(true);
            } catch (err) {
                console.error("Failed to load AI models.", err);
            }
        };
        loadModels();
    }, []);

    const endInterview = async () => {
        try {
            isEndingInterview.current = true;
            setStatus("ended");

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            if (document.fullscreenElement) {
                await document.exitFullscreen().catch(()=>{});
            }

            // Save result to backend when user intentionally finishes
            await submitInterviewResult("Completed", "User ended call");

        } catch (err) {
            console.error("Failed to end interview properly", err);
        } finally {
            window.speechSynthesis.cancel();
            try { await vapi.stop(); } catch(e){}
            navigate("/drive");
        }
    };

    const formatTime = (s) => {
        const m = String(Math.floor(s / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${m}:${sec}`;
    };

    const candidateName = user ? `${user.firstName} ${user.lastName}` : "Candidate";

    useEffect(() => {
        let isMounted = true;

        async function enableCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, facingMode: "user" },
                    audio: true,
                });

                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

            } catch (err) {
                setCameraError("Camera access denied.");
            }
        }

        if (status === "active") {
            enableCamera();
        }

        return () => {
            isMounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [status]);

    useEffect(() => {
        if (status !== "active" || !isModelsLoaded) return;

        const interval = setInterval(async () => {
            if (!videoRef.current) return;

            const detection = await faceapi.detectSingleFace(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            );

            if (!detection) {
                violations.current.noFace += 1;
                if (violations.current.noFace >= 3) {
                    terminateInterview("No face detected repeatedly. Interview terminated.");
                } else {
                    triggerAlert(
                        "Face Warning",
                        `Face not visible. Warning ${violations.current.noFace}/2`,
                        "danger"
                    );
                }
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [status, isModelsLoaded]);

    return (
        <>
            <SoftBackdrop />
            <LenisScroll />
            <CustomModal {...modalConfig} onClose={closeModal} />

            <DeviceSetupModal
                isOpen={isSetupModalOpen}
                onClose={() => navigate("/drive")}
                onConfirm={startActualInterview}
                isModelsLoaded={isModelsLoaded}
            />

            <div className="relative h-screen overflow-hidden flex flex-col items-start px-8 pt-8 pb-16">

                {/* ── Top heading ── */}
                <div className="w-full flex items-center justify-between mb-6">
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-white/40 tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 inline-block" />
                            AI Interview Session
                            <svg className="w-3.5 h-3.5 text-white/25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3" />
                                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                            </svg>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-300 bg-clip-text text-transparent tracking-tight">
                            Welcome, {candidateName}
                        </h1>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                        <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-sm font-semibold text-slate-200 tabular-nums tracking-widest">
                            {formatTime(elapsed)}
                        </span>
                    </div>
                </div>

                {/* ── Session subtitle ── */}
                <div className="w-full">
                    <p className="text-sm text-white/35 tracking-wide mb-25">
                        AI Interview in Sessions...
                    </p>
                </div>

                {/* ── Interview panels ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl self-center">

                    {/* Left — AI Recruiter */}
                    <motion.div
                        className="relative flex flex-col items-center justify-center gap-3 rounded-2xl px-8 py-12 bg-white/[0.04] backdrop-blur-xl border border-white/[0.07] overflow-hidden"
                        animate={{
                            scale: aiSpeaking ? 1.013 : 1,
                            borderColor: aiSpeaking ? "rgba(139,92,246,0.65)" : "rgba(255,255,255,0.07)",
                            boxShadow: aiSpeaking ? "0 0 36px rgba(139,92,246,0.22), inset 0 0 40px rgba(139,92,246,0.06)" : "none",
                        }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                    >
                        <AnimatePresence>
                            {aiSpeaking && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl border border-violet-500/40 pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Avatar */}
                        <div className="relative w-24 h-24 mb-1">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-violet-500/50 bg-violet-900/30">
                                <img
                                    src="https://ui-avatars.com/api/?name=AI+Recruiter&background=5b21b6&color=e9d5ff&size=96&bold=true&font-size=0.35"
                                    alt="AI Recruiter"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="absolute bottom-1 left-1 w-[18px] h-[18px] rounded-full bg-[#0d0f1a] border border-white/15 flex items-center justify-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                            </span>
                            <span className="absolute bottom-0 right-0 text-[9px] font-bold tracking-widest bg-gradient-to-br from-violet-600 to-purple-500 text-white rounded-full px-1.5 py-0.5 border border-white/10 leading-none">
                                AI
                            </span>
                        </div>

                        <div className="flex flex-col items-center">
                            <p className="text-[15px] font-semibold text-white/90 tracking-wide">
                                AI Recruiter
                            </p>
                            <p className="text-xs text-white/60 text-center mt-3 max-w-[240px] leading-relaxed">
                                {currentQuestion}
                            </p>
                        </div>

                        {aiSpeaking ? (
                            <WaveBar color="bg-violet-400" />
                        ) : (
                            <div className="h-7 mt-1" />
                        )}
                    </motion.div>

                    {/* Right — Candidate */}
                    <motion.div
                        className="relative flex flex-col items-center justify-center gap-3 rounded-2xl px-8 py-12 bg-white/[0.04] backdrop-blur-xl border border-white/[0.07] overflow-hidden"
                        animate={{
                            scale: candidateSpeaking ? 1.013 : 1,
                            borderColor: candidateSpeaking ? "rgba(52,211,153,0.65)" : "rgba(255,255,255,0.07)",
                            boxShadow: candidateSpeaking ? "0 0 36px rgba(52,211,153,0.2), inset 0 0 40px rgba(52,211,153,0.05)" : "none",
                        }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                    >
                        <AnimatePresence>
                            {candidateSpeaking && (
                                <motion.div
                                    className="absolute inset-0 rounded-2xl border border-emerald-400/40 pointer-events-none"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Webcam */}
                        <div className="relative w-full max-w-[320px] aspect-video rounded-2xl overflow-hidden border border-emerald-400/20 bg-black shadow-[0_0_30px_rgba(52,211,153,0.15)]">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover scale-x-[-1]"
                            />
                            <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] tracking-[0.2em] text-white/80 uppercase">
                                    Live
                                </span>
                            </div>
                            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
                                <p className="text-xs text-white/90 font-medium">
                                    {candidateName}
                                </p>
                            </div>
                        </div>

                        <p className="text-[15px] font-semibold text-white/90 tracking-wide mt-2">
                            Candidate Camera
                        </p>

                        {candidateSpeaking ? (
                            <WaveBar color="bg-emerald-400" />
                        ) : (
                            <div className="h-7 mt-1" />
                        )}
                    </motion.div>
                </div>

                {/* ── Controls ── */}
                <div className="flex items-center gap-4 mt-10 self-center">
                    {/* Mute */}
                    <motion.button
                        whileTap={{ scale: 0.91 }}
                        onClick={() => {
                            const nextMuted = !isMuted;
                            setIsMuted(nextMuted);
                            vapi.setMuted(nextMuted);
                        }}
                        aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                        className={`w-14 h-14 rounded-full flex items-center justify-center border outline-none transition-colors duration-200
              ${isMuted ? "bg-red-500/15 border-red-500/40" : "bg-white/10 border-white/15 hover:bg-white/15"}`}
                    >
                        {isMuted ? (
                            <svg className="w-5 h-5 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="1" y1="1" x2="23" y2="23" />
                                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        )}
                    </motion.button>

                    {/* End call */}
                    <motion.button
                        whileTap={{ scale: 0.91 }}
                        onClick={endInterview}
                        aria-label="End interview call"
                        className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center outline-none shadow-[0_4px_22px_rgba(239,68,68,0.45)]"
                    >
                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" transform="rotate(135 12 12)" />
                        </svg>
                    </motion.button>
                </div>

                {/* Status */}
                <p className="self-center mt-6 text-[11px] text-white/30 tracking-[0.18em] uppercase">
                    Interview in Progress...
                </p>
            </div>
        </>
    );
};

export default Interview;