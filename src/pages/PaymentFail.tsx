import { useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function PaymentFail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoggedIn } = useAuthStore()

  useEffect(() => {
    // If not logged in, redirect to login
    if (!isLoggedIn) {
      navigate('/auth/login', { replace: true })
    }
  }, [isLoggedIn, navigate])

  const paymentId = searchParams.get('idpay')
  const errorMessage = searchParams.get('message') || 'Payment failed or was cancelled'

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-rose-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-12 w-12 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Payment Failed
          </h1>
          <p className="mb-6 text-slate-600">{errorMessage}</p>

          {/* Payment Details */}
          {paymentId && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Transaction ID:</span>
                <span className="font-mono text-xs text-slate-900">{paymentId}</span>
              </div>
            </div>
          )}

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

