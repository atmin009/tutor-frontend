const API_ORIGIN = (() => {
  const base = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!base) return '';
  try {
    const u = new URL(base);
    return u.origin;
  } catch {
    return base.replace(/\/api\/?$/, '');
  }
})();

/**
 * Resolve a backend asset path (e.g. /uploads/courses/cover.jpg) to a full URL.
 * If the value is already an absolute URL it is returned as-is.
 */
export function resolveAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Helper function to get the course URL identifier
 * Uses slug if valid, otherwise falls back to course ID
 * @param course - Course object with id and slug
 * @returns URL-safe identifier (slug or id as string)
 */
export const getCourseUrlIdentifier = (course: { id: number; slug: string | null | undefined }): string => {
  // If slug exists and is not numeric (numeric slugs can cause confusion)
  // and is not empty, use it
  if (course.slug && course.slug.trim() !== '' && !/^\d+$/.test(course.slug.trim())) {
    return course.slug.trim()
  }
  
  // Otherwise, use course ID
  return course.id.toString()
}

