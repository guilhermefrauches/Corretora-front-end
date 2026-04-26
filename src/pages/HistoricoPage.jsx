import React, { useEffect, useState, useMemo } from 'react';
import { Download, Search } from 'lucide-react';
import { getWallet } from '../services/walletService';

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleDateString('pt-BR');
}

function typeLabel(type) {
  const map = { DEPOSIT: 'Depósito', WITHDRAW: 'Saque', COMPRA: 'Compra', VENDA: 'Venda' };
  return map[(type ?? '').toUpperCase()] ?? type ?? '-';
}

function isPositive(type) {
  return ['DEPOSIT', 'COMPRA'].includes((type ?? '').toUpperCase());
}

function exportCSV(transactions) {
  const header = ['Data', 'Tipo', 'Descrição', 'Valor (R$)'];
  const rows = transactions.map(tx => [
    fmtDate(tx.date ?? tx.createdAt),
    typeLabel(tx.type),
    tx.description ?? '',
    (isPositive(tx.type) ? '' : '-') + fmt(Math.abs(tx.amount ?? tx.total ?? 0)),
  ]);
  const content = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `extrato_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const TYPE_FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Depósito', value: 'DEPOSIT' },
  { label: 'Saque', value: 'WITHDRAW' },
  { label: 'Compra', value: 'COMPRA' },
  { label: 'Venda', value: 'VENDA' },
];

const PERIOD_FILTERS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: 'Tudo', days: null },
];

export default function HistoricoPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodDays, setPeriodDays] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWallet()
      .then(w => { if (!cancelled) setTransactions(w.transactions ?? []); })
      .catch(() => { if (!cancelled) setError('Não foi possível carregar o histórico.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const cutoff = periodDays ? new Date(Date.now() - periodDays * 86400000) : null;
    return transactions.filter(tx => {
      if (typeFilter !== 'all' && (tx.type ?? '').toUpperCase() !== typeFilter) return false;
      if (cutoff) {
        const d = new Date(tx.date ?? tx.createdAt);
        if (!isNaN(d) && d < cutoff) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const desc = (tx.description ?? '').toLowerCase();
        const type = typeLabel(tx.type).toLowerCase();
        if (!desc.includes(q) && !type.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, periodDays, search]);

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Histórico de Transações</div>
        <button
          style={{ ...styles.exportBtn, opacity: filtered.length === 0 ? 0.4 : 1 }}
          disabled={filtered.length === 0}
          onClick={() => exportCSV(filtered)}
        >
          <Download size={13} /> Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        {/* Search */}
        <div style={styles.searchWrap}>
          <Search size={13} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
          <input
            style={styles.searchInput}
            placeholder="Buscar por descrição ou tipo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Type */}
        <div style={styles.pillGroup}>
          {TYPE_FILTERS.map(f => (
            <button
              key={f.value}
              style={{ ...styles.pill, ...(typeFilter === f.value ? styles.pillActive : {}) }}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Period */}
        <div style={styles.pillGroup}>
          {PERIOD_FILTERS.map(f => (
            <button
              key={f.label}
              style={{ ...styles.pill, ...(periodDays === f.days ? styles.pillActive : {}) }}
              onClick={() => setPeriodDays(f.days)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        {loading && <div style={styles.state}>Carregando...</div>}
        {error && <div style={{ ...styles.state, color: '#f87171' }}>{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div style={styles.state}>Nenhuma transação encontrada.</div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div style={styles.count}>
              {filtered.length} transaç{filtered.length === 1 ? 'ão' : 'ões'}
              {filtered.length !== transactions.length && ` (de ${transactions.length})`}
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Data', 'Tipo', 'Descrição', 'Valor'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx, i) => (
                  <tr key={tx.id ?? i} style={styles.tr}>
                    <td style={{ ...styles.td, color: 'rgba(255,255,255,0.45)' }}>
                      {fmtDate(tx.date ?? tx.createdAt)}
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, ...(isPositive(tx.type) ? styles.badgeIn : styles.badgeOut) }}>
                        {typeLabel(tx.type)}
                      </span>
                    </td>
                    <td style={styles.td}>{tx.description ?? '-'}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: 600, color: isPositive(tx.type) ? '#4ade80' : '#f87171' }}>
                      {isPositive(tx.type) ? '+' : '-'} R$ {fmt(Math.abs(tx.amount ?? tx.total ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  },
  filters: { display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 12px', flex: '1 1 200px', minWidth: 180,
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: 13, fontFamily: 'inherit', width: '100%',
  },
  pillGroup: { display: 'flex', gap: 6 },
  pill: {
    padding: '6px 12px', borderRadius: 20,
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  },
  pillActive: {
    background: 'rgba(108,99,255,0.18)', borderColor: 'rgba(108,99,255,0.4)',
    color: '#a78bfa',
  },
  card: {
    background: '#1a1d2e', borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: 18, overflowX: 'auto',
  },
  count: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 14 },
  state: { padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 12px 10px',
  },
  tr: { borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  td: { padding: '11px 12px', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  badge: {
    display: 'inline-block', borderRadius: 6, padding: '2px 8px',
    fontSize: 11, fontWeight: 600, letterSpacing: '0.3px',
  },
  badgeIn:  { background: 'rgba(74,222,128,0.12)',  color: '#4ade80' },
  badgeOut: { background: 'rgba(248,113,113,0.12)', color: '#f87171' },
};
