import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navLinks = [
  { path: '/', label: 'หน้าแรก' },
  { path: '/courses', label: 'คอร์สทั้งหมด' },
  { path: '/learning', label: 'คอร์สของฉัน' },
  { path: '/contact', label: 'ติดต่อเรา' },
]

const getNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'text-sm font-medium transition-colors hover:text-brand',
    isActive ? 'text-brand' : 'text-slate-600',
  ].join(' ')

export default function MainLayout() {
  const { isLoggedIn, user, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link to="/" className="text-lg font-semibold text-brand">
            Tutor Online
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={getNavClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="flex items-center justify-center p-2 text-slate-600 hover:text-brand md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-4 md:flex">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/auth/login"
                  className="rounded-full border-2 border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:bg-slate-50 hover:text-brand"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/auth/register"
                  className="rounded-full bg-[#2563eb] px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8] hover:shadow-lg"
                >
                  สมัครสมาชิก
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-3 rounded-full border border-slate-200 px-3 py-1.5"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <span className="text-sm font-medium text-slate-700">{user?.name ?? 'ผู้ใช้'}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                    {initial}
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-lg border border-slate-200 bg-white shadow-lg">
                    <Link
                      to="/learning"
                      className="block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      การเรียนของฉัน
                    </Link>
                    <button
                      type="button"
                      className="block w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        logout()
                        setIsDropdownOpen(false)
                      }}
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t bg-white md:hidden">
            <nav className="flex flex-col px-4 py-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={getNavClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              {!isLoggedIn ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4">
                  <Link
                    to="/auth/login"
                    className="rounded-lg border-2 border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:border-brand hover:bg-slate-50 hover:text-brand"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    to="/auth/register"
                    className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8] hover:shadow-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              ) : (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <div className="mb-2 flex items-center gap-3 px-4 py-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
                      {initial}
                    </span>
                    <span className="text-sm font-medium text-slate-700">{user?.name ?? 'ผู้ใช้'}</span>
                  </div>
                  <Link
                    to="/learning"
                    className="block rounded-lg px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    การเรียนของฉัน
                  </Link>
                  <button
                    type="button"
                    className="mt-2 block w-full rounded-lg px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => {
                      logout()
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-10">
          <Outlet />
        </div>
      </main>

      <footer className="border-t bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">Media & Training Co., Ltd.</h3>
              <p className="mt-2 text-sm text-slate-600">
                ติวออนไลน์ครบทุกระดับชั้น ประถม – ม.ต้น – ม.ปลาย
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">ติดต่อเรา</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:0952605168" className="hover:text-brand">095-260-5168</a>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:training.mtr4263@gmail.com" className="hover:text-brand break-all">
                    training.mtr4263@gmail.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.058 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                  <a href="https://line.me/R/ti/p/@mtr4263" target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                    @mtr4263
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <a href="https://www.facebook.com/MediaAndTraining" target="_blank" rel="noopener noreferrer" className="hover:text-brand">
                    Media & Training Co., Ltd.
                  </a>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">ที่อยู่</h3>
              <div className="mt-4 space-y-4 text-sm text-slate-600">
                <div>
                  <p className="font-semibold text-slate-700">สำนักงานใหญ่</p>
                  <p className="mt-1 leading-relaxed">
                    49/19 หมู่ที่ 5 ตำบลนาตาล่วง<br />
                    อำเภอเมือง จังหวัดตรัง 92000
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700">สาขาหนองจอก</p>
                  <p className="mt-1 leading-relaxed">
                    เลขที่ 107/225 ซอยสุวินทวงศ์ 38<br />
                    แขวงลำผักชี เขตหนองจอก<br />
                    กรุงเทพมหานคร 10530
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold text-slate-900">ลิงก์ด่วน</h3>
              <div className="mt-4 space-y-2 text-sm">
                <Link to="/" className="block text-slate-600 hover:text-brand">
                  หน้าแรก
                </Link>
                <Link to="/courses" className="block text-slate-600 hover:text-brand">
                  คอร์สทั้งหมด
                </Link>
                <Link to="/contact" className="block text-slate-600 hover:text-brand">
                  ติดต่อเรา
                </Link>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="text-center">
              <p className="mb-4 text-sm font-medium text-slate-700">ช่องทางการชำระเงินที่รองรับ</p>
              <div className="flex justify-center">
                <img
                  src="/PayLogo.png"
                  alt="Accepted Payment Methods"
                  className="h-12 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Media & Training Co., Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}


