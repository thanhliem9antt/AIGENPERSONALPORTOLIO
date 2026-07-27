import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.roles?.includes('admin');
  return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
