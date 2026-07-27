import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';
import { LoadingSpinner } from './components/common/UI';

const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then((module) => ({ default: module.RegisterPage })));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OverviewPage = lazy(() => import('./pages/dashboard/OverviewPage'));
const ProfileEditPage = lazy(() => import('./pages/dashboard/ProfileEditPage'));
const SocialLinksPage = lazy(() => import('./pages/dashboard/SocialLinksPage'));
const ProjectsPage = lazy(() => import('./pages/dashboard/ProjectsPage'));
const AppearancePage = lazy(() => import('./pages/dashboard/AppearancePage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const CommunityPage = lazy(() => import('./pages/dashboard/CommunityPage'));
const GamesPage = lazy(() => import('./pages/dashboard/GamesPage'));

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner label="Đang mở trang" />}>
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
    </Suspense>
  );
}
