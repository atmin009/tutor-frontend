import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../api/axios'
import { getCourseUrlIdentifier } from '../utils/courseHelper'
import BannerSlider from '../components/BannerSlider'

interface Course {
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

interface CoursesResponse {
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

export default function Home() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch featured courses (first 6)
        const featuredResponse = await apiClient.get<CoursesResponse>(
          '/courses/public?limit=6'
        )
        const featuredData = featuredResponse.data.data?.data || []
        setFeaturedCourses(Array.isArray(featuredData) ? featuredData.slice(0, 6) : [])

        // Fetch all courses (first 12)
        const allResponse = await apiClient.get<CoursesResponse>(
          '/courses/public?limit=12'
        )
        const allData = allResponse.data.data?.data || []
        setAllCourses(Array.isArray(allData) ? allData : [])
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-16">
      {/* Hero Banner Section - Full width */}
      <BannerSlider />

      {/* SEO-friendly Hero Content (separate from slide visuals) */}
      <header className="mx-auto max-w-4xl text-center">
        <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl md:text-5xl">
          ติวออนไลน์ คณิตศาสตร์ และวิทยาศาสตร์ ระดับประถมปลาย
        </h1>
        <p className="mt-4 text-base font-semibold text-slate-700 sm:text-lg md:text-2xl">
          ครอบคลุมเนื้อหาอย่างละเอียด ตั้งแต่พื้นฐานจนถึงการประยุกต์
        </p>
        <p className="mt-4 text-sm text-slate-600 sm:text-base md:text-lg">
          เหมาะสำหรับนักเรียนที่ต้องการเสริมความเข้าใจ เพิ่มผลการเรียน และเตรียมสอบอย่างมั่นใจ
        </p>
        <p className="mt-3 text-sm text-slate-600 sm:text-base">
          ออกแบบบทเรียนให้เข้าใจง่าย เป็นระบบ
          ช่วยวางรากฐานที่แข็งแรง พร้อมต่อยอดสู่ระดับมัธยมได้อย่างมีประสิทธิภาพ
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/courses"
            className="rounded-full bg-brand px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8] hover:text-white hover:shadow-lg sm:px-8 sm:py-4 sm:text-base"
          >
            ดูคอร์สทั้งหมด
          </Link>
          <Link
            to="/auth/register"
            className="rounded-full border-2 border-brand/30 bg-white px-7 py-3 text-sm font-semibold text-brand shadow-sm transition-all hover:border-brand hover:bg-slate-50 sm:px-8 sm:py-4 sm:text-base"
          >
            เริ่มเรียนเลย
          </Link>
        </div>
      </header>

