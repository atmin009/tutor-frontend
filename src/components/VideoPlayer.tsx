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

  const getMimeTypeFromUrl = (url: string): string => {
    const clean = url.split('?')[0].split('#')[0].toLowerCase()
    if (clean.endsWith('.webm')) return 'video/webm'
    if (clean.endsWith('.ogv') || clean.endsWith('.ogg')) return 'video/ogg'
    if (clean.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl'
    return 'video/mp4'
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Create Plyr once; update source in a separate effect.
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

    return () => {
      if (onEnded) {
        video.removeEventListener('ended', onEnded)
      }
      if (playerRef.current) {
        ;(playerRef.current as unknown as { destroy: (soft?: boolean) => void }).destroy(true)
        playerRef.current = null
      }
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [onEnded])

  useEffect(() => {
    const video = videoRef.current
    const player = playerRef.current
    if (!video || !player) return

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
            const levelIndex = hls.levels.findIndex((level) => level.height === newQuality)
            if (levelIndex !== -1) {
              hls.currentLevel = levelIndex
            }
          },
        }
      })
    } else {
      // For plain files (mp4/webm/ogg), update via Plyr API to ensure it swaps sources correctly.
      ;(player as unknown as { source: unknown }).source = {
        type: 'video',
        title: '',
        sources: [
          {
            src,
            type: getMimeTypeFromUrl(src),
          },
        ],
        poster,
      }
    }

    // Force reload; helps ensure the element swaps immediately.
    video.load()
  }, [src])

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

