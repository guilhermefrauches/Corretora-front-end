import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PrefsProvider } from './context/PrefsContext';

import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import SummaryCards from './components/widgets/SummaryCards';
import QuickActions from './components/widgets/QuickActions';
import PerformanceChart from './components/charts/PerformanceChart';
import AllocationDonut from './components/charts/AllocationDonut';
import AssetsTable from './components/widgets/AssetsTable';
import CarteiraPage from './pages/CarteiraPage';
import MercadoPage from './pages/MercadoPage';
import HistoricoPage from './pages/HistoricoPage';
import RelatoriosPage from './pages/RelatoriosPage';
import AdminPage from './pages/AdminPage';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import PerfilPage from './pages/PerfilPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { portfolioSummary } from './data/mockData';

function OverviewPage() {
  const [walletVersion, setWalletVersion] = useState(0);
  const [walletData, setWalletData] = useState(null);

  function handleWalletUpdate(wallet) {
    if (wallet?.balance !== undefined) {
      setWalletData(wallet);
    } else {
      setWalletData(null);
      setWalletVersion((v) => v + 1);
    }
  }

  return (
    <>
      <SummaryCards summary={portfolioSummary} walletVersion={walletVersion} walletData={walletData} />
      <QuickActions onWalletUpdate={handleWalletUpdate} />
      <div style={styles.midRow}>
        <PerformanceChart />
        <AllocationDonut />
      </div>
      <AssetsTable />
    </>
  );
}

const PAGES = {
  overview:      <OverviewPage />,
  carteira:      <CarteiraPage />,
  mercado:       <MercadoPage />,
  historico:     <HistoricoPage />,
  relatorios:    <RelatoriosPage />,
  admin:         <AdminPage />,
  configuracoes: <ConfiguracoesPage />,
  perfil:        <PerfilPage />,
};

function Dashboard({ initialPage = 'overview' }) {
  const [activePage, setActivePage] = useState(initialPage);
  const { user, logout } = useAuth();

  return (
    <div style={styles.app}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={logout} userRole={user?.role} />
      <main style={styles.main}>
        <TopBar onNavigate={setActivePage} />
        {PAGES[activePage] ?? PAGES.overview}
      </main>
    </div>
  );
}

function RootRedirect() {
  const { token } = useAuth();
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/admin" element={<AdminRoute><Dashboard initialPage="admin" /></AdminRoute>} />
      <Route path="/dashboard/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PrefsProvider>
          <AppRoutes />
        </PrefsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles = {
  app: { display: 'flex', minHeight: '100vh', background: '#0f1117' },
  main: {
    flex: 1, padding: 24, display: 'flex', flexDirection: 'column',
    gap: 20, overflowY: 'auto',
  },
  midRow: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14 },
};
