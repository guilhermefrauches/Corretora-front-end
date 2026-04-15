import React from 'react';
import { transactions } from '../data/mockData';

function fmt(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function HistoricoPage() {
  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Histórico de Transações</div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              {['Data', 'Tipo', 'Ticker', 'Ativo', 'Qtd', 'Preço', 'Total'].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr key={i} style={styles.tr}>
                <td style={{ ...styles.td, color: 'rgba(255,255,255,0.45)' }}>{tx.date}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, ...(tx.type === 'Compra' ? styles.badgeBuy : styles.badgeSell) }}>
                    {tx.type}
                  </span>
                </td>
                <td style={styles.tdTicker}>{tx.ticker}</td>
                <td style={styles.td}>{tx.name}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>{tx.qty}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>R$ {fmt(tx.price)}</td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: 500, color: '#fff' }}>
                  R$ {fmt(tx.total)}
                </td>
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
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: 18,
    overflowX: 'auto',
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
  badge: {
    display: 'inline-block',
    borderRadius: 6,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.3px',
  },
  badgeBuy: { background: 'rgba(74,222,128,0.12)', color: '#4ade80' },
  badgeSell: { background: 'rgba(248,113,113,0.12)', color: '#f87171' },
};
