import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AboutUsPage from './pages/AboutUsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import DownloadsPage from './pages/DownloadsPage';
import FeaturesPage from './pages/FeaturesPage';
import ForSchoolsPage from './pages/ForSchoolsPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import PrivacyPage from './pages/PrivacyPage';
import RecoveryPage from './pages/RecoveryPage';
import TermsPage from './pages/TermsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Marketing Pages (Wrapped in MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/downloads" element={<DownloadsPage />} />
          <Route path="/schools" element={<ForSchoolsPage />} />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>

        {/* Auth Pages (Standalone) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/recovery" element={<RecoveryPage />} />
      </Routes>
    </Router>
  );
}
