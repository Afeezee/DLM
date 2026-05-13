import { Suspense, lazy, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import AdminSidebar from './components/layout/AdminSidebar'
import AdminTopbar from './components/layout/AdminTopbar'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import AmbientBackdrop from './components/shared/AmbientBackdrop'
import CartDrawer from './components/shared/CartDrawer'
import ScrollProgress from './components/shared/ScrollProgress'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { MembershipProvider } from './context/MembershipContext'
import { useAuth } from './hooks/useAuth'
import LandingPage from './pages/LandingPage'

const AdminOverviewPage = lazy(() => import('./admin/pages/AdminOverviewPage'))
const AdminAppointmentsPage = lazy(() => import('./admin/pages/AdminAppointmentsPage'))
const AdminAdvertsPage = lazy(() => import('./admin/pages/AdminAdvertsPage'))
const AdminAnalyticsPage = lazy(() => import('./admin/pages/AdminAnalyticsPage'))
const AdminAnnouncementsPage = lazy(() => import('./admin/pages/AdminAnnouncementsPage'))
const AdminCoursesPage = lazy(() => import('./admin/pages/AdminCoursesPage'))
const AdminFashionPage = lazy(() => import('./admin/pages/AdminFashionPage'))
const AdminGiveawaysPage = lazy(() => import('./admin/pages/AdminGiveawaysPage'))
const AdminMembershipsPage = lazy(() => import('./admin/pages/AdminMembershipsPage'))
const AdminTrainingsPage = lazy(() => import('./admin/pages/AdminTrainingsPage'))
const AdminServicesPage = lazy(() => import('./admin/pages/AdminServicesPage'))
const AdminUsersPage = lazy(() => import('./admin/pages/AdminUsersPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const AdvertisePage = lazy(() => import('./pages/AdvertisePage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const DashboardAppointmentsPage = lazy(() => import('./pages/DashboardAppointmentsPage'))
const DashboardMembershipPage = lazy(() => import('./pages/DashboardMembershipPage'))
const DashboardOrdersPage = lazy(() => import('./pages/DashboardOrdersPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const DashboardTrainingsPage = lazy(() => import('./pages/DashboardTrainingsPage'))
const DlmTimeoutPage = lazy(() => import('./pages/DlmTimeoutPage'))
const FashionCheckoutPage = lazy(() => import('./pages/FashionCheckoutPage'))
const FashionDetailPage = lazy(() => import('./pages/FashionDetailPage'))
const FashionPage = lazy(() => import('./pages/FashionPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const PersonalHubPage = lazy(() => import('./pages/PersonalHubPage'))
const PlaceholderPage = lazy(() => import('./pages/PlaceholderPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const CommunityPage = lazy(() => import('./pages/CommunityPage'))
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const TrainingsPage = lazy(() => import('./pages/TrainingsPage'))

const pageTransition = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
}

function LoaderScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-light px-4">
      <div className="surface max-w-md p-8 text-center">
        <p className="font-display text-4xl text-brand-dark">DLM</p>
        <p className="mt-3 text-sm uppercase tracking-[0.3em] text-brand-dark/60">
          Loading your workspace
        </p>
      </div>
    </div>
  )
}

function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return null
}

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoaderScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

function AdminRoute({ children }) {
  const { user, profile, isLoading } = useAuth()

  if (isLoading) {
    return <LoaderScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function PublicLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-light">
      <AmbientBackdrop />
      <Navbar />
      <main className="relative z-10 pb-16">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

function DashboardLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-light">
      <AmbientBackdrop />
      <Navbar />
      <main className="shell relative z-10 py-10 sm:py-14">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

function AdminLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-light lg:pl-72">
      <AmbientBackdrop />
      <AdminSidebar />
      <div className="relative z-10 min-h-screen">
        <AdminTopbar />
        <main className="px-4 py-6 sm:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <AnimatePresence mode="wait">
        <Suspense fallback={<LoaderScreen />}>
          <motion.div key={location.pathname} {...pageTransition}>
            <Routes location={location}>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/about"
                  element={<AboutPage />}
                />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/services/:id" element={<ServiceDetailPage />} />
                <Route path="/fashion" element={<FashionPage />} />
                <Route path="/fashion/:id" element={<FashionDetailPage />} />
                <Route
                  path="/trainings"
                  element={<TrainingsPage />}
                />
                <Route
                  path="/personal-hub"
                  element={<PersonalHubPage />}
                />
                <Route
                  path="/community"
                  element={<CommunityPage />}
                />
                <Route
                  path="/advertise"
                  element={<AdvertisePage />}
                />
                <Route
                  path="/dlm-timeout"
                  element={<DlmTimeoutPage />}
                />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>

              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />
                <Route
                  path="/dashboard/appointments"
                  element={<DashboardAppointmentsPage />}
                />
                <Route
                  path="/dashboard/orders"
                  element={<DashboardOrdersPage />}
                />
                <Route
                  path="/dashboard/membership"
                  element={<DashboardMembershipPage />}
                />
                <Route
                  path="/dashboard/trainings"
                  element={<DashboardTrainingsPage />}
                />
                <Route path="/book/:serviceId" element={<BookingPage />} />
                <Route path="/fashion/checkout" element={<FashionCheckoutPage />} />
              </Route>

              <Route
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<AdminOverviewPage />} />
                <Route
                  path="/admin/appointments"
                  element={<AdminAppointmentsPage />}
                />
                <Route
                  path="/admin/services"
                  element={<AdminServicesPage />}
                />
                <Route
                  path="/admin/fashion"
                  element={<AdminFashionPage />}
                />
                <Route
                  path="/admin/users"
                  element={<AdminUsersPage />}
                />
                <Route
                  path="/admin/memberships"
                  element={<AdminMembershipsPage />}
                />
                <Route
                  path="/admin/trainings"
                  element={<AdminTrainingsPage />}
                />
                <Route
                  path="/admin/courses"
                  element={<AdminCoursesPage />}
                />
                <Route
                  path="/admin/adverts"
                  element={<AdminAdvertsPage />}
                />
                <Route
                  path="/admin/announcements"
                  element={<AdminAnnouncementsPage />}
                />
                <Route
                  path="/admin/giveaways"
                  element={<AdminGiveawaysPage />}
                />
                <Route
                  path="/admin/analytics"
                  element={<AdminAnalyticsPage />}
                />
              </Route>

              <Route
                path="*"
                element={
                  <PlaceholderPage
                    eyebrow="Not Found"
                    title="The page you requested is not available"
                    description="Return to the landing page and continue exploring the Denomis Luxury Marketplace experience."
                    ctaLabel="Back to home"
                    ctaTo="/"
                  />
                }
              />
            </Routes>
          </motion.div>
        </Suspense>
      </AnimatePresence>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <MembershipProvider>
        <CartProvider>
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </CartProvider>
      </MembershipProvider>
    </AuthProvider>
  )
}

export default App
