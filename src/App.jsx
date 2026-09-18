import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import { ThemeProvider } from '@/lib/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Layout + public pages
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Coverage from '@/pages/Coverage';
import CoverageResults from '@/pages/CoverageResults';
import Packages from '@/pages/Packages';
import PackageDetail from '@/pages/PackageDetail';
import Compare from '@/pages/Compare';
import Providers from '@/pages/Providers';
import ProviderDetail from '@/pages/ProviderDetail';
import Networks from '@/pages/Networks';
import NetworkDetail from '@/pages/NetworkDetail';
import LocationPage from '@/pages/LocationPage';
import Business from '@/pages/Business';
import Saved from '@/pages/Saved';
import Enquire from '@/pages/Enquire';
import Partners from '@/pages/Partners';
import Help from '@/pages/Help';
import HelpArticle from '@/pages/HelpArticle';
import Contact from '@/pages/Contact';
import Download from '@/pages/Download';
import About from '@/pages/About';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Cookies from '@/pages/Cookies';
import Accessibility from '@/pages/Accessibility';
import Disclaimer from '@/pages/Disclaimer';
import NotFound from '@/pages/PageNotFound';

// Account
import AccountLayout from '@/components/account/AccountLayout';
import Account from '@/pages/account/Account';
import Profile from '@/pages/account/Profile';
import Addresses from '@/pages/account/Addresses';
import AccountSaved from '@/pages/account/AccountSaved';
import Comparisons from '@/pages/account/Comparisons';
import Enquiries from '@/pages/account/Enquiries';
import Notifications from '@/pages/account/Notifications';

// Admin
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProviders from '@/pages/admin/AdminProviders';
import AdminPackages from '@/pages/admin/AdminPackages';
import AdminEnquiries from '@/pages/admin/AdminEnquiries';
import AdminGeneric from '@/pages/admin/AdminGeneric';

const AuthenticatedApp = () => {
  const { isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes (standalone, no main layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main app with shared layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/coverage" element={<Coverage />} />
        <Route path="/coverage/results" element={<CoverageResults />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:slug" element={<PackageDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/providers/:slug" element={<ProviderDetail />} />
        <Route path="/networks" element={<Networks />} />
        <Route path="/networks/:slug" element={<NetworkDetail />} />
        <Route path="/fibre/:province" element={<LocationPage />} />
        <Route path="/fibre/:province/:city" element={<LocationPage />} />
        <Route path="/fibre/:province/:city/:suburb" element={<LocationPage />} />
        <Route path="/business" element={<Business />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/enquire" element={<Enquire />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/help" element={<Help />} />
        <Route path="/help/:slug" element={<HelpArticle />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/download" element={<Download />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/disclaimer" element={<Disclaimer />} />

        {/* Account (protected) */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<Account />} />
            <Route path="profile" element={<Profile />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="saved" element={<AccountSaved />} />
            <Route path="comparisons" element={<Comparisons />} />
            <Route path="enquiries" element={<Enquiries />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Route>

      {/* Admin navigation is a UX guard; Fastify authorization remains authoritative. */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]} unauthenticatedElement={<Navigate to="/login" replace />} forbiddenElement={<Navigate to="/" replace />} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="providers" element={<AdminProviders />} />
          <Route path="networks" element={<AdminGeneric section="networks" />} />
          <Route path="packages" element={<AdminPackages />} />
          <Route path="coverage" element={<AdminGeneric section="coverage" />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="customers" element={<AdminGeneric section="customers" />} />
          <Route path="promotions" element={<AdminGeneric section="promotions" />} />
          <Route path="content" element={<AdminGeneric section="content" />} />
          <Route path="analytics" element={<AdminGeneric section="analytics" />} />
          <Route path="settings" element={<AdminGeneric section="settings" />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};


function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
