import { useState, useEffect, useCallback, useRef } from "react";

// ─── Storage Helper ───
const DB = {
  async get(key) {
    try {
      const r = await window.storage.get(key);
      return r ? JSON.parse(r.value) : null;
    } catch { return null; }
  },
  async set(key, val) {
    try {
      await window.storage.set(key, JSON.stringify(val));
    } catch (e) { console.error("Storage error:", e); }
  },
  async list(prefix) {
    try {
      const r = await window.storage.list(prefix);
      return r?.keys || [];
    } catch { return []; }
  },
  async delete(key) {
    try { await window.storage.delete(key); } catch {}
  }
};

// ─── ID Generator ───
const genId = () => "REQ-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();

// ─── Constants ───
const PROJECT_TYPES = [
  "مشروع إنشائي جديد", "ترميم وصيانة", "توسعة مبنى قائم",
  "تجهيزات ومعدات", "بنية تحتية", "مشروع تقني / تحول رقمي",
  "خدمي / تشغيلي", "أخرى"
];

const STATUS_MAP = {
  new: { label: "جديد", color: "#2563eb", bg: "#dbeafe" },
  reviewing: { label: "قيد الدراسة", color: "#d97706", bg: "#fef3c7" },
  approved: { label: "معتمد", color: "#059669", bg: "#d1fae5" },
  rejected: { label: "مرفوض", color: "#dc2626", bg: "#fee2e2" },
  report_generated: { label: "تم توليد التقرير", color: "#7c3aed", bg: "#ede9fe" },
};

const ADMIN_PASS = "admin123";

