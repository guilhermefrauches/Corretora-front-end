import { useState } from 'react';
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
import { portfolioSummary } from './data/mockData';

function OverviewPage() {
  return (
    <>
      <SummaryCards summary={portfolioSummary} />
      <QuickActions onAction={(label) => console.log('Action:', label)} />
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

export default function App() {
  const [activePage, setActivePage] = useState('overview');

  return (
    <div style={styles.app}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main style={styles.main}>
        <TopBar userName="Guilherme" />
        {PAGES[activePage]}
      </main>
    </div>
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
