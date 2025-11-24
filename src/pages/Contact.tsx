export default function Contact() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
          ติดต่อเรา
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          เราพร้อมให้คำปรึกษาและตอบคำถามของคุณ
        </p>
      </div>

      {/* Contact Information */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Main Office */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">สำนักงานใหญ่</h2>
          </div>
          <div className="space-y-4 text-slate-700">
            <p className="leading-relaxed">
              49/19 หมู่ที่ 5 ตำบลนาตาล่วง<br />
              อำเภอเมือง จังหวัดตรัง 92000
            </p>
          </div>
        </div>

        {/* Branch Office */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">สาขาหนองจอก</h2>
          </div>
          <div className="space-y-4 text-slate-700">
            <p className="leading-relaxed">
              เลขที่ 107/225 ซอยสุวินทวงศ์ 38<br />
              แขวงลำผักชี เขตหนองจอก<br />
              กรุงเทพมหานคร 10530
            </p>
          </div>
        </div>
      </div>

      {/* Contact Methods */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Phone */}
        <a
          href="tel:0952605168"
          className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-brand hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">เบอร์โทรศัพท์</h3>
          <p className="mt-2 text-slate-600">095-260-5168</p>
          <p className="mt-1 text-sm text-brand">คลิกเพื่อโทร</p>
        </a>

        {/* Email */}
        <a
          href="mailto:training.mtr4263@gmail.com"
          className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-brand hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">อีเมล</h3>
          <p className="mt-2 break-all text-sm text-slate-600">training.mtr4263@gmail.com</p>
          <p className="mt-1 text-sm text-brand">คลิกเพื่อส่งอีเมล</p>
        </a>

        {/* Line */}
        <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#00C300]/10 text-[#00C300]">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.058 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Line ID</h3>
          <p className="mt-2 font-mono text-slate-600">@mtr4263</p>
          <a
            href="https://line.me/R/ti/p/@mtr4263"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-sm text-brand hover:underline"
          >
            เพิ่มเพื่อน
          </a>
        </div>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/MediaAndTraining"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-brand hover:shadow-md"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1877F2]/10 text-[#1877F2] transition-colors group-hover:bg-[#1877F2] group-hover:text-white">
            <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Facebook</h3>
          <p className="mt-2 text-slate-600">Media & Training Co., Ltd.</p>
          <p className="mt-1 text-sm text-brand">คลิกเพื่อเปิด Facebook</p>
        </a>
      </div>
    </div>
  )
}

