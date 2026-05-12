import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api";

// ─── Icons ────────────────────────────────────────────────────────────────────

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const LogoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IdIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="13" y2="14" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C63FF" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─── Info Row ─────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "10px 14px", borderRadius: "10px",
      background: "#6C63FF09", border: "1px solid #6C63FF18",
      marginBottom: "8px"
    }}>
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ color: "#6C63FF", fontSize: "12px", fontWeight: 600, minWidth: "60px" }}>
        {label}
      </span>
      <span style={{
        color: "#e4e4e7", fontSize: "12px", fontFamily: "monospace",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
      }}>
        {value}
      </span>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ ok }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700,
      background: ok ? "#22C55E18" : "#EF444418",
      border: `1px solid ${ok ? "#22C55E44" : "#EF444444"}`,
      color: ok ? "#22C55E" : "#EF4444",
      fontFamily: "'Syne', sans-serif", letterSpacing: "0.05em"
    }}>
      <span style={{
        width: "6px", height: "6px", borderRadius: "50%",
        background: ok ? "#22C55E" : "#EF4444",
        boxShadow: ok ? "0 0 6px #22C55E" : "0 0 6px #EF4444"
      }} />
      {ok ? "AUTHENTICATED" : "INVALID"}
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [admin, setAdmin]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setError("No admin token found. Please log in.");
        setLoading(false);
        return;
      }
      try {
        const res  = await fetch(`${API_URL}/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setAdmin(data.admin);
        } else {
          setError(data.message || "Token invalid.");
          localStorage.removeItem("adminToken");
        }
      } catch {
        setError("Could not reach server.");
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "/adminlogin";
  };

  // ── Loading ──
  if (loading) {
    return (
      <div style={centerStyle}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "50%",
          border: "3px solid #2A1454", borderTopColor: "#6C63FF",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error / Not authenticated ──
  if (error) {
    return (
      <div style={centerStyle}>
        <div style={{
          background: "linear-gradient(135deg, #1F2937ee, #1A0B2Eaa)",
          border: "1px solid #EF444433", borderRadius: "20px",
          padding: "40px 36px", textAlign: "center", maxWidth: "380px", width: "90%"
        }}>
          <div style={{
            width: "56px", height: "56px", borderRadius: "50%",
            background: "#EF444418", border: "1px solid #EF444433",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "24px"
          }}>🔒</div>
          <h2 style={{ color: "#fff", margin: "0 0 8px", fontFamily: "'Syne', sans-serif" }}>
            Access Denied
          </h2>
          <p style={{ color: "#EF4444", fontSize: "13px", margin: "0 0 24px" }}>{error}</p>
          <button onClick={() => window.location.href = "/adminlogin"} style={btnStyle}>
            Go to Admin Login →
          </button>
        </div>
      </div>
    );
  }

  const initials = admin?.name
    ?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "A";

  const loginTime = new Date().toLocaleString("en-IN", {
    dateStyle: "medium", timeStyle: "short"
  });

  return (
    <div style={{
      minHeight: "100vh", background: "#050816",
      fontFamily: "'DM Sans', sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "fixed", width: 420, height: 420, background: "#2A1454",
        top: -80, left: -100, opacity: 0.6, filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "fixed", width: 300, height: 300, background: "#6C63FF22",
        bottom: 40, right: -60, opacity: 0.5, filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px",
        animation: "fadeUp 0.4s ease both" }}>

        {/* Logo header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6C63FF, #2A1454)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <LogoIcon />
            </div>
            <span style={{ fontSize: "20px", fontWeight: 800, color: "#fff",
              fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}>
              CodeArena
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <ShieldIcon />
            <span style={{ fontSize: "11px", color: "#6C63FF", fontWeight: 700,
              letterSpacing: "0.15em", fontFamily: "'Syne', sans-serif" }}>
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "linear-gradient(135deg, #1F2937ee 0%, #1A0B2E99 100%)",
          border: "1px solid #6C63FF33", borderRadius: "20px",
          padding: "36px 32px", backdropFilter: "blur(24px)"
        }}>

          {/* Avatar + name */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%",
              background: "linear-gradient(135deg, #6C63FF, #2A1454)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px", fontSize: "26px", fontWeight: 700,
              color: "#fff", fontFamily: "'Syne', sans-serif",
              boxShadow: "0 0 0 4px #6C63FF22, 0 0 32px #6C63FF44"
            }}>
              {initials}
            </div>

            <h1 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 700,
              color: "#fff", fontFamily: "'Syne', sans-serif" }}>
              Welcome, {admin?.name} 👋
            </h1>
            <p style={{ color: "#71717a", fontSize: "12px", margin: "0 0 12px" }}>
              {admin?.email}
            </p>
            <StatusBadge ok={true} />
          </div>

          {/* Info rows */}
          <div style={{ marginBottom: "20px" }}>
            <InfoRow icon={<UserIcon />}  label="Name"    value={admin?.name} />
            <InfoRow icon={<MailIcon />}  label="Email"   value={admin?.email} />
            <InfoRow icon={<IdIcon />}    label="ID"      value={admin?.id || admin?._id} />
            <InfoRow icon={<ClockIcon />} label="Login"   value={loginTime} />
          </div>

          {/* Auth status banner */}
          <div style={{
            background: "#22C55E0a", border: "1px solid #22C55E22",
            borderRadius: "12px", padding: "12px 14px",
            display: "flex", alignItems: "center", gap: "10px",
            marginBottom: "20px"
          }}>
            <span style={{ fontSize: "18px" }}>✅</span>
            <div>
              <p style={{ margin: 0, fontSize: "12px", fontWeight: 600,
                color: "#22C55E", fontFamily: "'Syne', sans-serif" }}>
                Admin login verified
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "#71717a", marginTop: "2px" }}>
                Token validated via <code style={{ color: "#6C63FF" }}>/api/admin/me</code>
              </p>
            </div>
          </div>

          {/* Logout */}
          <button onClick={handleLogout} style={btnStyle}>
            <LogoutIcon /> Sign Out
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#3f3f46", marginTop: "16px" }}>
          CodeArena Admin Portal · Restricted Access
        </p>
      </div>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const centerStyle = {
  minHeight: "100vh", background: "#050816",
  display: "flex", alignItems: "center", justifyContent: "center",
  flexDirection: "column", gap: "16px"
};

const btnStyle = {
  width: "100%", padding: "12px", borderRadius: "12px",
  background: "linear-gradient(135deg, #6C63FF, #4f46e5)",
  color: "#fff", fontWeight: 600, fontSize: "14px",
  border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif",
  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
  boxShadow: "0 4px 24px #6C63FF44"
};