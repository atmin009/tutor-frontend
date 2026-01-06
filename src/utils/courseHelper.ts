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

