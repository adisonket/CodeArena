import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as faceapi from "face-api.js";
import SoftBackdrop from "../../components/SoftBackdrop";
import LenisScroll from "../../components/lenis";
import { useAuth } from "../../context/AuthContext";
import CodeEditor from "../../components/CodeEditor";

const CustomModal = ({ isOpen, title, message, type, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-[#0f1117]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden text-center"
          >
            <div
              className={`absolute top-0 left-0 w-full h-1.5 ${type === "danger" ? "bg-red-500" : "bg-indigo-500"}`}
            />
            <div className="space-y-4">
              <h3
                className={`text-xl font-bold tracking-tight ${type === "danger" ? "text-red-400" : "text-indigo-300"}`}
              >
                {title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {onConfirm && (
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  Confirm
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                {onConfirm ? "Cancel" : "Close"}
              </button>
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
    let stream = null;
    let audioContext = null;
    let analyser = null;
    let animationFrameId;
    let isComponentActive = true;

    const setupDevices = async () => {
      try {
        setError(null);
        const rawStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (!isComponentActive) {
          rawStream.getTracks().forEach((track) => track.stop());
          return;
        }
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
        if (isComponentActive)
          setError(
            "Camera or Microphone access denied. Please allow permissions in your browser.",
          );
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#0f1117]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
          >
            <div className="space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-indigo-300 text-center">
                Device Setup & Test
              </h3>
              {error ? (
                <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-sm text-center">
                  {error}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-video bg-black/50 rounded-2xl overflow-hidden border border-white/10 relative">
                    <video
                      ref={previewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-mono uppercase tracking-wider">
                      <span>Microphone Signal</span>
                      <span>{Math.round(audioLevel)}%</span>
                    </div>
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 transition-all duration-75"
                        style={{ width: `${audioLevel}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Speak to test your microphone and verify your camera angle
                    before starting.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 flex gap-3">
              <button
                onClick={onConfirm}
                disabled={!!error || !isModelsLoaded}
                className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                {!isModelsLoaded ? "Loading AI..." : "Start Assessment"}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const Assessment = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const drive = location.state?.drive;

  const [timeLeft, setTimeLeft] = useState(
    drive ? drive.timeDurationInMin * 60 : 0,
  );
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [cameraError, setCameraError] = useState(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(true);

  const [liveTime, setLiveTime] = useState(new Date());

  const missingFaceFrames = useRef(0);
  const maskFrames = useRef(0);
  const violations = useRef({
    brightness: 0,
    mask: 0,
    multiPerson: 0,
    noFace: 0,
    tab: 0,
    keyboard: 0,
  });
  const lastViolationTime = useRef(0);
  const isAnalyzing = useRef(false);
  const analysisTimeoutRef = useRef(null);

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    onConfirm: null,
  });
  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  const triggerAlert = (title, message, type = "info", onConfirm = null) => {
    setModalConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const currentQuestionType = questions[currentQ]?.type || "MCQ";
  const isCurrentMCQ = currentQuestionType === "MCQ";
  const isCurrentCoding = currentQuestionType === "CODING";

  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchAIQuestions = async () => {
      if (!drive) {
        navigate("/");
        return;
      }

      setLoadingQuestions(true);
      try {
        let allQuestions = [];

        if (drive.mcqCount && drive.mcqCount > 0) {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/ai/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                domain: drive.hiringPositionName,
                difficulty: "Intermediate",
                type: "MCQ",
                count: drive.mcqCount,
              }),
            },
          );
          const data = await res.json();
          if (data.success && data.questions) {
            allQuestions = [
              ...allQuestions,
              ...data.questions.map((q) => ({ ...q, type: "MCQ" })),
            ];
          }
        }

        if (drive.codeCount && drive.codeCount > 0) {
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/ai/generate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                domain: drive.hiringPositionName,
                difficulty: "Intermediate",
                type: "CODING",
                count: drive.codeCount,
              }),
            },
          );
          const data = await res.json();
          if (data.success && data.questions) {
            allQuestions = [
              ...allQuestions,
              ...data.questions.map((q) => ({ ...q, type: "CODING" })),
            ];
          }
        }

        if (allQuestions.length > 0) {
          setQuestions(
            allQuestions.map((q, index) => ({ id: index + 1, ...q })),
          );
        } else {
          console.error(
            "No questions returned from AI for the requested settings.",
          );
        }
      } catch (error) {
        console.error("AI Question Fetch Error:", error);
      } finally {
        setLoadingQuestions(false);
      }
    };

    fetchAIQuestions();
  }, [drive, navigate]);

  useEffect(() => {
    let timer;
    if (status === "active" && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && status === "active") {
      submitAssessment("Completed", "Time Expired");
    }
    return () => clearInterval(timer);
  }, [status, timeLeft]);

  const submitAssessment = async (finalStatus = "Completed", reason = "") => {
    setStatus("idle");

    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    const timeTaken = drive.timeDurationInMin * 60 - timeLeft;
    const mockScore = Math.floor(
      Math.random() * ((drive.totalMarks || 100) + 1),
    );

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:4000/api/auth/submit-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          driveId: drive._id,
          score: mockScore,
          timeTaken,
          status: finalStatus,
          violations: violations.current,
          terminationReason: reason,
        }),
      });

      if (finalStatus === "Terminated") {
        triggerAlert(
          "Session Terminated",
          `Your assessment was terminated due to security or environment violations. (${reason})`,
          "danger",
          () => navigate("/drive"),
        );
      } else {
        triggerAlert(
          "Assessment Finished",
          "Your responses and security metrics have been saved. You may safely close this tab.",
          "info",
          () => navigate("/drive"),
        );
      }
    } catch (err) {
      console.error("Failed to submit", err);
    }
  };

  const terminateSession = (reason) => {
    submitAssessment("Terminated", reason);
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitAssessment("Completed", "User Submitted");
    }
  };

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

  useEffect(() => {
    let isComponentActive = true;
    async function enableCamera() {
      try {
        if (streamRef.current)
          streamRef.current.getTracks().forEach((track) => track.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        if (!isComponentActive || status !== "active") {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          track.onended = () => {
            if (status === "active" && isComponentActive)
              terminateSession("Hardware Error: Camera Disconnected.");
          };
        });
      } catch (err) {
        if (isComponentActive) setCameraError("Camera access denied.");
      }
    }
    if (status === "active") enableCamera();
    else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }
    return () => {
      isComponentActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [status]);

  useEffect(() => {
    if (status !== "active" || !isModelsLoaded) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = 64;
    canvas.height = 36;
    let isRunning = true;

    const performAnalysis = async () => {
      if (!isRunning || isAnalyzing.current || modalConfig.isOpen) return;
      isAnalyzing.current = true;

      try {
        const video = videoRef.current;
        if (!video || video.readyState < 2 || video.paused || video.ended) {
          isAnalyzing.current = false;
          return;
        }

        const now = Date.now();
        const isCooldown = now - lastViolationTime.current < 4000;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let totalBrightness = 0;
        for (let i = 0; i < frame.data.length; i += 16) {
          totalBrightness +=
            (frame.data[i] + frame.data[i + 1] + frame.data[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (frame.data.length / 16);

        if (avgBrightness < 30) {
          if (!isCooldown) {
            violations.current.brightness += 1;
            lastViolationTime.current = Date.now();
            if (violations.current.brightness >= 4)
              terminateSession("Environment too dark.");
            else
              triggerAlert(
                "Lighting Warning",
                `Warning ${violations.current.brightness}/3: Lighting is too dark. Please turn on a light.`,
                "danger",
              );
          }
          isAnalyzing.current = false;
          return;
        }

        const detections = await faceapi
          .detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.2,
            }),
          )
          .withFaceLandmarks();

        if (detections.length === 0) {
          missingFaceFrames.current += 1;

          const allowedMissingFrames = isCurrentCoding ? 7 : 2;

          if (missingFaceFrames.current >= allowedMissingFrames) {
            if (!isCooldown) {
              violations.current.noFace += 1;
              lastViolationTime.current = Date.now();
              missingFaceFrames.current = 0;
              if (violations.current.noFace >= 4) {
                terminateSession("Face obscured or not visible.");
              } else {
                triggerAlert(
                  "Visibility Violation",
                  `Warning ${violations.current.noFace}/3: Face not detected! Please look directly at the screen.`,
                  "danger",
                );
              }
            }
          }
        } else if (detections.length > 1) {
          missingFaceFrames.current = 0;
          if (!isCooldown) {
            violations.current.multiPerson += 1;
            lastViolationTime.current = Date.now();
            if (violations.current.multiPerson >= 3) {
              terminateSession("Multiple people detected in the environment.");
            } else {
              triggerAlert(
                "Security Violation",
                `Warning ${violations.current.multiPerson}/2: Multiple faces detected! You must take this assessment alone.`,
                "danger",
              );
            }
          }
        } else {
          missingFaceFrames.current = 0;
        }
      } catch (err) {
        console.error("Analysis Error:", err);
      } finally {
        isAnalyzing.current = false;
      }
    };

    const loop = async () => {
      if (!isRunning) return;
      await performAnalysis();
      analysisTimeoutRef.current = setTimeout(loop, 1500);
    };

    loop();

    return () => {
      isRunning = false;
      if (analysisTimeoutRef.current) clearTimeout(analysisTimeoutRef.current);
    };
  }, [status, isModelsLoaded, modalConfig.isOpen, isCurrentCoding]);

  useEffect(() => {
    if (status !== "active") return;
    const handleFocusLoss = (reason) => {
      const now = Date.now();
      if (now - lastViolationTime.current < 2000 || modalConfig.isOpen) return;
      lastViolationTime.current = now;
      violations.current.tab += 1;
      if (violations.current.tab >= 3)
        terminateSession(`Session terminated: ${reason}.`);
      else
        triggerAlert(
          "Environment Warning",
          `Warning ${violations.current.tab}/2: ${reason} is strictly prohibited.`,
          "danger",
        );
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && status === "active") {
        document.documentElement
          .requestFullscreen()
          .then(() => handleFocusLoss("Exiting full-screen"))
          .catch(() => terminateSession("Security protocol failed."));
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) handleFocusLoss("Tab switching");
    };
    const handleBlur = () => handleFocusLoss("Window focus loss");
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;
      if (key === "escape") {
        e.preventDefault();
        return;
      }
      if (
        (ctrlOrMeta && ["c", "v", "u", "p"].includes(key)) ||
        (e.altKey && key === "tab") ||
        key === "f12"
      ) {
        e.preventDefault();
        e.stopPropagation();
        const now = Date.now();
        if (now - lastViolationTime.current < 1000) return;
        lastViolationTime.current = now;
        violations.current.keyboard += 1;
        if (violations.current.keyboard >= 3)
          terminateSession("Prohibited keyboard shortcut.");
        else
          triggerAlert(
            "Restricted Action",
            `Warning ${violations.current.keyboard}/2: Shortcuts disabled.`,
            "danger",
          );
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
      window.removeEventListener("blur", handleBlur);
    };
  }, [status, modalConfig.isOpen]);

  const toggleInterview = () => {
    if (!isModelsLoaded)
      return triggerAlert(
        "System Initializing",
        "Please wait for AI proctoring models.",
        "info",
      );
    if (status === "idle") setIsSetupModalOpen(true);
    else
      triggerAlert(
        "Submit Assessment?",
        "Your progress will be finalized.",
        "danger",
        () => submitAssessment("Completed", "User Submitted"),
      );
  };

  const startActualInterview = () => {
    setIsSetupModalOpen(false);
    setStatus("active");
    setCameraError(null);
    document.documentElement
      .requestFullscreen?.()
      .catch(() => console.warn("Fullscreen API rejected."));
  };

  if (loadingQuestions) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#050816] text-white text-xl font-semibold overflow-hidden">
        Generating AI Assessment Questions...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative bg-[#050816]">
      <div className="absolute inset-0 z-0 opacity-70 pointer-events-none">
        <SoftBackdrop />
      </div>
      <LenisScroll />
      <CustomModal {...modalConfig} onClose={closeModal} />

      <DeviceSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onConfirm={startActualInterview}
        isModelsLoaded={isModelsLoaded}
      />

      <div className="h-[80px] w-full max-w-[1600px] mx-auto px-4 lg:px-6 flex justify-between items-center z-10 relative shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-indigo-400">
            {liveTime.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </h2>
          <p className="text-sm font-medium text-gray-300 mt-0.5">
            {liveTime.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
          <span className="text-lg sm:text-xl font-bold text-indigo-400 hidden sm:block">
            {user?.firstName} {user?.lastName}
          </span>
        </div>

        <div className="w-[100px] hidden sm:block"></div>
      </div>

      <main className="relative z-10 px-4 pb-4 lg:px-6 lg:pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)] max-w-[1600px] mx-auto">
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl min-h-0"
        >
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/40"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/40"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/40"></div>
              </div>
              <span className="text-[11px] font-bold tracking-[0.2em] text-indigo-300 uppercase ml-2">
                {drive?.hiringPositionName || "Assessment"}
              </span>
            </div>
            {status === "active" && (
              <div
                className={`text-xs font-mono px-3 py-1 rounded-md ${timeLeft < 300 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-black/20 text-gray-400"}`}
              >
                {formatTime(timeLeft)} Remaining
              </div>
            )}
          </div>

          <div className="flex-1 p-6 flex flex-col min-h-0">
            {status === "active" && questions.length === 0 && (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <h2 className="text-xl font-bold text-red-400">
                  Failed to load questions
                </h2>
                <p className="text-sm text-gray-400 mt-2">
                  The API returned an empty list. Please contact support or
                  restart the drive.
                </p>
              </div>
            )}

            {status === "active" && isCurrentMCQ && questions.length > 0 && (
              <div className="h-full flex flex-col justify-between max-w-4xl mx-auto w-full">
                <div className="space-y-6">
                  <span className="text-indigo-400 font-mono text-sm">
                    Question {currentQ + 1} of {questions.length} (MCQ)
                  </span>
                  <h2 className="text-2xl font-semibold leading-relaxed">
                    {questions[currentQ]?.question}
                  </h2>
                  <div className="space-y-3 mt-8">
                    {questions[currentQ]?.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${answers[currentQ] === idx ? "bg-indigo-600/20 border-indigo-500" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                      >
                        <input
                          type="radio"
                          name="mcq"
                          className="hidden"
                          checked={answers[currentQ] === idx}
                          onChange={() =>
                            setAnswers({ ...answers, [currentQ]: idx })
                          }
                        />
                        <span className="ml-2 text-gray-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between mt-10 shrink-0 w-full">
                  <button
                    onClick={handlePrev}
                    disabled={currentQ === 0}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed px-10 py-3 rounded-xl text-sm font-bold uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-3 rounded-xl text-sm font-bold uppercase tracking-widest active:scale-95 transition-all"
                  >
                    {currentQ === questions.length - 1 ? "Submit" : "Next"}
                  </button>
                </div>
              </div>
            )}

            {status === "active" && isCurrentCoding && questions.length > 0 && (
              <div className="h-full flex flex-col gap-4 min-h-0">
                <div className="flex-1 min-h-0 flex flex-col rounded-xl overflow-hidden border border-white/10 shadow-inner">
                  <CodeEditor
                    currentQuestion={questions[currentQ]}
                    fixedLanguage={true}
                  />
                </div>
                <div className="flex justify-between items-center shrink-0 pt-2 pb-1 w-full">
                  <button
                    onClick={handlePrev}
                    disabled={currentQ === 0}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                  >
                    Previous
                  </button>
                  <div className="text-sm text-gray-400 font-mono px-2 text-center">
                    Question {currentQ + 1} of {questions.length} (CODING)
                  </div>
                  <button
                    onClick={handleNext}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                  >
                    {currentQ === questions.length - 1 ? "Submit" : "Next"}
                  </button>
                </div>
              </div>
            )}

            {status === "idle" && (
              <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                <h1 className="text-2xl font-bold text-white">
                  Preparing Secure Environment
                </h1>
                <p className="text-gray-400 text-sm mt-3">
                  Please complete the device setup to reveal your assessment
                  questions.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 flex flex-col gap-6 min-h-0"
        >
          <div className="aspect-video shrink-0 bg-black/60 border border-indigo-500/30 rounded-3xl relative overflow-hidden ring-1 ring-indigo-500/20 shadow-xl group">
            {status === "idle" ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="p-4 rounded-full bg-white/5 border border-white/10">
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  Camera Offline
                </span>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover scale-x-[-1]"
                />
                {cameraError && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-center p-4">
                    <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-6 py-4 rounded-2xl text-sm font-semibold backdrop-blur-md">
                      ⚠ {cameraError}
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black uppercase animate-pulse shadow-lg">
                  <span className="h-2 w-2 bg-white rounded-full"></span> REC
                </div>
              </>
            )}
          </div>

          <div className="flex-1 min-h-0 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 flex flex-col shadow-2xl">
            {status === "active" && (
              <div className="flex gap-2 flex-wrap mb-6 shrink-0">
                {questions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQ(idx)}
                    className={`w-9 h-9 rounded-xl text-xs font-black transition-all
            ${
              idx === currentQ
                ? "bg-[#6C63FF] text-white shadow-[0_0_12px_rgba(108,99,255,0.45)] scale-105"
                : q.submitted
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/5 text-[#A1A1AA] border border-white/10 hover:bg-white/10"
            }`}
                  >
                    {q.submitted ? "✓" : idx + 1}
                  </button>
                ))}
              </div>
            )}

            <div
              className="flex-1 overflow-y-auto mb-4 lg:mb-6 pr-2 scrollbar-thin"
              data-lenis-prevent="true"
            >
              {status === "active" && isCurrentCoding ? (
                <div className="space-y-4">
                  <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl shadow-inner">
                    <span className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-3 block">
                      Current Task (Q{currentQ + 1})
                    </span>

                    <p className="text-sm text-indigo-50 leading-relaxed font-medium whitespace-pre-wrap">
                      {questions[currentQ]?.question || "Loading question..."}
                    </p>
                  </div>

                  <div className="px-4 py-3 bg-black/20 rounded-xl text-xs text-gray-400 border border-white/5">
                    <span className="font-bold text-gray-300 block mb-1">
                      Live Execution Active:
                    </span>
                    Code execution is isolated within your browser. All inputs
                    and outputs are monitored for academic integrity.
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-sm text-indigo-50 leading-relaxed shadow-inner">
                  {status === "active"
                    ? "System active. AI proctoring is continuously monitoring face visibility, attention, and environment integrity."
                    : isModelsLoaded
                      ? "Authentication pending. Please complete the device setup to authorize access."
                      : "Initializing AI Proctoring Subsystems. Please wait..."}
                </div>
              )}
            </div>

            <div className="flex justify-center shrink-0">
              <button
                onClick={toggleInterview}
                disabled={status === "idle"}
                className={`w-full max-w-[300px] flex items-center justify-center gap-3 py-4 rounded-2xl border transition-all active:scale-95 text-[10px] font-black uppercase tracking-[0.2em]
        ${
          status === "idle"
            ? "bg-gray-800/50 border-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
        }`}
              >
                {status === "idle" ? "Awaiting Setup" : "Submit & End"}
              </button>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default Assessment;
