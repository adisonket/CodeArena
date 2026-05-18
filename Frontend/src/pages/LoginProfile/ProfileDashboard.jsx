import { useState, useEffect, useRef } from "react";
import SoftBackdropNew from "../../components/SoftBackdropNew";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext.jsx";

const API = "http://localhost:4000/api";

const COLORS = {
  deepNavy: "#050816",
  darkPurple: "#1A0B2E",
  midPurple: "#2A1454",
  accent: "#6C63FF",
  cardDark: "#1F2937",
  grayMuted: "#A1A1AA",
  green: "#22C55E",
  amber: "#f59e0b",
  red: "#f87171",
};

const EMPTY_EDU = {
  _id: null,
  degree: "", institution: "", university: "",
  year: "", cgpa: "", current: false, docs: [],
};

const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ── Icons ─────────────────────────────────────────────────────────────────────
const PencilIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CheckIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FileIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const ImageIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const UploadIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
  </svg>
);

const FolderOpenIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);

const UserIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const GraduationCapIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);

const IdCardIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M14 9h4M14 12h4M14 15h2" />
  </svg>
);

const LockIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);

const CameraIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const CircleCheckIcon = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const CircleHalfIcon = ({ size = 10, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20" />
  </svg>
);

const CircleDotIcon = ({ size = 8, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}
    stroke={color} strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const ArrowRightIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ExternalLinkIcon = ({ size = 12, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const Spinner = () => (
  <div style={{
    width: 14, height: 14, border: `2px solid ${COLORS.accent}44`,
    borderTop: `2px solid ${COLORS.accent}`, borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  }} />
);

function DocPreviewModal({ doc, onClose }) {
  if (!doc) return null;
  const url = doc.url || (doc.path ? `http://localhost:4000${doc.path}` : null);
  if (!url) return null;
  const isImage = /\.(jpg|jpeg|png)$/i.test(doc.name || "");
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        background: "rgba(0,0,0,0.75)", display: "flex",
        alignItems: "center", justifyContent: "center", padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLORS.cardDark, borderRadius: 18, overflow: "hidden",
          border: `1px solid ${COLORS.midPurple}`, width: "100%", maxWidth: 860,
          display: "flex", flexDirection: "column",
          maxHeight: "90vh", boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", borderBottom: `1px solid ${COLORS.midPurple}55`,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: COLORS.accent, display: "flex" }}>
              {isImage ? <ImageIcon size={18} color={COLORS.accent} /> : <FileIcon size={18} color={COLORS.accent} />}
            </span>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#fff", maxWidth: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {doc.name}
            </span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a
              href={url} target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid ${COLORS.accent}44`, padding: "4px 12px", borderRadius: 8, textDecoration: "none" }}
            >
              Open <ExternalLinkIcon size={11} color={COLORS.accent} />
            </a>
            <button
              onClick={onClose}
              style={{ background: "none", border: `1px solid ${COLORS.grayMuted}44`, color: COLORS.grayMuted, borderRadius: 8, padding: "4px 12px", fontSize: 12, fontFamily: "'Space Mono',monospace", cursor: "pointer" }}
            >
              ✕ Close
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          {isImage
            ? <img src={url} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            : <iframe src={url} title={doc.name} style={{ width: "100%", height: "75vh", border: "none", display: "block", background: "#fff" }} />
          }
        </div>
      </div>
    </div>
  );
}

function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  const color = type === "error" ? COLORS.red : COLORS.green;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28,
      background: COLORS.cardDark, border: `1px solid ${color}55`,
      color, fontFamily: "'Space Mono',monospace", fontSize: 12,
      padding: "10px 18px", borderRadius: 12, display: "flex",
      alignItems: "center", gap: 8, zIndex: 9999,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      {type === "success" ? <CheckIcon size={12} /> : "✕"} {message}
    </div>
  );
}

function SectionCard({ children, editing, style }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${COLORS.cardDark} 60%, ${COLORS.darkPurple} 100%)`,
      borderRadius: 18, padding: 24,
      boxShadow: "0 0 24px 2px rgba(108,99,255,0.10)",
      border: editing ? `1px solid ${COLORS.accent}55` : `1px solid ${COLORS.midPurple}55`,
      transition: "border 0.2s",
      ...style,
    }}>
      {children}
    </div>
  );
}

function EditBanner() {
  return (
    <div style={{
      background: `${COLORS.accent}10`, border: `1px solid ${COLORS.accent}33`,
      borderRadius: 10, padding: "8px 14px", marginBottom: 18,
      display: "flex", alignItems: "center", gap: 8,
      fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace",
    }}>
      <PencilIcon size={11} /> Editing mode — click Save when done.
    </div>
  );
}

function SectionHeader({ title, subtitle, editing, saving, onToggle }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div>
        <h2 style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, margin: 0 }}>{title}</h2>
        <p style={{ fontSize: 12, color: COLORS.grayMuted, margin: "4px 0 0" }}>{subtitle}</p>
      </div>
      <button onClick={onToggle} disabled={saving} style={{
        display: "flex", alignItems: "center", gap: 7,
        padding: "8px 16px", borderRadius: 10, flexShrink: 0, marginLeft: 16,
        border: editing ? `1.5px solid ${COLORS.green}` : `1.5px solid ${COLORS.accent}66`,
        color: editing ? COLORS.green : COLORS.accent,
        background: editing ? `${COLORS.green}15` : `${COLORS.accent}10`,
        fontFamily: "'Space Mono',monospace", fontSize: 11, fontWeight: 700,
        cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
        transition: "all 0.2s",
      }}>
        {saving ? <Spinner /> : editing ? <><CheckIcon size={12} /> Save</> : <><PencilIcon size={12} /> Edit</>}
      </button>
    </div>
  );
}

