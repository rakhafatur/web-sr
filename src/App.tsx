import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';

import LoginPage from './features/auth/pages/LoginPage';
import SignUpPage from './features/auth/pages/SignUpPage';
import HomePage from './features/home/pages/HomePage';
import UserListPage from './features/user/pages/UserListPage';
import UserApprovalPage from './features/user/pages/UserApprovalPage';
import PengawasListPage from './features/pengawas/pages/PengawasListPage';
import LadiesListPage from './features/ladies/pages/LadiesListPage';
import NotFoundPage from './features/core/pages/NotFoundPage';
import AddTransaksiPage from './features/transaction/pages/AddTransaksiPage';
import BukuKuningPage from './features/transaction/pages/BukuKuningPage';
import AbsensiPage from './features/absensi/pages/AbsensiPage';
import RekapVoucherPage from './features/transaction/pages/RekapVoucherPage';
import PerformaLadiesPage from './features/transaction/pages/PerformaLadiesPage';
import AddTransaksiPengawasPage from './features/transaction/pages/AddTransaksiPengawasPage';
import BukuKuningPengawasPage from './features/transaction/pages/BukuKuningPengawasPage';

import HomeLadiesPage from './features/ladies/pages/HomeLadiesPage';
import RiwayatAbsensiPage from './features/ladies/pages/RiwayatAbsensiPage';
import VoucherListPage from './features/ladies/pages/VoucherListPage';
import KasbonListPage from './features/ladies/pages/KasbonListPage';
import PeraturanPage from './features/ladies/pages/PeraturanPage';
import ProfilePage from './features/ladies/pages/ProfilePage';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layout/MainLayout';
import SplashScreen from './components/Common/SplashScreen';
import SmartChatPage from './features/smartchat/SmartChatPage';
import SmartChatLadiesPage from './features/smartchat/SmartChatLadiesPage';

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
      <BrowserRouter>
        <Suspense fallback={<div>Loading halaman...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><MainLayout><UserListPage /></MainLayout></ProtectedRoute>} />
            <Route path="/user-approval" element={<ProtectedRoute><MainLayout><UserApprovalPage /></MainLayout></ProtectedRoute>} />
            <Route path="/pengawas" element={<ProtectedRoute><MainLayout><PengawasListPage /></MainLayout></ProtectedRoute>} />
            <Route path="/ladies" element={<ProtectedRoute><MainLayout><LadiesListPage /></MainLayout></ProtectedRoute>} />
            <Route path="/buku-kuning" element={<ProtectedRoute><MainLayout><BukuKuningPage /></MainLayout></ProtectedRoute>} />
            <Route path="/add-transaksi" element={<ProtectedRoute><MainLayout><AddTransaksiPage /></MainLayout></ProtectedRoute>} />
            <Route path="/absensi" element={<ProtectedRoute><MainLayout><AbsensiPage /></MainLayout></ProtectedRoute>} />
            <Route path="/rekap-voucher" element={<ProtectedRoute><MainLayout><RekapVoucherPage /></MainLayout></ProtectedRoute>} />
            <Route path="/performa-ladies" element={<ProtectedRoute><MainLayout><PerformaLadiesPage /></MainLayout></ProtectedRoute>} />
            <Route path="/add-transaksi-pengawas" element={<ProtectedRoute><MainLayout><AddTransaksiPengawasPage /></MainLayout></ProtectedRoute>} />
            <Route path="/buku-kuning-pengawas" element={<ProtectedRoute><MainLayout><BukuKuningPengawasPage /></MainLayout></ProtectedRoute>} />
            <Route path="/smart-chat" element={<ProtectedRoute><MainLayout><SmartChatPage /></MainLayout></ProtectedRoute>} />
            <Route path="/smart-chat-ladies" element={<ProtectedRoute><MainLayout><SmartChatLadiesPage /></MainLayout></ProtectedRoute>} />

            {/* Ladies-specific */}
            <Route path="/ladies/home" element={<ProtectedRoute><MainLayout><HomeLadiesPage /></MainLayout></ProtectedRoute>} />
            <Route path="/ladies/absensi" element={<ProtectedRoute><MainLayout><RiwayatAbsensiPage /></MainLayout></ProtectedRoute>} />
            <Route path="/ladies/voucher" element={<ProtectedRoute><MainLayout><VoucherListPage /></MainLayout></ProtectedRoute>} />
            <Route path="/ladies/kasbon" element={<ProtectedRoute><MainLayout><KasbonListPage /></MainLayout></ProtectedRoute>} />
            <Route path="/ladies/peraturan" element={<ProtectedRoute><MainLayout><PeraturanPage /></MainLayout></ProtectedRoute>} />
            <Route path="/ladies/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />

            {/* 404 fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;