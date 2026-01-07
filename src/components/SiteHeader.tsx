import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const navLinks = [
  { path: '/', label: 'หน้าแรก' },
  { path: '/courses', label: 'คอร์สทั้งหมด' },
  { path: '/learning', label: 'คอร์สของฉัน' },
  { path: '/contact', label: 'ติดต่อเรา' },
]

const getDesktopNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-full px-3 py-2 text-sm font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
    isActive
      ? 'bg-brand/10 text-brand'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ')

const getMobileNavClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group flex items-center gap-3 rounded-xl px-4 py-3.5 text-base font-semibold transition-all',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
    isActive
      ? 'bg-gradient-to-r from-brand/10 to-brand/5 text-brand shadow-sm'
      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100',
  ].join(' ')

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        className={[
          'origin-center stroke-current transition-[transform,opacity] duration-200',
          open ? 'translate-y-[6px] rotate-45' : '',
        ].join(' ')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 7h16"
      />
      <path
        className={[
          'origin-center stroke-current transition-opacity duration-200',
          open ? 'opacity-0' : 'opacity-100',
        ].join(' ')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 12h16"
      />
      <path
        className={[
          'origin-center stroke-current transition-[transform,opacity] duration-200',
          open ? 'translate-y-[-6px] -rotate-45' : '',
        ].join(' ')}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 17h16"
      />
    </svg>
  )
}

export default function SiteHeader() {
  const { isLoggedIn, user, logout } = useAuthStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const menuId = useId()

  const initial = useMemo(() => user?.name?.charAt(0)?.toUpperCase() ?? 'U', [user?.name])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Close user dropdown on outside click / escape
  useEffect(() => {
    if (!isDropdownOpen) return
    const onPointerDown = (e: MouseEvent) => {
      if (!dropdownRef.current) return
      if (dropdownRef.current.contains(e.target as Node)) return
      setIsDropdownOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isDropdownOpen])

  // Mobile drawer: lock scroll + escape to close + focus
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const triggerEl = mobileButtonRef.current

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu()
    }
    window.addEventListener('keydown', onKeyDown)

    // Focus close button (better for keyboard users)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
      // return focus to trigger button
      triggerEl?.focus()
    }
  }, [isMobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
        >
          <img
            src="/logo_MTRtutor.png"
            alt="MTR Tutor"
            className="h-10 w-auto"
            draggable={false}
          />
          <span className="sr-only">Tutor Online</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className={getDesktopNavClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/auth/login"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/auth/register"
                  className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1d4ed8] hover:text-white hover:shadow-lg"
                >
                  สมัครสมาชิก
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <span className="hidden max-w-[160px] truncate text-sm font-semibold text-slate-800 sm:inline">
                    {user?.name ?? 'ผู้ใช้'}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                    {initial}
                  </span>
                  <svg className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.937a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div
                  className={[
                    'absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl',
                    isDropdownOpen ? 'block' : 'hidden',
                  ].join(' ')}
                  role="menu"
                >
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500">เข้าสู่ระบบเป็น</p>
                    <p className="mt-0.5 truncate text-sm font-bold text-slate-900">{user?.name ?? 'ผู้ใช้'}</p>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <Link
                    to="/learning"
                    role="menuitem"
                    className="block px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    การเรียนของฉัน
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    onClick={() => {
                      logout()
                      setIsDropdownOpen(false)
                    }}
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileButtonRef}
            type="button"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-800 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 md:hidden"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls={menuId}
          >
            <HamburgerIcon open={isMobileMenuOpen} />
          </button>
        </div>
      </div>

      {/* Mobile drawer (always mounted for smooth animation) */}
      <div
        id={menuId}
        className={[
          'fixed inset-0 z-50 md:hidden',
          isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        ].join(' ')}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          className={[
            'absolute inset-0 bg-slate-900/40 transition-opacity duration-200',
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
          aria-label="Close menu"
          onClick={closeMobileMenu}
          tabIndex={isMobileMenuOpen ? 0 : -1}
        />

        {/* Panel */}
        <aside
          className={[
            'absolute right-0 top-0 h-full w-[86%] max-w-sm',
            'border-l border-slate-200 bg-white shadow-2xl',
            'transition-transform duration-300 ease-out',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                <svg className="h-5 w-5 text-brand" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">เมนู</span>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 active:scale-95"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              tabIndex={isMobileMenuOpen ? 0 : -1}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[calc(100%-73px)] flex-col overflow-y-auto">
            <nav className="flex flex-col gap-1.5 px-4 py-5" aria-label="Mobile primary navigation">
              {navLinks.map((link) => {
                const iconMap: Record<string, React.ReactElement> = {
                  '/': (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  '/courses': (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  '/learning': (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                  '/contact': (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ),
                }
                const icon = iconMap[link.path] || (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={getMobileNavClass}
                    onClick={closeMobileMenu}
                  >
                    <span className="flex-shrink-0">{icon}</span>
                    <span className="flex-1">{link.label}</span>
                    <svg className="h-4 w-4 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </NavLink>
                )
              })}
            </nav>

            {/* Auth Section */}
            <div className="mt-auto border-t border-slate-200 bg-gradient-to-b from-white to-slate-50/50 px-4 py-5">
              {!isLoggedIn ? (
                <div className="space-y-3">
                  <Link
                    to="/auth/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
                    onClick={closeMobileMenu}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    to="/auth/register"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-[#1d4ed8] px-4 py-3.5 text-center text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:from-[#1d4ed8] hover:to-[#1e40af] active:scale-[0.98]"
                    onClick={closeMobileMenu}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    สมัครสมาชิก
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand/10 text-base font-bold text-brand shadow-sm">
                      {initial}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">{user?.name ?? 'ผู้ใช้'}</p>
                      <p className="text-xs font-medium text-slate-500">บัญชีของคุณ</p>
                    </div>
                  </div>
                  <div className="grid gap-2.5">
                    <Link
                      to="/learning"
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
                      onClick={closeMobileMenu}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      การเรียนของฉัน
                    </Link>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-center text-sm font-semibold text-red-700 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:shadow-md active:scale-[0.98]"
                      onClick={() => {
                        logout()
                        closeMobileMenu()
                      }}
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </header>
  )
}


