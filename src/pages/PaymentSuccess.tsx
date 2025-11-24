import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const params = useParams<{ courseId?: string }>()
  const { isLoggedIn } = useAuthStore()
  const [courseId, setCourseId] = useState<string | null>(null)

  useEffect(() => {
    // Extract courseId from URL path or params
    if (params.courseId) {
      setCourseId(params.courseId)
    } else {
      const pathParts = window.location.pathname.split('/')
      const learningIndex = pathParts.indexOf('learning')
      if (learningIndex !== -1 && pathParts[learningIndex + 1]) {
        setCourseId(pathParts[learningIndex + 1])
      }
    }

    // If not logged in, redirect to login
    if (!isLoggedIn) {
      const redirectPath = window.location.pathname + window.location.search
      navigate(`/auth/login?redirect=${encodeURIComponent(redirectPath)}`, { replace: true })
      return
    }

    // Redirect to learning page after 3 seconds
    if (courseId) {
      const timer = setTimeout(() => {
        navigate(`/learning/${courseId}`, { replace: true })
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      // If no courseId, redirect to learning dashboard
      const timer = setTimeout(() => {
        navigate('/learning', { replace: true })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [isLoggedIn, navigate, courseId])

  // Get payment details from query params
  const paymentId = searchParams.get('idpay')
  const amount = searchParams.get('amount')
  const paymentMethod = searchParams.get('paymentMethod')
  const customerName = searchParams.get('name_customer')
  const datetime = searchParams.get('datetime')

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-green-200 bg-white p-8 shadow-xl">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-12 w-12 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Payment Successful!
          </h1>
          <p className="mb-6 text-slate-600">
            Your payment has been processed successfully.
          </p>

          {/* Payment Details */}
          <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left">
            {customerName && (
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Customer:</span>
                <span className="font-medium text-slate-900">{customerName}</span>
              </div>
            )}
            {amount && (
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Amount:</span>
                <span className="font-medium text-slate-900">
                  {new Intl.NumberFormat('th-TH', {
                    style: 'currency',
                    currency: 'THB',
                  }).format(parseFloat(amount))}
                </span>
              </div>
            )}
            {paymentMethod && (
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Payment Method:</span>
                <span className="font-medium text-slate-900">
                  {paymentMethod === 'CREDIT_CARD' ? 'Credit Card' : paymentMethod}
                </span>
              </div>
            )}
            {paymentId && (
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-600">Transaction ID:</span>
                <span className="font-mono text-xs text-slate-900">{paymentId}</span>
              </div>
            )}
            {datetime && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Date:</span>
                <span className="font-medium text-slate-900">{datetime}</span>
              </div>
            )}
          </div>

          {/* Redirect Message */}
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              Redirecting you to your course...
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-blue-200">
              <div className="h-full w-full animate-pulse bg-blue-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