// ─── Main App ───
export default function App() {
  const [page, setPage] = useState("employee"); // employee | admin_login | admin | report_view
  const [activeRequest, setActiveRequest] = useState(null);
  const [reportData, setReportData] = useState(null);

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Noto Kufi Arabic', 'Segoe UI', sans-serif", direction: "rtl", background: "#f0f2f5" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      
      {page === "employee" && (
        <EmployeePage
          onGoAdmin={() => setPage("admin_login")}
        />
      )}
      {page === "admin_login" && (
        <AdminLogin
          onBack={() => setPage("employee")}
          onSuccess={() => setPage("admin")}
        />
      )}
      {page === "admin" && (
        <AdminDashboard
          onLogout={() => setPage("employee")}
          onViewReport={(req, data) => { setActiveRequest(req); setReportData(data); setPage("report_view"); }}
        />
      )}
      {page === "report_view" && (
        <ReportViewer
          request={activeRequest}
          reportData={reportData}
          onBack={() => setPage("admin")}
          onSave={async (req, data) => {
            await DB.set(`request:${req.id}`, { ...req, reportData: data, status: "report_generated" });
            setPage("admin");
          }}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// EMPLOYEE PAGE - Submit Request
// ═══════════════════════════════════════
function EmployeePage({ onGoAdmin }) {
  const [form, setForm] = useState({
    name: "", department: "", email: "", phone: "",
    projectName: "", projectType: "", location: "",
    description: "", justification: "", estimatedCost: "",
    duration: "", beneficiary: "", notes: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [reqId, setReqId] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = true;
    if (!form.department.trim()) e.department = true;
    if (!form.projectName.trim()) e.projectName = true;
    if (!form.projectType) e.projectType = true;
    if (!form.description.trim()) e.description = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const id = genId();
    const request = {
      id, ...form,
      status: "new",
      createdAt: new Date().toISOString(),
      adminNotes: "",
      reportData: null,
    };
    await DB.set(`request:${id}`, request);
    setReqId(id);
    setSubmitted(true);
  };

  const resetForm = () => {
    setForm({ name: "", department: "", email: "", phone: "", projectName: "", projectType: "", location: "", description: "", justification: "", estimatedCost: "", duration: "", beneficiary: "", notes: "" });
    setSubmitted(false);
    setReqId("");
    setErrors({});
  };

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0f4c3a 0%, #1a6b4f 50%, #0d3d2f 100%)" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "50px 40px", maxWidth: 480, width: "90%", textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.15)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 40 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 12 }}>تم استلام طلبك بنجاح</h2>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 24, lineHeight: 1.8 }}>سيتم مراجعة طلبك من قبل قسم الدراسات والتصاميم وإعداد تقرير الدراسات الخمسة</p>
          <div style={{ background: "#f0fdf4", border: "2px dashed #059669", borderRadius: 12, padding: "16px 24px", marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>رقم الطلب</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", letterSpacing: 2, fontFamily: "monospace" }}>{reqId}</div>
          </div>
          <button onClick={resetForm} style={{ ...btnStyle, background: "#0f4c3a", width: "100%" }}>+ إرسال طلب آخر</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f4c3a 0%, #1a6b4f 50%, #0d3d2f 100%)" }}>
      {/* Header */}
      <div style={{ padding: "32px 24px 0", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 6 }}>نموذج طلب إعداد دراسة مشروع</h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>جامعة أم القرى · وكالة الجامعة للمشاريع · قسم الدراسات والتصاميم</p>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 680, margin: "24px auto", padding: "0 16px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }}>
          
          <SectionTitle icon="👤" title="بيانات مقدم الطلب" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="الاسم الكامل" required value={form.name} onChange={v => set("name", v)} error={errors.name} />
            <Field label="القسم / الإدارة" required value={form.department} onChange={v => set("department", v)} error={errors.department} />
            <Field label="البريد الإلكتروني" value={form.email} onChange={v => set("email", v)} type="email" />
            <Field label="رقم الجوال" value={form.phone} onChange={v => set("phone", v)} />
          </div>

          <div style={{ height: 1, background: "#e5e7eb", margin: "28px 0" }} />

          <SectionTitle icon="🏗️" title="بيانات المشروع المقترح" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="اسم المشروع" required value={form.projectName} onChange={v => set("projectName", v)} error={errors.projectName} />
            <div>
              <label style={labelStyle}>نوع المشروع <span style={{ color: "#dc2626" }}>●</span></label>
              <select value={form.projectType} onChange={e => set("projectType", e.target.value)}
                style={{ ...inputStyle, ...(errors.projectType ? { borderColor: "#dc2626" } : {}) }}>
                <option value="">اختر النوع...</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <Field label="الموقع / المبنى" value={form.location} onChange={v => set("location", v)} />
          <Field label="وصف المشروع" required value={form.description} onChange={v => set("description", v)} textarea error={errors.description} />
          <Field label="مبررات المشروع والحاجة إليه" value={form.justification} onChange={v => set("justification", v)} textarea />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="التكلفة التقديرية (ريال)" value={form.estimatedCost} onChange={v => set("estimatedCost", v)} />
            <Field label="المدة المقترحة (شهر)" value={form.duration} onChange={v => set("duration", v)} />
          </div>
          <Field label="الجهة المستفيدة" value={form.beneficiary} onChange={v => set("beneficiary", v)} />
          <Field label="ملاحظات إضافية" value={form.notes} onChange={v => set("notes", v)} textarea />

          <button onClick={handleSubmit} style={{ ...btnStyle, background: "#0f4c3a", width: "100%", marginTop: 20, fontSize: 16, padding: "14px 24px" }}>
            📤 إرسال الطلب
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={onGoAdmin} style={{ background: "none", border: "1px solid rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.8)", padding: "10px 28px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            🔐 دخول المدير
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ADMIN LOGIN
// ═══════════════════════════════════════
function AdminLogin({ onBack, onSuccess }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState(false);

  const login = () => {
    if (pass === ADMIN_PASS) onSuccess();
    else setError(true);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)" }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", maxWidth: 400, width: "90%", textAlign: "center", boxShadow: "0 25px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>لوحة تحكم المدير</h2>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>قسم الدراسات والتصاميم · جامعة أم القرى</p>
        <input
          type="password"
          placeholder="كلمة المرور"
          value={pass}
          onChange={e => { setPass(e.target.value); setError(false); }}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ ...inputStyle, textAlign: "center", fontSize: 16, marginBottom: error ? 8 : 16 }}
        />
        {error && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 12 }}>كلمة المرور غير صحيحة</p>}
        <button onClick={login} style={{ ...btnStyle, background: "#1e293b", width: "100%" }}>دخول ←</button>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#888", marginTop: 16, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>→ العودة لنموذج الطلب</button>
        <p style={{ color: "#aaa", fontSize: 11, marginTop: 20 }}>كلمة المرور: admin123</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════
function AdminDashboard({ onLogout, onViewReport }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const keys = await DB.list("request:");
    const reqs = [];
    for (const k of keys) {
      const r = await DB.get(k);
      if (r) reqs.push(r);
    }
    reqs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRequests(reqs);
    setLoading(false);
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const updateStatus = async (req, status) => {
    const updated = { ...req, status, adminNotes };
    await DB.set(`request:${req.id}`, updated);
    setSelected(updated);
    loadRequests();
  };

  const generateReport = async (req) => {
    setGenerating(true);
    try {
      const prompt = buildReportPrompt(req);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(c => c.text || "").join("") || "";
      
      let reportContent;
      try {
        const clean = text.replace(/```json|```/g, "").trim();
        reportContent = JSON.parse(clean);
      } catch {
        reportContent = {
          strategic: text.substring(0, 600) || "الدراسة الاستراتيجية للمشروع",
          economic: "التحليل الاقتصادي والمالي للمشروع",
          commercial: "الدراسة التجارية وآلية الطرح",
          financial: "الدراسة المالية والتمويلية",
          management: "دراسة الإدارة والتنفيذ",
        };
      }
      
      const updated = { ...req, status: "report_generated", reportData: reportContent, adminNotes };
      await DB.set(`request:${req.id}`, updated);
      setSelected(updated);
      loadRequests();
      onViewReport(updated, reportContent);
    } catch (err) {
      console.error(err);
      // Fallback report
      const fallback = generateFallbackReport(req);
      const updated = { ...req, status: "report_generated", reportData: fallback, adminNotes };
      await DB.set(`request:${req.id}`, updated);
      setSelected(updated);
      loadRequests();
      onViewReport(updated, fallback);
    }
    setGenerating(false);
  };

  const filtered = filter === "all" ? requests : requests.filter(r => r.status === filter);
  const counts = {
    all: requests.length,
    new: requests.filter(r => r.status === "new").length,
    reviewing: requests.filter(r => r.status === "reviewing").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    report_generated: requests.filter(r => r.status === "report_generated").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Top Bar */}
      <div style={{ background: "linear-gradient(135deg, #1e293b, #334155)", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 32 }}>🎓</span>
          <div>
            <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>لوحة تحكم المدير</h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0 }}>قسم الدراسات والتصاميم · جامعة أم القرى</p>
          </div>
        </div>
        <button onClick={onLogout} style={{ ...btnStyle, background: "rgba(255,255,255,0.15)", fontSize: 13, padding: "8px 20px" }}>🚪 خروج</button>
      </div>

      {/* Stats */}
      <div style={{ maxWidth: 1100, margin: "24px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { key: "new", icon: "📥", label: "طلبات جديدة" },
          { key: "reviewing", icon: "🔍", label: "قيد الدراسة" },
          { key: "approved", icon: "✅", label: "معتمدة" },
          { key: "report_generated", icon: "📊", label: "تقارير مكتملة" },
          { key: "rejected", icon: "❌", label: "مرفوضة" },
        ].map(s => (
          <div key={s.key} onClick={() => setFilter(s.key)} style={{ background: "#fff", borderRadius: 14, padding: "20px 16px", textAlign: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: filter === s.key ? `2px solid ${STATUS_MAP[s.key]?.color || "#333"}` : "2px solid transparent", transition: "all .2s" }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: STATUS_MAP[s.key]?.color || "#333", marginTop: 4 }}>{counts[s.key]}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 40px", display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: 20 }}>
        {/* Request List */}
        <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                { k: "all", l: "الكل" }, { k: "new", l: "جديدة" }, { k: "reviewing", l: "قيد الدراسة" },
                { k: "approved", l: "معتمدة" }, { k: "report_generated", l: "مكتملة" }, { k: "rejected", l: "مرفوضة" }
              ].map(f => (
                <button key={f.k} onClick={() => setFilter(f.k)} style={{
                  padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: filter === f.k ? "#1e293b" : "#f3f4f6",
                  color: filter === f.k ? "#fff" : "#555",
                  fontSize: 12, fontWeight: 600, fontFamily: "inherit"
                }}>
                  {f.l} {counts[f.k]}
                </button>
              ))}
            </div>
            <button onClick={loadRequests} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}>🔄</button>
          </div>

          <div style={{ maxHeight: 500, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#888" }}>جاري التحميل...</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#888" }}>لا توجد طلبات</div>
            ) : filtered.map(r => (
              <div key={r.id} onClick={() => { setSelected(r); setAdminNotes(r.adminNotes || ""); }}
                style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", background: selected?.id === r.id ? "#f8fafc" : "#fff", transition: "all .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{r.projectName}</span>
                  <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, color: STATUS_MAP[r.status]?.color, background: STATUS_MAP[r.status]?.bg }}>{STATUS_MAP[r.status]?.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
                  <span>{r.name} · {r.department}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11 }}>{r.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>تفاصيل الطلب</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888" }}>✕</button>
            </div>
            <div style={{ padding: "20px", maxHeight: 460, overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "monospace", fontSize: 13, color: "#888" }}>{selected.id}</span>
                <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: STATUS_MAP[selected.status]?.color, background: STATUS_MAP[selected.status]?.bg }}>{STATUS_MAP[selected.status]?.label}</span>
              </div>
              
              <DetailRow label="مقدم الطلب" value={selected.name} />
              <DetailRow label="القسم" value={selected.department} />
              {selected.email && <DetailRow label="البريد" value={selected.email} />}
              {selected.phone && <DetailRow label="الجوال" value={selected.phone} />}
              <div style={{ height: 1, background: "#e5e7eb", margin: "12px 0" }} />
              <DetailRow label="اسم المشروع" value={selected.projectName} />
              <DetailRow label="النوع" value={selected.projectType} />
              {selected.location && <DetailRow label="الموقع" value={selected.location} />}
              <DetailRow label="الوصف" value={selected.description} />
              {selected.justification && <DetailRow label="المبررات" value={selected.justification} />}
              {selected.estimatedCost && <DetailRow label="التكلفة التقديرية" value={`${Number(selected.estimatedCost).toLocaleString()} ريال`} />}
              {selected.duration && <DetailRow label="المدة" value={`${selected.duration} شهر`} />}
              {selected.beneficiary && <DetailRow label="المستفيد" value={selected.beneficiary} />}
              {selected.notes && <DetailRow label="ملاحظات" value={selected.notes} />}

              <div style={{ height: 1, background: "#e5e7eb", margin: "16px 0" }} />
              
              <label style={{ ...labelStyle, marginBottom: 6 }}>ملاحظات المدير</label>
              <textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="أضف ملاحظاتك هنا..."
                style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} />

              {/* Actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {(selected.status === "new") && (
                  <>
                    <button onClick={() => updateStatus(selected, "reviewing")} style={{ ...btnStyle, background: "#d97706" }}>🔍 قبول للمراجعة</button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => updateStatus(selected, "approved")} style={{ ...btnStyle, background: "#059669", flex: 1 }}>✅ موافقة</button>
                      <button onClick={() => updateStatus(selected, "rejected")} style={{ ...btnStyle, background: "#dc2626", flex: 1 }}>❌ رفض</button>
                    </div>
                  </>
                )}
                {selected.status === "reviewing" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => updateStatus(selected, "approved")} style={{ ...btnStyle, background: "#059669", flex: 1 }}>✅ موافقة</button>
                    <button onClick={() => updateStatus(selected, "rejected")} style={{ ...btnStyle, background: "#dc2626", flex: 1 }}>❌ رفض</button>
                  </div>
                )}
                {(selected.status === "approved" || selected.status === "report_generated") && (
                  <button onClick={() => generateReport(selected)} disabled={generating}
                    style={{ ...btnStyle, background: generating ? "#9ca3af" : "#7c3aed" }}>
                    {generating ? "⏳ جاري التوليد..." : "✦ توليد تقرير الدراسات الخمسة"}
                  </button>
                )}
                {selected.status === "report_generated" && selected.reportData && (
                  <button onClick={() => onViewReport(selected, selected.reportData)}
                    style={{ ...btnStyle, background: "#0f4c3a" }}>
                    📄 عرض التقرير
                  </button>
                )}
                {selected.status === "rejected" && (
                  <button onClick={() => updateStatus(selected, "new")} style={{ ...btnStyle, background: "#6b7280" }}>↩️ إعادة فتح</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// REPORT VIEWER - View / Edit / Print
// ═══════════════════════════════════════
function ReportViewer({ request, reportData, onBack, onSave }) {
  const [data, setData] = useState(reportData || {});
  const [editing, setEditing] = useState(false);
  const printRef = useRef(null);

  const sections = [
    { key: "strategic", title: "الدراسة الاستراتيجية", icon: "🎯", subtitle: "Strategic Case" },
    { key: "economic", title: "الدراسة الاقتصادية", icon: "📊", subtitle: "Economic Case" },
    { key: "commercial", title: "الدراسة التجارية", icon: "🏪", subtitle: "Commercial Case" },
    { key: "financial", title: "الدراسة المالية", icon: "💰", subtitle: "Financial Case" },
    { key: "management", title: "دراسة الإدارة", icon: "⚙️", subtitle: "Management Case" },
  ];

  const handlePrint = () => {
    const w = window.open("", "_blank");
    w.document.write(`
      <html dir="rtl">
      <head>
        <meta charset="utf-8">
        <title>تقرير الدراسات الخمسة - ${request.projectName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Kufi+Arabic:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Noto Kufi Arabic', sans-serif; direction: rtl; color: #1a1a1a; padding: 40px; }
          .header { text-align: center; border-bottom: 3px solid #0f4c3a; padding-bottom: 24px; margin-bottom: 32px; }
          .header h1 { font-size: 24px; color: #0f4c3a; }
          .header p { color: #666; font-size: 13px; margin-top: 6px; }
          .meta { background: #f8f9fa; border-radius: 8px; padding: 16px; margin-bottom: 28px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
          .meta-item { font-size: 13px; }
          .meta-label { color: #888; font-size: 11px; }
          .section { margin-bottom: 28px; page-break-inside: avoid; }
          .section-title { font-size: 18px; font-weight: 700; color: #0f4c3a; border-right: 4px solid #0f4c3a; padding-right: 12px; margin-bottom: 12px; }
          .section-body { font-size: 14px; line-height: 2; color: #333; white-space: pre-wrap; }
          .footer { text-align: center; border-top: 2px solid #e5e7eb; padding-top: 16px; margin-top: 40px; color: #999; font-size: 11px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير الدراسات الخمسة — Five Case Model</h1>
          <p>جامعة أم القرى · وكالة الجامعة للمشاريع · قسم الدراسات والتصاميم</p>
        </div>
        <div class="meta">
          <div class="meta-item"><div class="meta-label">اسم المشروع</div>${request.projectName}</div>
          <div class="meta-item"><div class="meta-label">رقم الطلب</div>${request.id}</div>
          <div class="meta-item"><div class="meta-label">النوع</div>${request.projectType}</div>
          ${request.location ? `<div class="meta-item"><div class="meta-label">الموقع</div>${request.location}</div>` : ""}
          ${request.estimatedCost ? `<div class="meta-item"><div class="meta-label">التكلفة التقديرية</div>${Number(request.estimatedCost).toLocaleString()} ريال</div>` : ""}
          ${request.duration ? `<div class="meta-item"><div class="meta-label">المدة</div>${request.duration} شهر</div>` : ""}
        </div>
        ${sections.map(s => `
          <div class="section">
            <div class="section-title">${s.icon} ${s.title} — ${s.subtitle}</div>
            <div class="section-body">${data[s.key] || "لم يتم توليد هذا القسم"}</div>
          </div>
        `).join("")}
        <div class="footer">
          <p>تم إعداد هذا التقرير بواسطة نظام الدراسات الخمسة — جامعة أم القرى © ١٤٤٧هـ</p>
          <p>تاريخ الإصدار: ${new Date().toLocaleDateString("ar-SA")}</p>
        </div>
      </body>
      </html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5" }}>
      {/* Top Bar */}
      <div style={{ background: "linear-gradient(135deg, #0f4c3a, #1a6b4f)", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ ...btnStyle, background: "rgba(255,255,255,0.15)", padding: "8px 16px", fontSize: 13 }}>← العودة</button>
          <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>تقرير الدراسات الخمسة</h2>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setEditing(!editing)} style={{ ...btnStyle, background: editing ? "#059669" : "rgba(255,255,255,0.15)", padding: "8px 16px", fontSize: 13 }}>
            {editing ? "💾 حفظ التعديلات" : "✏️ تعديل المحتوى"}
          </button>
          <button onClick={() => { if (editing) { onSave(request, data); setEditing(false); } }} style={{ ...btnStyle, background: "rgba(255,255,255,0.15)", padding: "8px 16px", fontSize: 13, display: editing ? "block" : "none" }}>
            📁 حفظ في النظام
          </button>
          <button onClick={handlePrint} style={{ ...btnStyle, background: "rgba(255,255,255,0.15)", padding: "8px 16px", fontSize: 13 }}>🖨 طباعة PDF</button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={printRef} style={{ maxWidth: 850, margin: "28px auto", padding: "0 16px 40px" }}>
        {/* Report Header */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "32px 36px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", textAlign: "center", borderTop: "4px solid #0f4c3a" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f4c3a", marginBottom: 6 }}>تقرير الدراسات الخمسة — Five Case Model</h1>
          <p style={{ color: "#888", fontSize: 13 }}>جامعة أم القرى · وكالة الجامعة للمشاريع · قسم الدراسات والتصاميم</p>
          <div style={{ margin: "20px auto 0", display: "inline-grid", gridTemplateColumns: "repeat(3, auto)", gap: "8px 32px", textAlign: "start", background: "#f8faf8", padding: "16px 28px", borderRadius: 10 }}>
            <MetaItem label="اسم المشروع" value={request.projectName} />
            <MetaItem label="رقم الطلب" value={request.id} />
            <MetaItem label="النوع" value={request.projectType} />
            {request.location && <MetaItem label="الموقع" value={request.location} />}
            {request.estimatedCost && <MetaItem label="التكلفة" value={`${Number(request.estimatedCost).toLocaleString()} ريال`} />}
            {request.duration && <MetaItem label="المدة" value={`${request.duration} شهر`} />}
          </div>
        </div>

        {/* Sections */}
        {sections.map((s, i) => (
          <div key={s.key} style={{ background: "#fff", borderRadius: 16, padding: "28px 32px", marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f4c3a", margin: 0 }}>الدراسة {i + 1}: {s.title}</h3>
                <span style={{ fontSize: 12, color: "#999" }}>{s.subtitle}</span>
              </div>
            </div>
            {editing ? (
              <textarea
                value={data[s.key] || ""}
                onChange={e => setData(p => ({ ...p, [s.key]: e.target.value }))}
                style={{ ...inputStyle, minHeight: 160, resize: "vertical", lineHeight: 2, fontSize: 14 }}
              />
            ) : (
              <div style={{ fontSize: 14, lineHeight: 2.2, color: "#333", whiteSpace: "pre-wrap" }}>
                {data[s.key] || "لم يتم توليد هذا القسم بعد"}
              </div>
            )}
          </div>
        ))}

        {editing && (
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => { onSave(request, data); setEditing(false); }}
              style={{ ...btnStyle, background: "#0f4c3a", fontSize: 16, padding: "14px 48px" }}>
              💾 حفظ جميع التعديلات
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════
function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>{title}</h3>
    </div>
  );
}

function Field({ label, value, onChange, required, textarea, type = "text", error }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label} {required && <span style={{ color: "#dc2626" }}>●</span>}</label>
      <Tag
        type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, ...(textarea ? { minHeight: 80, resize: "vertical" } : {}), ...(error ? { borderColor: "#dc2626", background: "#fff5f5" } : {}) }}
      />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#1a1a1a", lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#888" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════
// STYLES
// ═══════════════════════════════════════
const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1.5px solid #e0e0e0", fontSize: 14, fontFamily: "inherit",
  outline: "none", background: "#fafafa", transition: "border .2s",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: "#444", marginBottom: 5,
};

