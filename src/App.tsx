import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const SignUpPage = lazy(() => import('./features/auth/pages/SignUpPage'));
const HomePage = lazy(() => import('./features/home/pages/HomePage'));
const UserListPage = lazy(() => import('./features/user/pages/UserListPage'));
const UserApprovalPage = lazy(() => import('./features/user/pages/UserApprovalPage'));
const CreateUserPage = lazy(() => import('./features/user/pages/CreateUser'));
const DetailUserPage = lazy(() => import('./features/user/pages/DetailUser'));
const PengawasListPage = lazy(() => import('./features/pengawas/pages/PengawasListPage'));
const LadiesListPage = lazy(() => import('./features/ladies/pages/LadiesListPage'));
const NotFoundPage = lazy(() => import('./features/core/pages/NotFoundPage'));
const AddTransaksiPage = lazy(() => import('./features/transaction/pages/AddTransaksiPage'));
const BukuKuningPage = lazy(() => import('./features/transaction/pages/BukuKuningPage'));
const AbsensiPage = lazy(() => import('./features/absensi/pages/AbsensiPage'));
const RekapVoucherPage = lazy(() => import('./features/transaction/pages/RekapVoucherPage'));
const PerformaLadiesPage = lazy(() => import('./features/transaction/pages/PerformaLadiesPage'));
const AddTransaksiPengawasPage = lazy(() => import('./features/transaction/pages/AddTransaksiPengawasPage'));
const BukuKuningPengawasPage = lazy(() => import('./features/transaction/pages/BukuKuningPengawasPage'));
const SmartChatPage = lazy(() => import('./features/smartchat/pages/SmartChatPage'));
const SmartChatLadiesPage = lazy(() => import('./features/smartchat/pages/SmartChatLadiesPage'));
const AgentPage = lazy(() => import('./features/agent/pages/AgentListPage'));
const CreateAgentPage = lazy(() => import('./features/agent/pages/CreateAgent'));
const DetailAgentPage = lazy(() => import('./features/agent/pages/DetailAgent'));
const OutletListPage = lazy(() => import('./features/outlet/pages/OutletListPage'));
const CreatePengawasPage = lazy(() => import('./features/pengawas/pages/CreatePengawas'));
const DetailPengawasPage = lazy(() => import('./features/pengawas/pages/DetailPengawas'));
const CreateLadiesPage = lazy(() => import('./features/ladies/pages/CreateLadies'));
const DetailLadiesPage = lazy(() => import('./features/ladies/pages/DetailLadies'));

const HomeLadiesPage = lazy(() => import('./features/ladies/pages/HomeLadiesPage'));
const RiwayatAbsensiPage = lazy(() => import('./features/ladies/pages/RiwayatAbsensiPage'));
const VoucherListPage = lazy(() => import('./features/ladies/pages/VoucherListPage'));
const KasbonListPage = lazy(() => import('./features/ladies/pages/KasbonListPage'));
const DokterListPage = lazy(() => import('./features/ladies/pages/DokterListPage'));
const PemasukanLainListPage = lazy(() => import('./features/ladies/pages/PemasukanLainListPage'));
const PeraturanPage = lazy(() => import('./features/ladies/pages/PeraturanPage'));
const ProfilePage = lazy(() => import('./features/ladies/pages/ProfilePage'));

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RootRoute from './components/RootRoute';
import MainLayout from './layout/MainLayout';
import SplashScreen from './components/Common/SplashScreen';
import RouteLoader from './components/Common/RouteLoader';
import OfflineBanner from './components/OfflineBanner';
import ConfirmDialogHost from './components/ConfirmDialog';
import SessionGuard from './components/SessionGuard';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // durasi splash
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <AuthProvider>
      <OfflineBanner />

      <BrowserRouter>
        <SessionGuard />

        <Suspense fallback={<RouteLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected routes (shared layout) */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Outlet />
                  </MainLayout>
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<RootRoute><HomePage /></RootRoute>} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/user-create" element={<CreateUserPage />} />
              <Route path="/user-approval" element={<UserApprovalPage />} />
              <Route path="/user-detail/:id" element={<DetailUserPage />} />
              <Route path="/pengawas" element={<PengawasListPage />} />
              <Route path="/pengawas-create" element={<CreatePengawasPage />} />
              <Route path="/pengawas-detail/:id" element={<DetailPengawasPage />} />
              <Route path="/ladies" element={<LadiesListPage />} />
              <Route path="/ladies-create" element={<CreateLadiesPage />} />
              <Route path="/ladies-detail/:id" element={<DetailLadiesPage />} />
              <Route path="/buku-kuning" element={<BukuKuningPage />} />
              <Route path="/add-transaksi" element={<AddTransaksiPage />} />
              <Route path="/absensi" element={<AbsensiPage />} />
              <Route path="/rekap-voucher" element={<RekapVoucherPage />} />
              <Route path="/performa-ladies" element={<PerformaLadiesPage />} />
              <Route path="/add-transaksi-pengawas" element={<AddTransaksiPengawasPage />} />
              <Route path="/buku-kuning-pengawas" element={<BukuKuningPengawasPage />} />
              <Route path="/smart-chat" element={<SmartChatPage />} />
              <Route path="/smart-chat-ladies" element={<SmartChatLadiesPage />} />
              <Route path="/agent" element={<AgentPage />} />
              <Route path="/agent-create" element={<CreateAgentPage />} />
              <Route path="/agent-detail/:id" element={<DetailAgentPage />} />
              <Route path="/outlet" element={<OutletListPage />} />

              {/* Ladies-specific */}
              <Route path="/ladies/home" element={<HomeLadiesPage />} />
              <Route path="/ladies/absensi" element={<RiwayatAbsensiPage />} />
              <Route path="/ladies/voucher" element={<VoucherListPage />} />
              <Route path="/ladies/pemasukan_lain" element={<PemasukanLainListPage />} />
              <Route path="/ladies/kasbon" element={<KasbonListPage />} />
              <Route path="/ladies/dokter" element={<DokterListPage />} />
              <Route path="/ladies/peraturan" element={<PeraturanPage />} />
              <Route path="/ladies/profile" element={<ProfilePage />} />
            </Route>

            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <ToastContainer position="top-right" autoClose={4000} newestOnTop />
      <ConfirmDialogHost />
    </AuthProvider>
  );
}

export default App;
