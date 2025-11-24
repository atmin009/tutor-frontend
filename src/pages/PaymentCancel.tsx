import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function PaymentCancel() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      navigate('/auth/login', { replace: true })
    }
  }, [isLoggedIn, navigate])

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-yellow-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          {/* Cancel Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-12 w-12 text-yellow-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Cancel Message */}
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Payment Cancelled
          </h1>
          <p className="mb-6 text-slate-600">
            Your payment was cancelled. No charges were made.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/courses"
              className="block w-full rounded-lg bg-brand px-4 py-3 text-center text-sm font-semibold text-white shadow-lg hover:bg-brand/90 transition-colors"
            >
              Browse Courses
            </Link>
            <Link
              to="/learning"
              className="block w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Go to My Learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

