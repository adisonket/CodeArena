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
};

const EMPTY_EDU = {
  _id: null,
  degree: "", institution: "", university: "",
  year: "", cgpa: "", current: false, docs: [],
};

// ── Auth header helper ────────────────────────────────────────────────────────
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

const Spinner = () => (
  <div style={{
    width: 14, height: 14, border: `2px solid ${COLORS.accent}44`,
    borderTop: `2px solid ${COLORS.accent}`, borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  }} />
);

// ── Reusable components ───────────────────────────────────────────────────────
function Toast({ message, type = "success", onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, []);
  const color = type === "error" ? "#f87171" : COLORS.green;
  return (
    <div style={{
      position: "fixed", bottom: 28, right: 28,
      background: COLORS.cardDark, border: `1px solid ${color}55`,
      color, fontFamily: "'Space Mono',monospace", fontSize: 12,
      padding: "10px 18px", borderRadius: 12, display: "flex",
      alignItems: "center", gap: 8, zIndex: 9999,
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
    }}>
      {type === "success" ? "✓" : "✕"} {message}
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

function EditableInput({ label, value, editing, onChange, textarea }) {
  const base = {
    width: "100%", borderRadius: 10, padding: "9px 12px",
    fontSize: 13, fontFamily: "'DM Sans',sans-serif",
    outline: "none", resize: "none", transition: "all 0.2s",
    boxSizing: "border-box", color: editing ? "#fff" : "#e2e8f0",
    background: editing ? `${COLORS.midPurple}55` : "transparent",
    border: editing ? `1.5px solid ${COLORS.accent}88` : "1.5px solid transparent",
    boxShadow: editing ? `0 0 0 3px ${COLORS.accent}18` : "none",
  };
  return (
    <div style={{ marginBottom: 4 }}>
      <label style={{
        fontSize: 10, display: "block", marginBottom: 5, letterSpacing: 1,
        textTransform: "uppercase", fontFamily: "'Space Mono',monospace",
        color: editing ? COLORS.accent : COLORS.grayMuted, transition: "color 0.2s",
      }}>
        {label}
        {editing && <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 9 }}>✎</span>}
      </label>
      {textarea
        ? <textarea rows={3} style={base} value={value} readOnly={!editing} onChange={e => onChange(e.target.value)} />
        : <input style={base} value={value} readOnly={!editing} onChange={e => onChange(e.target.value)} />
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
  return (
    <div style={{
      border: editing ? `1.5px solid ${COLORS.accent}55` : `1px solid ${COLORS.midPurple}99`,
      borderRadius: 14, padding: 16, marginBottom: 14, position: "relative",
      background: editing ? `${COLORS.accent}05` : "transparent", transition: "all 0.2s",
    }}>
      {edu.current && (
        <span style={{ position: "absolute", top: 12, right: 12, background: `${COLORS.green}22`, color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "3px 10px", borderRadius: 99, border: `1px solid ${COLORS.green}44` }}>
          ● Current
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
            <span>📄</span>
            <span style={{ color: COLORS.green, fontFamily: "'Space Mono',monospace", fontSize: 11, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
            <span style={{ fontSize: 10, color: COLORS.grayMuted, flexShrink: 0 }}>{d.size}</span>
            {editing && (
              <button onClick={() => onRemoveDoc(edu._id ? String(edu._id) : edu.tempId, d._id, i)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 12, padding: 0, flexShrink: 0 }}>✕</button>
            )}
          </div>
        ))}
        {editing && edu.docs.length === 0 && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, border: `2px dashed ${COLORS.accent}66`, borderRadius: 10, padding: "9px 14px", cursor: uploadingDocId === edu._id ? String(edu._id) : edu.tempId ? "not-allowed" : "pointer", fontSize: 12, color: COLORS.grayMuted, marginTop: 4, transition: "border 0.2s", opacity: uploadingDocId === (edu._id ? String(edu._id) : edu.tempId) ? 0.6 : 1 }}>
            {uploadingDocId === edu._id ? String(edu._id) : edu.tempId
              ? <><Spinner /><span style={{ color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11 }}>Uploading...</span></>
              : <><span style={{ color: COLORS.accent, fontFamily: "'Space Mono',monospace", fontSize: 11 }}>↑ Upload PDF</span><span style={{ marginLeft: "auto", fontSize: 10 }}>PDF only</span></>
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

  // For new (unsaved) edu entries: upload doc locally, will be saved on Save
  // For existing entries: upload immediately to backend
  const handleDocUpload = async (id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const edu = eduList.find(ed => String(ed._id) === id || ed.tempId === id);
    console.log("id received:", id);
    console.log("eduList entries:", eduList.map(ed => ({ _id: String(ed._id), tempId: ed.tempId })));
    console.log("found edu:", edu);
    if (!edu) return; // ← prevents the crash

    // If this edu entry exists in DB (has a real _id), upload immediately
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
      // New edu not yet saved — store file reference locally (show name/size preview)
      const preview = { name: file.name, size: `${Math.round(file.size / 1024)} KB`, _file: file };
      setEduList(prev => prev.map(ed => ed.tempId === id ? { ...ed, docs: [...ed.docs, preview] } : ed));
    }
  };

  const handleRemoveDoc = async (eduId, docId, docIndex) => {
    const edu = eduList.find(ed => String(ed._id) === eduId || ed.tempId === eduId);

    // If the doc is persisted in DB
    if (edu._id && docId) {
      try {
        await fetch(`${API}/profile/education/${edu._id}/doc/${docId}`, {
          method: "DELETE",
          headers: authHeader(),
        });
      } catch (err) { /* silent */ }
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
      // Strip local _file references before sending to API
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

  useEffect(() => {
    if (initialData?.resumeUrl) {
      setResume({ name: initialData.resumeOriginalName || "Resume", url: initialData.resumeUrl });
    }
  }, [initialData]);

  const handleFile = async e => {
    const f = e.target.files[0];
    if (!f) return;
    setUploading(true);
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
      setResume({ name: json.originalName, size: json.size, url: json.resumeUrl });
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
      onSaved && onSaved();
    } catch { /* silent */ }
  };

  return (
    <>
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
                <div style={{ width: 56, height: 56, borderRadius: 14, background: `${COLORS.midPurple}88`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 24 }}>📄</div>
                <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color: "#fff", margin: 0 }}>Drag & drop your resume</p>
                <p style={{ fontSize: 12, color: COLORS.grayMuted, marginTop: 6 }}>or <span style={{ color: COLORS.accent }}>browse to upload</span></p>
                <p style={{ fontSize: 10, color: COLORS.grayMuted, marginTop: 10, fontFamily: "'Space Mono',monospace" }}>PDF, DOCX up to 5MB</p>
              </>
            }
            <input type="file" style={{ display: "none" }} accept=".pdf,.docx" onChange={handleFile} disabled={uploading} />
          </label>
        ) : (
          <div style={{ border: `1px solid ${COLORS.green}44`, borderRadius: 14, padding: 16, background: `${COLORS.cardDark}88`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: `${COLORS.green}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{resume.name}</p>
              {resume.size && <p style={{ fontSize: 11, color: COLORS.grayMuted, marginTop: 3 }}>{resume.size}</p>}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label style={{ fontSize: 11, color: COLORS.accent, fontFamily: "'Space Mono',monospace", border: `1px solid ${COLORS.accent}44`, padding: "4px 12px", borderRadius: 8, cursor: "pointer" }}>
                Replace <input type="file" style={{ display: "none" }} accept=".pdf,.docx" onChange={handleFile} />
              </label>
              <button onClick={handleDelete} style={{ fontSize: 11, color: "#f87171", fontFamily: "'Space Mono',monospace", border: "1px solid #f8717144", padding: "4px 12px", borderRadius: 8, background: "none", cursor: "pointer" }}>Remove</button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, padding: 16, borderRadius: 12, background: `${COLORS.accent}0D`, border: `1px solid ${COLORS.accent}22` }}>
          <p style={{ fontSize: 10, color: COLORS.accent, fontFamily: "'Space Mono',monospace", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Resume Tips</p>
          {["Keep your resume to 1–2 pages maximum", "Highlight projects, GitHub links, and measurable results", "Use consistent formatting and clear section headers", "Our AI will analyze your resume and suggest improvements"].map((tip, i) => (
            <p key={i} style={{ fontSize: 12, color: COLORS.grayMuted, margin: "0 0 6px" }}>
              <span style={{ color: COLORS.accent }}>▸ </span>{tip}
            </p>
          ))}
        </div>

        <button style={{ width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 12, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.midPurple})`, color: "#fff", fontFamily: "'Space Mono',monospace", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
          ✦ Analyze Resume with AI
        </button>
      </SectionCard>
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
  score += (filled / personalFields.length) * 40;
  if ((profile.education || []).filter(e => e.degree && e.institution).length > 0) score += 35;
  if (profile.resumeUrl) score += 25;
  return Math.round(score);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  // const { user: authUser } = useAuth();
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");
  const [photoUploading, setPhotoUploading] = useState(false);

  // Fetch full profile on mount
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
    { id: "personal", label: "Personal Details", icon: "👤" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "resume", label: "Resume", icon: "📄" },
  ];

  const profilePct = calcCompletion(profile);
  const pctColor = profilePct >= 80 ? COLORS.green : profilePct >= 50 ? COLORS.accent : "#f59e0b";

  // Photo source priority: uploaded photo > Google picture > initials
  const photoSrc = profile?.picture
    ? profile.picture.startsWith('http')
      ? profile.picture                               // Google OAuth URL
      : `http://localhost:4000${profile.picture}`     // local upload
    : null;

  const initials = `${profile?.firstName?.[0] || ""}${profile?.lastName?.[0] || ""}`.toUpperCase() || "?";

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
                  {photoUploading ? <Spinner /> : <><span style={{ fontSize: 18 }}>↑</span><span style={{ fontSize: 9, color: COLORS.accent, fontFamily: "'Space Mono',monospace" }}>Change</span></>}
                  <input type="file" style={{ display: "none" }} accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.firstName} {profile?.lastName}</div>
                <div style={{ fontSize: 11, color: COLORS.grayMuted, marginTop: 2 }}>{profile?.email}</div>
                <span style={{ display: "inline-block", marginTop: 8, background: `${COLORS.green}22`, color: COLORS.green, fontSize: 9, fontFamily: "'Space Mono',monospace", padding: "3px 10px", borderRadius: 99, border: `1px solid ${COLORS.green}44` }}>
                  ● Available for Interviews
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
                  {profilePct < 50 ? "Fill in your details to get started" : profilePct < 100 ? "Almost there — upload your resume!" : "Profile complete 🎉"}
                </p>
              </div>
            </div>

            {/* Nav Tabs */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.cardDark} 60%, ${COLORS.darkPurple} 100%)`, borderRadius: 18, padding: 10, border: `1px solid ${COLORS.midPurple}55` }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", marginBottom: 2, background: activeTab === tab.id ? `linear-gradient(90deg, ${COLORS.accent}18, transparent)` : "transparent", color: activeTab === tab.id ? COLORS.accent : COLORS.grayMuted, borderLeft: activeTab === tab.id ? `3px solid ${COLORS.accent}` : "3px solid transparent", transition: "all 0.15s" }}>
                  <span>{tab.icon}</span> {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Stats */}
            <div style={{ background: `linear-gradient(135deg, ${COLORS.cardDark} 60%, ${COLORS.darkPurple} 100%)`, borderRadius: 18, padding: 20, border: `1px solid ${COLORS.midPurple}55` }}>
              <p style={{ fontSize: 10, color: COLORS.grayMuted, fontFamily: "'Space Mono',monospace", letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Profile Completion</p>
              {[
                ["Personal Info", profile?.bio ? "✓" : "–", profile?.bio ? COLORS.green : COLORS.grayMuted],
                ["Education", (profile?.education?.length > 0) ? "✓" : "–", (profile?.education?.length > 0) ? COLORS.green : COLORS.grayMuted],
                ["Resume", profile?.resumeUrl ? "✓" : "–", profile?.resumeUrl ? COLORS.green : COLORS.grayMuted],
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
            {activeTab === "personal" && <PersonalSection initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "education" && <EducationSection initialData={profile} onSaved={refreshProfile} />}
            {activeTab === "resume" && <ResumeSection initialData={profile} onSaved={refreshProfile} />}
          </main>
        </div>
      </div>
    </>
  );
}