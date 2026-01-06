import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/axios'
import { getCourseUrlIdentifier } from '../utils/courseHelper'

type Course = {
  id: number
  title: string
  slug: string
  summary: string | null
  price: number
  coverImage: string | null
  teacher: {
    id: number
    name: string
  } | null
}

type CoursesResponse = {
  data: {
    data: Course[]
    meta: {
      page: number
      limit: number
      totalItems: number
      totalPages: number
    }
  }
  message: string
}

export default function CoursesCatalog() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }
        params.append('limit', '20')

        const response = await apiClient.get<CoursesResponse>(
          `/courses/public?${params.toString()}`
        )

        // Backend wraps response: { data: { data: [...], meta: {...} }, message: "..." }
        const coursesData = response.data.data?.data || []
        setCourses(Array.isArray(coursesData) ? coursesData : [])
      } catch (err: any) {
        setError(err.response?.data?.message || 'โหลดคอร์สไม่สำเร็จ')
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchCourses()
    }, searchQuery ? 300 : 0)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-6">
        <h1 className="text-4xl font-bold text-slate-900">คอร์สทั้งหมด</h1>
        <div className="max-w-md">
          <input
            type="text"
            placeholder="ค้นหาคอร์ส..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      )}

      {/* Courses Grid */}
      {!isLoading && !error && (
        <>
          {courses.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <p className="text-slate-600">
                {searchQuery
                  ? 'ไม่พบคอร์สที่ตรงกับการค้นหา'
                  : 'ยังไม่มีคอร์สในขณะนี้'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage || ''}
                        alt={course.title}
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
                      {course.title}
                    </h3>

                    {course.summary && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                        {course.summary}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-slate-500">
                        {course.teacher ? (
                          <span>โดย {course.teacher.name}</span>
                        ) : (
                          <span className="text-slate-400">ไม่มีผู้สอน</span>
                        )}
                      </div>
                      <div className="text-lg font-semibold text-brand">
                        {course.price > 0 ? formatPrice(course.price) : 'ฟรี'}
                      </div>
                    </div>

                    <Link
                      to={`/courses/${getCourseUrlIdentifier(course)}`}
                      className="mt-4 block w-full rounded-lg bg-[#003366] px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#002244]"
                    >
                      รายละเอียด
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
