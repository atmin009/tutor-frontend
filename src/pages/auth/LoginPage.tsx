import { type FormEvent, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import apiClient from '../../api/axios'

export default function LoginPage() {
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })

      const { token, user } = response.data
      login(token, user)

      // Redirect to previous page or /learning
      const from = (location.state as { from?: string })?.from || '/learning'
      navigate(from, { replace: true })
    } catch (err: any) {
      setError(err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">ยินดีต้อนรับกลับ</h1>
            <p className="mt-2 text-sm text-slate-600">เข้าสู่ระบบเพื่อเรียนต่อ</p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            ยังไม่มีบัญชี?{' '}
            <Link to="/auth/register" className="font-medium text-brand hover:text-brand/80">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

