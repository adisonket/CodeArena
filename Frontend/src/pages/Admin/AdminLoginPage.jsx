import { useState } from "react";

const API_URL = "http://localhost:4000/api";

// ─── Icons ────────────────────────────────────────────────────────────────────

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ─── Alert ────────────────────────────────────────────────────────────────────

function Alert({ type, message }) {
  if (!message) return null;
  const styles = {
    error:   "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
  };
  return (
    <div className={`text-xs px-3.5 py-2.5 rounded-xl border ${styles[type]}`}>
      {message}
    </div>
  );
}

// ─── OTP Input — 6 separate boxes ─────────────────────────────────────────────

function OtpBoxes({ value, onChange }) {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (e, idx) => {
    const key = e.key;
    if (key === "Backspace") {
      const next = digits.map((d, i) => i === idx ? "" : d).join("").slice(0, 6);
      onChange(next);
      if (idx > 0) document.getElementById(`otp-${idx - 1}`)?.focus();
      return;
    }
    if (!/^\d$/.test(key)) return;
    const next = digits.map((d, i) => i === idx ? key : d).join("").slice(0, 6);
    onChange(next);
    if (idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2.5 justify-between">
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onChange={() => {}} // controlled via onKeyDown
          className="w-11 h-12 rounded-xl text-center text-lg font-bold text-white
            bg-[#050816cc] border border-[#2A1454] outline-none
            focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF33]
            transition-all duration-200 caret-transparent"
        />
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const [step, setStep]         = useState("credentials"); // "credentials" | "otp"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp]           = useState("");
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  // ── Step 1: Submit email + password ──
  const handleCredentials = async () => {
    if (!email || !password) return setError("Both fields are required.");
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("OTP sent to your admin email.");
      setTimeout(() => { setSuccess(""); setStep("otp"); }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Submit OTP ──
  const handleOtp = async () => {
    if (otp.length < 6) return setError("Enter all 6 digits.");
    setError(""); setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/admin/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser",  JSON.stringify(data.admin));
      window.location.href = "/admindashboard";
    } catch (err) {
      setError(err.message);
      setOtp("");
      document.getElementById("otp-0")?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyEnter = (fn) => (e) => { if (e.key === "Enter") fn(); };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-6 py-8 overflow-hidden"
      style={{ background: "#050816", fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .anim { animation: fadeSlideIn 0.3s ease both; }
      `}</style>

      {/* Background orbs — same as AuthPage */}
      <div className="fixed rounded-full pointer-events-none"
        style={{ width: 420, height: 420, background: "#2A1454", top: -80, left: -100, opacity: 0.7, filter: "blur(80px)" }} />
      <div className="fixed rounded-full pointer-events-none"
        style={{ width: 300, height: 300, background: "#6C63FF22", bottom: 40, right: -60, opacity: 0.5, filter: "blur(80px)" }} />
      <div className="fixed rounded-full pointer-events-none"
        style={{ width: 200, height: 200, background: "#6C63FF18", top: "40%", left: "50%", opacity: 0.4, filter: "blur(80px)" }} />

      <div className="relative z-10 w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #6C63FF, #2A1454)" }}>
              <LogoIcon />
            </div>
            <h1 className="text-[22px] font-extrabold tracking-tight text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              CodeArena
            </h1>
          </div>
          {/* Admin badge */}
          <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full
            border border-[#6C63FF44] bg-[#6C63FF11]">
            <ShieldIcon />
            <span className="text-xs font-semibold text-[#6C63FF] tracking-widest uppercase"
              style={{ fontFamily: "'Syne', sans-serif" }}>
              Admin Portal
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[20px] p-8 border border-[#6C63FF33]"
          style={{
            background: "linear-gradient(135deg, #1F2937ee 0%, #1A0B2E99 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}>

          {/* ── Step 1: Credentials ── */}
          {step === "credentials" && (
            <div className="anim flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-bold text-white font-[Syne]">Admin Sign In</h2>
                <p className="text-zinc-400 text-[13px] mt-0.5">
                  Restricted access — authorised personnel only
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-widest uppercase">
                  Admin Email
                </label>
                <input
                  type="email"
                  placeholder="admin@codearena.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyEnter(handleCredentials)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600
                    bg-[#050816cc] border border-[#2A1454] outline-none
                    focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF22]
                    transition-all duration-200"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-widest uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyEnter(handleCredentials)}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-white placeholder-zinc-600
                      bg-[#050816cc] border border-[#2A1454] outline-none
                      focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF22]
                      transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500
                      hover:text-[#6C63FF] transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
              </div>

              <Alert type="error"   message={error} />
              <Alert type="success" message={success} />

              <button
                onClick={handleCredentials}
                disabled={loading}
                className="w-full py-3 rounded-xl text-[15px] font-semibold text-white
                  bg-gradient-to-br from-[#6C63FF] to-[#4f46e5]
                  shadow-[0_4px_24px_#6C63FF44]
                  hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#6C63FF55]
                  active:scale-[0.98] transition-all duration-150
                  border-none cursor-pointer font-[Syne] tracking-wide
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Verifying..." : "Continue →"}
              </button>

              {/* Security note */}
              <p className="text-center text-[11px] text-zinc-600">
                A one-time passcode will be sent to your registered email
              </p>
            </div>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <div className="anim flex flex-col gap-4">
              <div>
                <button
                  onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 mb-3 flex items-center
                    gap-1 bg-transparent border-none cursor-pointer p-0 transition-colors"
                >
                  ← Back
                </button>
                <h2 className="text-xl font-bold text-white font-[Syne]">Enter OTP</h2>
                <p className="text-zinc-400 text-[13px] mt-0.5">
                  6-digit code sent to{" "}
                  <span className="text-[#6C63FF] font-medium">{email}</span>
                </p>
              </div>

              <OtpBoxes value={otp} onChange={setOtp} />

              <Alert type="error" message={error} />

              <button
                onClick={handleOtp}
                disabled={loading || otp.length < 6}
                className="w-full py-3 rounded-xl text-[15px] font-semibold text-white
                  bg-gradient-to-br from-[#6C63FF] to-[#4f46e5]
                  shadow-[0_4px_24px_#6C63FF44]
                  hover:-translate-y-0.5 hover:shadow-[0_8px_32px_#6C63FF55]
                  active:scale-[0.98] transition-all duration-150
                  border-none cursor-pointer font-[Syne] tracking-wide
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? "Verifying..." : "Verify & Sign In →"}
              </button>

              {/* Resend */}
              <button
                onClick={handleCredentials}
                disabled={loading}
                className="text-xs text-zinc-500 hover:text-[#6C63FF] text-center
                  bg-transparent border-none cursor-pointer transition-colors w-full"
              >
                Didn't receive it? Resend OTP
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-[11px] text-zinc-700 mt-5">
          CodeArena Admin Portal · Restricted Access
        </p>
      </div>
    </div>
  );
}