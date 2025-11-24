import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/axios'
import { isYouTubeUrl, getVideoSource } from '../utils/videoHelper'
import PaymentSuccess from './PaymentSuccess'

type Lesson = {
  id: number
  title: string
  contentType: string
  contentUrl: string | null
  contentText: string | null
  duration: number | null
  sortOrder: number
}

type Section = {
  id: number
  title: string
  sortOrder: number
  videoUrl: string | null
  attachmentUrl: string | null
  lessons: Lesson[]
}

type CourseData = {
  course: {
    id: number
    title: string
    description: string | null
    teacher: {
      id: number
      name: string
    } | null
    sections: Section[]
  }
  progress: {
    completedLessons: number
    totalLessons: number
    percentage: number
  }
}

type CourseResponse = {
  data: CourseData
  message: string
}

export default function LearningCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoggedIn } = useAuthStore()

  // Check if this is a payment success redirect (has MoneySpace query params)
  const hasPaymentParams = searchParams.has('idpay') || searchParams.has('paymentMethod')
  
  // If it's a payment success redirect, show PaymentSuccess component
  if (hasPaymentParams) {
    return <PaymentSuccess />
  }
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [currentSection, setCurrentSection] = useState<Section | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth/login?redirect=/learning', { replace: true })
      return
    }

    if (!courseId) {
      setError('Invalid course ID')
      setIsLoading(false)
      return
    }

    const fetchCourse = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get<CourseResponse>(
          `/me/courses/${courseId}`
        )

        const data = response.data.data
        setCourseData(data)

        console.log('📹 Course Data:', data)
        console.log('📹 Sections:', data.course.sections)
        
        // Set first lesson as current if available
        if (data.course.sections.length > 0) {
          const firstSection = data.course.sections[0]
          setCurrentSection(firstSection)
          
          console.log('📹 First Section:', firstSection)
          console.log('📹 First Section Lessons:', firstSection.lessons)

          if (firstSection.lessons.length > 0) {
            const firstLesson = firstSection.lessons[0]
            console.log('📹 First Lesson:', firstLesson)
            console.log('📹 First Lesson ContentType:', firstLesson.contentType)
            console.log('📹 First Lesson ContentUrl:', firstLesson.contentUrl)
            setCurrentLesson(firstLesson)
          } else if (firstSection.videoUrl) {
            // If section has video but no lessons, we'll show section video
            console.log('📹 Section has videoUrl:', firstSection.videoUrl)
            setCurrentLesson(null)
          }
        }

        // Expand first section by default
        if (data.course.sections.length > 0) {
          setExpandedSections(new Set([data.course.sections[0].id]))
        }
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/auth/login?redirect=/learning', { replace: true })
        } else {
          setError(err.response?.data?.message || 'Failed to load course')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, isLoggedIn, navigate])

  const handleLessonClick = (lesson: Lesson, section: Section) => {
    setCurrentLesson(lesson)
    setCurrentSection(section)
    // Expand the section if not already expanded
    setExpandedSections((prev) => new Set([...prev, section.id]))
  }

  const handleSectionClick = (section: Section) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(section.id)) {
        next.delete(section.id)
      } else {
        next.add(section.id)
      }
      return next
    })
  }

  const handleLessonComplete = async () => {
    if (!courseId) return

    // If there's a current lesson, mark it as complete
    if (currentLesson) {
      try {
        await apiClient.post('/me/progress', {
          courseId: Number(courseId),
          lessonId: currentLesson.id,
        })

        // Refresh course data to update progress
        const response = await apiClient.get<CourseResponse>(
          `/me/courses/${courseId}`
        )
        setCourseData(response.data.data)
      } catch (err) {
        console.error('Failed to update progress', err)
      }
    } else if (currentSection) {
      // For section videos, we can't mark a specific lesson as complete
      // But we can show a message or refresh the data
      try {
        const response = await apiClient.get<CourseResponse>(
          `/me/courses/${courseId}`
        )
        setCourseData(response.data.data)
      } catch (err) {
        console.error('Failed to refresh course data', err)
      }
    }
  }

  const getContentTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return '🎥'
      case 'text':
        return '📄'
      case 'file':
        return '📎'
      default:
        return '📝'
    }
  }

  if (!isLoggedIn) {
    return null
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
      </div>
    )
  }

  if (error || !courseData) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
        <p className="text-red-700">{error || 'ไม่พบคอร์ส'}</p>
        <button
          onClick={() => navigate('/learning')}
          className="mt-4 text-brand hover:text-brand/80"
        >
          ← กลับไปยังการเรียน
        </button>
      </div>
    )
  }

  const { course, progress } = courseData

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">ความก้าวหน้าคอร์ส</span>
          <span className="font-semibold text-slate-900">
            {Math.round(progress.percentage)}%
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.max(progress.percentage || 0, 0)}%`,
              backgroundColor: '#2563eb',
              minWidth: (progress.percentage || 0) > 0 ? '2px' : '0px'
            }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          เรียนเสร็จแล้ว {progress.completedLessons} จาก {progress.totalLessons} บทเรียน
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{course.title}</h1>
            {course.teacher && (
              <p className="mt-2 text-slate-600">
                ผู้สอน: <span className="font-medium">{course.teacher.name}</span>
              </p>
            )}
          </div>

          {/* Current Lesson/Content */}
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            {currentLesson ? (
              <>
                <h2 className="mb-4 text-xl font-semibold text-slate-900">
                  {currentLesson.title}
                </h2>

                {/* Video Content */}
                {currentLesson.contentType === 'video' ? (
                  currentLesson.contentUrl ? (
                    <div className="space-y-4">
                      <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
                        {isYouTubeUrl(currentLesson.contentUrl) ? (
                          <iframe
                            src={getVideoSource(currentLesson.contentUrl)}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={currentLesson.title}
                            style={{ pointerEvents: 'auto' }}
                          />
                        ) : (
                          <video
                            src={getVideoSource(currentLesson.contentUrl) || ''}
                            controls
                            className="h-full w-full"
                            onEnded={handleLessonComplete}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                      <button
                        onClick={handleLessonComplete}
                        className="w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
                      >
                        ✓ ทำเครื่องหมายว่าเรียนเสร็จแล้ว
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <p className="text-yellow-800">
                        ⚠️ Video URL is missing for this lesson. Please add a video URL in the admin panel.
                      </p>
                    </div>
                  )
                ) : null}

                {/* Text Content */}
                {currentLesson.contentType === 'text' && (
                  <div className="prose prose-slate max-w-none">
                    {currentLesson.contentText ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: currentLesson.contentText }}
                      />
                    ) : (
                      <p className="text-slate-600">ไม่มีเนื้อหา</p>
                    )}
                    <button
                      onClick={handleLessonComplete}
                      className="mt-4 w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
                    >
                      ✓ ทำเครื่องหมายว่าเรียนเสร็จแล้ว
                    </button>
                  </div>
                )}

                {/* File Content */}
                {currentLesson.contentType === 'file' && currentLesson.contentUrl && (
                  <div className="space-y-4">
                    <p className="text-slate-600">
                      ดาวน์โหลดไฟล์เพื่อดูบทเรียนนี้
                    </p>
                    <div className="flex gap-2">
                      <a
                        href={currentLesson.contentUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
                      >
                        📎 เปิดไฟล์
                      </a>
                      <a
                        href={currentLesson.contentUrl || '#'}
                        download
                        className="inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                      >
                        💾 ดาวน์โหลด
                      </a>
                    </div>
                    <button
                      onClick={handleLessonComplete}
                      className="mt-2 w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
                    >
                      ✓ ทำเครื่องหมายว่าเรียนเสร็จแล้ว
                    </button>
                  </div>
                )}
              </>
            ) : currentSection && currentSection.videoUrl ? (
              <>
                <h2 className="mb-4 text-xl font-semibold text-slate-900">
                  {currentSection.title}
                </h2>
                <div className="space-y-4">
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-slate-900">
                    {isYouTubeUrl(currentSection.videoUrl) ? (
                      <iframe
                        src={getVideoSource(currentSection.videoUrl)}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={currentSection.title}
                        style={{ pointerEvents: 'auto' }}
                      />
                    ) : (
                      <video
                        src={getVideoSource(currentSection.videoUrl) || ''}
                        controls
                        className="h-full w-full"
                        onEnded={handleLessonComplete}
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                  <button
                    onClick={handleLessonComplete}
                    className="w-full rounded-lg bg-[#2563eb] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
                  >
                    ✓ ทำเครื่องหมายว่าเรียนเสร็จแล้ว
                  </button>
                </div>
                {currentSection.attachmentUrl && (
                  <div className="mt-4 space-y-2">
                    <a
                      href={currentSection.attachmentUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] shadow-sm"
                    >
                      📎 เปิดไฟล์แนบ
                    </a>
                    <a
                      href={currentSection.attachmentUrl || '#'}
                      download
                      className="ml-2 inline-block rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      💾 ดาวน์โหลดไฟล์
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-slate-500">
                <p>Select a lesson from the sidebar to start learning.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Curriculum Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Course Curriculum
              </h3>
              <div className="space-y-2">
                {course.sections.map((section) => (
                  <div
                    key={section.id}
                    className="overflow-hidden rounded-lg border border-slate-200"
                  >
                    <button
                      type="button"
                      onClick={() => handleSectionClick(section)}
                      className="flex w-full items-center justify-between bg-slate-50 px-3 py-3 text-left transition-colors hover:bg-slate-100"
                    >
                      <span className="text-sm font-medium text-slate-900">
                        {section.title}
                      </span>
                      <svg
                        className={`h-4 w-4 text-slate-500 transition-transform ${
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
                            <div className="px-3 py-2 text-xs text-slate-500">
                              No lessons
                            </div>
                          ) : (
                            section.lessons.map((lesson) => (
                              <button
                                key={lesson.id}
                                type="button"
                                onClick={() => handleLessonClick(lesson, section)}
                                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                                  currentLesson?.id === lesson.id
                                    ? 'bg-brand/10 text-brand'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-base">
                                  {getContentTypeIcon(lesson.contentType)}
                                </span>
                                <span className="flex-1">{lesson.title}</span>
                                {lesson.duration && (
                                  <span className="text-xs text-slate-500">
                                    {lesson.duration}m
                                  </span>
                                )}
                              </button>
                            ))
                          )}
                          {section.attachmentUrl && (
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentSection(section)
                                setCurrentLesson(null)
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                            >
                              <span className="text-base">📎</span>
                              <span className="flex-1">Section Materials</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
