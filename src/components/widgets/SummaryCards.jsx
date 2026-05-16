import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getWallet } from '../../services/walletService';
import { getPortfolio } from '../../services/portfolioService';
import { usePrefs } from '../../context/PrefsContext';

function fmt(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v) {
  const n = Number(v);
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export default function SummaryCards({ walletVersion = 0, walletData = null, portfolioVersion = 0 }) {
  const { prefs, updatePref } = usePrefs();
  const hidden = prefs.hideBalance;

  const [availableBalance, setAvailableBalance]   = useState(null);
  const [investedValue, setInvestedValue]         = useState(null);
  const [allTimeReturnBRL, setAllTimeReturnBRL]   = useState(null);
  const [allTimeReturnPct, setAllTimeReturnPct]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (walletData?.balance !== undefined) {
      setAvailableBalance(walletData.balance);
    }
  }, [walletData]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const walletPromise = walletData?.balance !== undefined
      ? Promise.resolve({ balance: walletData.balance })
      : getWallet();

    Promise.allSettled([walletPromise, getPortfolio()]).then(([walletRes, portfolioRes]) => {
      if (cancelled) return;
      if (walletRes.status === 'fulfilled') {
        setAvailableBalance(walletRes.value.balance ?? 0);
      }
      if (portfolioRes.status === 'fulfilled') {
        const p = portfolioRes.value;
        setInvestedValue(p.totalValue ?? 0);
        setAllTimeReturnBRL(p.allTimeReturnBRL ?? 0);
        setAllTimeReturnPct(p.allTimeReturnPct ?? 0);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [walletVersion, portfolioVersion]);

  const disponivel  = availableBalance ?? 0;
  const investido   = investedValue ?? 0;
  const patrimonio  = disponivel + investido;
  const returnPositive = (allTimeReturnBRL ?? 0) >= 0;

  const mask = (v) => (hidden ? 'R$ ••••••' : v);
  const patrimonioDisplay = loading ? '...' : mask(`R$ ${fmt(patrimonio)}`);
  const dispDisplay = loading ? '...' : (hidden ? '••••••' : `R$ ${fmt(disponivel)}`);
  const invDisplay  = loading ? '...' : (hidden ? '••••••' : `R$ ${fmt(investido)}`);
  const returnBRLDisplay = loading ? '...' : (hidden ? '••••••' : `${returnPositive ? '+' : '-'}R$ ${fmt(Math.abs(allTimeReturnBRL ?? 0))}`);
  const returnPctDisplay = loading ? '...' : (hidden ? '••••••' : fmtPct(allTimeReturnPct ?? 0));

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
        <div style={{ ...styles.value, opacity: loading && !hidden ? 0.5 : 1 }}>{patrimonioDisplay}</div>
        <div style={styles.splitRow}>
          <span style={styles.splitItem}>
            <span style={{ ...styles.splitDot, background: '#6c63ff' }} />
            Disponível: {dispDisplay}
          </span>
          <span style={styles.splitItem}>
            <span style={{ ...styles.splitDot, background: '#f59e0b' }} />
            Investido: {invDisplay}
          </span>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Rentabilidade total</div>
        <div style={{ ...styles.value, color: returnPositive ? '#4ade80' : '#f87171', opacity: loading ? 0.5 : 1 }}>
          {returnPctDisplay}
        </div>
        <div style={{ ...styles.sub, color: 'rgba(255,255,255,0.4)' }}>
          sobre o valor investido
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Rendimento acumulado</div>
        <div style={{ ...styles.value, color: returnPositive ? '#4ade80' : '#f87171', opacity: loading ? 0.5 : 1 }}>
          {returnBRLDisplay}
        </div>
        <div style={{ ...styles.sub, color: 'rgba(255,255,255,0.4)' }}>
          valor a mercado vs. preço médio
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 },
  card: {
    background: '#1a1d2e', borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)', padding: 18,
  },
  label: {
    fontSize: 11, color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8,
  },
  eyeBtn: {
    position: 'absolute', top: '50%', right: 16, transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)',
    cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', transition: 'color 0.15s',
  },
  value: { fontSize: 22, fontWeight: 500, color: '#fff', marginBottom: 6, transition: 'opacity 0.2s' },
  sub: { fontSize: 12 },
  splitRow: { display: 'flex', gap: 14, flexWrap: 'wrap' },
  splitItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.45)' },
  splitDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
};
