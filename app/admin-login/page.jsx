'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin-dashboard')
    } else {
      setError('كلمة المرور غير صحيحة')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0ede8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Tahoma, sans-serif" }} dir="rtl">
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e8e4dc', width: '100%', maxWidth: '360px', padding: '2.5rem', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '48px', height: '48px', background: '#111', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>دخول الإدارة</div>
          <div style={{ fontSize: '12px', color: '#999' }}>لوحة تحكم الطلبات</div>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#444', marginBottom: '6px' }}>كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              style={{ width: '100%', border: '1.5px solid #e0dbd1', borderRadius: '10px', padding: '10px 12px', fontSize: '14px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fdf0f0', color: '#c0392b', borderRadius: '8px', padding: '10px', fontSize: '13px', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#111', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {loading ? 'جاري الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  )
}