const btnStyle = {
  padding: "10px 20px", borderRadius: 10, border: "none",
  color: "#fff", fontSize: 14, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", transition: "all .2s",
};

// ═══════════════════════════════════════
// REPORT GENERATION HELPERS
// ═══════════════════════════════════════
function buildReportPrompt(req) {
  return `أنت خبير في إعداد دراسات الجدوى ونموذج الدراسات الخمسة (Five Case Model) للمشاريع الجامعية.

أعد تقرير الدراسات الخمسة للمشروع التالي بصيغة JSON فقط بدون أي نص إضافي:

بيانات المشروع:
- اسم المشروع: ${req.projectName}
- النوع: ${req.projectType}
- الموقع: ${req.location || "غير محدد"}
- الوصف: ${req.description}
- المبررات: ${req.justification || "غير محددة"}
- التكلفة التقديرية: ${req.estimatedCost ? req.estimatedCost + " ريال" : "غير محددة"}
- المدة: ${req.duration ? req.duration + " شهر" : "غير محددة"}
- المستفيد: ${req.beneficiary || "غير محدد"}

أرجع JSON بالشكل التالي فقط (بدون markdown أو backticks):
{
  "strategic": "نص الدراسة الاستراتيجية - يشمل المبررات الاستراتيجية والأهداف والنتائج المتوقعة والمخاطر وعلاقة المشروع برؤية الجامعة (3-5 فقرات)",
  "economic": "نص الدراسة الاقتصادية - يشمل تحليل التكلفة والعائد والبدائل المطروحة والخيار المفضل (3-5 فقرات)",
  "commercial": "نص الدراسة التجارية - يشمل آلية الطرح والتعاقد والموردين والمواصفات (3-5 فقرات)",
  "financial": "نص الدراسة المالية - يشمل مصادر التمويل والتكاليف التفصيلية والجدول الزمني المالي (3-5 فقرات)",
  "management": "نص دراسة الإدارة - يشمل هيكل إدارة المشروع والجدول الزمني وخطة المخاطر والحوكمة (3-5 فقرات)"
}

اكتب محتوى احترافي ومفصل باللغة العربية مناسب لجامعة أم القرى.`;
}

