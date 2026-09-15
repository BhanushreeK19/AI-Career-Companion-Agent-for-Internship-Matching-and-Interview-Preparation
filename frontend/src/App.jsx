import { useEffect, useMemo, useState } from "react";
import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { api, clearSession, getToken, setToken } from "./api";
import { CoverLetterPage, CareerProfilePage, ParsedResumesPage } from "./CareerFeatures";
import { ThemeToggle } from "./theme";
import { AIAssistantWidget } from "./ChatAssistant";
import InterviewPreparationPage from "./InterviewPrep";

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("ai_user") || "null");
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem("ai_user", JSON.stringify(user));
}

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function Shell({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: "⌂" },
    { to: "/resume", label: "Resume Parsing", icon: "▣" },
    { to: "/parsed-resumes", label: "Parsed Resumes", icon: "☰" },
    { to: "/internships", label: "Internships", icon: "◈" },
    { to: "/matches", label: "My Matches", icon: "✦" },
    { to: "/applied-internships", label: "Applied Internships", icon: "✓" },
    { to: "/cover-letter", label: "Cover Letter", icon: "✎" },
    { to: "/interview-prep", label: "Interview Prep Agent", icon: "🎯" },
    { to: "/profile", label: "Profile", icon: "◉" }
  ];

  const initials = (user?.full_name || "User")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join("");

  async function logout() {
    try {
      await api.logout();
    } catch {
      // The local session is still cleared even if the server is unavailable.
    }
    clearSession();
    onLogout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">AI</div>
          <div>
            <strong>Career Companion</strong>
            <span>Smart career matching</span>
          </div>
        </div>

        <nav className="side-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span>✦</span>
            <div>
              <strong>AI-powered matching</strong>
              <p>Upload your resume to discover internships that fit your profile.</p>
            </div>
          </div>
          <button className="nav-item logout-button" onClick={logout}>
            <span className="nav-icon">↪</span>
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="crumb">
            <span>AI Career Companion</span>
            <b>/</b>
            <span>{location.pathname === "/dashboard" ? "Dashboard" : location.pathname.slice(1) || "Dashboard"}</span>
          </div>
          <div className="topbar-right">
            <ThemeToggle />
            <button className="profile-chip" onClick={() => navigate("/profile")}>
              <span className="avatar">{initials}</span>
              <span className="profile-chip-text">
                <strong>{user?.full_name || "User"}</strong>
                <small>{user?.email || ""}</small>
              </span>
            </button>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>

      <AIAssistantWidget />
    </div>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-glow glow-one" />
        <div className="auth-glow glow-two" />
        <div className="auth-brand"><span className="brand-mark">AI</span> Career Companion</div>
        <div className="auth-copy">
          <div className="eyebrow">INTELLIGENT CAREER MATCHING</div>
          <h1>Find internships that match <em>you.</em></h1>
          <p>Turn your resume into personalized internship recommendations using semantic search, vector retrieval and AI.</p>
          <div className="flow">
            <span>Resume Parsing</span><i>→</i><span>Internship Matching</span><i>→</i><span>Interview Preparation</span>
          </div>
        </div>
        <div className="auth-foot">Built with FastAPI · PostgreSQL · FAISS · Hugging Face · Groq</div>
      </div>
      <div className="auth-panel">{children}</div>
    </div>
  );
}

