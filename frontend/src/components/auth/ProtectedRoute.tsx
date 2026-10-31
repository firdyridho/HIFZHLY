import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: 'user' | 'admin';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');

  // Jika tidak ada token (misal belum login atau sudah logout), lempar langsung ke /login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Cek otorisasi role jika rute mewajibkan role tertentu
  if (allowedRole) {
    let userRole = 'user';
    try {
      const cached = localStorage.getItem('hifzhly_user_profile') || localStorage.getItem('user');
      if (cached) {
        const u = JSON.parse(cached);
        userRole = (u.role || 'user').toLowerCase();
      }
    } catch {
      userRole = 'user';
    }

    const isAdmin = userRole === 'admin' || userRole === 'ustadz' || userRole === 'musyrif';

    if (allowedRole === 'admin' && !isAdmin) {
      return <Navigate to="/app" replace />;
    }

    if (allowedRole === 'user' && isAdmin) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
}

