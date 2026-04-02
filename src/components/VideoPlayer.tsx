import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

type VideoPlayerProps = {
  src: string
  poster?: string
  className?: string
  onEnded?: () => void
}

export default function VideoPlayer({ src, poster, className, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnded = () => onEnded?.()
    video.addEventListener('ended', handleEnded)

    // Reset playback immediately when switching sources
    try {
      video.pause()
      video.currentTime = 0
    } catch {
      // ignore
    }

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
      hlsRef.current = hls
    } else {
      video.src = src
    }

    video.load()

    return () => {
      video.removeEventListener('ended', handleEnded)
    }
  }, [src, onEnded])

  return (
    <video
      ref={videoRef}
      className={className}
      playsInline
      controls
      poster={poster}
      crossOrigin="anonymous"
    />
  )
}

