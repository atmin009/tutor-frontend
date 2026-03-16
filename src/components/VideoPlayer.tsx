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

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null

    if (src.endsWith('.m3u8') && Hls.isSupported()) {
      hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(video)
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
    } else {
      video.src = src
    }

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

    if (onEnded) {
      video.addEventListener('ended', onEnded)
    }

    if (hls) {
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        const levels = hls?.levels || []
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
      player.destroy()
      if (hls) {
        hls.destroy()
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

