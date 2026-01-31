import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import AboutUsPage from './pages/AboutUsPage';
import AudioPlayerPage from './pages/AudioPlayerPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import CreatePodcastPage from './pages/CreatePodcastPage';
import DecksPage from './pages/DecksPage';
import DownloadsPage from './pages/DownloadsPage';
import FeaturesPage from './pages/FeaturesPage';
import FlashcardsPage from './pages/FlashcardsPage';
import ForSchoolsPage from './pages/ForSchoolsPage';
import LandingPage from './pages/LandingPage';
import LearningDashboard from './pages/LearningDashboard';
import CreateListeningPage from './pages/CreateListeningPage';
import LearningPage from './pages/LearningPage';
import ListeningPage from './pages/ListeningPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import PrivacyPage from './pages/PrivacyPage';
import RecoveryPage from './pages/RecoveryPage';
import SpeakingListPage from './pages/SpeakingListPage';
import SpeakingPage from './pages/SpeakingPage';
import TermsPage from './pages/TermsPage';
import WordDeckDetail from './pages/WordDeckDetail';
import WordDecks from './pages/WordDecks';
import TestListPage from './pages/TestListPage';
import TestPage from './pages/TestPage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Marketing Pages (Wrapped in MainLayout) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/app" element={<DownloadsPage />} />
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

        {/* Learning App (Shared Layout) */}
        <Route path="/learning" element={<LearningPage />}>
          <Route index element={<LearningDashboard />} />
          <Route path="listening" element={<ListeningPage />} />
          <Route path="listening/create" element={<CreateListeningPage />} />
          <Route path="listening/:id" element={<AudioPlayerPage />} />
          <Route path="speaking" element={<SpeakingListPage />} />
          <Route path="speaking/practice" element={<SpeakingPage />} />
          <Route path="words" element={<WordDecks />} />
          <Route path="words/:id" element={<WordDeckDetail />} />
          <Route path="words/:id/flashcards" element={<FlashcardsPage />} />
          <Route path="decks" element={<DecksPage />} />
          <Route path="tests" element={<TestListPage />} />
          <Route path="tests/:level" element={<TestPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
