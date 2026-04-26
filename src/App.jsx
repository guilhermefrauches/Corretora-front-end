import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { portfolioSummary } from './data/mockData';

function OverviewPage() {
  const [walletVersion, setWalletVersion] = useState(0);

  return (
    <>
      <SummaryCards summary={portfolioSummary} walletVersion={walletVersion} />
      <QuickActions onWalletUpdate={() => setWalletVersion((v) => v + 1)} />
      <div style={styles.midRow}>
        <PerformanceChart />
        <AllocationDonut />
      </div>
      <AssetsTable />
    </>
  );
}

const PAGES = {
  overview: <OverviewPage />,
  carteira: <CarteiraPage />,
  mercado: <MercadoPage />,
  historico: <HistoricoPage />,
  relatorios: <RelatoriosPage />,
};

function Dashboard() {
  const [activePage, setActivePage] = useState('overview');
  const { user, logout } = useAuth();

  return (
    <div style={styles.app}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={logout} />
      <main style={styles.main}>
        <TopBar userName={user?.name ?? 'Usuário'} />
        {PAGES[activePage]}
      </main>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token } = useAuth();
  return token ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f1117',
  },
  main: {
    flex: 1,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    overflowY: 'auto',
  },
  midRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 14,
  },
};
