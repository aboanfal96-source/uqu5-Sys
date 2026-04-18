'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const STATUS = {
  pending:  { label: 'قيد الانتظار', bg: '#fff8e1', color: '#b7791f' },
  approved: { label: 'موافق عليه',   bg: '#e8f5e9', color: '#1a6b2a' },
  rejected: { label: 'مرفوض',        bg: '#fdecea', color: '#b91c1c' },
}

export default function AdminDashboard() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [notes, setNotes] = useState('')
  const [report, setReport] = useState('')
  const router = useRouter()

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (selected) {
      setNotes(selected.adminNotes || '')
      setReport(selected.reportContent || '')
    }
  }, [selected])

  const fetchAll = async () => {
    const res = await fetch('/api/requests')
    const data = await res.json()
    setRequests(data)
    setLoading(false)
  }

  const update = async (id, updates) => {
    setSaving(true)
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
    if (selected?.id === id) setSelected(prev => ({ ...prev, ...updates }))
    setSaving(false)
  }

  const generateReport = async () => {
    if (!selected) return
    setGenerating(true)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `أنت موظف إداري في جامعة أم القرى. اكتب تقريراً رسمياً موجزاً باللغة العربية لهذا الطلب:

الاسم: ${selected.employeeName}
القسم: ${selected.department || 'غير محدد'}
العنوان: ${selected.requestTitle}
التفاصيل: ${selected.requestDescription}
الحالة: ${STATUS[selected.status]?.label}
${selected.adminNotes ? 'ملاحظات الإدارة: ' + selected.adminNotes : ''}

اكتب التقرير بشكل رسمي مناسب للجامعة. لا تضف تعليقات خارج التقرير.`
          }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || ''
      setReport(text)
      await update(selected.id, { reportContent: text })
    } catch {
      setReport('حدث خطأ أثناء توليد التقرير')
    }
    setGenerating(false)
  }

  const logout = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' })
    router.push('/admin-login')
  }

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Tahoma, sans-serif" }}>
      <div style={{ color: '#888', fontSize: '14px' }}>جاري التحميل...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f5f3ef', fontFamily: "'Segoe UI', Tahoma, sans-serif" }} dir="rtl">

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e4dc', padding: '0 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', background: '#1a472a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#111' }}>لوحة الطلبات</span>
              <span style={{ fontSize: '12px', color: '#999', marginRight: '8px' }}>جامعة أم القرى</span>
            </div>
          </div>
          <button onClick={logout} style={{ fontSize: '13px', color: '#888', background: 'none', border: '1px solid #e0dbd1', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit' }}>
            خروج
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'إجمالي الطلبات', val: stats.total, color: '#111' },
            { label: 'قيد الانتظار', val: stats.pending, color: '#b7791f' },
            { label: 'موافق عليها', val: stats.approved, color: '#1a6b2a' },
            { label: 'مرفوضة', val: stats.rejected, color: '#b91c1c' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e8e4dc', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '26px', fontWeight: '700', color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>

          {/* Table */}
          <div style={{ flex: 1, background: '#fff', borderRadius: '14px', border: '1px solid #e8e4dc', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f0ece4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>الطلبات ({requests.length})</span>
            </div>

            {requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#bbb', fontSize: '14px' }}>لا توجد طلبات بعد</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#faf9f7', textAlign: 'right' }}>
                    {['الاسم', 'العنوان', 'الحالة', 'التاريخ'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#888', borderBottom: '1px solid #f0ece4' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => (
                    <tr
                      key={req.id}
                      onClick={() => setSelected(req)}
                      style={{ cursor: 'pointer', background: selected?.id === req.id ? '#f0f7f1' : 'transparent', borderBottom: '1px solid #f7f5f2', transition: 'background 0.15s' }}
                    >
                      <td style={{ padding: '11px 14px', fontSize: '14px', color: '#222', fontWeight: '500' }}>{req.employeeName}</td>
                      <td style={{ padding: '11px 14px', fontSize: '13px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.requestTitle}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', background: STATUS[req.status]?.bg, color: STATUS[req.status]?.color }}>
                          {STATUS[req.status]?.label}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: '12px', color: '#aaa' }}>
                        {new Date(req.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div style={{ width: '380px', background: '#fff', borderRadius: '14px', border: '1px solid #e8e4dc', padding: '1.25rem', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', flexShrink: 0 }}>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', flex: 1, paddingLeft: '8px' }}>{selected.requestTitle}</div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '18px', color: '#bbb', cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
              </div>

              {/* Info */}
              <div style={{ background: '#faf9f7', borderRadius: '10px', padding: '10px 12px', marginBottom: '1rem', fontSize: '13px', color: '#555', lineHeight: '1.8' }}>
                <div><b>الموظف:</b> {selected.employeeName}</div>
                {selected.department && <div><b>القسم:</b> {selected.department}</div>}
                <div><b>التاريخ:</b> {new Date(selected.createdAt).toLocaleString('ar-SA')}</div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>الطلب</div>
                <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.7', background: '#faf9f7', borderRadius: '10px', padding: '10px 12px' }}>{selected.requestDescription}</div>
              </div>

              {/* Status */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>تغيير الحالة</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {Object.entries(STATUS).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => update(selected.id, { status: key })}
                      style={{
                        flex: 1, padding: '7px 4px', fontSize: '12px', fontWeight: '500', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                        background: selected.status === key ? val.color : '#f5f3ef',
                        color: selected.status === key ? '#fff' : '#888',
                        border: selected.status === key ? `2px solid ${val.color}` : '1.5px solid #e8e4dc',
                      }}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '6px' }}>ملاحظات الإدارة</div>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  onBlur={() => update(selected.id, { adminNotes: notes })}
                  placeholder="أضف ملاحظة..."
                  style={{ width: '100%', border: '1.5px solid #e0dbd1', borderRadius: '10px', padding: '9px 11px', fontSize: '13px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', background: '#fafaf8' }}
                />
              </div>

              {/* Report */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#888' }}>التقرير</div>
                  <button
                    onClick={generateReport}
                    disabled={generating}
                    style={{ fontSize: '12px', background: generating ? '#ccc' : '#1a472a', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 12px', cursor: generating ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    {generating ? (
                      <>
                        <span style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}></span>
                        جاري التوليد...
                      </>
                    ) : '✦ توليد بالذكاء الاصطناعي'}
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={report}
                  onChange={e => setReport(e.target.value)}
                  onBlur={() => update(selected.id, { reportContent: report })}
                  placeholder="سيظهر التقرير هنا بعد التوليد، أو اكتبه يدوياً..."
                  style={{ width: '100%', border: '1.5px solid #e0dbd1', borderRadius: '10px', padding: '9px 11px', fontSize: '13px', fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', background: '#fafaf8', lineHeight: '1.7' }}
                />
                <button
                  onClick={() => update(selected.id, { reportContent: report })}
                  disabled={saving}
                  style={{ marginTop: '8px', width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ التقرير'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
