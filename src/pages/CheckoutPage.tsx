import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import apiClient from '../api/axios'

type PaymentSession = {
  orderId: string
  amount: number
  originalAmount?: number
  discountAmount?: number
  couponId?: number
  transactionId: string
  paymentUrl: string | null
  qrImageUrl: string | null
  courseTitle: string
}

type PaymentSessionResponse = {
  data: PaymentSession
  message: string
}

type PaymentStatus = {
  id: number
  orderId: string
  status: string
  amount: number
  paymentType: string | null
  transactionId: string | null
}

type PaymentStatusResponse = {
  data: PaymentStatus
  message: string
}

type PaymentMethod = 'qrnone' | 'card'

export default function CheckoutPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuthStore()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qrnone')
  const [qrSession, setQrSession] = useState<PaymentSession | null>(null)
  const [cardSession, setCardSession] = useState<PaymentSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string>('pending')
  const [isPolling, setIsPolling] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [originalPrice, setOriginalPrice] = useState<number | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate(`/auth/login?redirect=/checkout/${courseId}`, { replace: true })
      return
    }
  }, [isLoggedIn, navigate, courseId])

  // Fetch course price
  useEffect(() => {
    if (!isLoggedIn || !courseId) return

    const fetchCoursePrice = async () => {
      try {
        console.log('🔍 Fetching course price for courseId:', courseId)
        const response = await apiClient.get(`/courses/${courseId}/public`)
        console.log('✅ Course price response:', response.data)
        
        // Backend response format: { data: { id, title, price, ... }, message: "..." }
        if (response.data && response.data.data) {
          const course = response.data.data
          console.log('📊 Course data:', course)
          console.log('💰 Course price:', course.price)
          console.log('💰 Course salePrice:', course.salePrice)
          
          // Use salePrice if available, otherwise use price
          const finalPrice = course.salePrice !== null && course.salePrice !== undefined 
            ? course.salePrice 
            : course.price
          
          if (finalPrice !== null && finalPrice !== undefined) {
            setOriginalPrice(finalPrice)
          } else {
            console.warn('⚠️ Course price is null or undefined')
            setError('ไม่สามารถดึงราคาคอร์สได้')
          }
        } else {
          console.error('❌ Invalid response format:', response.data)
          setError('รูปแบบข้อมูลตอบกลับไม่ถูกต้อง')
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch course price:', err)
        console.error('❌ Error details:', {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          url: err.config?.url,
          baseURL: err.config?.baseURL,
        })
        
        const errorMessage = err.response?.data?.message 
          || err.response?.statusText 
          || err.message 
          || 'ไม่สามารถดึงราคาคอร์สได้'
        setError(errorMessage)
      }
    }

    fetchCoursePrice()
  }, [isLoggedIn, courseId])

  // Create QR payment session on mount
  useEffect(() => {
    if (!isLoggedIn || !courseId) return

    const createQrPayment = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await apiClient.post<PaymentSessionResponse>(
          '/payments/create',
          {
            courseId: Number(courseId),
            paymentType: 'qrnone',
            couponCode: appliedCoupon?.code || undefined,
          }
        )

        setQrSession(response.data.data)
        if (response.data.data.originalAmount) {
          setOriginalPrice(response.data.data.originalAmount)
        }
        setIsPolling(true)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to create payment session')
      } finally {
        setIsLoading(false)
      }
    }

    createQrPayment()
  }, [isLoggedIn, courseId, appliedCoupon])

  // Create card payment session when user selects card
  useEffect(() => {
    if (!isLoggedIn || !courseId || paymentMethod !== 'card' || cardSession) return

    const createCardPayment = async () => {
      setIsCreatingCard(true)
      setError(null)

      try {
        const response = await apiClient.post<PaymentSessionResponse>(
          '/payments/create',
          {
            courseId: Number(courseId),
            paymentType: 'card',
            couponCode: appliedCoupon?.code || undefined,
          }
        )

        setCardSession(response.data.data)
        if (response.data.data.originalAmount) {
          setOriginalPrice(response.data.data.originalAmount)
        }
        setIsPolling(true)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to create card payment session')
      } finally {
        setIsCreatingCard(false)
      }
    }

    createCardPayment()
  }, [isLoggedIn, courseId, paymentMethod, cardSession, appliedCoupon])

  // Poll payment status
  useEffect(() => {
    if (!isPolling) return

    const currentSession = paymentMethod === 'qrnone' ? qrSession : cardSession
    if (!currentSession?.orderId) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await apiClient.get<PaymentStatusResponse>(
          `/payments/status?orderId=${currentSession.orderId}`
        )

        const order = response.data.data
        const status = order.status
        const transactionId = order.transactionId || currentSession.transactionId
        
        console.log('📊 Payment status check:', {
          status,
          transactionId,
          orderId: currentSession.orderId,
          paymentMethod,
          hasTransactionId: !!transactionId,
        })
        setPaymentStatus(status)

        // Check if payment is successful
        // Status is "paid" OR has transaction ID but status is still "pending" (webhook might not have fired)
        // For QR code payments, if transaction ID exists, payment is likely successful
        const isPaid = status === 'paid' || (transactionId && status === 'pending' && paymentMethod === 'qrnone')
        
        if (isPaid && status !== 'paid') {
          console.log('⚠️ Payment has transaction ID but status is still pending, will confirm payment')
        }

        if (isPaid) {
          setIsPolling(false)
          clearInterval(pollInterval)

          // Confirm payment to ensure enrollment is created and status is updated
          if (currentSession?.orderId) {
            try {
              console.log('💳 Confirming payment with orderId:', currentSession.orderId)
              const confirmPayload: { orderId?: string; transactionId?: string } = {
                orderId: currentSession.orderId,
              }
              
              // Add transactionId if available
              if (transactionId) {
                confirmPayload.transactionId = transactionId
              }
              
              await apiClient.post('/payments/confirm', confirmPayload)
              console.log('✅ Payment confirmed and enrollment created')
            } catch (err: any) {
              console.error('❌ Failed to confirm payment:', err)
              // Continue anyway - might already be confirmed
            }
          }

          // Redirect to learning page after short delay
          setTimeout(() => {
            navigate(`/learning/${courseId}`, { replace: true })
          }, 2000)
        } else if (status === 'failed') {
          setIsPolling(false)
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error('Failed to check payment status', err)
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(pollInterval)
  }, [isPolling, paymentMethod, qrSession, cardSession, courseId, navigate])

  if (!isLoggedIn) {
    return null
  }

  const currentSession = paymentMethod === 'qrnone' ? qrSession : cardSession
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('กรุณาใส่โค้ดส่วนลด')
      return
    }

    setIsValidatingCoupon(true)
    setCouponError(null)

    try {
      const response = await apiClient.post('/coupons/validate', {
        code: couponCode.trim().toUpperCase(),
        courseId: Number(courseId),
      })

      if (response.data.data.discountAmount) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discountAmount: response.data.data.discountAmount,
        })
        setCouponError(null)
        // Reset sessions to recreate with coupon
        setQrSession(null)
        setCardSession(null)
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'โค้ดส่วนลดไม่ถูกต้อง')
      setAppliedCoupon(null)
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError(null)
    // Reset sessions to recreate without coupon
    setQrSession(null)
    setCardSession(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto" />
            <p className="text-slate-600">กำลังเตรียมการชำระเงิน...</p>
          </div>
      </div>
    )
  }

  if (error && !currentSession) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-brand hover:text-brand/80"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    )
  }

  if (!currentSession) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto w-full max-w-6xl px-4">
        {/* Success Message */}
        {paymentStatus === 'paid' && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6 text-center">
            <div className="mb-2 text-4xl">✅</div>
            <h2 className="text-xl font-semibold text-green-900">
              ชำระเงินสำเร็จ!
            </h2>
            <p className="mt-2 text-green-700">
              กำลังนำคุณไปยังคอร์สเรียน...
            </p>
          </div>
        )}

        {/* Main Checkout Card */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Course Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h1 className="text-2xl font-bold text-slate-900">ชำระเงิน</h1>
              <div className="mt-6 space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {currentSession.courseTitle}
                  </h2>
                </div>
                {/* Coupon Section */}
                <div className="space-y-3">
                  {!appliedCoupon ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        โค้ดส่วนลด
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value.toUpperCase())
                            setCouponError(null)
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              handleValidateCoupon()
                            }
                          }}
                          placeholder="ใส่โค้ดส่วนลด"
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                        />
                        <button
                          type="button"
                          onClick={handleValidateCoupon}
                          disabled={isValidatingCoupon}
                          className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                        >
                          {isValidatingCoupon ? '...' : 'ใช้'}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-sm text-red-600">{couponError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            ใช้โค้ดส่วนลด: {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-700">
                            ส่วนลด {formatPrice(appliedCoupon.discountAmount)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-sm text-green-700 hover:text-green-900"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {originalPrice && originalPrice > currentSession.amount && (
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span>ราคาเดิม:</span>
                      <span className="line-through">{formatPrice(originalPrice)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-sm text-green-600">
                      <span>ส่วนลด:</span>
                      <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between gap-2 border-t border-slate-200 pt-2">
                    <span className="text-sm text-slate-600">ราคาสุทธิ:</span>
                    <span className="text-3xl font-bold text-slate-900">
                      {formatPrice(currentSession.amount)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">เข้าถึงได้ตลอดชีพ</span> - เมื่อคุณชำระเงินเสร็จสิ้น คุณจะสามารถเข้าถึงคอร์สนี้ได้ตลอดชีพ
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Status Indicator */}
            {isPolling && paymentStatus === 'pending' && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-medium text-blue-900">
                    กำลังรอการยืนยันการชำระเงิน...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Payment Methods */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                ช่องทางการชำระเงิน
              </h2>

              {/* Payment Method Tabs */}
              <div className="mb-6 flex gap-2 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qrnone')}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    paymentMethod === 'qrnone'
                      ? 'bg-white text-brand shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  PromptPay QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    paymentMethod === 'card'
                      ? 'bg-white text-brand shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  บัตรเครดิต
                </button>
              </div>

              {/* QR Payment */}
              {paymentMethod === 'qrnone' && (
                <div className="space-y-4">
                  {qrSession?.qrImageUrl ? (
                    <>
                      {/* Thai QR Payment Logo */}
                      <div className="flex justify-center mb-4">
                        <div className="w-full max-w-[308px]">
                          <img
                            src="/PromptPayLogo.png"
                            alt="Thai QR Payment"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-center rounded-lg border-2 border-slate-200 bg-white p-6">
                        <img
                          src={qrSession.qrImageUrl}
                          alt="PromptPay QR Code"
                          className="h-64 w-64"
                        />
                      </div>
                      <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                        <p className="text-sm font-medium text-blue-900 text-center">
                          สแกน QR Code เพื่อชำระเงิน
                        </p>
                        <p className="text-xs text-blue-700 text-center">
                          ท่านสามารถใช้ Mobile Banking สแกนเพื่อชำระได้ทุกธนาคาร
                        </p>
                        <p className="text-xs text-blue-600 text-center font-semibold">
                          จำนวนเงิน: {formatPrice(qrSession.amount)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="text-slate-600">กำลังโหลด QR Code...</p>
                    </div>
                  )}
                </div>
              )}

              {/* Credit Card Payment */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  {isCreatingCard ? (
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent mx-auto" />
                      <p className="text-slate-600">กำลังเตรียมการชำระเงินด้วยบัตรเครดิต...</p>
                    </div>
                  ) : cardSession?.paymentUrl ? (
                    <>
                      {/* Credit Card Payment Logo */}
                      <div className="flex justify-center mb-4">
                        <div className="w-full max-w-[308px]">
                          <img
                            src="/cardpayLogo.png"
                            alt="Credit Card Payment"
                            className="w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                      
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                        <div className="mb-4">
                          <svg
                            className="mx-auto h-16 w-16 text-brand"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                          ชำระเงินด้วยบัตรเครดิต
                        </h3>
                        <p className="mb-4 text-sm text-slate-600">
                          รองรับบัตรเครดิตและบัตรเดบิตทุกประเภท (Visa, Mastercard, JCB)
                        </p>
                        <p className="mb-6 text-xs text-slate-500">
                          คุณจะถูกนำไปยังหน้าชำระเงินที่ปลอดภัยของ MoneySpace เพื่อดำเนินการชำระเงิน
                        </p>
                        <button
                          onClick={() => {
                            if (cardSession.paymentUrl) {
                              window.location.href = cardSession.paymentUrl
                            }
                          }}
                          className="w-full rounded-lg bg-[#2563eb] px-6 py-4 text-base font-bold text-white shadow-xl hover:bg-[#1d4ed8] focus:outline-none focus:ring-4 focus:ring-[#2563eb]/30 transition-all transform hover:scale-[1.02]"
                        >
                          ดำเนินการชำระเงิน
                        </button>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-4 text-center">
                        <p className="text-xs text-blue-700">
                          🔒 การชำระเงินที่ปลอดภัยด้วย MoneySpace
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                      <p className="text-sm text-red-700">
                        ไม่สามารถโหลดฟอร์มชำระเงินได้ กรุณาลองใหม่อีกครั้ง
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Info */}
            {currentSession && (
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-900">
                  รายละเอียดคำสั่งซื้อ
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>หมายเลขคำสั่งซื้อ:</span>
                    <span className="font-mono text-slate-900">
                      {currentSession.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>จำนวนเงิน:</span>
                    <span className="font-semibold text-slate-900">
                      {formatPrice(currentSession.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>สถานะ:</span>
                    <span
                      className={`font-medium ${
                        paymentStatus === 'paid'
                          ? 'text-green-600'
                          : paymentStatus === 'failed'
                            ? 'text-red-600'
                            : 'text-slate-600'
                      }`}
                    >
                      {paymentStatus === 'paid'
                        ? 'ชำระเงินแล้ว'
                        : paymentStatus === 'failed'
                          ? 'ชำระเงินไม่สำเร็จ'
                          : paymentStatus === 'pending'
                            ? 'รอการชำระเงิน'
                            : paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
