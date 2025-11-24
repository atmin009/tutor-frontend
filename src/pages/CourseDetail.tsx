import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/axios'
import { isYouTubeUrl, getVideoSource } from '../utils/videoHelper'

type Section = {
  id: number
  title: string
  videoUrl: string | null
  attachmentUrl: string | null
  lessons: Lesson[]
}

type Lesson = {
  id: number
  title: string
  contentType: string
  contentUrl: string | null
  contentText: string | null
  duration: number | null
  sortOrder: number
}

type Course = {
  id: number
  title: string
  slug: string
  description: string | null
  summary: string | null
  price: number
  salePrice: number | null
  coverImage: string | null
  previewVideoUrl: string | null
  teacher: {
    id: number
    name: string
    avatarUrl: string | null
  } | null
  sections: Section[]
}

type CourseResponse = {
  data: Course
  message: string
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { isLoggedIn, user } = useAuthStore()
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [isEnrolled, setIsEnrolled] = useState(false)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!slug) return

      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<CourseResponse>(
          `/courses/${slug}/public`
        )

        const courseData = response.data.data
        console.log('📹 Course Detail Data:', courseData)
        console.log('📹 Preview Video URL:', courseData.previewVideoUrl)
        console.log('📹 Sections:', courseData.sections)
        setCourse(courseData)

        // Check enrollment if logged in
        if (isLoggedIn && user && courseData.id) {
          try {
            const enrollmentResponse = await apiClient.get<{
              data: { isEnrolled: boolean }
              message: string
            }>(`/me/check-enrollment/${courseData.id}`)
            setIsEnrolled(enrollmentResponse.data.data.isEnrolled)
          } catch (err: any) {
            // If 401 or 404, user is not enrolled
            if (err.response?.status === 401 || err.response?.status === 404) {
              setIsEnrolled(false)
            } else {
              console.error('Failed to check enrollment:', err)
              setIsEnrolled(false)
            }
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'โหลดคอร์สไม่สำเร็จ')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [slug, isLoggedIn, user])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      return next
    })
  }

  const getContentTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return '🎥 Video'
      case 'text':
        return '📄 Text'
      case 'file':
        return '📎 File'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
        <p className="text-red-700">{error || 'ไม่พบคอร์ส'}</p>
        <Link
          to="/courses"
          className="mt-4 inline-block text-brand hover:text-brand/80"
        >
          ← กลับไปยังรายการคอร์ส
        </Link>
      </div>
    )
  }

  const hasSale = course.salePrice !== null && course.salePrice < course.price

  return (
    <div className="space-y-8">
      {/* Cover Image Banner */}
      {course.coverImage && (
        <div className="relative h-64 w-full overflow-hidden rounded-xl bg-slate-200 md:h-80">
          <img
            src={course.coverImage || ''}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Course Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title and Basic Info */}
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{course.title}</h1>
            {course.teacher && (
              <p className="mt-2 text-lg text-slate-600">
                ผู้สอน: <span className="font-medium">{course.teacher.name}</span>
              </p>
            )}
            {course.summary && (
              <p className="mt-4 text-lg text-slate-700">{course.summary}</p>
            )}
          </div>

          {/* Key Highlights */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-2xl font-semibold text-slate-900">
              สิ่งที่คุณจะได้เรียนรู้
            </h2>
            {course.description ? (
              <div
                className="mt-4 prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            ) : (
              <ul className="mt-4 space-y-2 text-slate-600">
                <li className="flex items-start">
                  <span className="mr-2 text-brand">✓</span>
                  <span>เนื้อหาคอร์สที่ครอบคลุม</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-brand">✓</span>
                  <span>การสอนโดยผู้เชี่ยวชาญ</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-brand">✓</span>
                  <span>เข้าถึงได้ตลอดชีพ</span>
                </li>
              </ul>
            )}
          </div>

          {/* Preview Video */}
          {course.previewVideoUrl ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                Preview this course
              </h2>
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
                {isYouTubeUrl(course.previewVideoUrl) ? (
                  <iframe
                    src={getVideoSource(course.previewVideoUrl)}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="ตัวอย่างคอร์ส"
                    style={{ pointerEvents: 'auto' }}
                  />
                ) : (
                  <video
                    src={getVideoSource(course.previewVideoUrl) || ''}
                    controls
                    className="h-full w-full"
                  >
                    เบราว์เซอร์ของคุณไม่รองรับแท็กวิดีโอ
                  </video>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900">
                ตัวอย่างคอร์ส
              </h2>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-600">
                  ไม่มีวิดีโอตัวอย่างสำหรับคอร์สนี้
                </p>
              </div>
            </div>
          )}

          {/* Curriculum */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-6 text-2xl font-semibold text-slate-900">
              หลักสูตร
            </h2>
            <div className="space-y-2">
              {course.sections.length === 0 ? (
                <p className="text-slate-500">ยังไม่มีส่วนในคอร์สนี้</p>
              ) : (
                course.sections.map((section) => (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-lg border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(section.id)}
                      className="flex w-full items-center justify-between bg-slate-50 px-4 py-4 text-left transition-colors hover:bg-slate-100"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">
                          {section.title}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {section.lessons.length} บทเรียน
                        </p>
                      </div>
                      <svg
                        className={`h-5 w-5 text-slate-500 transition-transform ${
                          expandedSections.has(section.id) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {expandedSections.has(section.id) && (
                      <div className="border-t border-slate-200 bg-white">
                        <div className="divide-y divide-slate-100">
                          {section.lessons.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-slate-500">
                              ไม่มีบทเรียนในส่วนนี้
                            </div>
                          ) : (
                            section.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between px-4 py-3"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-sm text-slate-400">
                                    {getContentTypeLabel(lesson.contentType)}
                                  </span>
                                  <span className="text-sm text-slate-700">
                                    {lesson.title}
                                  </span>
                                </div>
                                {lesson.duration && (
                                  <span className="text-xs text-slate-500">
                                    {lesson.duration} min
                                  </span>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="space-y-4">
              {/* Price */}
              <div>
                {hasSale ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-slate-900">
                        {formatPrice(course.salePrice!)}
                      </span>
                      <span className="text-lg text-slate-500 line-through">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <span className="mt-1 inline-block rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                      กำลังลดราคา
                    </span>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-slate-900">
                    {course.price > 0 ? formatPrice(course.price) : 'ฟรี'}
                  </div>
                )}
              </div>

              {/* Action Button */}
              {!isLoggedIn ? (
                <Link
                  to="/auth/login"
                  className="block w-full rounded-lg bg-[#2563eb] px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#1d4ed8] hover:shadow-lg"
                >
                  เข้าสู่ระบบเพื่อซื้อ
                </Link>
              ) : isEnrolled ? (
                <Link
                  to={`/learning/${course.id}`}
                  className="block w-full rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  ไปเรียน
                </Link>
              ) : (
                <Link
                  to={`/checkout/${course.id}`}
                  className="block w-full rounded-lg bg-[#CC0000] px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#AA0000]"
                >
                  ซื้อคอร์ส
                </Link>
              )}

              {/* Course Info */}
              <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">ส่วน:</span>
                  <span className="font-medium text-slate-900">
                    {course.sections.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">บทเรียนทั้งหมด:</span>
                  <span className="font-medium text-slate-900">
                    {course.sections.reduce(
                      (acc, section) => acc + section.lessons.length,
                      0
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
