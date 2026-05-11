import React, { useState, useEffect } from "react";
import {
  Users, Server, Video, FileBarChart, Plus, Trash2, X,
  ShieldAlert, ArrowRight, ArrowLeft, Check, Edit2, Layers, ChevronDown, ChevronUp
} from "lucide-react";
import SoftBackdrop from "../../components/SoftBackdrop";
import Header from "../../components/Header";

const API_URL = "http://localhost:4000/api/admin";

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [data, setData] = useState({ users: [], drives: [], interviews: [], results: [], domains: [] });
  const [loading, setLoading] = useState(false);

  const [showDriveModal, setShowDriveModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [editingDomain, setEditingDomain] = useState(null);

  const fetchToken = () => localStorage.getItem("token") || "";

  const fetchData = async (endpoint, key) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${fetchToken()}` },
      });
      const result = await res.json();
      if (result.success) setData((prev) => ({ ...prev, [key]: result.data }));
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "users") fetchData("users", "users");
    if (activeTab === "drives") fetchData("drives", "drives");
    if (activeTab === "interviews") fetchData("interviews", "interviews");
    if (activeTab === "results") fetchData("results", "results");
    if (activeTab === "domains") fetchData("domains", "domains");
  }, [activeTab]);

  const handleDeleteDrive = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drive?")) return;
    try {
      const res = await fetch(`${API_URL}/drives/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${fetchToken()}` },
      });
      if (res.ok) fetchData("drives", "drives");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleDeleteInterview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this interview assignment?")) return;
    try {
      const res = await fetch(`${API_URL}/interviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${fetchToken()}` },
      });
      if (res.ok) fetchData("interviews", "interviews");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleDeleteDomain = async (id) => {
    if (!window.confirm("Delete this category and all its domains?")) return;
    try {
      const res = await fetch(`${API_URL}/domains/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${fetchToken()}` },
      });
      if (res.ok) fetchData("domains", "domains");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const tabs = [
    { id: "users",      label: "Users",      icon: Users },
    { id: "drives",     label: "Drives",     icon: Server },
    { id: "interviews", label: "Interviews", icon: Video },
    { id: "results",    label: "Results",    icon: FileBarChart },
    { id: "domains",    label: "Domains",    icon: Layers },
  ];

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-indigo-500/30">
      <SoftBackdrop />

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 relative z-10">

        {/* ── Sidebar ── */}
        <aside className="md:col-span-3 space-y-2 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-3xl shadow-xl h-fit">
          <div className="p-4 mb-2">
            <h2 className="text-xs font-black tracking-widest text-indigo-400 uppercase flex items-center gap-2">
              <ShieldAlert size={16} /> Admin Portal
            </h2>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-sm ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <section className="md:col-span-9 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-xl min-h-[600px] flex flex-col">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab} Management</h1>

            <div className="flex gap-3">
              {activeTab === "drives" && (
                <button
                  onClick={() => setShowDriveModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
                >
                  <Plus size={16} /> Create Drive
                </button>
              )}
              {activeTab === "interviews" && (
                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
                >
                  <Plus size={16} /> Create Interview
                </button>
              )}
              {activeTab === "domains" && (
                <button
                  onClick={() => { setEditingDomain(null); setShowDomainModal(true); }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
                >
                  <Plus size={16} /> Add Category
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 rounded-xl border border-white/5">
            {loading ? (
              <div className="flex h-full items-center justify-center text-indigo-400 animate-pulse">Loading data...</div>
            ) : (
              <div className="w-full">
                {activeTab === "users"      && <UsersTable users={data.users} />}
                {activeTab === "drives"     && <DrivesTable drives={data.drives} onDelete={handleDeleteDrive} />}
                {activeTab === "interviews" && <InterviewsTable interviews={data.interviews} onEdit={setEditingInterview} onDelete={handleDeleteInterview} />}
                {activeTab === "results"    && <ResultsTable results={data.results} />}
                {activeTab === "domains"    && (
                  <DomainsPanel
                    domains={data.domains}
                    onDelete={handleDeleteDomain}
                    onEdit={(cat) => { setEditingDomain(cat); setShowDomainModal(true); }}
                    onRefresh={() => fetchData("domains", "domains")}
                    token={fetchToken()}
                  />
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Modals ── */}
      {showDriveModal && (
        <DriveModal
          onClose={() => setShowDriveModal(false)}
          onSuccess={() => { setShowDriveModal(false); fetchData("drives", "drives"); }}
          token={fetchToken()}
        />
      )}

      {showInterviewModal && (
        <InterviewModal
          onClose={() => setShowInterviewModal(false)}
          onSuccess={() => { setShowInterviewModal(false); fetchData("interviews", "interviews"); }}
          token={fetchToken()}
        />
      )}

      {editingInterview && (
        <EditInterviewModal
          interview={editingInterview}
          onClose={() => setEditingInterview(null)}
          onSuccess={() => { setEditingInterview(null); fetchData("interviews", "interviews"); }}
          token={fetchToken()}
        />
      )}

      {showDomainModal && (
        <DomainModal
          editing={editingDomain}
          onClose={() => { setShowDomainModal(false); setEditingDomain(null); }}
          onSuccess={() => { setShowDomainModal(false); setEditingDomain(null); fetchData("domains", "domains"); }}
          token={fetchToken()}
        />
      )}
    </div>
  );
};

// ─── Users Table ──────────────────────────────────────────────────────────────
const UsersTable = ({ users }) => (
  <table className="w-full text-sm text-left">
    <thead className="text-xs text-indigo-300 uppercase bg-black/40">
      <tr>
        <th className="px-6 py-4">Name</th>
        <th className="px-6 py-4">Email</th>
        <th className="px-6 py-4 text-center">Verified</th>
        <th className="px-6 py-4 text-center">2FA</th>
        <th className="px-6 py-4">Joined</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      {users.map((u) => (
        <tr key={u._id} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 font-semibold">{u.firstName} {u.lastName}</td>
          <td className="px-6 py-4 text-slate-300">{u.email}</td>
          <td className="px-6 py-4 text-center">{u.isVerified ? "✅" : "❌"}</td>
          <td className="px-6 py-4 text-center">{u.twoFactorEnabled ? "🔐" : "🔓"}</td>
          <td className="px-6 py-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ─── Drives Table ─────────────────────────────────────────────────────────────
const DrivesTable = ({ drives, onDelete }) => (
  <table className="w-full text-sm text-left">
    <thead className="text-xs text-indigo-300 uppercase bg-black/40">
      <tr>
        <th className="px-6 py-4">Drive ID</th>
        <th className="px-6 py-4">Position Name</th>
        <th className="px-6 py-4">Date</th>
        <th className="px-6 py-4">Type</th>
        <th className="px-6 py-4 text-center">Duration</th>
        <th className="px-6 py-4 text-center">Questions</th>
        <th className="px-6 py-4 text-center">Total Marks</th>
        <th className="px-6 py-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      {drives.map((d) => (
        <tr key={d._id} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 font-mono font-bold text-indigo-400">{d.driveId}</td>
          <td className="px-6 py-4 font-semibold">{d.hiringPositionName}</td>
          <td className="px-6 py-4 text-slate-300">{new Date(d.driveDate).toLocaleDateString()}</td>
          <td className="px-6 py-4 uppercase text-xs font-bold text-slate-400">{d.driveType}</td>
          <td className="px-6 py-4 text-center">{d.timeDurationInMin}m</td>
          <td className="px-6 py-4 text-center">
            {d.driveType === "Assessment" ? `${d.mcqCount || 0} MCQ, ${d.codeCount || 0} Code` : "N/A"}
          </td>
          <td className="px-6 py-4 text-center">
            {d.driveType === "Assessment" ? d.totalMarks : "N/A"}
          </td>
          <td className="px-6 py-4 text-right">
            <button onClick={() => onDelete(d._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors">
              <Trash2 size={16} />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ─── Interviews Table ─────────────────────────────────────────────────────────
const InterviewsTable = ({ interviews, onEdit, onDelete }) => (
  <table className="w-full text-sm text-left">
    <thead className="text-xs text-indigo-300 uppercase bg-black/40">
      <tr>
        <th className="px-6 py-4">Drive ID</th>
        <th className="px-6 py-4">Position Name</th>
        <th className="px-6 py-4">Drive Date</th>
        <th className="px-6 py-4 w-1/2">Enrolled Users</th>
        <th className="px-6 py-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      {interviews.map((i) => (
        <tr key={i._id} className="hover:bg-white/5 transition-colors">
          <td className="px-6 py-4 font-mono font-bold text-indigo-400">{i.driveId?.driveId || "N/A"}</td>
          <td className="px-6 py-4 font-semibold">{i.driveId?.hiringPositionName || "N/A"}</td>
          <td className="px-6 py-4 text-slate-300">
            {i.driveId ? new Date(i.driveId.driveDate).toLocaleDateString() : "N/A"}
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {i.userIds.map((u) => (
                <span key={u._id} className="px-2 py-1 bg-white/10 rounded-md text-xs border border-white/5">
                  {u.firstName} {u.lastName}
                </span>
              ))}
            </div>
          </td>
          <td className="px-6 py-4 text-right">
            <div className="flex justify-end gap-2">
              <button onClick={() => onEdit(i)} className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Edit Users">
                <Edit2 size={16} />
              </button>
              <button onClick={() => onDelete(i._id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Delete Interview">
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// ─── Results Table ────────────────────────────────────────────────────────────
const ResultsTable = ({ results }) => (
  <table className="w-full text-sm text-left">
    <thead className="text-xs text-indigo-300 uppercase bg-black/40">
      <tr>
        <th className="px-6 py-4">Candidate</th>
        <th className="px-6 py-4">Drive ID</th>
        <th className="px-6 py-4">Position Name</th>
        <th className="px-6 py-4 text-center">Score</th>
        <th className="px-6 py-4 text-center">Status</th>
        <th className="px-6 py-4 text-center">Result</th>
        <th className="px-6 py-4 text-center">Time Taken</th>
        <th className="px-6 py-4 text-center">Violations</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/10">
      {results.map((r) => {
        const totalViolations = Object.values(r.violations || {}).reduce((a, b) => a + b, 0);
        return (
          <tr key={r._id} className="hover:bg-white/5 transition-colors">
            <td className="px-6 py-4 font-semibold">{r.userId?.firstName} {r.userId?.lastName}</td>
            <td className="px-6 py-4 font-mono font-bold text-indigo-400">{r.driveId?.driveId}</td>
            <td className="px-6 py-4 text-slate-300">{r.driveId?.hiringPositionName}</td>
            <td className="px-6 py-4 text-center font-mono">{r.score} / {r.driveId?.totalMarks || 0}</td>
            <td className="px-6 py-4 text-center">
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                r.status === "Completed" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}>
                {r.status}
              </span>
            </td>
            <td className="px-6 py-4 text-center">
              <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                r.isPass ? "bg-indigo-500/20 text-indigo-400" : "bg-gray-500/20 text-gray-400"
              }`}>
                {r.isPass ? "Passed" : "Failed"}
              </span>
            </td>
            <td className="px-6 py-4 text-center">{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</td>
            <td className="px-6 py-4 text-center text-red-400 font-bold">{totalViolations}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// ─── Domains Panel ────────────────────────────────────────────────────────────
const DomainsPanel = ({ domains, onDelete, onEdit, onRefresh, token }) => {
  const [expanded, setExpanded] = useState({});
  const [addingTo, setAddingTo] = useState(null);   // category _id currently adding a domain to
  const [newDomain, setNewDomain] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAddDomain = async (categoryId) => {
    if (!newDomain.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/domains/${categoryId}/domain`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain: newDomain.trim() }),
      });
      if (res.ok) {
        setNewDomain("");
        setAddingTo(null);
        onRefresh();
      } else {
        const d = await res.json();
        alert(d.message || "Failed to add domain");
      }
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleRemoveDomain = async (categoryId, domain) => {
    if (!window.confirm(`Remove "${domain}" from this category?`)) return;
    try {
      const res = await fetch(`${API_URL}/domains/${categoryId}/domain`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain }),
      });
      if (res.ok) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Layers size={40} className="mb-4 opacity-30" />
        <p className="text-sm">No categories yet. Click <span className="text-indigo-400 font-bold">Add Category</span> to get started.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {domains.map((cat) => (
        <div key={cat._id} className="p-4">
          {/* Category header row */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => toggle(cat._id)}
              className="flex items-center gap-3 flex-1 text-left group"
            >
              <span className={`transition-transform duration-200 text-indigo-400 ${expanded[cat._id] ? "rotate-0" : "-rotate-90"}`}>
                {expanded[cat._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
              <span className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                {cat.category}
              </span>
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">
                {cat.domains?.length || 0} topics
              </span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setAddingTo(addingTo === cat._id ? null : cat._id); setNewDomain(""); }}
                className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                title="Add domain"
              >
                <Plus size={15} />
              </button>
              <button
                onClick={() => onEdit(cat)}
                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                title="Edit category name"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => onDelete(cat._id)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                title="Delete category"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* Inline add-domain input */}
          {addingTo === cat._id && (
            <div className="mt-3 ml-7 flex gap-2">
              <input
                autoFocus
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDomain(cat._id)}
                placeholder="New domain name…"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500 placeholder-slate-600"
              />
              <button
                onClick={() => handleAddDomain(cat._id)}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white text-sm font-bold rounded-xl transition-all"
              >
                {saving ? "…" : "Add"}
              </button>
              <button
                onClick={() => { setAddingTo(null); setNewDomain(""); }}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Domain chips */}
          {expanded[cat._id] && (
            <div className="mt-3 ml-7 flex flex-wrap gap-2">
              {(cat.domains || []).length === 0 ? (
                <span className="text-xs text-slate-600 italic">No domains yet.</span>
              ) : (
                cat.domains.map((d) => (
                  <span
                    key={d}
                    className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-300 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                  >
                    {d}
                    <button
                      onClick={() => handleRemoveDomain(cat._id, d)}
                      className="text-slate-600 group-hover:text-red-400 transition-colors"
                      title={`Remove "${d}"`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Drive Modal ──────────────────────────────────────────────────────────────
const DriveModal = ({ onClose, onSuccess, token }) => {
  const [formData, setFormData] = useState({
    hiringPositionName: "",
    driveDate: "",
    driveType: "Assessment",
    difficulty: "Intermediate",
    timeDurationInMin: "",
    mcqCount: "",
    codeCount: "",
    mcqMarks: "",
    codeMarks: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        timeDurationInMin: Number(formData.timeDurationInMin),
        mcqCount: Number(formData.mcqCount) || 0,
        codeCount: Number(formData.codeCount) || 0,
        mcqMarks: Number(formData.mcqMarks) || 0,
        codeMarks: Number(formData.codeMarks) || 0,
      };
      const res = await fetch(`${API_URL}/drives`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) onSuccess();
      else alert(`Failed to create drive: ${data.message}`);
    } catch (error) {
      console.error("Network/Fetch Error:", error);
      alert("A network or server error occurred. Check console.");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0f1117] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Create New Drive</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Position Name</label>
            <input required type="text" name="hiringPositionName" onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date</label>
              <input required type="datetime-local" name="driveDate" onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
              <select name="driveType" onChange={handleChange} value={formData.driveType}
                className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500">
                <option value="Assessment">Assessment</option>
                <option value="Interview">Interview</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Difficulty</label>
              <select name="difficulty" value={formData.difficulty} onChange={handleChange}
                className="w-full bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Duration (Min)</label>
              <input required type="number" name="timeDurationInMin" onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
            </div>
            {formData.driveType === "Assessment" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Number of MCQs</label>
                  <input required type="number" name="mcqCount" onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Number of Code Qs</label>
                  <input required type="number" name="codeCount" onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Marks per MCQ</label>
                  <input required type="number" name="mcqMarks" onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Marks per Code Q</label>
                  <input required type="number" name="codeMarks" onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500" />
                </div>
              </>
            )}
          </div>
          <div className="mt-8">
            <button type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all">
              Save Drive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Domain Category Modal (create + edit) ────────────────────────────────────
const DomainModal = ({ editing, onClose, onSuccess, token }) => {
  const [category, setCategory] = useState(editing?.category || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category.trim()) return;
    setSaving(true);
    try {
      const url    = editing ? `${API_URL}/domains/${editing._id}` : `${API_URL}/domains`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category: category.trim() }),
      });
      const data = await res.json();
      if (res.ok) onSuccess();
      else alert(data.message || "Operation failed");
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0f1117] border border-white/10 rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {editing ? "Rename Category" : "New Category"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category Name</label>
            <input
              autoFocus
              required
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Core CS, Web Development…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 placeholder-slate-600"
            />
          </div>
          {!editing && (
            <p className="text-xs text-slate-500">
              You can add individual domains to this category after creating it.
            </p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-bold rounded-xl shadow-lg transition-all mt-2"
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Interview Modal ──────────────────────────────────────────────────────────
const InterviewModal = ({ onClose, onSuccess, token }) => {
  const [step, setStep] = useState(1);
  const [drives, setDrives] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrive, setSelectedDrive] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const [dRes, uRes] = await Promise.all([
          fetch(`${API_URL}/drives`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
          fetch(`${API_URL}/users`,  { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        ]);
        if (dRes.success) setDrives(dRes.data);
        if (uRes.success) setUsers(uRes.data);
      } catch (err) {
        console.error("Failed to load modal data", err);
      }
      setLoading(false);
    };
    fetchSetupData();
  }, [token]);

  const toggleUser = (id) =>
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]);

  const handleSelectAllUsers = () =>
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u._id));

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/interviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driveId: selectedDrive, userIds: selectedUsers }),
      });
      if (res.ok) onSuccess();
      else alert("Failed to create interview assignment");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0f1117] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">
            {step === 1 ? "Step 1: Select Drive" : "Step 2: Assign Candidates"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center text-indigo-400 animate-pulse py-10">Loading Data...</div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-6 pr-2">
            {step === 1 && (
              <div className="space-y-3">
                {drives.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No drives available. Create a drive first.</p>
                ) : drives.map((d) => (
                  <div
                    key={d._id}
                    onClick={() => setSelectedDrive(d._id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      selectedDrive === d._id
                        ? "border-indigo-500 bg-indigo-500/20 shadow-lg"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-white text-lg">
                        <span className="text-indigo-400 mr-2 font-mono">[{d.driveId}]</span>
                        {d.hiringPositionName}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex gap-3">
                        <span>📅 {new Date(d.driveDate).toLocaleDateString()}</span>
                        <span>⏱ {d.timeDurationInMin}m</span>
                        <span className="uppercase text-indigo-300">{d.driveType}</span>
                      </div>
                    </div>
                    {selectedDrive === d._id && <Check className="text-indigo-400" size={24} />}
                  </div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-sm text-slate-300 font-bold">{selectedUsers.length} Users Selected</span>
                  <button onClick={handleSelectAllUsers} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase">
                    {selectedUsers.length === users.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                {users.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">No users available.</p>
                ) : users.map((u) => (
                  <label
                    key={u._id}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedUsers.includes(u._id)
                        ? "border-indigo-500/50 bg-indigo-500/10"
                        : "border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={() => toggleUser(u._id)}
                      className="w-5 h-5 accent-indigo-600 bg-black/50 border-white/20 rounded cursor-pointer" />
                    <div>
                      <div className="font-bold text-white">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">ID: {u._id} | {u.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex justify-between mt-auto">
          {step === 2 ? (
            <button onClick={() => setStep(1)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl flex items-center gap-2 font-bold transition-all">
              <ArrowLeft size={16} /> Back
            </button>
          ) : <div />}

          {step === 1 ? (
            <button onClick={() => setStep(2)} disabled={!selectedDrive}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white rounded-xl flex items-center gap-2 font-bold transition-all">
              Next <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={selectedUsers.length === 0}
              className="px-8 py-2.5 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-green-500/20">
              Assign Users <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Edit Interview Modal ─────────────────────────────────────────────────────
const EditInterviewModal = ({ interview, onClose, onSuccess, token }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState(interview.userIds.map((u) => u._id));

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const uRes = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json());
        if (uRes.success) setUsers(uRes.data);
      } catch (err) {
        console.error("Failed to load users", err);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [token]);

  const toggleUser = (id) =>
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]);

  const handleSelectAllUsers = () =>
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u._id));

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_URL}/interviews/${interview._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userIds: selectedUsers }),
      });
      if (res.ok) onSuccess();
      else alert("Failed to update interview assignment");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0f1117] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Edit Enrolled Users</h3>
            <p className="text-sm text-indigo-400 mt-1">
              <span className="font-mono">[{interview.driveId?.driveId}]</span> {interview.driveId?.hiringPositionName}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center text-indigo-400 animate-pulse py-10">Loading Data...</div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-6 pr-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm text-slate-300 font-bold">{selectedUsers.length} Users Enrolled</span>
                <button onClick={handleSelectAllUsers} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase">
                  {selectedUsers.length === users.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              {users.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No users available.</p>
              ) : users.map((u) => (
                <label
                  key={u._id}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedUsers.includes(u._id)
                      ? "border-indigo-500/50 bg-indigo-500/10"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <input type="checkbox" checked={selectedUsers.includes(u._id)} onChange={() => toggleUser(u._id)}
                    className="w-5 h-5 accent-indigo-600 bg-black/50 border-white/20 rounded cursor-pointer" />
                  <div>
                    <div className="font-bold text-white">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">ID: {u._id} | {u.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-white/10 flex justify-end mt-auto">
          <button onClick={handleSubmit}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-500/20">
            Save Changes <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;