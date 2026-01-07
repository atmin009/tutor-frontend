import { useEffect, useMemo, useRef, useState } from 'react'

type Slide = {
  src: string
  alt: string
}

type BannerSliderProps = {
  slides?: Slide[]
  intervalMs?: number
  className?: string
}

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setPrefersReduced(mediaQuery.matches)

    onChange()
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return prefersReduced
}

export default function BannerSlider({
  slides,
  intervalMs = 6000,
  className = '',
}: BannerSliderProps) {
  const items = useMemo<Slide[]>(
    () =>
      slides?.length
        ? slides
        : [
            { src: '/banner1.png', alt: 'Banner 1' },
            { src: '/banner2.png', alt: 'Banner 2' },
          ],
    [slides]
  )

  const prefersReducedMotion = usePrefersReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)

  const goTo = (next: number) => {
    const total = items.length
    setActiveIndex(((next % total) + total) % total)
  }

  const next = () => goTo(activeIndex + 1)
  const prev = () => goTo(activeIndex - 1)

  useEffect(() => {
    if (prefersReducedMotion || isPaused || items.length <= 1) return

    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((idx) => (idx + 1) % items.length)
    }, intervalMs)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [intervalMs, isPaused, items.length, prefersReducedMotion])

  return (
    <section
      className={[
        'group relative w-full overflow-hidden bg-slate-200',
        // Fixed responsive height with full-width container
        'h-52 sm:h-64 md:h-80 lg:h-[26rem]',
        className,
      ].join(' ')}
      aria-roledescription="carousel"
      aria-label="Banner slides"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
      }}
      tabIndex={0}
    >
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100" />

      {/* Images - Container to preserve aspect ratio and show full image */}
      <div className="relative mx-auto h-full w-full max-w-6xl">
        {items.map((slide, idx) => (
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={[
              // Contain to show full image without cropping text
              'absolute inset-0 mx-auto h-full w-full object-contain',
              'transition-opacity duration-700',
              idx === activeIndex ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>

      {/* Controls - Full width positioning */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/70"
            onClick={prev}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm transition-all hover:bg-black/60 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/70"
            onClick={next}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {items.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === activeIndex}
                className={[
                  'h-2.5 w-2.5 rounded-full transition-all',
                  idx === activeIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80',
                ].join(' ')}
                onClick={() => goTo(idx)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}


