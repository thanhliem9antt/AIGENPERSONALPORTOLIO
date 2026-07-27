import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import HomePage from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import PublicProfilePage from './pages/PublicProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import OverviewPage from './pages/dashboard/OverviewPage';
import ProfileEditPage from './pages/dashboard/ProfileEditPage';
import SocialLinksPage from './pages/dashboard/SocialLinksPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import AppearancePage from './pages/dashboard/AppearancePage';
import SettingsPage from './pages/dashboard/SettingsPage';
import CommunityPage from './pages/dashboard/CommunityPage';
import GamesPage from './pages/dashboard/GamesPage';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route path="/:profileHandle" element={<PublicProfilePage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="profile" element={<ProfileEditPage />} />
          <Route path="social-links" element={<SocialLinksPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
