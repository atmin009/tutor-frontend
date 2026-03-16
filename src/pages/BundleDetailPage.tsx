import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/axios'

type Bundle = {
  id: number
  name: string
  description: string | null
  price: number
  status: string
  courseIds: string
  maxCourses: number | null
  startsAt: string | null
  endsAt: string | null
}

type BundleResponse = {
  data: Bundle
  message: string
}

export default function BundleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (!id) return
    const fetchBundle = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await apiClient.get<BundleResponse>(`/bundles/${id}/public`)
        setBundle(res.data.data)
      } catch (err: any) {
        const msg = err.response?.data?.message || 'โหลดชุดโปรโมชั่นไม่สำเร็จ'
        setError(msg)
        setBundle(null)
      } finally {
        setLoading(false)
      }
    }
    fetchBundle()
  }, [id])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleBuyBundle = async () => {
    if (!bundle || !id) return
    if (!isLoggedIn) {
      navigate(`/auth/login?redirect=${encodeURIComponent(`/bundles/${id}`)}`, { replace: true })
      return
    }
    setPurchasing(true)
    try {
      const courseIds: number[] = JSON.parse(bundle.courseIds)
      await apiClient.post('/me/bundles/checkout', {
        bundleId: Number(id),
        courseIds,
      })
      navigate('/learning', { replace: true })
    } catch (err: any) {
      const msg = err.response?.data?.message || 'ดำเนินการไม่สำเร็จ'
      setError(msg)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  if (error && !bundle) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
        <p className="text-red-700">{error}</p>
        <Link to="/courses" className="mt-4 inline-block text-brand hover:underline">
          ← กลับไปรายการคอร์ส
        </Link>
      </div>
    )
  }

  if (!bundle) return null

  const courseIds: number[] = JSON.parse(bundle.courseIds)
  const courseCount = bundle.maxCourses ?? courseIds.length

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-2 inline-block rounded bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800">
          ชุดโปรโมชั่น
        </div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{bundle.name}</h1>
        {bundle.description && (
          <p className="mt-3 text-slate-600">{bundle.description}</p>
        )}
        <p className="mt-2 text-sm text-slate-500">
          {courseCount} คอร์สในชุดนี้
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-3xl font-bold text-slate-900">
            {bundle.price > 0 ? formatPrice(bundle.price) : 'ฟรี'}
          </div>
          <button
            type="button"
            onClick={handleBuyBundle}
            disabled={purchasing}
            className="rounded-lg bg-[#CC0000] px-6 py-3 text-base font-semibold text-white hover:bg-[#AA0000] disabled:opacity-60"
          >
            {purchasing ? 'กำลังดำเนินการ...' : 'ซื้อชุดนี้'}
          </button>
        </div>

        {!isLoggedIn && (
          <p className="mt-3 text-sm text-slate-500">
            กดซื้อชุดนี้จะนำคุณไปเข้าสู่ระบบ แล้วกลับมาหน้านี้เพื่อชำระเงิน
          </p>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>

      <p className="text-center">
        <Link to="/courses" className="text-brand hover:underline">
          ← กลับไปรายการคอร์ส
        </Link>
      </p>
    </div>
  )
}
