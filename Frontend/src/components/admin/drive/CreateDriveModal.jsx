import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    Zap,
    ChevronRight,
    Calendar,
    X,
    Edit3,
    CheckCircle2,
    FileText,
    Briefcase,
    AlignLeft,
    CheckSquare,
    Sparkles,
    Gauge,
    Wand2,
    Bot,
    ChevronDown,
    Timer,
    Code2,
} from "lucide-react";

import { CalendarDays } from "lucide-react";

const DARK_INPUT_STYLE = `
  .dark-input, .dark-select {
    color-scheme: dark;
  }

  .dark-select option {
    background: #0f0d1f;
    color: rgba(255,255,255,0.8);
  }

  .dark-input {
    background: rgba(8, 6, 18, 0.85);
    color: rgba(255,255,255,0.85);
    color-scheme: dark;
  }

  .dark-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const EMPTY = {
    title: "",
    tag: "",
    type: "Assessment",
    startDate: "",
    endDate: "",
    difficulty: "Intermediate",
    duration: "",

    mcqCount: "",
    codeCount: "",

    marksPerMcq: "",
    marksPerCode: "",

    aiPrompt: "",

    emailTitle: "",
    emailBody: "",
};

const Field = ({ label, icon: Icon, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
            {Icon && (
                <Icon
                    size={10}
                    className="text-indigo-400"
                />
            )}
            {label}
        </label>

        {children}

        {error && (
            <p className="text-[10px] text-rose-400 mt-0.5">
                {error}
            </p>
        )}
    </div>
);

const TInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    error,
    icon: Icon,
    ...rest
}) => {
    const isDate = type === "datetime-local";

    return (
        <div className="relative">

            {!isDate && Icon && (
                <Icon
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none z-10"
                />
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`dark-input w-full ${
                    Icon && !isDate
                        ? "pl-10"
                        : "pl-3"
                } ${
                    isDate
                        ? "pr-10"
                        : "pr-3"
                } py-2.5 rounded-xl text-xs text-white/80 placeholder-white/20 outline-none transition border ${
                    error
                        ? "border-rose-500/50 focus:border-rose-500/70"
                        : "border-white/8 focus:border-indigo-500/50"
                }`}
                {...rest}
            />

            {isDate && (
                <CalendarDays
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none"
                />
            )}
        </div>
    );
};

const SInput = ({
    value,
    onChange,
    children,
    error
}) => (
    <div className="relative">
        <select
            value={value}
            onChange={onChange}
            className={`dark-select w-full appearance-none px-3 py-2.5 pr-8 rounded-xl text-xs outline-none cursor-pointer transition ${
                error
                    ? "border border-rose-500/50"
                    : "border border-white/8 focus:border-indigo-500/50"
            }`}
            style={{
                background: "rgba(8,6,18,0.85)",
                color: "rgba(255,255,255,0.75)",
                colorScheme: "dark"
            }}
        >
            {children}
        </select>

        <ChevronDown
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
        />
    </div>
);

const CreateDriveModal = ({
    onClose,
    onSave,
    editData,
}) => {
    const [form, setForm] = useState(
        editData
            ? {
    
                title:
                    editData.title || "",
    
                tag:
                    editData.tag || "",
    
                type:
                    editData.type || "Assessment",
    
                startDate:
                    editData.startDate
                        ? new Date(editData.startDate)
                            .toISOString()
                            .slice(0,16)
                        : "",
    
                endDate:
                    editData.endDate
                        ? new Date(editData.endDate)
                            .toISOString()
                            .slice(0,16)
                        : "",
    
                difficulty:
                    editData.difficulty || "Intermediate",
    
                duration:
                    editData.duration || "",
    
                visibility:
                    editData.visibility || "Private",
    
                mcqCount:
                    editData.mcqCount || "",
    
                codeCount:
                    editData.codeCount || "",
    
                marksPerMcq:
                    editData.marksPerMcq || "",
    
                marksPerCode:
                    editData.marksPerCode || "",
    
                aiPrompt: "",
    
                emailTitle: "",
    
                emailBody: "",
            }
    
            : EMPTY
    );
    const [errors, setErrors]   = useState({});
    const [step, setStep]       = useState(1);
    const [saving, setSaving]   = useState(false);
    const [done, setDone]       = useState(false);
    const [generating, setGenerating] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const validate1 = () => {

        const e = {};
    
        if (!form.title.trim())
            e.title = "Drive name is required";
    
        if (!form.tag.trim())
            e.tag = "Category is required";
    
        if (!form.startDate)
            e.startDate = "Start date required";
    
        if (!form.endDate)
            e.endDate = "End date required";
    
        // only validate while creating
        if (
            !editData &&
            form.startDate &&
            form.endDate &&
            new Date(form.endDate).getTime() <
                new Date(form.startDate).getTime()
        ) {
            e.endDate = "End must be after start";
        }
    
        if (
            !form.duration ||
            isNaN(form.duration) ||
            +form.duration <= 0
        ) {
            e.duration = "Enter a valid duration";
        }
    
        return e;
    };
    const validate2 = () => {
        const e = {};
        if (form.mcqCount === "" || isNaN(form.mcqCount) || +form.mcqCount < 0)   e.mcqCount  = "Enter MCQ count";
        if (form.codeCount === "" || isNaN(form.codeCount) || +form.codeCount < 0) e.codeCount = "Enter code Q count";
        if ((+form.mcqCount||0) + (+form.codeCount||0) === 0) e.mcqCount = "Add at least 1 question";
        if (!form.marksPerMcq  || isNaN(form.marksPerMcq))  e.marksPerMcq  = "Required";
        if (!form.marksPerCode || isNaN(form.marksPerCode)) e.marksPerCode = "Required";
        return e;
    };

    const handleNext1 = () => {
        const e = validate1();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({}); setStep(2);
    };
    const handleNext2 = () => {
        const e = validate2();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({}); setStep(3);
    };

    const handleAutoFill = () => {
        console.log("Auto fill clicked");
    };

    const handleGenerate = async () => {

        setGenerating(true);
    
        await new Promise((r) =>
            setTimeout(r, 1200)
        );
    
        setGenerating(false);
    
        setStep(4);
    };

    const handleSave = async () => {

        try {
    
            setSaving(true);
    
            const payload = {
    
                driveId: Math.floor(
                    100000 + Math.random() * 900000
                ).toString(),
    
                hiringPositionName: form.title,
    
                driveDate: form.startDate,
    
                driveType: form.type,
    
                timeDurationInMin: Number(form.duration),
    
                mcqCount: Number(form.mcqCount || 0),
    
                codeCount:
                    form.type === "Assessment"
                        ? Number(form.codeCount || 0)
                        : 0,
    
                mcqMarks: Number(form.marksPerMcq || 0),
    
                codeMarks:
                    form.type === "Assessment"
                        ? Number(form.marksPerCode || 0)
                        : 0,
            };
    
            const response = editData

                ? await axios.put(
                    `http://localhost:4000/api/drives/${editData._id}`,
                    payload
                )

                : await axios.post(
                    "http://localhost:4000/api/drives",
                    payload
                );
    
            if (response.data.success) {
    
                const newDrive = {
    
                    _id: response.data.drive._id,
    
                    title: response.data.drive.hiringPositionName,
    
                    tag: response.data.drive.driveType,
    
                    status: "Draft",
    
                    visibility: "Private",
    
                    type: response.data.drive.driveType,
    
                    startDate: response.data.drive.driveDate,
    
                    endDate: response.data.drive.driveDate,
    
                    totalCandidates: 0,
    
                    attempted: 0,
    
                    avgScore: 0,
    
                    topScore: 0,
    
                    duration:
                        response.data.drive.timeDurationInMin,
    
                    questionCount:
                        response.data.drive.mcqCount +
                        response.data.drive.codeCount,
    
                    mcqCount:
                        response.data.drive.mcqCount,
    
                    codeCount:
                        response.data.drive.codeCount,
    
                    marksPerMcq:
                        response.data.drive.mcqMarks,
    
                    marksPerCode:
                        response.data.drive.codeMarks,
    
                    createdAt:
                        response.data.drive.createdAt,
    
                    difficulty: form.difficulty,
    
                    tags: [],
    
                    completionRate: 0,
                };
    
                setDone(true);
    
                onSave(newDrive);

                onClose();
            }
    
        } catch (error) {
    
            console.log(error);
    
        } finally {
    
            setSaving(false);
        }
    };

    const totalQs    = (+form.mcqCount||0) + (+form.codeCount||0);
    const totalMarks = (+form.mcqCount||0)*(+form.marksPerMcq||0) + (+form.codeCount||0)*(+form.marksPerCode||0);

    const STEPS = ["Basic Info", "Questions", "AI Generate (Optional)",  "Email",];

    return (
        <motion.div key="modal-bd"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)" }}
            onClick={onClose}>

            {/* inject dark input styles once */}
            <style>{DARK_INPUT_STYLE}</style>

            <motion.div
                initial={{ opacity:0, scale:0.93, y:20 }}
                animate={{ opacity:1, scale:1,    y:0 }}
                exit={{   opacity:0, scale:0.93, y:20 }}
                transition={{ type:"spring", damping:26, stiffness:280 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-[520px] rounded-3xl border border-white/[0.07] flex flex-col overflow-hidden"
                style={{ background:"rgba(11,8,24,0.99)", boxShadow:"0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.15)" }}>

                {/* top accent line */}
                <div className="h-[2px]" style={{ background:"linear-gradient(90deg,#6366f1,#8b5cf6,#a855f7,transparent)" }} />

                {/* header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.3)" }}>
                            {done
                                ? <CheckCircle2 size={16} className="text-emerald-400" />
                                : step === 3
                                ? <Bot size={16} className="text-purple-400" />
                                : <Zap size={16} className="text-indigo-400" />}
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-tight">
                                {editData ? "Update Drive" : "Create New Drive"}
                            </p>
                            <p className="text-white/30 text-[11px] mt-0.5">
                                {done ? "Adding to your drives list…"
                                    : step === 1 ? "Step 1 of 4 — Basic Info"
                                    : step === 2 ? "Step 2 of 4 — Questions & Scoring"
                                    : step === 3 ? "Step 3 of 4 — AI Question Generation"
                                    : "Step 4 of 4 — Candidate Email"
                                    }
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-white/6 transition">
                        <X size={15} />
                    </button>
                </div>

                {/* step bar — 3 steps */}
                <div className="px-6 mb-1">
                    <div className="flex items-center gap-2">
                        {STEPS.map((label, idx) => {
                            const s = idx + 1;
                            return (
                                <React.Fragment key={s}>
                                    <div className={`flex items-center gap-1.5 text-[10px] font-semibold transition ${step >= s ? "text-indigo-300" : "text-white/20"}`}>
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold transition border ${
                                            step > s  ? "bg-indigo-500 border-indigo-400 text-white"
                                            : step === s ? "border-indigo-500/70 text-indigo-300 bg-indigo-500/10"
                                            : "border-white/10 text-white/20"}`}
                                            style={{ fontSize:10 }}>
                                            {step > s ? <CheckCircle2 size={10}/> : s}
                                        </div>
                                        {label}
                                    </div>
                                    {s < 4 && <div className={`flex-1 h-px transition ${step > s ? "bg-indigo-500/50" : "bg-white/8"}`} />}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* scrollable body */}
                <div className="px-6 pb-2 overflow-y-auto max-h-[480px]"
                    style={{ scrollbarWidth:"thin", scrollbarColor:"rgba(99,102,241,0.2) transparent" }}>
                    <AnimatePresence mode="wait">

                        {/* STEP 1 */}
                        {step === 1 && (
                            <motion.div key="s1"
                                initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}
                                transition={{ duration:0.18 }} className="space-y-4 py-4">

                                <Field label="Drive Name" icon={Briefcase} error={errors.title}>
                                    <TInput value={form.title} onChange={set("title")}
                                        placeholder="e.g. Senior React Engineer" error={errors.title} />
                                </Field>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Category" icon={AlignLeft} error={errors.tag}>
                                        <TInput value={form.tag} onChange={set("tag")}
                                            placeholder="e.g. Engineering" error={errors.tag} />
                                    </Field>
                                    <Field label="Drive Type" icon={FileText}>
                                        <SInput value={form.type} onChange={set("type")}>
                                            <option>Aptitude</option>
                                            <option>Assessment</option>
                                        </SInput>
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Start Date" icon={Calendar} error={errors.startDate}>
                                        <TInput
                                            type="datetime-local"
                                            value={form.startDate}
                                            onChange={set("startDate")}
                                            error={errors.startDate}
                                        />
                                    </Field>

                                    <Field label="End Date" icon={Calendar} error={errors.endDate}>
                                        <TInput
                                            type="datetime-local"
                                            value={form.endDate}
                                            onChange={set("endDate")}
                                            error={errors.endDate}
                                        />
                                    </Field>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Difficulty" icon={Gauge}>
                                        <SInput value={form.difficulty} onChange={set("difficulty")}>
                                            <option>Beginner</option>
                                            <option>Intermediate</option>
                                            <option>Advanced</option>
                                        </SInput>
                                    </Field>
                                    <Field label="Duration (min)" icon={Timer} error={errors.duration}>
                                        <TInput type="number" value={form.duration} onChange={set("duration")}
                                            placeholder="e.g. 90" error={errors.duration} min="1" />
                                    </Field>
                                </div>

                                
                            </motion.div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <motion.div key="s2"
                                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                                transition={{ duration:0.18 }} className="space-y-4 py-4">

                                <div className="rounded-2xl border border-indigo-500/15 p-4 space-y-3"
                                    style={{ background:"rgba(99,102,241,0.05)" }}>
                                    <div className="flex items-center gap-2 pb-1 border-b border-indigo-500/10">
                                        <CheckSquare size={13} className="text-indigo-400" />
                                        <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest">MCQ Questions</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label={
                                            form.type === "Aptitude"
                                                ? "Number of MCQs (per block)"
                                                : "Number of MCQs"
                                        } error={errors.mcqCount}>
                                            <TInput type="number" value={form.mcqCount} onChange={set("mcqCount")}
                                                placeholder="e.g. 20" error={errors.mcqCount} min="0" />
                                        </Field>
                                        <Field label="Marks per MCQ" error={errors.marksPerMcq}>
                                            <TInput type="number" value={form.marksPerMcq} onChange={set("marksPerMcq")}
                                                placeholder="e.g. 2" error={errors.marksPerMcq} min="0" />
                                        </Field>
                                    </div>
                                </div>

                                {form.type === "Assessment" && (
                                    <div
                                        className="rounded-2xl border border-purple-500/15 p-4 space-y-3"
                                        style={{
                                            background: "rgba(139,92,246,0.05)"
                                        }}
                                    >
                                        <div className="flex items-center gap-2 pb-1 border-b border-purple-500/10">
                                            <Code2
                                                size={13}
                                                className="text-purple-400"
                                            />

                                            <p className="text-purple-300 text-[11px] font-bold uppercase tracking-widest">
                                                Coding Questions
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">

                                            <Field
                                                label="Number of Code Qs"
                                                error={errors.codeCount}
                                            >
                                                <TInput
                                                    type="number"
                                                    value={form.codeCount}
                                                    onChange={set("codeCount")}
                                                    placeholder="e.g. 5"
                                                    error={errors.codeCount}
                                                    min="0"
                                                />
                                            </Field>

                                            <Field
                                                label="Marks per Code Q"
                                                error={errors.marksPerCode}
                                            >
                                                <TInput
                                                    type="number"
                                                    value={form.marksPerCode}
                                                    onChange={set("marksPerCode")}
                                                    placeholder="e.g. 10"
                                                    error={errors.marksPerCode}
                                                    min="0"
                                                />
                                            </Field>

                                        </div>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {totalQs > 0 && (
                                        <motion.div
                                            initial={{ opacity:0, y:8, scale:0.97 }}
                                            animate={{ opacity:1, y:0, scale:1 }}
                                            exit={{   opacity:0, y:4, scale:0.97 }}
                                            className="rounded-xl p-3.5 border border-indigo-500/20 flex items-center gap-3"
                                            style={{ background:"rgba(99,102,241,0.08)" }}>
                                            <Sparkles size={14} className="text-indigo-400 shrink-0" />
                                            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                                                {[
                                                    { label:"Total Qs",    val: totalQs },
                                                    { label:"Total Marks", val: totalMarks || "—" },
                                                    { label:"Duration",    val: form.duration ? `${form.duration}m` : "—" },
                                                ].map(s => (
                                                    <div key={s.label}>
                                                        <p className="text-white font-bold text-sm">{s.val}</p>
                                                        <p className="text-white/30 text-[10px]">{s.label}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* STEP 3 — AI Question Generation */}
                        {step === 3 && (
                            <motion.div key="s3"
                                initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
                                transition={{ duration:0.18 }} className="space-y-4 py-4">

                                {/* Header banner */}
                                <div className="rounded-2xl p-4 border border-purple-500/20 flex items-start gap-3"
                                    style={{ background:"linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.12))" }}>
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                                        style={{ background:"rgba(139,92,246,0.2)", border:"1px solid rgba(139,92,246,0.35)" }}>
                                        <Bot size={16} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-purple-200 font-bold text-xs">AI Question Generator</p>
                                        <p className="text-white/35 text-[11px] mt-0.5 leading-relaxed">
                                            Describe the type of questions you want. AI will generate a curated question set tailored to your drive.
                                        </p>
                                    </div>
                                </div>

                                {/* Prompt textarea */}
                                <Field label="Generation Prompt" icon={Wand2}>
                                    <div className="relative">
                                        <textarea
                                            value={form.aiPrompt}
                                            onChange={set("aiPrompt")}
                                            placeholder="e.g. Generate 20 MCQ questions on React hooks, async/await, and JavaScript closures for an intermediate-level frontend developer assessment..."
                                            rows={5}
                                            className="w-full px-3 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/20 outline-none transition border border-white/8 focus:border-purple-500/50 resize-none"
                                            style={{ background:"rgba(8,6,18,0.85)", lineHeight:"1.6" }}
                                        />
                                        {form.aiPrompt && (
                                            <button
                                                onClick={() => setForm(f => ({ ...f, aiPrompt:"" }))}
                                                className="absolute top-2.5 right-2.5 w-5 h-5 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/8 transition">
                                                <X size={10} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-white/20 text-[10px]">{form.aiPrompt.length} chars</span>
                                        {form.aiPrompt.length > 0 && (
                                            <span className="text-emerald-400/60 text-[10px] flex items-center gap-1">
                                                <CheckCircle2 size={9}/> Prompt ready
                                            </span>
                                        )}
                                    </div>
                                </Field>

                                {/* Auto-fill button */}
                                <motion.button
                                    whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                                    onClick={handleAutoFill}
                                    disabled={false}
                                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-indigo-500/30 transition disabled:opacity-50"
                                    style={{ background:"rgba(99,102,241,0.1)", color:"#a5b4fc" }}>
                                    <>
                                        <Sparkles size={13} />
                                        Auto AI Fill - Generate from Drive Details
                                    </>
                                </motion.button>

                                

                                {/* Drive summary reminder */}
                                {(form.title || form.tag) && (
                                    <div className="rounded-xl p-3 border border-white/5 flex items-center gap-2.5"
                                        style={{ background:"rgba(255,255,255,0.02)" }}>
                                        <Zap size={12} className="text-indigo-400 shrink-0" />
                                        <p className="text-white/30 text-[11px]">
                                            Generating for <span className="text-white/55 font-semibold">{form.title || "Untitled"}</span>
                                            {form.tag && <> · <span className="text-white/40">{form.tag}</span></>}
                                            {form.difficulty && <> · <span className="text-amber-400/60">{form.difficulty}</span></>}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="s4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.18 }}
                                className="space-y-4 py-4"
                            >

                                <div
                                    className="rounded-2xl p-4 border border-indigo-500/20 flex items-start gap-3"
                                    style={{
                                        background:
                                            "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.12))"
                                    }}
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                        style={{
                                            background: "rgba(99,102,241,0.15)",
                                            border: "1px solid rgba(99,102,241,0.3)"
                                        }}
                                    >
                                        <FileText
                                            size={16}
                                            className="text-indigo-300"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-indigo-200 font-bold text-xs">
                                            Candidate Email
                                        </p>

                                        <p className="text-white/35 text-[11px] mt-0.5 leading-relaxed">
                                            Configure the invitation email candidates will receive.
                                        </p>
                                    </div>
                                </div>

                                <Field
                                    label="Email Subject"
                                    icon={FileText}
                                    error={errors.emailTitle}
                                >
                                    <TInput
                                        value={form.emailTitle}
                                        error={errors.emailTitle}
                                        onChange={set("emailTitle")}
                                        placeholder="e.g. Invitation for Frontend Assessment Drive"
                                    />
                                </Field>

                                <Field
                                        label="Email Body"
                                        icon={AlignLeft}
                                        error={errors.emailBody}
                                >
                                    <textarea
                                        value={form.emailBody}
                                        onChange={set("emailBody")}
                                        rows={7}
                                        placeholder="Write candidate invitation email..."
                                        className="w-full px-3 py-2.5 rounded-xl text-xs text-white/80 placeholder-white/20 outline-none transition border border-white/8 focus:border-indigo-500/50 resize-none"
                                        style={{
                                            background: "rgba(8,6,18,0.85)",
                                            lineHeight: "1.6"
                                        }}
                                    />
                                </Field>

                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        setForm(f => ({
                                            ...f,

                                            emailTitle:
                                                `${f.title} - Assessment Invitation`,

                                            emailBody:
                                                `Hello Candidate,

                                                You are invited to participate in the ${f.title} assessment drive.

                                                Drive Details:
                                                • Category: ${f.tag}
                                                • Difficulty: ${f.difficulty}
                                                • Duration: ${f.duration} minutes

                                                Please complete the assessment before the deadline.

                                                Best Regards,
                                                CodeArena Recruitment Team`
                                        }));
                                    }}
                                    className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-indigo-500/30 transition"
                                    style={{
                                        background: "rgba(99,102,241,0.1)",
                                        color: "#a5b4fc"
                                    }}
                                >
                                    <Sparkles size={13} />
                                    Auto AI Fill - Generate Email
                                </motion.button>

                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* footer actions */}
                <div className="px-6 py-5 border-t border-white/6 flex gap-2.5">
                    {step === 1 && (
                        <>
                            <button onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/35 hover:text-white hover:bg-white/5 transition">
                                Cancel
                            </button>
                            <button onClick={handleNext1}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
                                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                                Next - Questions <ChevronRight size={13} />
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <button onClick={() => { setErrors({}); setStep(1); }}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/35 hover:text-white hover:bg-white/5 transition">
                                ← Back
                            </button>
                            <button onClick={handleNext2}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2"
                                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                                Next — AI Generate <ChevronRight size={13} />
                            </button>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <button
                                onClick={() => {
                                    setErrors({});
                                    setStep(2);
                                }}
                                className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-white/8 text-white/35 hover:text-white hover:bg-white/5 transition"
                            >
                                ← Back
                            </button>

                            <button
                                onClick={() => setStep(4)}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-white/8 text-white/70 hover:bg-white/5 transition flex items-center justify-center gap-2"
                                style={{
                                    background: "rgba(255,255,255,0.03)"
                                }}
                            >
                                Skip & Next
                                <ChevronRight size={13} />
                            </button>

                            <button
                                onClick={handleGenerate}
                                disabled={generating || done || !form.aiPrompt.trim()}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-40"
                                style={{
                                    background:
                                        "linear-gradient(135deg,#7c3aed,#a855f7)"
                                }}
                            >
                                {generating ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.7,
                                                ease: "linear"
                                            }}
                                            className="w-3.5 h-3.5 rounded-full border-2 border-purple-300/30 border-t-purple-200"
                                        />

                                        Generating…
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={13} />
                                        Generate Questions
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    {step === 4 && (
                        <>
                            <button
                                onClick={() => {
                                    setErrors({});
                                    setStep(3);
                                }}
                                className="py-2.5 px-4 rounded-xl text-xs font-semibold border border-white/8 text-white/35 hover:text-white hover:bg-white/5 transition"
                            >
                                ← Back
                            </button>

                            <button
                                onClick={async () => {

                                    const e = {};

                                    if (!form.emailTitle.trim()) {
                                        e.emailTitle = "Email subject is required";
                                    }

                                    if (!form.emailBody.trim()) {
                                        e.emailBody = "Email body is required";
                                    }

                                    if (Object.keys(e).length) {
                                        setErrors(e);
                                        return;
                                    }

                                    setErrors({});
                                    await handleSave();
                                }}
                                disabled={saving || done}
                                className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-40"
                                style={{
                                    background:
                                        "linear-gradient(135deg,#7c3aed,#a855f7)"
                                }}
                            >
                                {saving ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.7,
                                                ease: "linear"
                                            }}
                                            className="w-3.5 h-3.5 rounded-full border-2 border-purple-300/30 border-t-purple-200"
                                        />

                                        Creating…
                                    </>
                                ) : done ? (
                                    <>
                                        <CheckCircle2 size={13} />
                                        Created!
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={13} />
                                        Create Drive
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CreateDriveModal;