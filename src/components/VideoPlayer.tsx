import { useEffect, useRef } from 'react'
import Plyr from 'plyr'
import Hls from 'hls.js'
import 'plyr/dist/plyr.css'

type VideoPlayerProps = {
  src: string
  poster?: string
  className?: string
  onEnded?: () => void
}

export default function VideoPlayer({ src, poster, className, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const playerRef = useRef<Plyr | null>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Hard reset previous playback immediately when switching lessons
    try {
      video.pause()
      video.currentTime = 0
    } catch {
      // ignore
    }

    // Clean up any previous instances without removing React-managed DOM
    if (playerRef.current) {
      playerRef.current.destroy(true)
      playerRef.current = null
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
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else {
      video.src = src
    }

    // Force the element to load the new source immediately
    video.load()

    const player = new Plyr(video, {
      controls: [
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'fullscreen',
      ],
      settings: ['quality'],
    })
    playerRef.current = player

    if (onEnded) {
      video.addEventListener('ended', onEnded)
    }

    const hls = hlsRef.current
    if (hls) {
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls.levels || []
        const availableQualities = levels
          .map((l) => l.height)
          .filter((v, i, self) => v && self.indexOf(v) === i)
          .sort((a, b) => a - b)

        if (!availableQualities.length) return

        // Plyr types declare quality as number; at runtime it accepts this object for HLS
        ;(player as { quality: unknown }).quality = {
          default: Math.max(...availableQualities),
          options: availableQualities,
          forced: true,
          onChange: (newQuality: number) => {
            if (!hls) return
            const levelIndex = hls.levels.findIndex((level) => level.height === newQuality)
            if (levelIndex !== -1) {
              hls.currentLevel = levelIndex
            }
          },
        }
      })
    }

    return () => {
      if (onEnded) {
        video.removeEventListener('ended', onEnded)
      }
      if (playerRef.current) {
        playerRef.current.destroy(true)
        playerRef.current = null
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, onEnded])

  return (
    <video
      ref={videoRef}
      className={className}
      playsInline
      controls
      poster={poster}
    />
  )
}

