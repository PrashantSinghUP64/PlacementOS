import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "~/lib/api";
import { useAppAuthStore } from "~/lib/app-auth";
import Navbar from "~/components/Navbar";
export function meta() {
  return [
    { title: "Profile — PlacementOS" },
    { name: "description", content: "Manage your PlacementOS profile" },
  ];
}

export default function Profile() {
  const token = useAppAuthStore((s) => s.token);
  const storeUser = useAppAuthStore((s) => s.user);
  const setSession = useAppAuthStore((s) => s.setSession);
  const isAuthenticated = useAppAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [email, setEmail] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => { if (!isAuthenticated) navigate("/login"); }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!token) return;
    apiFetch("/profile", { token }).then(async (res) => {
      if (res.ok) {
        const data = await res.json() as { name: string; email: string; targetRole: string; skills: string[]; totalAnalyses: number };
        setName(data.name);
        setEmail(data.email);
        setTargetRole(data.targetRole || "");
        setSkills(data.skills || []);
        setTotalAnalyses(data.totalAnalyses || 0);
      }
    });
  }, [token]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    if (!name.trim()) { setProfileError("Name is required."); return; }
    setSaving(true);
    try {
      const res = await apiFetch("/profile", {
        method: "PUT",
        token,
        body: JSON.stringify({ name: name.trim(), targetRole: targetRole.trim(), skills }),
      });
      if (res.ok) {
        const updated = await res.json() as { id: string; name: string; email: string };
        if (storeUser) setSession(token!, { ...storeUser, name: updated.name });
        setProfileSuccess("Profile updated successfully!");
        setTimeout(() => setProfileSuccess(null), 3000);
      } else {
        const d = await res.json().catch(() => ({})) as { message?: string };
        setProfileError(d.message || "Update failed.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    if (!currentPw || !newPw) { setPwError("Both fields required."); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    setChangingPw(true);
    try {
      const res = await apiFetch("/profile/password", {
        method: "PUT",
        token,
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      if (res.ok) {
        setPwSuccess("Password changed!");
        setCurrentPw("");
        setNewPw("");
        setTimeout(() => setPwSuccess(null), 3000);
      } else {
        const d = await res.json().catch(() => ({})) as { message?: string };
        setPwError(d.message || "Failed to change password.");
      }
    } finally {
      setChangingPw(false);
    }
  }

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) {
      setSkills([...skills, s]);
      setSkillInput("");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
        </div>

        {/* Account stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 animate-fade-in-up">
          <div className="stat-card">
            <span className="text-2xl">📊</span>
            <p className="text-2xl font-black text-violet-600">{totalAnalyses}</p>
            <p className="text-sm text-gray-500">Total Analyses</p>
          </div>
          <div className="stat-card">
            <span className="text-2xl">✉️</span>
            <p className="text-sm font-bold text-gray-800 truncate">{email}</p>
            <p className="text-sm text-gray-500">Email Address</p>
          </div>
        </div>

        {/* Profile form */}
        <div className="card mb-6 animate-fade-in-up">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Personal Information</h2>
          {profileError && <div className="alert-error mb-4">{profileError}</div>}
          {profileSuccess && <div className="alert-success mb-4">{profileSuccess}</div>}
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Frontend Developer" />
            </div>

            {/* Skills */}
            <div className="form-group">
              <label className="form-label">Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="Add a skill and press Enter"
                  className="flex-1"
                />
                <button type="button" onClick={addSkill} className="btn-primary px-4 py-2 text-sm shrink-0">Add</button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {skills.map((s) => (
                    <span key={s} className="chip-purple flex items-center gap-1">
                      {s}
                      <button type="button" onClick={() => setSkills(skills.filter((x) => x !== s))} className="ml-1 hover:text-red-600">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card animate-fade-in-up delay-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Change Password</h2>
          {pwError && <div className="alert-error mb-4">{pwError}</div>}
          {pwSuccess && <div className="alert-success mb-4">{pwSuccess}</div>}
          <form onSubmit={changePassword} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} placeholder="••••••••" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Min. 6 characters" />
            </div>
            <button type="submit" className="btn-secondary" disabled={changingPw}>
              {changingPw ? "Changing…" : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
