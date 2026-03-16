import { create } from 'zustand'

type BundleCourse = {
  id: number
  title: string
}

type BundleState = {
  selectedCourses: BundleCourse[]
  bundleId: number | null
  setBundleId: (id: number | null) => void
  addCourse: (course: BundleCourse) => void
  removeCourse: (courseId: number) => void
  clear: () => void
}

export const useBundleStore = create<BundleState>((set) => ({
  selectedCourses: [],
  bundleId: null,
  setBundleId: (id) => set({ bundleId: id }),
  addCourse: (course) =>
    set((state) => {
      if (state.selectedCourses.find((c) => c.id === course.id)) {
        return state
      }
      return { selectedCourses: [...state.selectedCourses, course] }
    }),
  removeCourse: (courseId) =>
    set((state) => ({
      selectedCourses: state.selectedCourses.filter((c) => c.id !== courseId),
    })),
  clear: () => set({ selectedCourses: [], bundleId: null }),
}))

