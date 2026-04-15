import React from 'react';
import { marketIndices, marketHighlights } from '../data/mockData';

export default function MercadoPage() {
  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Mercado</div>

      <div style={styles.indicesGrid}>
        {marketIndices.map((idx) => (
          <div key={idx.label} style={styles.indexCard}>
            <div style={styles.indexLabel}>{idx.label}</div>
            <div style={styles.indexValue}>{idx.value}</div>
            <div style={{ ...styles.indexChange, color: idx.positive ? '#4ade80' : '#f87171' }}>
              {idx.positive ? '▲' : '▼'} {idx.change}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>Destaques do dia</div>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Ticker', 'Nome', 'Preço', 'Variação', 'Volume'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {marketHighlights.map((row) => (
              <tr key={row.ticker} style={styles.tr}>
                <td style={styles.tdTicker}>{row.ticker}</td>
                <td style={styles.td}>{row.name}</td>
                <td style={styles.td}>R$ {row.price}</td>
                <td style={{ ...styles.td, color: row.positive ? '#4ade80' : '#f87171', fontWeight: 500 }}>
                  {row.positive ? '▲' : '▼'} {row.change}
                </td>
                <td style={{ ...styles.td, color: 'rgba(255,255,255,0.45)' }}>{row.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20 },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  indicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
  },
  indexCard: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: '16px 18px',
  },
  indexLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 8,
  },
  indexValue: { fontSize: 18, fontWeight: 500, color: '#fff', marginBottom: 4 },
  indexChange: { fontSize: 12 },
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: 18,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 14,
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0 12px 10px',
  },
  tr: { borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  td: { padding: '11px 12px', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  tdTicker: {
    padding: '11px 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    fontFamily: 'monospace',
  },
};