function FormMessage({ error, success }) {
  if (!error && !success) return null;
  return <div className={`form-message ${error ? "error" : "success"}`}>{error || success}</div>;
}

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.login(email, password);
      setToken(result.access_token);
      const user = await api.getProfile();
      saveUser(user);
      onLogin(user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="mobile-auth-logo"><span className="brand-mark">AI</span></div>
        <div className="eyebrow">WELCOME BACK</div>
        <h2>Sign in to your account</h2>
        <p className="auth-subtitle">Continue your internship search.</p>
        <form onSubmit={submit} className="form-stack">
          <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
          <div className="form-row-end">
            <NavLink to="/forgot-password">Forgot password?</NavLink>
          </div>
          <FormMessage error={error} />
          <button className="primary-button full" disabled={loading}>{loading ? "Signing in..." : "Sign in →"}</button>
        </form>
        <p className="auth-switch">Don't have an account? <NavLink to="/register">Create one</NavLink></p>
      </div>
    </AuthLayout>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone_number: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.register(form);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="mobile-auth-logo"><span className="brand-mark">AI</span></div>
        <div className="eyebrow">GET STARTED</div>
        <h2>Create your account</h2>
        <p className="auth-subtitle">Your personalized internship journey starts here.</p>
        <form onSubmit={submit} className="form-stack">
          <Field label="Full name" value={form.full_name} onChange={(v) => update("full_name", v)} placeholder="Bhanushree K" required />
          <Field label="Email address" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="you@example.com" required />
          <Field label="Phone number" value={form.phone_number} onChange={(v) => update("phone_number", v)} placeholder="+91 98765 43210" />
          <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} placeholder="At least 8 characters, with a letter and number" required />
          <FormMessage error={error} />
          <button className="primary-button full" disabled={loading}>{loading ? "Creating account..." : "Create account →"}</button>
        </form>
        <p className="auth-switch">Already have an account? <NavLink to="/login">Sign in</NavLink></p>
      </div>
    </AuthLayout>
  );
}

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      setResult(await api.forgotPassword(email));
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="eyebrow">ACCOUNT RECOVERY</div>
        <h2>Reset your password</h2>
        <p className="auth-subtitle">Enter your registered email to request a reset token.</p>
        <form onSubmit={submit} className="form-stack">
          <Field label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
          <FormMessage error={error} success={result?.message} />
          {result?.reset_token && (
            <div className="token-box">
              <small>Development reset token</small>
              <code>{result.reset_token}</code>
              <NavLink to={`/reset-password?token=${encodeURIComponent(result.reset_token)}`}>Continue to reset password →</NavLink>
            </div>
          )}
          <button className="primary-button full" disabled={loading}>{loading ? "Requesting..." : "Request reset token"}</button>
        </form>
        <p className="auth-switch"><NavLink to="/login">← Back to sign in</NavLink></p>
      </div>
    </AuthLayout>
  );
}

function ResetPassword() {
  const params = new URLSearchParams(window.location.search);
  const [token, setTokenValue] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const r = await api.resetPassword(token, password);
      setMessage(r.message);
    } catch (err) { setError(err.message); }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="eyebrow">ACCOUNT RECOVERY</div>
        <h2>Choose a new password</h2>
        <p className="auth-subtitle">Use the reset token issued by the development API.</p>
        <form onSubmit={submit} className="form-stack">
          <Field label="Reset token" value={token} onChange={setTokenValue} placeholder="Paste reset token" required />
          <Field label="New password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" required />
          <FormMessage error={error} success={message} />
          <button className="primary-button full">Reset password</button>
        </form>
        <p className="auth-switch"><NavLink to="/login">← Back to sign in</NavLink></p>
      </div>
    </AuthLayout>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} />
    </label>
  );
}

