import React, { useState } from 'react';
import SummaryCards from '../components/widgets/SummaryCards';
import AssetsTable from '../components/widgets/AssetsTable';
import AllocationDonut from '../components/charts/AllocationDonut';

export default function CarteiraPage() {
  const [version, setVersion] = useState(0);

  function handleSellSuccess() {
    setVersion(v => v + 1);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Carteira</div>
      <SummaryCards
        walletVersion={version}
        portfolioVersion={version}
      />
      <div style={styles.midRow}>
        <AssetsTable portfolioVersion={version} onSellSuccess={handleSellSuccess} />
        <AllocationDonut portfolioVersion={version} />
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
