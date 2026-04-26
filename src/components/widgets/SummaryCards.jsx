import React, { useEffect, useState } from 'react';
import { getWallet } from '../../services/walletService';

function fmt(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SummaryCards({ summary, walletVersion = 0 }) {
  const { dailyChange, dailyChangePct, monthReturn, cdiMonth, ibovMonth, accumulatedReturn, accumulatedReturnPct } = summary;

  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingBalance(true);
    setBalanceError(false);

    getWallet()
      .then((wallet) => {
        if (!cancelled) setBalance(wallet.balance);
      })
      .catch(() => {
        if (!cancelled) setBalanceError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingBalance(false);
      });

    return () => { cancelled = true; };
  }, [walletVersion]);

  const balanceDisplay = loadingBalance
    ? '...'
    : balanceError
    ? 'Indisponível'
    : `R$ ${fmt(balance)}`;

  return (
    <div style={styles.grid}>
      <div style={styles.card}>
        <div style={styles.label}>Patrimônio total</div>
        <div style={{ ...styles.value, opacity: loadingBalance ? 0.5 : 1 }}>{balanceDisplay}</div>
        <div style={{ ...styles.sub, color: '#4ade80' }}>
          ▲ +R$ {fmt(dailyChange)} hoje (+{dailyChangePct.toFixed(2)}%)
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Rentabilidade no mês</div>
        <div style={{ ...styles.value, color: '#4ade80' }}>+{monthReturn.toFixed(2)}%</div>
        <div style={{ ...styles.sub, color: 'rgba(255,255,255,0.4)' }}>
          CDI: +{cdiMonth.toFixed(2)}% · IBOV: +{ibovMonth.toFixed(2)}%
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Rendimento acumulado</div>
        <div style={{ ...styles.value, color: '#4ade80' }}>+R$ {fmt(accumulatedReturn)}</div>
        <div style={{ ...styles.sub, color: 'rgba(255,255,255,0.4)' }}>
          desde jan/2023 · +{accumulatedReturnPct.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 14,
  },
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: 18,
  },
  label: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: 500,
    color: '#fff',
    marginBottom: 4,
    transition: 'opacity 0.2s',
  },
  sub: {
    fontSize: 12,
  },
};