function EditableInput({ label, value, editing, onChange, textarea, type = "text", readOnly = false }) {
  const base = {
    width: "100%", borderRadius: 10, padding: "9px 12px",
    fontSize: 13, fontFamily: "'DM Sans',sans-serif",
    outline: "none", resize: "none", transition: "all 0.2s",
    boxSizing: "border-box", color: (editing && !readOnly) ? "#fff" : "#e2e8f0",
    background: (editing && !readOnly) ? `${COLORS.midPurple}55` : "transparent",
    border: (editing && !readOnly) ? `1.5px solid ${COLORS.accent}88` : "1.5px solid transparent",
    boxShadow: (editing && !readOnly) ? `0 0 0 3px ${COLORS.accent}18` : "none",
    cursor: readOnly ? "default" : "text",
  };
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{
        fontSize: 10, display: "block", marginBottom: 5, letterSpacing: 1,
        textTransform: "uppercase", fontFamily: "'Space Mono',monospace",
        color: (editing && !readOnly) ? COLORS.accent : COLORS.grayMuted, transition: "color 0.2s",
      }}>
        {label}
        {editing && !readOnly && <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 9 }}>✎</span>}
      </label>
      {textarea
        ? <textarea rows={3} style={base} value={value} readOnly={!editing || readOnly} onChange={e => onChange && onChange(e.target.value)} />
        : <input type={type} style={base} value={value} readOnly={!editing || readOnly} onChange={e => onChange && onChange(e.target.value)} />
      }
    </div>
  );
}

