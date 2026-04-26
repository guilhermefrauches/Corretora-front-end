import React, { useEffect, useState } from 'react';
import { getWallet } from '../services/walletService';

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('pt-BR');
}

function typeLabel(type) {
  if (!type) return '-';
  const map = { DEPOSIT: 'Depósito', WITHDRAW: 'Saque', COMPRA: 'Compra', VENDA: 'Venda' };
  return map[type.toUpperCase()] ?? type;
}

function isPositive(type) {
  return ['DEPOSIT', 'COMPRA'].includes((type ?? '').toUpperCase());
}

export default function HistoricoPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getWallet()
      .then((wallet) => {
        if (!cancelled) setTransactions(wallet.transactions ?? []);
      })
      .catch(() => {
        if (!cancelled) setError('Não foi possível carregar o histórico.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Histórico de Transações</div>

      <div style={styles.card}>
        {loading && <div style={styles.state}>Carregando...</div>}
        {error && <div style={{ ...styles.state, color: '#f87171' }}>{error}</div>}

        {!loading && !error && transactions.length === 0 && (
          <div style={styles.state}>Nenhuma transação encontrada.</div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Data', 'Tipo', 'Descrição', 'Valor'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, i) => (
                <tr key={tx.id ?? i} style={styles.tr}>
                  <td style={{ ...styles.td, color: 'rgba(255,255,255,0.45)' }}>
                    {fmtDate(tx.date ?? tx.createdAt)}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        ...(isPositive(tx.type) ? styles.badgeBuy : styles.badgeSell),
                      }}
                    >
                      {typeLabel(tx.type)}
                    </span>
                  </td>
                  <td style={styles.td}>{tx.description ?? '-'}</td>
                  <td
                    style={{
                      ...styles.td,
                      textAlign: 'right',
                      fontWeight: 500,
                      color: isPositive(tx.type) ? '#4ade80' : '#f87171',
                    }}
                  >
                    {isPositive(tx.type) ? '+' : '-'} R$ {fmt(Math.abs(tx.amount ?? tx.total ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
  state: {
    padding: '24px 0',
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
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
