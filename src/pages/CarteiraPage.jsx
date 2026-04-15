import React from 'react';
import SummaryCards from '../components/widgets/SummaryCards';
import AssetsTable from '../components/widgets/AssetsTable';
import AllocationDonut from '../components/charts/AllocationDonut';
import { portfolioSummary } from '../data/mockData';

export default function CarteiraPage() {
  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Carteira</div>
      <SummaryCards summary={portfolioSummary} />
      <div style={styles.midRow}>
        <AssetsTable />
        <AllocationDonut />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
  },
  midRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 280px',
    gap: 14,
    alignItems: 'start',
  },
};
