import { useEffect } from 'react'
import {
  Navigate,
  Outlet,
  RouterProvider,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import CheckoutPage from '../pages/CheckoutPage'
import CourseDetail from '../pages/CourseDetail'
import CoursesCatalog from '../pages/CoursesCatalog'
import Home from '../pages/Home'
import Contact from '../pages/Contact'
import LearningCoursePage from '../pages/LearningCoursePage'
import LearningDashboard from '../pages/LearningDashboard'
import PaymentSuccess from '../pages/PaymentSuccess'
import PaymentFail from '../pages/PaymentFail'
import PaymentCancel from '../pages/PaymentCancel'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import { useAuthStore } from '../store/authStore'

const ProtectedRoute = () => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const location = useLocation()

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}

// Auth pages handle their own full-page layout

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/courses', element: <CoursesCatalog /> },
      { path: '/courses/:slug', element: <CourseDetail /> },
      { path: '/contact', element: <Contact /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/checkout/:courseId', element: <CheckoutPage /> },
          { path: '/learning', element: <LearningDashboard /> },
          { path: '/learning/:courseId', element: <LearningCoursePage /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/auth/login', element: <LoginPage /> },
      { path: '/auth/register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/payment/success',
    element: <PaymentSuccess />,
  },
  {
    path: '/payment/fail',
    element: <PaymentFail />,
  },
  {
    path: '/payment/cancel',
    element: <PaymentCancel />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export default function AppRouter() {
  const loadFromStorage = useAuthStore((state) => state.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return <RouterProvider router={router} />
}


