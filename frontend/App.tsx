import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PaymentCheckoutPage } from './pages/PaymentCheckoutPage';
import { FinancePage } from './pages/FinancePage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthRedirect } from './components/AuthRedirect';
import { SelectionProvider } from './contexts/SelectionContext';
import { useEffect, useState } from 'react';
import { authService } from './services/authService';
import { Toaster } from './components/ui/sonner';

const libraries: ('places')[] = ['places'];

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Make Google Maps API key optional
  const googleMapsKey = import.meta.env?.VITE_GOOGLE_MAPS_KEY || '';
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: googleMapsKey,
    libraries,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authService.me();
        console.log('User authenticated via cookie');
      } catch {
        console.log('No valid session found');
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Auth loading
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Зареждане...</p>
        </div>
      </div>
    );
  }

  // Skip Google Maps loading check if no API key provided
  if (googleMapsKey && !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading Google Maps…</p>
      </div>
    );
  }

  return (
    <SelectionProvider>
      <BrowserRouter>
        <Routes>
          {/* Публични */}
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRedirect>
                <RegisterPage />
              </AuthRedirect>
            }
          />

          {/* Жители */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard/homes" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:view"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Админ (kept for backward compatibility but works same as resident) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Navigate to="/admin/dashboard/homes" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard/:view"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Плащане */}
          <Route
            path="/payment/checkout"
            element={
              <ProtectedRoute>
                <PaymentCheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Финанси (само за админи) */}
          <Route
            path="/admin/dashboard/finances"
            element={
              <ProtectedRoute>
                <FinancePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </SelectionProvider>
  );
}