      {/* Key Benefits Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            ทำไมต้องติวออนไลน์กับเรา
          </h2>
          <p className="mt-4 text-lg text-slate-700">
            เรียนได้ทุกที่ทุกเวลา
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              title: 'เนื้อหาครบถ้วน ตั้งแต่พื้นฐานจนถึงการประยุกต์',
              description: 'ครอบคลุมทุกหัวข้อสำคัญในหลักสูตรระดับประถมปลาย ทั้งคณิตศาสตร์และวิทยาศาสตร์ เน้นความเข้าใจที่ลึกซึ้ง',
            },
            {
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
              title: 'เน้น 2 วิชาหลัก คณิตศาสตร์ – วิทยาศาสตร์',
              description: 'เหมาะสำหรับนักเรียนที่ต้องการเสริมความเข้าใจ เพิ่มผลการเรียน และวางรากฐานที่แข็งแรง',
            },
            {
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ),
              title: 'เรียนออนไลน์ได้ทุกอุปกรณ์',
              description: 'มือถือ แท็บเล็ต คอมพิวเตอร์ เลือกเรียนได้ตามสะดวก',
            },
            {
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
              title: 'ระบบแบบฝึกหัด–เฉลยละเอียด',
              description: 'มีวิดีโอสอน, แบบทดสอบ, เฉลยทีละขั้นตอน ช่วยให้นักเรียนเข้าใจมากขึ้น',
            },
            {
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
              title: 'ออกแบบบทเรียนให้เข้าใจง่าย เป็นระบบ',
              description: 'บทเรียนจัดเรียงอย่างเป็นระบบ ช่วยให้เรียนรู้ได้อย่างมีประสิทธิภาพ พร้อมต่อยอดสู่ระดับมัธยม',
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                {benefit.icon}
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
                คอร์สเรียนแนะนำ
              </h2>
          <p className="mt-2 text-lg text-slate-700">
            คอร์สยอดนิยมที่นักเรียนเลือกเรียนมากที่สุด
          </p>
            </div>
            <Link
              to="/courses"
              className="hidden rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 md:block"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${getCourseUrlIdentifier(course)}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
                  </div>
                  <div className="p-5">
                    <h3 className="line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-brand">
                      {course.title}
                    </h3>
                    {course.summary && (
                      <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                        {course.summary}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        {course.teacher && (
                          <p className="text-xs text-slate-600">โดย {course.teacher.name}</p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-brand">{formatPrice(course.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Platform Features Section */}
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 md:p-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold text-slate-900 md:text-4xl">
            ระบบเรียนออนไลน์ใช้งานง่าย
          </h2>
          <p className="mt-4 text-center text-lg text-slate-700">
            แพลตฟอร์มของเราออกแบบเพื่อให้นักเรียนใช้งานได้ทันที ไม่ซับซ้อน
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { icon: '📹', title: 'วิดีโอเรียนย้อนหลังได้ไม่จำกัด', description: 'ดูซ้ำกี่ครั้งก็ได้ จนกว่าจะเข้าใจ' },
              { icon: '📊', title: 'ติดตามความคืบหน้าได้', description: 'ดูความก้าวหน้าในการเรียนของคุณ' },
              { icon: '💬', title: 'สอบถามได้ตลอดเวลา', description: 'มีทีมสนับสนุนพร้อมช่วยเหลือ' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl">{feature.icon}</div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Enroll Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            สมัครเรียนง่ายใน 3 ขั้นตอน
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { step: '1', title: 'เลือกคอร์สที่ต้องการ', description: 'เลือกคอร์สที่เหมาะกับระดับชั้นและเป้าหมายของคุณ' },
            { step: '2', title: 'สมัครสมาชิกและชำระเงิน', description: 'ลงทะเบียนและชำระเงินผ่านระบบที่ปลอดภัย' },
            { step: '3', title: 'เริ่มเรียนได้ทันที', description: 'เข้าสู่ระบบและเริ่มเรียนได้เลย ไม่ต้องรอ' },
          ].map((item, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm text-slate-700">{item.description}</p>
              </div>
              {index < 2 && (
                <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-full text-slate-300 md:block">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* All Courses Section */}
      {allCourses.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
                คอร์สทั้งหมด
              </h2>
              <p className="mt-2 text-lg text-slate-700">
                ดูคอร์สเรียนทั้งหมดที่มีให้เลือก
              </p>
            </div>
            <Link
              to="/courses"
              className="hidden rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 md:block"
            >
              ดูทั้งหมด →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-xl bg-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {allCourses.slice(0, 8).map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${getCourseUrlIdentifier(course)}`}
                  className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {course.coverImage ? (
                      <img
                        src={course.coverImage}
                        alt={course.title}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                        <svg className="h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-brand">
                      {course.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      {course.teacher && (
                        <p className="text-xs text-slate-600">โดย {course.teacher.name}</p>
                      )}
                      <p className="text-base font-bold text-brand">{formatPrice(course.price)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-center text-white md:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-brand/10 to-transparent"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
            หากคุณกำลังมองหา ติวออนไลน์ คณิตศาสตร์ และวิทยาศาสตร์ ระดับประถมปลาย
          </h2>
          <p className="mt-4 text-lg text-white drop-shadow-sm">
            ด้วยบทเรียนที่ออกแบบให้เข้าใจง่าย เป็นระบบ <strong className="font-bold">บริษัท มีเดียแอนด์เทรนนิ่ง จำกัด</strong> ช่วยให้นักเรียนเสริมความเข้าใจ เพิ่มผลการเรียน และวางรากฐานที่แข็งแรง พร้อมต่อยอดสู่ระดับมัธยมได้อย่างมีประสิทธิภาพ
          </p>
          <div className="mt-8">
            <Link
              to="/courses"
              className="inline-block rounded-full bg-white px-8 py-4 text-base font-semibold text-slate-900 shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
            >
              เริ่มต้นเรียนวันนี้ เพื่อคะแนนที่ดีขึ้นในอนาคต
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
