import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { getPortfolio } from '../../services/portfolioService';
import { getWallet } from '../../services/walletService';

ChartJS.register(ArcElement, Tooltip);

const TYPE_LABEL  = { acao: 'Ações', fii: 'FIIs', renda_fixa: 'Renda Fixa' };
const TYPE_COLOR  = { acao: '#4ade80', fii: '#f59e0b', renda_fixa: '#6c63ff' };

const AVAIL_COLOR = '#60a5fa';

function fmtTotal(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + 'k';
  return v.toFixed(0);
}

export default function AllocationDonut({ portfolioVersion = 0 }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.allSettled([getPortfolio(), getWallet()]).then(([pRes, wRes]) => {
      if (cancelled) return;

      const holdings = pRes.status === 'fulfilled' ? (pRes.value.positions ?? pRes.value.holdings ?? []) : [];
      const available = wRes.status === 'fulfilled' ? (wRes.value.balance ?? 0) : 0;

      // Aggregate by type
      const byType = {};
      for (const h of holdings) {
        const type     = h.assetType ?? h.type ?? 'acao';
        const qty      = h.qty ?? h.quantity ?? 0;
        const avgPrice = h.avgPrice ?? h.averagePrice ?? h.average_price ?? 0;
        byType[type] = (byType[type] ?? 0) + (h.totalValue ?? h.totalInvested ?? (qty * avgPrice) ?? 0);
      }

      const investedTotal = Object.values(byType).reduce((a, b) => a + b, 0);
      const grandTotal = investedTotal + available;

      if (grandTotal === 0) {
        setItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      const result = [];
      for (const [type, value] of Object.entries(byType)) {
        if (value > 0) {
          result.push({
            label: TYPE_LABEL[type] ?? type,
            pct: Math.round((value / grandTotal) * 100),
            color: TYPE_COLOR[type] ?? '#818cf8',
          });
        }
      }
      if (available > 0) {
        result.push({
          label: 'Disponível',
          pct: Math.round((available / grandTotal) * 100),
          color: AVAIL_COLOR,
        });
      }

      setItems(result);
      setTotal(grandTotal);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [portfolioVersion]);

  if (loading) {
    return (
      <div style={styles.card}>
        <div style={styles.title}>Alocação</div>
        <div style={styles.empty}>Carregando...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={styles.card}>
        <div style={styles.title}>Alocação</div>
        <div style={styles.empty}>Sem ativos para exibir</div>
      </div>
    );
  }

  const data = {
    labels: items.map(d => d.label),
    datasets: [{
      data: items.map(d => d.pct),
      backgroundColor: items.map(d => d.color),
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e2235',
        titleColor: 'rgba(255,255,255,0.6)',
        bodyColor: '#fff',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`,
        },
      },
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.title}>Alocação</div>

      <div style={styles.donutWrap}>
        <Doughnut data={data} options={options} />
        <div style={styles.center}>
          <div style={styles.centerValue}>{fmtTotal(total)}</div>
          <div style={styles.centerLabel}>total</div>
        </div>
      </div>

      <div style={styles.legend}>
        {items.map(({ label, pct, color }) => (
          <div key={label} style={styles.legendItem}>
            <div style={styles.legendLeft}>
              <div style={{ ...styles.dot, background: color }} />
              <span>{label}</span>
            </div>
            <span style={styles.pct}>{pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: 18,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  empty: {
    padding: '24px 0',
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
  },
  donutWrap: {
    position: 'relative',
    height: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  centerValue: {
    fontSize: 18,
    fontWeight: 500,
    color: '#fff',
  },
  centerLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
  legend: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: 12,
  },
  legendLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: 'rgba(255,255,255,0.65)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  pct: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
  },
};
