import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: 'user' | 'admin';
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const location = useLocation();
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
  });

  // Strict BFCache & Back-Forward Navigation Protection
  useEffect(() => {
    const enforceAuth = () => {
      const currentToken = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      setToken(currentToken);
      if (!currentToken) {
        window.location.replace('/login');
      }
    };

    // Listen to pageshow (termasuk saat browser me-restore dari BFCache setelah tombol Back ditekan)
    const handlePageShow = (event: PageTransitionEvent) => {
      const currentToken = localStorage.getItem('hifzhly_auth_token') || localStorage.getItem('token');
      if (event.persisted || !currentToken) {
        if (!currentToken) {
          window.location.replace('/login');
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', enforceAuth);
    window.addEventListener('storage', enforceAuth);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', enforceAuth);
      window.removeEventListener('storage', enforceAuth);
    };
  }, []);

  // Jika tidak ada token (misal belum login atau sudah logout), lempar langsung ke /login dan jangan render konten anak sama sekali
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
