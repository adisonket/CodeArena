import { useState } from "react";
import SoftBackdropNew from "../../components/SoftBackdropNew";
import Header from "../../components/Header";


const skills = [
  { label: "Technical Skills", score: 5, max: 10, color: "from-[#2A1454] to-[#6C63FF]", textColor: "text-[#6C63FF]" },
  { label: "Communication", score: 6, max: 10, color: "from-[#2A1454] to-[#6C63FF]", textColor: "text-[#6C63FF]" },
  { label: "Problem Solving", score: 7, max: 10, color: "from-[#14532d] to-[#22C55E]", textColor: "text-[#22C55E]" },
  { label: "Experience", score: null, max: 10, color: "from-[#2A1454] to-[#6C63FF]", textColor: "text-[#A1A1AA]" },
];

// ── Props expected from backend ──────────────────────────────
// candidate: { name, email, avatarInitial, id }
// overallScore: number
// skills: [{ label, score, max }]
// summary: string
// recommendation: string
// onSendMsg: () => void
// ─────────────────────────────────────────────────────────────

export default function FeedbackPanel({
  candidate = { name: "Mriganka Adhikary", email: "mrigankaadhikary@gmail.com", avatarInitial: "M", id: "MRA-2024-042" },
  overallScore = 6,
  skillsData = skills,
  summary = "The candidate demonstrated solid problem-solving ability and team leadership experience, but lacked depth in backend technical specifics. Communication showed room for improvement — a repeated question during the session indicated potential gaps in active listening. Concrete API or backend contributions are needed to fully gauge technical proficiency.",
  recommendation = "Requires further technical assessment before considering for hire. More detailed examples of backend work and API contributions are needed.",
  onSendMsg = () => alert("Message sent!"),
}) {
  return (
      <>
          <SoftBackdropNew />
          <Header />

          <div className="min-h-screen bg-[#050816] flex items-center justify-center p-6 font-['DM_Sans',sans-serif]">
              <div className="w-full max-w-[600px] relative z-10">

                  {/* Tags */}
                  <div className="flex gap-2 mb-4">
                      <Tag>INTERVIEW RESULT</Tag>
                      <Tag>AI EVALUATED</Tag>
                  </div>

                  {/* Main Glass Card */}
                  <div className="card-glow bg-[#1A0B2E]/70 backdrop-blur-xl border border-[#6C63FF]/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(108,99,255,0.15),0_0_80px_rgba(108,99,255,0.06),0_24px_48px_rgba(5,8,22,0.6)] relative before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-[#6C63FF]/40 before:via-transparent before:to-[#2A1454]/60 before:-z-10 before:blur-[2px]">

                      {/* Candidate + Score */}
                      <div className="flex items-center justify-between gap-4 mb-5">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#6C63FF] to-[#2A1454] flex items-center justify-center text-white text-xl font-extrabold shadow-[0_4px_16px_rgba(108,99,255,0.3)] shrink-0">
                                  {candidate.avatarInitial}
                              </div>
                              <div>
                                  <div className="text-white font-bold text-base leading-tight">{candidate.name}</div>
                                  <div className="text-[#A1A1AA] text-xs">{candidate.email}</div>
                              </div>
                          </div>

                          {/* Overall Score Badge */}
                          <div className="bg-gradient-to-br from-[#6C63FF]/15 to-[#2A1454]/40 border border-[#6C63FF]/30 rounded-[14px] px-5 py-3 text-right">
                              <div className="text-[11px] text-[#A1A1AA] font-semibold tracking-widest mb-0.5">OVERALL</div>
                              <div className="text-[28px] font-extrabold text-[#6C63FF] leading-none">
                                  {overallScore}<span className="text-sm text-[#A1A1AA] font-normal">/10</span>
                              </div>
                          </div>
                      </div>

                      <Divider />

                      {/* Skills Assessment */}
                      <div className="mb-5">
                          <SectionLabel>SKILLS ASSESSMENT</SectionLabel>
                          <div className="grid grid-cols-2 gap-4">
                              {skillsData.map((skill) => (
                                  <SkillBar key={skill.label} {...skill} />
                              ))}
                          </div>
                      </div>

                      <Divider />

                      {/* Performance Summary */}
                      <div className="mb-5">
                          <SectionLabel>PERFORMANCE SUMMARY</SectionLabel>
                          <div className="bg-[#050816]/50 border border-[#6C63FF]/10 rounded-xl p-4">
                              <p className="text-[#cbd5e1] text-[13px] leading-7">{summary}</p>
                          </div>
                      </div>

                      {/* Recommendation Box */}
                      <div className="bg-red-500/[0.07] border border-red-500/20 rounded-[14px] p-4">
                          <div className="text-[11px] font-bold tracking-widest text-red-400 mb-1.5">⚠ RECOMMENDATION</div>
                          <div className="flex items-start gap-3 justify-between">
                              <p className="text-red-300 text-[13px] leading-relaxed flex-1">{recommendation}</p>
                              <button
                                  onClick={onSendMsg}
                                  className="bg-gradient-to-br from-[#6C63FF] to-[#8B84FF] text-white text-[13px] font-semibold tracking-wide px-5 py-2.5 rounded-xl shadow-[0_4px_20px_rgba(108,99,255,0.4)] hover:shadow-[0_6px_28px_rgba(108,99,255,0.55)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                              >
                                  Send Msg
                              </button>
                          </div>
                      </div>

                  </div>

                  {/* Footer */}
                  <div className="flex justify-between mt-4 px-1">
                      <span className="text-[11px] text-[#3f3f5a]">
                          candidate_id: <span className="text-[#6C63FF]">{candidate.id}</span>
                      </span>
                      <span className="text-[11px] text-[#3f3f5a]">evaluated via AI · InterviewPlatform</span>
                  </div>

              </div>
          </div>
      </>
  );
}

// ── Sub-components ────────────────────────────────────────────

function Tag({ children }) {
  return (
    <span className="bg-[#6C63FF]/10 border border-[#6C63FF]/25 text-[#8B84FF] text-[11px] font-semibold tracking-wide px-3 py-1 rounded-full">
      {children}
    </span>
  );
}

function Divider() {
  return (
    <div className="h-px bg-gradient-to-r from-transparent via-[#6C63FF]/20 to-transparent mb-5" />
  );
}

function SectionLabel({ children }) {
  return (
    <div className="text-[13px] font-bold tracking-[0.08em] text-[#A1A1AA] mb-3">{children}</div>
  );
}

function SkillBar({ label, score, max = 10, color, textColor }) {
  const pct = score != null ? (score / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] text-slate-200 font-medium">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>
          {score != null ? score : "—"}<span className="text-[#A1A1AA] font-normal">/10</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#6C63FF]/10 overflow-hidden relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} relative`}
          style={{ width: `${pct}%` }}
        >
          {score != null && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(108,99,255,0.8)]" />
          )}
        </div>
      </div>
    </div>
  );
}