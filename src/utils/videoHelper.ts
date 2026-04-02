/**
 * Check if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string | null): boolean {
  if (!url) return false;
  
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
}

/**
 * Convert YouTube URL to embed URL
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 */
export function getYouTubeEmbedUrl(url: string): string {
  if (!isYouTubeUrl(url)) return url;

  // If already an embed URL, return as is
  if (url.includes('/embed/')) {
    return url;
  }

  // Extract video ID from various YouTube URL formats
  let videoId = '';

  // Format: https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) {
    videoId = watchMatch[1];
  } else {
    // Format: https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    } else {
      // Format: https://www.youtube.com/embed/VIDEO_ID
      const embedMatch = url.match(/\/embed\/([^?]+)/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
    }
  }

  if (!videoId) {
    return url; // Return original if we can't extract video ID
  }

  // Return embed URL with parameters to minimize YouTube branding and links
  // modestbranding=1: Hides YouTube logo in controls
  // rel=0: Hides related videos from other channels (shows only from same channel)
  // controls=1: Shows video controls (play, pause, volume, etc.)
  // showinfo=0: Hides video info (deprecated but kept for compatibility)
  // iv_load_policy=3: Hides video annotations
  // fs=1: Allows fullscreen (can be set to 0 to disable)
  // disablekb=0: Enables keyboard controls
  return `https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0&controls=1&showinfo=0&iv_load_policy=3&fs=1&disablekb=0`;
}

/**
 * Get video source URL - either direct URL or YouTube embed
 */
export function getVideoSource(url: string | null, baseUrl?: string): string | undefined {
  if (!url) return undefined;

  // If it's a YouTube URL, return embed URL
  if (isYouTubeUrl(url)) {
    return getYouTubeEmbedUrl(url);
  }

  // If it's a relative URL and baseUrl is provided, prepend baseUrl
  if (baseUrl && url.startsWith('/')) {
    return `${baseUrl}${url}`;
  }

  // Return as is (absolute URL)
  return url;
}

