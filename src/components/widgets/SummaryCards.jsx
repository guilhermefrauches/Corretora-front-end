import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getWallet } from '../../services/walletService';
import { usePrefs } from '../../context/PrefsContext';

function fmt(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SummaryCards({ summary, walletVersion = 0, walletData = null }) {
  const { dailyChange, dailyChangePct, monthReturn, cdiMonth, ibovMonth, accumulatedReturn, accumulatedReturnPct } = summary;
  const { prefs, updatePref } = usePrefs();
  const hidden = prefs.hideBalance;

  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState(false);

  useEffect(() => {
    if (walletData?.balance !== undefined) {
      setBalance(walletData.balance);
      setLoadingBalance(false);
      setBalanceError(false);
      return;
    }

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
  }, [walletVersion, walletData]);

  const balanceDisplay = hidden
    ? 'R$ ••••••'
    : loadingBalance
    ? '...'
    : balanceError
    ? 'Indisponível'
    : `R$ ${fmt(balance)}`;

  return (
    <div style={styles.grid}>
      <div style={{ ...styles.card, position: 'relative' }}>
        <button
          style={styles.eyeBtn}
          onClick={() => updatePref('hideBalance', !hidden)}
          title={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
        >
          {hidden ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <div style={styles.label}>Patrimônio total</div>
        <div style={{ ...styles.value, opacity: loadingBalance && !hidden ? 0.5 : 1 }}>{balanceDisplay}</div>
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
  eyeBtn: {
    position: 'absolute',
    top: '50%',
    right: 16,
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.35)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
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
