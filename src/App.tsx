import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';


import LoginPage from './features/auth/pages/LoginPage';
import SignUpPage from './features/auth/pages/SignUpPage';
import HomePage from './features/home/pages/HomePage';
import UserListPage from './features/user/pages/UserListPage';
import PengawasListPage from './features/pengawas/pages/PengawasListPage';
import LadiesListPage from './features/ladies/pages/LadiesListPage';
import NotFoundPage from './features/core/pages/NotFoundPage';
import AddTransaksiPage from './features/transaction/pages/AddTransaksiPage';
import BukuKuningPage from './features/transaction/pages/BukuKuningPage';
import AbsensiPage from './features/absensi/pages/AbsensiPage';
import RekapVoucherPage from './features/transaction/pages/RekapVoucherPage';
import PerformaLadiesPage from './features/transaction/pages/PerformaLadiesPage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layout/MainLayout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div>Loading halaman...</div>}>
          <Routes>
            {/* Public routes: TIDAK dibungkus layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected pages: dibungkus MainLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <HomePage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <UserListPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pengawas"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PengawasListPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ladies"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <LadiesListPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/buku-kuning"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <BukuKuningPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-transaksi"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AddTransaksiPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/absensi"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <AbsensiPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/rekap-voucher"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <RekapVoucherPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/performa-ladies"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <PerformaLadiesPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;