function Dashboard({ user, resume, setResume }) {
  const navigate = useNavigate();
  const [catalogCount, setCatalogCount] = useState(null);

  useEffect(() => {
    api.getInternships().then((x) => setCatalogCount(Array.isArray(x) ? x.length : null)).catch(() => {});
  }, []);

  return (
    <div>
      <section className="hero-card">
        <div>
          <span className="eyebrow">YOUR CAREER COPILOT</span>
          <h1>Good to see you, {user?.full_name?.split(" ")[0] || "there"}.</h1>
          <p>Upload your resume and let semantic AI find the internships where your skills have the strongest fit.</p>
          <button className="primary-button" onClick={() => navigate("/resume")}>
            {resume ? "Analyze another resume" : "Upload your resume"} <span>→</span>
          </button>
        </div>
        <div className="hero-orb">
          <div className="orb-ring ring-one" />
          <div className="orb-ring ring-two" />
          <div className="orb-core">✦</div>
        </div>
      </section>

      <div className="stats-grid">
        <Stat label="Internships indexed" value={catalogCount ?? "—"} icon="◈" />
        <Stat label="Matching engine" value="FAISS" icon="⌁" />
        <Stat label="Embedding model" value="MiniLM" icon="◎" />
        <Stat label="AI analysis" value="Groq" icon="✦" />
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div><span className="eyebrow">WORKFLOW</span><h2>From resume to opportunity</h2></div>
        </div>
        <div className="workflow-grid">
          <WorkflowStep n="01" title="Upload" text="Add your PDF or DOCX resume." />
          <WorkflowStep n="02" title="Parse" text="Regex + Groq extract structured profile data." />
          <WorkflowStep n="03" title="Retrieve" text="FAISS searches your profile against the internship vector database." />
          <WorkflowStep n="04" title="Match" text="Results are re-ranked using skills, semantics, education and location." />
        </div>
      </section>

      {resume && (
        <section className="resume-mini-card">
          <div className="resume-icon">▣</div>
          <div>
            <span className="eyebrow">LATEST RESUME</span>
            <h3>{resume.filename}</h3>
            <p>{resume.data?.professional_summary || "Resume parsed successfully."}</p>
          </div>
          <button className="secondary-button" onClick={() => navigate("/matches")}>View matches →</button>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, icon }) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><div><strong>{value}</strong><span>{label}</span></div></div>;
}
function WorkflowStep({ n, title, text }) {
  return <div className="workflow-step"><span>{n}</span><h3>{title}</h3><p>{text}</p></div>;
}

function ResumePage({ resume, setResume }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!file) return;
    setLoading(true); setError("");
    try {
      const result = await api.uploadResume(file);
      setResume(result);
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  function pickFile(f) {
    if (!f) return;
    const valid = /\.(pdf|docx)$/i.test(f.name);
    if (!valid) {
      setError("Please choose a PDF or DOCX file.");
      return;
    }
    setError("");
    setFile(f);
  }

  const data = resume?.data;

  return (
    <div>
      <PageHeader eyebrow="RESUME INTELLIGENCE" title="Your resume, understood." text="Upload a PDF or DOCX and the AI parser will turn it into structured career data for internship matching." />
      <div className="resume-layout">
        <div>
          <div
            className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
          >
            <input id="resume-input" type="file" accept=".pdf,.docx" onChange={(e) => pickFile(e.target.files?.[0])} />
            <label htmlFor="resume-input">
              <div className="upload-circle">↑</div>
              <h3>{file ? file.name : "Drop your resume here"}</h3>
              <p>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to parse` : "or click to browse · PDF or DOCX · max 10 MB"}</p>
            </label>
          </div>
          {error && <FormMessage error={error} />}
          <button className="primary-button full-width-button" disabled={!file || loading} onClick={submit}>
            {loading ? "Parsing with AI..." : "Parse resume & continue →"}
          </button>
          {loading && <div className="loading-bar"><span /></div>}
        </div>

        <div className="info-card">
          <span className="eyebrow">WHAT WE EXTRACT</span>
          <div className="tag-cloud">
            {["Contact", "Professional summary", "Technical skills", "Education", "Experience", "Projects", "Certifications", "Internships", "Languages", "Achievements"].map((x) => <span key={x}>{x}</span>)}
          </div>
          <div className="info-note"><span>✦</span><p>Your parsed data is stored with your account and becomes the input to the RAG matching pipeline.</p></div>
        </div>
      </div>

      {data && <ParsedResume data={data} />}
    </div>
  );
}

function ParsedResume({ data }) {
  const skills = Array.isArray(data?.skills)
    ? data.skills
    : data?.skills?.technical_skills || data?.technical_skills || [];

  const soft = Array.isArray(data?.soft_skills)
    ? data.soft_skills
    : data?.skills?.soft_skills || [];
    return (
    <section className="parsed-section">
      <div className="section-heading"><div><span className="eyebrow">AI EXTRACTION</span><h2>Parsed profile</h2></div><span className="success-pill">✓ Successfully parsed</span></div>
      <div className="profile-summary-card">
        <div className="large-avatar">{(data?.name || "U").slice(0, 1).toUpperCase()}</div>
        <div><h2>{data?.name || "Candidate"}</h2><p>{data?.current_job_title || data?.professional_summary || "Candidate profile"}</p><div className="inline-tags">{skills.slice(0, 8).map((s) => <span key={s}>{s}</span>)}</div></div>
      </div>
      <div className="parsed-grid">
        <InfoPanel title="Professional summary"><p>{data?.professional_summary || "Not available."}</p></InfoPanel>
        <InfoPanel title="Technical skills"><div className="tag-cloud">{skills.length ? skills.map((s) => <span key={s}>{s}</span>) : <em>Not available</em>}</div></InfoPanel>
        <InfoPanel title="Education">{(data?.education || []).map((e, i) => <div className="timeline-item" key={i}><strong>{e.degree || "Degree"}</strong><span>{e.institution || "Institution not specified"}</span><small>{e.field_of_study || ""} {e.start_date || ""} {e.end_date ? `— ${e.end_date}` : ""}</small></div>)}</InfoPanel>
        <InfoPanel title="Projects">{(data?.projects || []).map((p, i) => <div className="timeline-item" key={i}><strong>{p.name || "Project"}</strong><span>{p.description || ""}</span><small>{(p.technologies_used || []).join(" · ")}</small></div>)}</InfoPanel>
        <InfoPanel title="Experience">{(data?.work_experience || []).map((w, i) => <div className="timeline-item" key={i}><strong>{w.job_title || "Role"} · {w.company || ""}</strong><span>{(w.responsibilities || []).join(" ")}</span><small>{w.start_date || ""} {w.end_date ? `— ${w.end_date}` : ""}</small></div>)}</InfoPanel>
        <InfoPanel title="Certifications">{(data?.certifications || []).map((c, i) => <div className="timeline-item" key={i}><strong>{c.name || "Certification"}</strong><span>{c.issuing_organization || ""}</span></div>)}</InfoPanel>
      </div>
    </section>
  );
}

function InfoPanel({ title, children }) {
  return <div className="info-panel"><h3>{title}</h3>{children}</div>;
}

function InternshipsPage() {
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());

  useEffect(() => {
    api.getInternships().then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
    api.getAppliedInternships().then((rows) => setAppliedIds(new Set(rows.map((r) => r.internship_id)))).catch(() => {});
  }, []);

  function handleApplied(internshipId) {
    setAppliedIds((prev) => new Set(prev).add(internshipId));
  }

  const domains = useMemo(() => ["All", ...new Set(items.map((x) => x.domain).filter(Boolean))], [items]);
  const filtered = items.filter((x) => {
    const q = query.toLowerCase();
    const text = `${x.role_title} ${x.company} ${x.description} ${(x.required_skills || []).join(" ")}`.toLowerCase();
    return (!q || text.includes(q)) && (domain === "All" || x.domain === domain);
  });

  return (
    <div>
      <PageHeader eyebrow="INTERNSHIP CATALOG" title="Explore opportunities." text="Browse the internship dataset that powers the RAG matching engine." />
      <div className="toolbar">
        <input className="search-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search role, company or skill..." />
        <select value={domain} onChange={(e) => setDomain(e.target.value)}>{domains.map((d) => <option key={d}>{d}</option>)}</select>
        <span className="result-count">{filtered.length} opportunities</span>
      </div>
      {loading ? <LoadingState text="Loading internship catalog..." /> : error ? <FormMessage error={error} /> : (
        <div className="internship-grid">
          {filtered.map((job) => (
            <InternshipCard key={job.id} job={job} applied={appliedIds.has(job.id)} onApplied={handleApplied} />
          ))}
        </div>
      )}
    </div>
  );
}

function InternshipCard({ job, match, applied, onApplied }) {
  const [applying, setApplying] = useState(false);
  const [localApplied, setLocalApplied] = useState(!!applied);
  const [applyError, setApplyError] = useState("");

  useEffect(() => setLocalApplied(!!applied), [applied]);

  async function handleApply() {
    if (localApplied || applying) return;
    setApplying(true);
    setApplyError("");
    try {
      await api.applyToInternship(job.id);
      setLocalApplied(true);
      onApplied && onApplied(job.id);
    } catch (err) {
      setApplyError(err.message || "Could not apply. Please try again.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <article className="internship-card">
      <div className="card-topline"><span className="domain-pill">{job.domain}</span><span>{job.mode}</span></div>
      <h3>{job.role_title}</h3>
      <p className="company">{job.company}</p>
      <p className="job-description">{job.description}</p>
      <div className="skill-row">{(job.required_skills || []).slice(0, 5).map((s) => <span key={s}>{s}</span>)}</div>
      <div className="job-meta"><span>⌖ {job.location}</span><span>◷ {job.duration_weeks} weeks</span></div>
      {match && (
        <div className="match-box">
          <div className="match-score"><strong>{match.match_percentage}%</strong><span>{match.match_label}</span></div>
          <div className="match-skills"><div><small>MATCHED</small><p>{match.matched_skills?.length ? match.matched_skills.join(" · ") : "—"}</p></div><div><small>SKILL GAPS</small><p>{match.missing_skills?.length ? match.missing_skills.join(" · ") : "None"}</p></div></div>
        </div>
      )}
      {applyError && <FormMessage error={applyError} />}
      <div className="card-actions">
        <button className="secondary-button" onClick={() => window.location.href=`/cover-letter?internship=${job.id}`}>Generate Cover Letter</button>
        <button
          className="primary-button"
          onClick={handleApply}
          disabled={localApplied || applying}
        >
          {localApplied ? "Applied ✓" : applying ? "Applying..." : "Apply Now"}
        </button>
      </div>
    </article>
  );
}

function AppliedInternshipsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getAppliedInternships().then(setRows).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader eyebrow="MY APPLICATIONS" title="Applied internships." text="Every internship you've applied to from inside the app, tracked in one place." />
      {loading ? <LoadingState text="Loading your applications..." /> : error ? <FormMessage error={error} /> : rows.length === 0 ? (
        <EmptyState title="No applications yet" text="Apply to an internship from the Internships or My Matches page and it will show up here." />
      ) : (
        <div className="applied-list">
          {rows.map((r) => (
            <div className="applied-row" key={r.id}>
              <div className="resume-icon">✓</div>
              <div className="applied-row-main">
                <h3>{r.role_title}</h3>
                <p>{r.company}</p>
              </div>
              <span className="applied-date">Applied {new Date(r.applied_at).toLocaleDateString()}</span>
              <span className="applied-status-pill">{r.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MatchesPage({ resume }) {
  const [matches, setMatches] = useState([]);
  const [summary, setSummary] = useState("");
  const [k, setK] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedIds, setAppliedIds] = useState(new Set());
  const navigate = useNavigate();

  async function loadMatches() {
    if (!resume?.resume_id) return;
    setLoading(true); setError("");
    try {
      const result = await api.matchInternships(resume.resume_id, k);
      setMatches(result.results || []);
      setSummary(result.summary || "");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  function handleApplied(internshipId) {
    setAppliedIds((prev) => new Set(prev).add(internshipId));
  }

  useEffect(() => {
    api.getAppliedInternships().then((rows) => setAppliedIds(new Set(rows.map((r) => r.internship_id)))).catch(() => {});
  }, []);

  if (!resume?.resume_id) {
    return (
      <EmptyState title="Upload a resume first" text="Your RAG matches are generated from the parsed resume stored in your account." action="Upload resume" onClick={() => navigate("/resume")} />
    );
  }

  return (
    <div>
      <PageHeader eyebrow="RAG MATCHING" title="Internships matched to you." text="FAISS semantic retrieval is combined with skills, education and location scoring to rank your best opportunities." />
      <div className="match-toolbar">
        <div><span className="eyebrow">MATCH COUNT</span><strong>Top {k}</strong></div>
        <select value={k} onChange={(e) => setK(Number(e.target.value))}><option value="3">3 matches</option><option value="5">5 matches</option><option value="10">10 matches</option></select>
        <button
          className="primary-button"
          onClick={loadMatches}
          disabled={loading}
        >
          {loading ? "Finding matches..." : "Find Matches →"}
        </button>

      </div>
      {error && <FormMessage error={error} />}
      {loading ? <LoadingState text="Searching the internship vector database..." /> : (
        <>
          {summary && <div className="ai-summary"><div className="summary-icon">✦</div><div><span className="eyebrow">AI INSIGHT</span><p>{summary}</p></div></div>}
          <div className="matches-list">{matches.map((m) => <InternshipCard key={m.id} job={m} match={m} applied={appliedIds.has(m.id)} onApplied={handleApplied} />)}</div>
        </>
      )}
    </div>
  );
}

function ProfilePage({ user, onUserChange }) {
  const [form, setForm] = useState({ full_name: user?.full_name || "", phone_number: user?.phone_number || "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState({ current_password: "", new_password: "" });

  async function save(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const updated = await api.updateProfile(form);
      saveUser(updated); onUserChange(updated); setMessage("Profile updated successfully.");
    } catch (err) { setError(err.message); }
  }

  async function changePassword(e) {
    e.preventDefault(); setError(""); setMessage("");
    try {
      const result = await api.changePassword(passwords.current_password, passwords.new_password);
      setMessage(result.message);
      setPasswords({ current_password: "", new_password: "" });
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <PageHeader eyebrow="ACCOUNT" title="Your profile." text="Manage your account details and security settings." />
      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-head"><span className="large-avatar">{(user?.full_name || "U").slice(0, 1)}</span><div><h3>Personal information</h3><p>These details are associated with your account.</p></div></div>
          <form onSubmit={save} className="form-stack">
            <Field label="Full name" value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} required />
            <Field label="Email address" value={user?.email || ""} onChange={() => {}} />
            <Field label="Phone number" value={form.phone_number || ""} onChange={(v) => setForm({ ...form, phone_number: v })} />
            <FormMessage error={error} success={message} />
            <button className="primary-button">Save changes</button>
          </form>
        </div>
        <div className="settings-card">
          <div className="settings-card-head"><span className="settings-icon">⌁</span><div><h3>Change password</h3><p>Keep your account protected.</p></div></div>
          <form onSubmit={changePassword} className="form-stack">
            <Field label="Current password" type="password" value={passwords.current_password} onChange={(v) => setPasswords({ ...passwords, current_password: v })} required />
            <Field label="New password" type="password" value={passwords.new_password} onChange={(v) => setPasswords({ ...passwords, new_password: v })} required />
            <button className="secondary-button">Change password</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, text }) {
  return <div className="page-header"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{text}</p></div>;
}
function LoadingState({ text }) { return <div className="loading-state"><span className="spinner" />{text}</div>; }
function EmptyState({ title, text, action, onClick }) { return <div className="empty-state"><div className="empty-icon">✦</div><h2>{title}</h2><p>{text}</p>{action && <button className="primary-button" onClick={onClick}>{action} →</button>}</div>; }

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [resume, setResumeState] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ai_resume") || "null"); } catch { return null; }
  });

  function setResume(value) {
    setResumeState(value);
    if (value) localStorage.setItem("ai_resume", JSON.stringify(value));
    else localStorage.removeItem("ai_resume");
  }

  function onLogin(value) {
    setUser(value);
    saveUser(value);
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={onLogin} />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/*" element={
        <ProtectedRoute>
          <Shell user={user} onLogout={() => setUser(null)}>
            <Routes>
              <Route path="dashboard" element={<Dashboard user={user} resume={resume} setResume={setResume} />} />
              <Route path="resume" element={<ResumePage resume={resume} setResume={setResume} />} />
              <Route path="parsed-resumes" element={<ParsedResumesPage setResume={setResume} />} />
              <Route path="internships" element={<InternshipsPage />} />
              <Route path="matches" element={<MatchesPage resume={resume} />} />
              <Route path="interview-prep" element={<InterviewPreparationPage />} />
              <Route path="applied-internships" element={<AppliedInternshipsPage />} />
              <Route path="cover-letter" element={<CoverLetterPage resume={resume} />} />
              <Route path="profile" element={<CareerProfilePage user={user} onUserChange={onLogin} />} />
              <Route path="ai-assistant" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Shell>
        </ProtectedRoute>
      } />
    </Routes>
  );
}