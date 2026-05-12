import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return ( 
    <div style={{
      minHeight: "100vh", background: "#050816", color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: "16px",
      fontFamily: "DM Sans, sans-serif"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1F2937ee, #1A0B2E99)",
        border: "1px solid #6C63FF33", borderRadius: "20px",
        padding: "40px", textAlign: "center", maxWidth: "400px", width: "90%"
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          overflow: "hidden",
          margin: "0 auto 16px",
          background: "linear-gradient(135deg, #6C63FF, #2A1454)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: "#fff"
        }}>
          {user?.picture ? (
            <img
            src={user.picture.startsWith('http') ? user.picture : `http://localhost:4000${user.picture}`}
            alt="Profile"
            referrerPolicy="no-referrer"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />
          ) : (
            <>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </>
          )}
        </div>

        <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700 }}>
          Welcome, {user?.firstName}! 👋
        </h1>
        <p style={{ color: "#a1a1aa", fontSize: "13px", margin: "0 0 24px" }}>
          {user?.email}
        </p>

        <div style={{
          background: "#6C63FF11", border: "1px solid #6C63FF22",
          borderRadius: "12px", padding: "12px 16px",
          fontSize: "12px", color: "#a1a1aa", marginBottom: "24px",
          textAlign: "left"
        }}>
          <div style={{ marginBottom: "6px" }}>
            <span style={{ color: "#6C63FF" }}>User ID: </span>{user?.id}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <span style={{ color: "#6C63FF" }}>Verified: </span>
            {user?.isVerified ? "Yes" : "No"}
          </div>
          <div>
            <span style={{ color: "#6C63FF" }}>2FA: </span>
            {user?.twoFactorEnabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: "100%", padding: "12px", borderRadius: "12px",
            background: "linear-gradient(135deg, #6C63FF, #4f46e5)",
            color: "#fff", fontWeight: 600, fontSize: "14px",
            border: "none", cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}