'use client'
import { useState } from 'react'

export default function RequestPage() {
  const [form, setForm] = useState({
    employeeName: '',
    department: '',
    requestTitle: '',
    requestDescription: '',
  })
  const [status, setStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ employeeName: '', department: '', requestTitle: '', requestDescription: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Segoe UI', Tahoma, sans-serif" }} dir="rtl">
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4dc', width: '100%', maxWidth: '480px', padding: '2.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '2rem' }}>
          <div style={{ width: '40px', height: '40px', background: '#1a472a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', color: '#1a1a1a' }}>تقديم طلب</div>
            <div style={{ fontSize: '12px', color: '#888' }}>جامعة أم القرى — وكالة المشاريع</div>
          </div>
        </div>

        {status === 'success' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ width: '64px', height: '64px', background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <svg width="28" height="28" fill="none" stroke="#1a472a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>تم إرسال طلبك بنجاح</div>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '1.5rem' }}>ستتم مراجعته من قِبل الإدارة قريباً</div>
            <button onClick={() => setStatus(null)} style={{ background: '#1a472a', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
              تقديم طلب آخر
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {[
              { key: 'employeeName', label: 'اسم الموظف', required: true, placeholder: 'أدخل اسمك الكامل' },
              { key: 'department', label: 'القسم / الإدارة', required: false, placeholder: 'اختياري' },
              { key: 'requestTitle', label: 'عنوان الطلب', required: true, placeholder: 'موضوع الطلب باختصار' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>
                  {f.label} {f.required && <span style={{ color: '#c0392b' }}>*</span>}
                </label>
                <input
                  type="text"
                  required={f.required}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  style={{ width: '100%', border: '1.5px solid #e0dbd1', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', background: '#fafaf8' }}
                />
              </div>
            ))}

            <div style={{ marginBottom: '1.4rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#333', marginBottom: '6px' }}>
                تفاصيل الطلب <span style={{ color: '#c0392b' }}>*</span>
              </label>
              <textarea
                required
                rows={4}
                value={form.requestDescription}
                onChange={e => setForm({ ...form, requestDescription: e.target.value })}
                placeholder="اشرح طلبك بالتفصيل..."
                style={{ width: '100%', border: '1.5px solid #e0dbd1', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', background: '#fafaf8' }}
              />
            </div>

            {status === 'error' && (
              <div style={{ background: '#fdf0f0', color: '#c0392b', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', marginBottom: '1rem' }}>
                حدث خطأ، يرجى المحاولة مرة أخرى
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ width: '100%', background: status === 'loading' ? '#7a9e82' : '#1a472a', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: status === 'loading' ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}
            >
              {status === 'loading' ? 'جاري الإرسال...' : 'إرسال الطلب ←'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