function generateFallbackReport(req) {
  const cost = req.estimatedCost ? `${Number(req.estimatedCost).toLocaleString()} ريال` : "لم تحدد بعد";
  const dur = req.duration ? `${req.duration} شهر` : "لم تحدد بعد";
  
  return {
    strategic: `الدراسة الاستراتيجية لمشروع "${req.projectName}"

يأتي هذا المشروع ضمن جهود جامعة أم القرى في تطوير بنيتها التحتية وتحسين بيئتها الأكاديمية والبحثية. يهدف المشروع إلى ${req.description}

المبررات الاستراتيجية:
${req.justification || "يتوافق المشروع مع الخطة الاستراتيجية للجامعة ورؤية المملكة 2030 في تطوير قطاع التعليم العالي."}

النتائج المتوقعة:
- تحسين جودة الخدمات المقدمة للمستفيدين
- رفع كفاءة البنية التحتية للجامعة
- تعزيز مكانة الجامعة في مجال ${req.projectType}

المستفيد الرئيسي: ${req.beneficiary || "منسوبو وطلاب جامعة أم القرى"}`,

    economic: `الدراسة الاقتصادية لمشروع "${req.projectName}"

تحليل التكلفة والعائد:
التكلفة التقديرية للمشروع: ${cost}
المدة المتوقعة للتنفيذ: ${dur}

البدائل المطروحة:
1. البديل الأول: تنفيذ المشروع بالكامل وفق المواصفات المقترحة
2. البديل الثاني: تنفيذ المشروع على مراحل
3. البديل الثالث: عدم التنفيذ (الوضع الراهن)

الخيار المفضل: البديل الأول - التنفيذ الكامل
المبرر: يحقق أعلى عائد اقتصادي ويتجنب تكاليف التأخير والتضخم`,

    commercial: `الدراسة التجارية لمشروع "${req.projectName}"

آلية الطرح والتعاقد:
يُقترح طرح المشروع عبر منافسة عامة وفقاً لنظام المنافسات والمشتريات الحكومية، مع مراعاة:
- إعداد كراسة شروط ومواصفات شاملة
- تحديد معايير التأهيل الفني والمالي
- اعتماد آلية تقييم العروض وفق أفضل الممارسات

نوع العقد المقترح: عقد تنفيذ بسعر إجمالي
الموقع: ${req.location || "يحدد لاحقاً"}`,

    financial: `الدراسة المالية لمشروع "${req.projectName}"

التكاليف التفصيلية:
- قيمة عقد التنفيذ التقديرية: ${cost}
- تكاليف الإشراف (تقديري): يحسب وفق النسب المعتمدة
- احتياطي طوارئ: 10% من قيمة العقد

مصادر التمويل:
يموّل المشروع من ميزانية جامعة أم القرى المعتمدة ضمن بند المشاريع

الجدول الزمني المالي:
- مدة التنفيذ المقترحة: ${dur}
- الدفعات: وفق نسب الإنجاز المعتمدة`,

    management: `دراسة الإدارة والتنفيذ لمشروع "${req.projectName}"

هيكل إدارة المشروع:
- الجهة المالكة: جامعة أم القرى
- جهة الإشراف: وكالة الجامعة للمشاريع - الإدارة العامة للمشاريع
- المقاول المنفذ: يحدد بعد الترسية

الجدول الزمني:
- مرحلة التصميم والطرح: 3-4 أشهر
- مرحلة التنفيذ: ${dur}
- مرحلة التشغيل والتسليم: 1-2 شهر

إدارة المخاطر:
- مخاطر التأخير: تُعالج بوضع جدول زمني واقعي مع حوافز وجزاءات
- مخاطر تجاوز التكاليف: تُعالج باحتياطي الطوارئ والمتابعة الدورية
- مخاطر الجودة: تُعالج بالإشراف الهندسي المستمر`
  };
}