function AddSkillInput({ onAdd }) {
  const [val, setVal] = useState("");
  const [show, setShow] = useState(false);
  const submit = () => { if (val.trim()) { onAdd(val.trim()); setVal(""); setShow(false); } };
  if (!show) return (
    <button onClick={() => setShow(true)} style={{
      fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace",
      background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}44`,
      padding: "5px 12px", borderRadius: 8, cursor: "pointer",
    }}>+ Add Skill</button>
  );
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input autoFocus value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") setShow(false); }}
        placeholder="e.g. TypeScript"
        style={{
          background: `${COLORS.midPurple}55`, border: `1.5px solid ${COLORS.accent}88`,
          color: "#fff", borderRadius: 8, padding: "5px 12px", fontSize: 12,
          fontFamily: "'Space Mono',monospace", outline: "none", width: 150,
          boxShadow: `0 0 0 3px ${COLORS.accent}18`,
        }} />
      <button onClick={submit} style={{ background: COLORS.accent, border: "none", color: "#fff", borderRadius: 8, padding: "5px 12px", fontSize: 11, fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>Add</button>
      <button onClick={() => setShow(false)} style={{ background: "transparent", border: `1px solid ${COLORS.grayMuted}44`, color: COLORS.grayMuted, borderRadius: 8, padding: "5px 10px", fontSize: 11, fontFamily: "'Space Mono',monospace", cursor: "pointer" }}>✕</button>
    </div>
  );
}

// ── Personal Section ──────────────────────────────────────────────────────────
function PersonalSection({ initialData, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({
    firstName: "", lastName: "", email: "",
    phone: "", location: "", linkedin: "", github: "", bio: "",
  });
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (initialData) {
      setData({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        location: initialData.location || "",
        linkedin: initialData.linkedin || "",
        github: initialData.github || "",
        bio: initialData.bio || "",
      });
      setSkills(initialData.skills || []);
    }
  }, [initialData]);

  const set = key => val => setData(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/profile`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ ...data, skills }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEditing(false);
      setToast({ msg: "Personal details saved!", type: "success" });
      onSaved && onSaved(json.user);
    } catch (err) {
      setToast({ msg: err.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard editing={editing}>
        {editing && <EditBanner />}
        <SectionHeader title="Personal Details" subtitle="Your basic information shown to interviewers"
          editing={editing} saving={saving} onToggle={() => editing ? handleSave() : setEditing(true)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <EditableInput label="First Name" value={data.firstName} editing={editing} onChange={set("firstName")} />
          <EditableInput label="Last Name" value={data.lastName} editing={editing} onChange={set("lastName")} />
          <EditableInput label="Email Address" value={data.email} editing={false} onChange={() => {}} />
          <EditableInput label="Phone Number" value={data.phone} editing={editing} onChange={set("phone")} />
          <EditableInput label="Location" value={data.location} editing={editing} onChange={set("location")} />
          <EditableInput label="LinkedIn" value={data.linkedin} editing={editing} onChange={set("linkedin")} />
          <div style={{ gridColumn: "1 / -1" }}>
            <EditableInput label="GitHub" value={data.github} editing={editing} onChange={set("github")} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <EditableInput label="About / Bio" value={data.bio} editing={editing} onChange={set("bio")} textarea />
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${COLORS.midPurple}55`, marginTop: 20, paddingTop: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <label style={{ fontSize: 10, color: editing ? COLORS.accent : COLORS.grayMuted, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s" }}>
              Technical Skills
            </label>
            {editing && <AddSkillInput onAdd={s => setSkills(p => [...p, s])} />}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {skills.map((s, i) => (
              <span key={i} style={{ background: COLORS.midPurple, color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11, padding: "5px 12px", borderRadius: 99, border: `1px solid ${COLORS.accent}33`, display: "flex", alignItems: "center", gap: 6 }}>
                {s}
                {editing && (
                  <button onClick={() => setSkills(p => p.filter((_, j) => j !== i))} style={{ background: "none", border: "none", color: `${COLORS.accent}99`, cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1, display: "flex" }}>✕</button>
                )}
              </span>
            ))}
            {skills.length === 0 && !editing && (
              <span style={{ fontSize: 12, color: COLORS.grayMuted }}>No skills added yet</span>
            )}
          </div>
        </div>
      </SectionCard>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── Education Section ─────────────────────────────────────────────────────────
function EduCard({ edu, editing, onFieldChange, onDocUpload, onRemoveDoc, uploadingDocId }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  return (
    <div style={{
      border: editing ? `1.5px solid ${COLORS.accent}55` : `1px solid ${COLORS.midPurple}99`,
      borderRadius: 14, padding: 16, marginBottom: 14, position: "relative",
      background: editing ? `${COLORS.accent}05` : "transparent", transition: "all 0.2s",
    }}>
      {edu.current && (
        <span style={{ position: "absolute", top: 12, right: 12, background: `${COLORS.green}22`, color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "3px 10px", borderRadius: 99, border: `1px solid ${COLORS.green}44`, display: "flex", alignItems: "center", gap: 4 }}>
          <CircleDotIcon size={6} color={COLORS.green} /> Current
        </span>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 14px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <EditableInput label="Degree / Program" value={edu.degree} editing={editing} onChange={v => onFieldChange(edu._id ? String(edu._id) : edu.tempId, "degree", v)} />
        </div>
        <EditableInput label="Institution" value={edu.institution} editing={editing} onChange={v => onFieldChange(edu._id ? String(edu._id) : edu.tempId, "institution", v)} />
        <EditableInput label="University" value={edu.university} editing={editing} onChange={v => onFieldChange(edu._id ? String(edu._id) : edu.tempId, "university", v)} />
        <EditableInput label="Year" value={edu.year} editing={editing} onChange={v => onFieldChange(edu._id ? String(edu._id) : edu.tempId, "year", v)} />
        <EditableInput label="CGPA / %" value={edu.cgpa} editing={editing} onChange={v => onFieldChange(edu._id ? String(edu._id) : edu.tempId, "cgpa", v)} />
      </div>

      <div style={{ borderTop: `1px solid ${COLORS.midPurple}44`, marginTop: 14, paddingTop: 14 }}>
        <label style={{ fontSize: 10, color: editing ? COLORS.accent : COLORS.grayMuted, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8, transition: "color 0.2s" }}>
          Supporting Documents <span style={{ color: COLORS.grayMuted, fontSize: 9, textTransform: "none", letterSpacing: 0 }}>(PDF only)</span>
        </label>
        {edu.docs.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: `${COLORS.cardDark}99`, padding: "7px 12px", borderRadius: 9, border: `1px solid ${COLORS.midPurple}44`, marginBottom: 6, fontSize: 12 }}>
            <FileIcon size={14} color={COLORS.green} />
            <span style={{ color: COLORS.green, fontFamily: "'Space Mono',monospace", fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
            <span style={{ fontSize: 10, color: COLORS.grayMuted, flexShrink: 0 }}>{d.size}</span>
            <button
              onClick={() => setPreviewDoc(d)}
              style={{ background: "none", border: `1px solid ${COLORS.accent}44`, color: COLORS.accent, cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 6, fontFamily: "'Space Mono',monospace", flexShrink: 0 }}
            >
              Preview
            </button>
            {editing && (
              <button onClick={() => onRemoveDoc(edu._id ? String(edu._id) : edu.tempId, d._id, i)} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 12, padding: 0, flexShrink: 0 }}>✕</button>
            )}
          </div>
        ))}
        {editing && edu.docs.length === 0 && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, border: `2px dashed ${COLORS.accent}66`, borderRadius: 10, padding: "9px 14px", cursor: uploadingDocId === (edu._id ? String(edu._id) : edu.tempId) ? "not-allowed" : "pointer", fontSize: 12, color: COLORS.grayMuted, marginTop: 4, transition: "border 0.2s", opacity: uploadingDocId === (edu._id ? String(edu._id) : edu.tempId) ? 0.6 : 1 }}>
            {uploadingDocId === (edu._id ? String(edu._id) : edu.tempId)
              ? <><Spinner /><span style={{ color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11 }}>Uploading...</span></>
              : <><UploadIcon size={14} color={COLORS.accent} /><span style={{ color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11 }}>Upload PDF</span><span style={{ marginLeft: "auto", fontSize: 10 }}>PDF only</span></>
            }
            <input type="file" style={{ display: "none" }} accept=".pdf" onChange={e => onDocUpload(edu._id ? String(edu._id) : edu.tempId, e)} disabled={uploadingDocId === (edu._id ? String(edu._id) : edu.tempId)} />
          </label>
        )}
        {editing && edu.docs.length >= 1 && (
          <p style={{ fontSize: 11, color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", marginTop: 8, textAlign: "center" }}>
            Maximum 1 document per qualification. Remove existing to replace.
          </p>
        )}
      </div>
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}

function EducationSection({ initialData, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [toast, setToast] = useState(null);
  const [eduList, setEduList] = useState([]);

  useEffect(() => {
    if (initialData?.education) setEduList(initialData.education);
  }, [initialData]);

  const handleFieldChange = (id, field, val) => {
    setEduList(prev => prev.map(ed => (String(ed._id) === id || ed.tempId === id) ? { ...ed, [field]: val } : ed));
  };

  const handleDocUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const edu = eduList.find(ed => String(ed._id) === id || ed.tempId === id);
    if (!edu) return;

    if (edu._id) {
      setUploadingDocId(id);
      try {
        const form = new FormData();
        form.append("doc", file);
        const res = await fetch(`${API}/profile/education/${edu._id}/doc`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: form,
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        setEduList(prev => prev.map(ed => String(ed._id) === id ? { ...ed, docs: [...ed.docs, json.doc] } : ed));
        setToast({ msg: "Document uploaded!", type: "success" });
      } catch (err) {
        setToast({ msg: err.message || "Upload failed", type: "error" });
      } finally {
        setUploadingDocId(null);
      }
    } else {
      const preview = { name: file.name, size: `${Math.round(file.size / 1024)} KB`, _file: file };
      setEduList(prev => prev.map(ed => ed.tempId === id ? { ...ed, docs: [...ed.docs, preview] } : ed));
    }
  };

  const handleRemoveDoc = async (eduId, docId, docIndex) => {
    const edu = eduList.find(ed => String(ed._id) === eduId || ed.tempId === eduId);
    if (edu._id && docId) {
      try {
        await fetch(`${API}/profile/education/${edu._id}/doc/${docId}`, {
          method: "DELETE",
          headers: authHeader(),
        });
      } catch { /* silent */ }
    }
    setEduList(prev => prev.map(ed =>
      (String(ed._id) === eduId || ed.tempId === eduId)
        ? { ...ed, docs: ed.docs.filter((_, i) => i !== docIndex) }
        : ed
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const clean = eduList.map(({ tempId, ...ed }) => ({
        ...ed,
        docs: ed.docs.filter(d => !d._file).map(({ _file, ...d }) => d),
      }));
      const res = await fetch(`${API}/profile/education`, {
        method: "PUT",
        headers: authHeader(),
        body: JSON.stringify({ education: clean }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEduList(json.education);
      setEditing(false);
      setToast({ msg: "Education saved!", type: "success" });
      onSaved && onSaved();
    } catch (err) {
      setToast({ msg: err.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionCard editing={editing}>
        {editing && <EditBanner />}
        <SectionHeader title="Educational Details" subtitle="Academic background and credentials"
          editing={editing} saving={saving} onToggle={() => editing ? handleSave() : setEditing(true)} />
        {eduList.map(edu => (
          <EduCard key={edu._id || edu.tempId} edu={edu} editing={editing}
            onFieldChange={handleFieldChange} onDocUpload={handleDocUpload}
            onRemoveDoc={handleRemoveDoc} uploadingDocId={uploadingDocId} />
        ))}
        {editing && (
          <button onClick={() => setEduList(p => [...p, { ...EMPTY_EDU, tempId: `temp-${Date.now()}` }])}
            style={{ width: "100%", border: `1.5px dashed ${COLORS.accent}44`, borderRadius: 12, padding: "10px 0", color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 12, background: "none", cursor: "pointer" }}>
            + Add Another Education
          </button>
        )}
      </SectionCard>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── Resume Section ────────────────────────────────────────────────────────────
function ResumeSection({ initialData, onSaved }) {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    if (initialData?.resumeUrl) {
      const fullUrl = initialData.resumeUrl.startsWith("http")
        ? initialData.resumeUrl
        : `http://localhost:4000${initialData.resumeUrl}`;
      setResume({ name: initialData.resumeOriginalName || "Resume", url: fullUrl });
    }
  }, [initialData]);

  const handleFile = async e => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
    setAnalysis(null);
    try {
      const form = new FormData();
      form.append("resume", f);
      const res = await fetch(`${API}/profile/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const fullUrl = json.resumeUrl.startsWith("http")
        ? json.resumeUrl
        : `http://localhost:4000${json.resumeUrl}`;
      setResume({ name: json.originalName, size: json.size, url: fullUrl });
      setToast({ msg: "Resume uploaded!", type: "success" });
      onSaved && onSaved();
    } catch (err) {
      setToast({ msg: err.message || "Upload failed", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`${API}/profile/resume`, { method: "DELETE", headers: authHeader() });
      setResume(null);
      setAnalysis(null);
      onSaved && onSaved();
    } catch { /* silent */ }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch(`${API}/profile/resume/analyze`, {
        method: "POST",
        headers: authHeader(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setAnalysis(json.analysis);
    } catch (err) {
      setToast({ msg: err.message || "Analysis failed", type: "error" });
    } finally {
      setAnalyzing(false);
    }
  };

  const ScoreRing = ({ score, size = 64, label }) => {
    const r = (size / 2) - 6;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const color = score >= 75 ? COLORS.green : score >= 50 ? COLORS.accent : COLORS.amber;
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`${color}22`} strokeWidth={5} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`} />
          <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle"
            fill={color} fontSize={size * 0.22} fontFamily="'Space Mono',monospace" fontWeight="700">
            {score}
          </text>
        </svg>
        {label && <span style={{ fontSize: 10, color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace" }}>{label}</span>}
      </div>
    );
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionCard>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, margin: 0 }}>Resume</h2>
            <p style={{ fontSize: 12, color: COLORS.grayMuted, marginTop: 4 }}>Upload your latest resume for interviewers to review</p>
          </div>

          {!resume ? (
            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: `2px dashed ${COLORS.midPurple}`, borderRadius: 16, padding: "48px 24px", cursor: uploading ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: uploading ? 0.7 : 1 }}
              onMouseEnter={e => { if (!uploading) { e.currentTarget.style.borderColor = COLORS.accent; e.currentTarget.style.background = `${COLORS.accent}08`; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.midPurple; e.currentTarget.style.background = "transparent"; }}>
              {uploading
                ? <><Spinner /><p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: COLORS.accent, marginTop: 12 }}>Uploading...</p></>
                : <>
                  <div style={{ width: 56, height: 56, borderRadius: 14, background: `${COLORS.midPurple}88`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <FileIcon size={26} color={COLORS.accent} />
                  </div>
                  <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#fff", margin: 0 }}>Drag & drop your resume</p>
                  <p style={{ fontSize: 12, color: COLORS.grayMuted, marginTop: 6 }}>or <span style={{ color: COLORS.accent }}>browse to upload</span></p>
                  <p style={{ fontSize: 10, color: COLORS.grayMuted, marginTop: 10, fontFamily: "'Space Mono',monospace" }}>PDF, DOCX up to 5MB</p>
                </>
              }
              <input type="file" style={{ display: "none" }} accept=".pdf,.docx" onChange={handleFile} disabled={uploading} />
            </label>
          ) : (
            <div style={{ border: `1px solid ${COLORS.green}44`, borderRadius: 14, padding: 16, background: `${COLORS.cardDark}88`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: `${COLORS.green}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileIcon size={20} color={COLORS.green} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resume.name}</p>
                {resume.size && <p style={{ fontSize: 11, color: COLORS.grayMuted, marginTop: 3 }}>{resume.size}</p>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setPreviewDoc({ name: resume.name, url: resume.url })}
                  style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid ${COLORS.accent}44`, padding: "4px 12px", borderRadius: 8, background: "none", cursor: "pointer" }}
                >
                  Preview
                </button>
                <label style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid ${COLORS.accent}44`, padding: "4px 12px", borderRadius: 8, cursor: "pointer" }}>
                  Replace <input type="file" style={{ display: "none" }} accept=".pdf,.docx" onChange={handleFile} />
                </label>
                <button onClick={handleDelete} style={{ fontSize: 11, color: COLORS.red, fontFamily: "'Space Mono',monospace", border: `1px solid ${COLORS.red}44`, padding: "4px 12px", borderRadius: 8, background: "none", cursor: "pointer" }}>Remove</button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: `${COLORS.accent}0D`, border: `1px solid ${COLORS.accent}22` }}>
            <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Resume Tips</p>
            {["Keep your resume to 1–2 pages maximum", "Highlight projects, GitHub links, and measurable results", "Use consistent formatting and clear section headers", "Our AI will analyze your resume and suggest improvements"].map((tip, i) => (
              <p key={i} style={{ fontSize: 12, color: COLORS.grayMuted, margin: "0 0 6px", display: "flex", alignItems: "flex-start", gap: 6 }}>
                <ArrowRightIcon size={11} color={COLORS.accent} style={{ flexShrink: 0, marginTop: 2 }} />{tip}
              </p>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!resume || analyzing}
            style={{
              width: "100%", marginTop: 16, padding: "13px 0", borderRadius: 12,
              background: !resume ? `${COLORS.midPurple}55` : `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.midPurple})`,
              color: !resume ? COLORS.grayMuted : "#fff",
              fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700,
              border: "none", cursor: !resume ? "not-allowed" : analyzing ? "wait" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: analyzing ? 0.8 : 1, transition: "all 0.2s",
            }}>
            {analyzing ? <><Spinner /> Analyzing with AI...</> : "✦ Analyze Resume with AI"}
          </button>
        </SectionCard>

        {analysis && (
          <SectionCard>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontFamily: "'Space Mono',monospace", fontSize: 16, fontWeight: 700, margin: 0 }}>AI Analysis Results</h2>
              <p style={{ fontSize: 12, color: COLORS.grayMuted, marginTop: 4 }}>Powered by AI — tap Analyze again to refresh</p>
            </div>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 24, padding: 20, background: `${COLORS.midPurple}33`, borderRadius: 14 }}>
              <ScoreRing score={analysis.overallScore} size={80} label="Overall" />
              <ScoreRing score={analysis.atsScore} size={80} label="ATS Score" />
            </div>
            <div style={{ marginBottom: 20, padding: 14, background: `${COLORS.accent}0D`, border: `1px solid ${COLORS.accent}22`, borderRadius: 12 }}>
              <p style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.7, margin: 0 }}>{analysis.summary}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Section Breakdown</p>
              {Object.entries(analysis.sections || {}).map(([key, score]) => {
                const color = score >= 75 ? COLORS.green : score >= 50 ? COLORS.accent : COLORS.amber;
                return (
                  <div key={key} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#e2e8f0", textTransform: "capitalize" }}>{key}</span>
                      <span style={{ fontSize: 11, color, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{score}/100</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 99, background: COLORS.midPurple }}>
                      <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 14, background: `${COLORS.green}0D`, border: `1px solid ${COLORS.green}22`, borderRadius: 12 }}>
                <p style={{ fontSize: 10, color: COLORS.green, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Strengths</p>
                {(analysis.strengths || []).map((s, i) => (
                  <p key={i} style={{ fontSize: 12, color: "#e2e8f0", margin: "0 0 6px", display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <CheckIcon size={12} color={COLORS.green} style={{ flexShrink: 0, marginTop: 2 }} />{s}
                  </p>
                ))}
              </div>
              <div style={{ padding: 14, background: `${COLORS.amber}0D`, border: `1px solid ${COLORS.amber}22`, borderRadius: 12 }}>
                <p style={{ fontSize: 10, color: COLORS.amber, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Improvements</p>
                {(analysis.improvements || []).map((item, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 12, color: COLORS.amber, margin: "0 0 2px", fontWeight: 600, display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <ArrowRightIcon size={11} color={COLORS.amber} style={{ flexShrink: 0, marginTop: 2 }} />{item.issue}
                    </p>
                    <p style={{ fontSize: 11, color: COLORS.grayMuted, margin: 0 }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            {(analysis.atsTips || []).length > 0 && (
              <div style={{ marginBottom: 20, padding: 14, background: `${COLORS.cardDark}88`, border: `1px solid ${COLORS.midPurple}`, borderRadius: 12 }}>
                <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>ATS Optimisation Tips</p>
                {analysis.atsTips.map((tip, i) => (
                  <p key={i} style={{ fontSize: 12, color: COLORS.grayMuted, margin: "0 0 6px", display: "flex", alignItems: "flex-start", gap: 6 }}>
                    <ArrowRightIcon size={11} color={COLORS.accent} style={{ flexShrink: 0, marginTop: 2 }} />{tip}
                  </p>
                ))}
              </div>
            )}
            {(analysis.missingKeywords || []).length > 0 && (
              <div>
                <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Suggested Keywords to Add</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {analysis.missingKeywords.map((kw, i) => (
                    <span key={i} style={{ background: `${COLORS.accent}15`, color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11, padding: "4px 12px", borderRadius: 99, border: `1px solid ${COLORS.accent}33` }}>+ {kw}</span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        )}
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </>
  );
}

// ── KYC Doc Upload Widget ─────────────────────────────────────────────────────
function KycDocWidget({ label, docData, fieldName, editing, uploading, onUpload }) {
  const [previewDoc, setPreviewDoc] = useState(null);
  const hasDoc = docData?.name && docData?.path;
  const isImage = docData?.name && /\.(jpg|jpeg|png)$/i.test(docData.name);
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{ fontSize: 10, display: "block", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", color: editing ? COLORS.accent : COLORS.grayMuted }}>
        {label} Document <span style={{ fontSize: 9, textTransform: "none", letterSpacing: 0, color: COLORS.grayMuted }}>(JPG, PNG, PDF)</span>
      </label>
      {hasDoc ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: `${COLORS.green}0D`, border: `1px solid ${COLORS.green}33`, borderRadius: 10, padding: "9px 14px" }}>
          <span style={{ display: "flex", flexShrink: 0 }}>
            {isImage ? <ImageIcon size={16} color={COLORS.green} /> : <FileIcon size={16} color={COLORS.green} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: COLORS.green, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{docData.name}</p>
            {docData.size && <p style={{ fontSize: 10, color: COLORS.grayMuted, margin: "2px 0 0" }}>{docData.size}</p>}
          </div>
          <button
            onClick={() => setPreviewDoc(docData)}
            style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid ${COLORS.accent}44`, padding: "3px 10px", borderRadius: 6, background: "none", cursor: "pointer", flexShrink: 0 }}
          >
            Preview
          </button>
          {editing && (
            <label style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid ${COLORS.accent}44`, padding: "4px 10px", borderRadius: 7, cursor: uploading === fieldName ? "not-allowed" : "pointer", flexShrink: 0 }}>
              {uploading === fieldName ? <Spinner /> : "Replace"}
              <input type="file" style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" onChange={e => onUpload(fieldName, e)} disabled={uploading === fieldName} />
            </label>
          )}
        </div>
      ) : (
        editing ? (
          <label style={{ display: "flex", alignItems: "center", gap: 8, border: `2px dashed ${uploading === fieldName ? COLORS.accent : `${COLORS.accent}55`}`, borderRadius: 10, padding: "10px 14px", cursor: uploading === fieldName ? "not-allowed" : "pointer", opacity: uploading === fieldName ? 0.7 : 1, transition: "all 0.2s" }}>
            {uploading === fieldName
              ? <><Spinner /><span style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace" }}>Uploading...</span></>
              : <><UploadIcon size={16} color={COLORS.accent} /><span style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace" }}>Upload {label} Document</span><span style={{ marginLeft: "auto", fontSize: 10, color: COLORS.grayMuted }}>JPG, PNG, PDF</span></>
            }
            <input type="file" style={{ display: "none" }} accept=".jpg,.jpeg,.png,.pdf" onChange={e => onUpload(fieldName, e)} disabled={uploading === fieldName} />
          </label>
        ) : (
          <div style={{ border: `1px dashed ${COLORS.midPurple}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <FolderOpenIcon size={16} color={COLORS.grayMuted} />
            <span style={{ fontSize: 12, color: COLORS.grayMuted }}>No document uploaded yet</span>
          </div>
        )
      )}
      <DocPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}

// ── KYC & Address Section ─────────────────────────────────────────────────────
function KycSection({ initialData, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [toast, setToast] = useState(null);

  const [data, setData] = useState({
    dob: "", nationality: "",
    state: "", district: "", pin: "", locality: "", postOffice: "",
    aadhaarNumber: "", panNumber: "",
  });
  const [aadhaarDoc, setAadhaarDoc] = useState(null);
  const [panDoc, setPanDoc] = useState(null);

  useEffect(() => {
    if (initialData) {
      setData({
        dob: initialData.dob || "",
        nationality: initialData.nationality || "",
        state: initialData.address?.state || "",
        district: initialData.address?.district || "",
        pin: initialData.address?.pin || "",
        locality: initialData.address?.locality || "",
        postOffice: initialData.address?.postOffice || "",
        aadhaarNumber: initialData.aadhaarNumber || "",
        panNumber: initialData.panNumber || "",
      });
      setAadhaarDoc(initialData.aadhaarDoc?.name ? initialData.aadhaarDoc : null);
      setPanDoc(initialData.panDoc?.name ? initialData.panDoc : null);
    }
  }, [initialData]);

  const set = key => val => setData(d => ({ ...d, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      ["dob", "nationality", "aadhaarNumber", "panNumber"].forEach(k => form.append(k, data[k]));
      ["state", "district", "pin", "locality", "postOffice"].forEach(k => form.append(k, data[k]));

      const res = await fetch(`${API}/profile/complete-setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setEditing(false);
      setToast({ msg: "KYC & Address saved!", type: "success" });
      onSaved && onSaved();
    } catch (err) {
      setToast({ msg: err.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDocUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setUploadingDoc(field);
    try {
      const form = new FormData();
      form.append(field, file);
      const res = await fetch(`${API}/profile/complete-setup`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      const docInfo = { name: file.name, size: `${Math.round(file.size / 1024)} KB`, path: `/uploads/kyc/${file.name}` };
      if (field === "aadhaar") setAadhaarDoc(docInfo);
      if (field === "pan") setPanDoc(docInfo);
      setToast({ msg: `${field === "aadhaar" ? "Aadhaar" : "PAN"} document uploaded!`, type: "success" });
      onSaved && onSaved();
    } catch (err) {
      setToast({ msg: err.message || "Upload failed", type: "error" });
    } finally {
      setUploadingDoc(null);
    }
  };

  const maskNumber = (val) => {
    if (!val || editing) return val;
    if (val.length <= 4) return val;
    return "•".repeat(val.length - 4) + val.slice(-4);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <SectionCard editing={editing}>
          {editing && <EditBanner />}
          <SectionHeader title="KYC & Address" subtitle="Identity verification and residential details"
            editing={editing} saving={saving} onToggle={() => editing ? handleSave() : setEditing(true)} />

          <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>Personal Identity</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", marginBottom: 20 }}>
            <EditableInput label="Date of Birth" value={data.dob} editing={editing} onChange={set("dob")} type="date" />
            <EditableInput label="Nationality" value={data.nationality} editing={editing} onChange={set("nationality")} />
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.midPurple}55`, paddingTop: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>Residential Address</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <EditableInput label="State" value={data.state} editing={editing} onChange={set("state")} />
              <EditableInput label="District" value={data.district} editing={editing} onChange={set("district")} />
              <EditableInput label="PIN Code" value={data.pin} editing={editing} onChange={set("pin")} />
              <EditableInput label="Post Office" value={data.postOffice} editing={editing} onChange={set("postOffice")} />
              <div style={{ gridColumn: "1 / -1" }}>
                <EditableInput label="Locality / Area" value={data.locality} editing={editing} onChange={set("locality")} />
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.midPurple}55`, paddingTop: 20, marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, marginTop: 0 }}>KYC Numbers</p>
            <p style={{ fontSize: 11, color: COLORS.grayMuted, marginBottom: 14, marginTop: 0 }}>Sensitive fields are masked when not in edit mode.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <div>
                <label style={{ fontSize: 10, display: "block", marginBottom: 5, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", color: editing ? COLORS.accent : COLORS.grayMuted }}>
                  Aadhaar Number {editing && <span style={{ opacity: 0.6, fontSize: 9 }}>✎</span>}
                </label>
                <input
                  style={{ width: "100%", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.2s", boxSizing: "border-box", color: editing ? "#fff" : "#e2e8f0", background: editing ? `${COLORS.midPurple}55` : "transparent", border: editing ? `1.5px solid ${COLORS.accent}88` : "1.5px solid transparent", boxShadow: editing ? `0 0 0 3px ${COLORS.accent}18` : "none", letterSpacing: editing ? "normal" : "2px" }}
                  value={editing ? data.aadhaarNumber : maskNumber(data.aadhaarNumber)}
                  readOnly={!editing}
                  onChange={e => set("aadhaarNumber")(e.target.value)}
                  maxLength={12}
                  placeholder={editing ? "12-digit Aadhaar number" : ""}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, display: "block", marginBottom: 5, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'Space Mono',monospace", color: editing ? COLORS.accent : COLORS.grayMuted }}>
                  PAN Number {editing && <span style={{ opacity: 0.6, fontSize: 9 }}>✎</span>}
                </label>
                <input
                  style={{ width: "100%", borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "'DM Sans',sans-serif", outline: "none", transition: "all 0.2s", boxSizing: "border-box", color: editing ? "#fff" : "#e2e8f0", background: editing ? `${COLORS.midPurple}55` : "transparent", border: editing ? `1.5px solid ${COLORS.accent}88` : "1.5px solid transparent", boxShadow: editing ? `0 0 0 3px ${COLORS.accent}18` : "none", letterSpacing: editing ? "normal" : "2px", textTransform: "uppercase" }}
                  value={editing ? data.panNumber : maskNumber(data.panNumber)}
                  readOnly={!editing}
                  onChange={e => set("panNumber")(e.target.value.toUpperCase())}
                  maxLength={10}
                  placeholder={editing ? "10-character PAN" : ""}
                />
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${COLORS.midPurple}55`, paddingTop: 20 }}>
            <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14, marginTop: 0 }}>KYC Documents</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <KycDocWidget label="Aadhaar" docData={aadhaarDoc} fieldName="aadhaar" editing={editing} uploading={uploadingDoc} onUpload={handleDocUpload} />
              <KycDocWidget label="PAN" docData={panDoc} fieldName="pan" editing={editing} uploading={uploadingDoc} onUpload={handleDocUpload} />
            </div>
            {!editing && (
              <p style={{ fontSize: 11, color: COLORS.grayMuted, marginTop: 12, fontFamily: "'Space Mono',monospace", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <LockIcon size={12} color={COLORS.grayMuted} /> Your KYC documents are stored securely and never shared.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}

// ── Profile completion ────────────────────────────────────────────────────────
function calcCompletion(profile) {
  if (!profile) return 0;
  let score = 0;
  const personalFields = ["firstName", "lastName", "phone", "location", "linkedin", "github", "bio"];
  const filled = personalFields.filter(f => profile[f]?.trim()).length;
  score += (filled / personalFields.length) * 30;
  if ((profile.education || []).filter(e => e.degree && e.institution).length > 0) score += 25;
  if (profile.resumeUrl) score += 20;
  const kycFields = ["dob", "nationality", "aadhaarNumber", "panNumber"];
  const kycFilled = kycFields.filter(f => profile[f]?.trim()).length;
  score += (kycFilled / kycFields.length) * 15;
  const addrFields = ["state", "district", "pin", "locality"];
  const addrFilled = addrFields.filter(f => profile.address?.[f]?.trim()).length;
  score += (addrFilled / addrFields.length) * 10;
  return Math.round(score);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [photoUploading, setPhotoUploading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (json.success) setProfile(json.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePhotoChange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append("photo", f);
      const res = await fetch(`${API}/profile/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      const json = await res.json();
      if (json.success) {
        setProfile(p => ({ ...p, picture: json.photoUrl }));
        const token = localStorage.getItem("token");
        login({ ...(authUser || {}), picture: json.photoUrl }, token);
      }
    } catch (err) { console.error(err); }
    finally { setPhotoUploading(false); }
  };

  const refreshProfile = async () => {
    try {
      const res = await fetch(`${API}/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json();
      if (json.success) setProfile(json.user);
    } catch { /* silent */ }
  };

  const tabs = [
    { id: "personal",  label: "Personal Details", Icon: UserIcon },
    { id: "education", label: "Education",         Icon: GraduationCapIcon },
    { id: "resume",    label: "Resume",            Icon: FileIcon },
    { id: "kyc",       label: "KYC & Address",     Icon: IdCardIcon },
  ];

  const profilePct = calcCompletion(profile);
  const pctColor = profilePct >= 80 ? COLORS.green : profilePct >= 50 ? COLORS.accent : COLORS.amber;

  const photoSrc = profile?.picture
    ? profile.picture.startsWith("http")
      ? profile.picture
      : `http://localhost:4000${profile.picture}`
    : null;

  const initials = `${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}`.toUpperCase() || "?";
  const isProfileComplete = profile?.profileComplete === true;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: COLORS.deepNavy, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <Spinner />
        <p style={{ color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", fontSize: 12 }}>Loading profile...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <SoftBackdropNew />
      <div className="relative z-10" style={{ minHeight: "100vh", color: "#fff", fontFamily: "'DM Sans',sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <Header />

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* ── Sidebar ── */}
          <aside style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Photo Card */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.cardDark} 60%, ${COLORS.darkPurple} 100%)`, borderRadius: 18, padding: 24, boxShadow: "0 0 24px 2px rgba(108,99,255,0.10)", border: `1px solid ${COLORS.midPurple}55`, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", overflow: "hidden", boxShadow: `0 0 0 3px ${COLORS.accent}, 0 0 24px 4px rgba(108,99,255,0.25)`, opacity: photoUploading ? 0.6 : 1, transition: "opacity 0.2s" }}>
                  {photoSrc
                    ? <img src={photoSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${COLORS.midPurple}, ${COLORS.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{initials}</div>
                  }
                </div>
                <label style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,0.65)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  {photoUploading
                    ? <Spinner />
                    : <>
                        <CameraIcon size={18} color={COLORS.accent} />
                        <span style={{ fontSize: 9, color: COLORS.accent, fontFamily: "'Space Mono',monospace", marginTop: 4 }}>Change</span>
                      </>
                  }
                  <input type="file" style={{ display: "none" }} accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.firstName} {profile?.lastName}</div>
                <div style={{ fontSize: 11, color: COLORS.grayMuted, marginTop: 2 }}>{profile?.email}</div>

                {isProfileComplete ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, background: `${COLORS.green}22`, color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "3px 10px", borderRadius: 99, border: `1px solid ${COLORS.green}44` }}>
                    <CircleCheckIcon size={9} color={COLORS.green} /> Profile Complete
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, background: `${COLORS.amber}18`, color: COLORS.amber, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "3px 10px", borderRadius: 99, border: `1px solid ${COLORS.amber}44` }}>
                    <CircleHalfIcon size={9} color={COLORS.amber} /> Setup Incomplete
                  </span>
                )}

                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, background: `${COLORS.green}22`, color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "3px 10px", borderRadius: 99, border: `1px solid ${COLORS.green}44` }}>
                  <CircleDotIcon size={6} color={COLORS.green} /> Available for Interviews
                </span>
              </div>

              <div style={{ width: "100%", borderTop: `1px solid ${COLORS.midPurple}55`, paddingTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
                  <span style={{ color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace" }}>Profile</span>
                  <span style={{ color: pctColor, fontFamily: "'Space Mono',monospace", fontWeight: 700, transition: "color 0.4s" }}>{profilePct}%</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: COLORS.midPurple, overflow: "hidden" }}>
                  <div style={{ width: `${profilePct}%`, height: "100%", background: `linear-gradient(90deg, ${COLORS.accent}, ${pctColor})`, borderRadius: 99, transition: "width 0.5s ease" }} />
                </div>
                <p style={{ fontSize: 10, color: COLORS.grayMuted, marginTop: 6 }}>
                  {profilePct < 50 ? "Fill in your details to get started" : profilePct < 100 ? "Almost there — complete your KYC!" : "Profile complete"}
                </p>
              </div>
            </div>

            {/* Nav Tabs */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.cardDark} 60%, ${COLORS.darkPurple} 100%)`, borderRadius: 18, padding: 10, border: `1px solid ${COLORS.midPurple}55` }}>
              {tabs.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", marginBottom: 2, background: activeTab === id ? `linear-gradient(90deg, ${COLORS.accent}18, transparent)` : "transparent", color: activeTab === id ? COLORS.accent : COLORS.grayMuted, borderLeft: activeTab === id ? `3px solid ${COLORS.accent}` : "3px solid transparent", transition: "all 0.15s" }}>
                  <Icon size={15} color={activeTab === id ? COLORS.accent : COLORS.grayMuted} /> {label}
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.cardDark} 60%, ${COLORS.darkPurple} 100%)`, borderRadius: 18, padding: 20, border: `1px solid ${COLORS.midPurple}55` }}>
              <p style={{ fontSize: 10, color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, marginTop: 0 }}>Profile Completion</p>
              {[
                ["Personal Info",  profile?.bio ? "✓" : "–",                                          profile?.bio ? COLORS.green : COLORS.grayMuted],
                ["Education",      (profile?.education?.length > 0) ? "✓" : "–",                      (profile?.education?.length > 0) ? COLORS.green : COLORS.grayMuted],
                ["Resume",         profile?.resumeUrl ? "✓" : "–",                                    profile?.resumeUrl ? COLORS.green : COLORS.grayMuted],
                ["KYC Numbers",    (profile?.aadhaarNumber && profile?.panNumber) ? "✓" : "–",         (profile?.aadhaarNumber && profile?.panNumber) ? COLORS.green : COLORS.grayMuted],
                ["KYC Docs",       (profile?.aadhaarDoc?.name && profile?.panDoc?.name) ? "✓" : "–",  (profile?.aadhaarDoc?.name && profile?.panDoc?.name) ? COLORS.green : COLORS.grayMuted],
                ["Address",        profile?.address?.state ? "✓" : "–",                               profile?.address?.state ? COLORS.green : COLORS.grayMuted],
              ].map(([label, val, color]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 10 }}>
                  <span style={{ color: COLORS.grayMuted }}>{label}</span>
                  <span style={{ color, fontFamily: "'Space Mono',monospace", fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main style={{ flex: 1, minWidth: 0 }}>
            {activeTab === "personal"  && <PersonalSection  initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "education" && <EducationSection initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "resume"    && <ResumeSection    initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "kyc"       && <KycSection       initialData={profile} onSaved={refreshProfile} />}
          </main>
        </div>
      </div>
    </>
  );
}