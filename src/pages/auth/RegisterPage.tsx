import { type FormEvent, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../api/axios'

export default function RegisterPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    // Validate phone number (must be 10 digits)
    if (phone) {
      const cleanedPhone = phone.replace(/\D/g, '')
      if (cleanedPhone.length !== 10) {
        setError('เบอร์โทรศัพท์ต้องเป็น 10 หลัก')
        return
      }
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        phone: phone ? phone.replace(/\D/g, '') : undefined,
        password,
      })

      const { token, user } = response.data
      login(token, user)

      // Auto-login and redirect to learning dashboard
      navigate('/learning', { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'สร้างบัญชีไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">สร้างบัญชีใหม่</h1>
            <p className="mt-2 text-sm text-slate-600">เริ่มต้นการเรียนของคุณวันนี้</p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">ชื่อ-นามสกุล</span>
              <input
                type="text"
                required
                value={name}
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="ชื่อ-นามสกุล"
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">อีเมล</span>
              <input
                type="email"
                required
                value={email}
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">เบอร์โทรศัพท์ (10 หลัก)</span>
              <input
                type="tel"
                required
                value={phone}
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0812345678"
                maxLength={10}
                onChange={(event) => {
                  // Only allow digits
                  const value = event.target.value.replace(/\D/g, '')
                  setPhone(value)
                }}
              />
              {phone && phone.replace(/\D/g, '').length !== 10 && (
                <p className="mt-1 text-xs text-red-600">เบอร์โทรศัพท์ต้องเป็น 10 หลัก</p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">รหัสผ่าน</span>
              <input
                type="password"
                required
                value={password}
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">ยืนยันรหัสผ่าน</span>
              <input
                type="password"
                required
                value={confirmPassword}
                disabled={isLoading}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            มีบัญชีอยู่แล้ว?{' '}
            <Link to="/auth/login" className="font-medium text-brand hover:text-brand/80">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

