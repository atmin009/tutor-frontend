import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBundleStore } from '../store/bundleStore'
import apiClient from '../api/axios'

type BundleCheckoutResponse = {
  data: {
    bundleId: number
    courseIds: number[]
  }
  message: string
}

export default function CheckoutBundlePage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const { selectedCourses, bundleId, clear } = useBundleStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth/login?redirect=/checkout-bundle', { replace: true })
      return
    }
  }, [isLoggedIn, navigate])

  const handleCheckout = async () => {
    if (!bundleId || selectedCourses.length === 0) {
      setError('ยังไม่ได้เลือกชุดโปรหรือคอร์ส')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await apiClient.post<BundleCheckoutResponse>('/me/bundles/checkout', {
        bundleId,
        courseIds: selectedCourses.map((c) => c.id),
      })

      console.log('✅ Bundle checkout result', response.data)
      setSuccess(true)
      clear()
      setTimeout(() => {
        navigate('/learning', { replace: true })
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'ไม่สามารถทำรายการโปรโมชันชุดคอร์สได้')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isLoggedIn) return null

  if (!bundleId || selectedCourses.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">ยังไม่มีการเลือกคอร์สสำหรับโปรโมชันชุดคอร์ส</p>
          <button
            onClick={() => navigate('/courses')}
            className="mt-4 text-brand hover:text-brand/80"
          >
            ← เลือกคอร์ส
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-3xl px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">โปรโมชันชุดคอร์ส (ต้นแบบ)</h1>
          <p className="mt-2 text-sm text-slate-600">
            โปรโตไทป์: ระบบจะเพิ่มสิทธิ์เข้าเรียนทุกคอร์สที่เลือกทันทีโดยยังไม่ผูกกับระบบชำระเงินจริง
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            สำเร็จ! คุณได้รับสิทธิ์เข้าเรียนคอร์สทุกคอร์สในชุดนี้แล้ว กำลังนำคุณไปยังหน้าเรียน...
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            คอร์สในชุดโปร ({selectedCourses.length})
          </h2>
          <ul className="mb-6 space-y-2 text-sm text-slate-800">
            {selectedCourses.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span className="line-clamp-1">{c.title}</span>
                <span className="ml-2 text-xs text-slate-400">#{c.id}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleCheckout}
            className="w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {isProcessing ? 'กำลังดำเนินการ...' : 'ยืนยันใช้โปรนี้ (ต้นแบบ - ยังไม่ผูกจ่ายเงินจริง)'}
          </button>
        </div>
      </div>
    </div>
  )
}

