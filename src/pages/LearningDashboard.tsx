import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/axios'

type Enrollment = {
  courseId: number
  courseTitle: string
  courseCover: string | null
  progressPercentage: number
  lastAccessedAt: string | null
}

type EnrollmentsResponse = {
  data: Enrollment[]
  message: string
}

export default function LearningDashboard() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoggedIn) {
      navigate('/auth/login?redirect=/learning', { replace: true })
      return
    }

    const fetchEnrollments = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<EnrollmentsResponse>('/me/enrollments')
        const enrollmentsData = response.data.data || []
        setEnrollments(Array.isArray(enrollmentsData) ? enrollmentsData : [])
      } catch (err: any) {
        if (err.response?.status === 401) {
          navigate('/auth/login?redirect=/learning', { replace: true })
        } else {
          setError(err.response?.data?.message || 'โหลดคอร์สของคุณไม่สำเร็จ')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchEnrollments()
  }, [isLoggedIn, navigate])

  // Don't render anything if redirecting
  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">การเรียนของฉัน</h1>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">การเรียนของฉัน</h1>
          <p className="mt-2 text-slate-600">
            ดำเนินการเรียนต่อและติดตามความก้าวหน้าของคุณ
          </p>
        </div>

      {/* Courses Grid */}
      {enrollments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-8 w-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            ยังไม่มีคอร์ส
          </h3>
          <p className="mt-2 text-slate-600">
            เริ่มเรียนโดยการลงทะเบียนคอร์ส
          </p>
          <Link
            to="/courses"
            className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
          >
            ดูคอร์สทั้งหมด
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.courseId}
              className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-200 hover:shadow-lg"
            >
              {/* Cover Image */}
              <div className="relative h-40 w-full overflow-hidden bg-slate-200">
                {enrollment.courseCover ? (
                  <img
                    src={enrollment.courseCover || ''}
                    alt={enrollment.courseTitle}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-300 to-slate-400">
                    <span className="text-4xl text-white opacity-50">📚</span>
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-5">
                <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                  {enrollment.courseTitle}
                </h3>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">ความก้าวหน้า</span>
                    <span className="font-medium text-slate-900">
                      {Math.round(enrollment.progressPercentage || 0)}%
                    </span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.max(enrollment.progressPercentage || 0, 0)}%`,
                        backgroundColor: '#2563eb',
                        minWidth: (enrollment.progressPercentage || 0) > 0 ? '2px' : '0px'
                      }}
                    />
                  </div>
                </div>

                {/* Continue Button */}
                <Link
                  to={`/learning/${enrollment.courseId}`}
                  className="mt-4 block w-full rounded-lg bg-[#2563eb] px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
                >
                  เรียนต่อ
                </Link>

                {/* Last Accessed */}
                {enrollment.lastAccessedAt && (
                  <p className="mt-3 text-xs text-slate-500">
                    เข้าถึงล่าสุด:{' '}
                    {new Date(enrollment.lastAccessedAt).toLocaleDateString('th-TH')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
