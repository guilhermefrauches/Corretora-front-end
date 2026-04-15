import React from 'react';
import { assets } from '../../data/mockData';

function fmt(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Badge({ value }) {
  const pos = value >= 0;
  return (
    <span style={{
      background: pos ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
      color: pos ? '#4ade80' : '#f87171',
      padding: '2px 7px',
      borderRadius: 4,
      fontSize: 11,
    }}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

const TYPE_COLORS = {
  acao: { bg: 'rgba(108,99,255,0.2)', color: '#a78bfa' },
  fii:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  renda_fixa: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
};

export default function AssetsTable() {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Meus ativos</span>
        <span style={styles.count}>{assets.length} ativos</span>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            {['Ativo', 'Qtd.', 'Preço médio', 'Valor total', 'Retorno / Dia'].map((h, i) => (
              <th key={h} style={{ ...styles.th, textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const tc = TYPE_COLORS[asset.type] || TYPE_COLORS.acao;
            return (
              <tr key={asset.ticker} style={styles.row}>
                <td style={styles.td}>
                  <span style={{ ...styles.ticker, background: tc.bg, color: tc.color }}>
                    {asset.ticker}
                  </span>
                  <span style={styles.assetName}>{asset.name}</span>
                </td>
                <td style={styles.td}>{asset.qty}</td>
                <td style={styles.td}>R$ {fmt(asset.avgPrice)}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>R$ {fmt(asset.totalValue)}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}><Badge value={asset.dayPct} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 18px 12px',
    borderBottom: '0.5px solid rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
  },
  count: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '10px 18px',
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    fontWeight: 400,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  row: {
    borderTop: '0.5px solid rgba(255,255,255,0.05)',
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  td: {
    padding: '12px 18px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  ticker: {
    fontWeight: 500,
    fontSize: 12,
    padding: '2px 7px',
    borderRadius: 4,
    marginRight: 8,
  },
  assetName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
};
