import React, { useEffect, useState } from 'react';
import { getPortfolio } from '../../services/portfolioService';
import SellModal from './SellModal';

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
      {pos ? '+' : ''}{Number(value).toFixed(2)}%
    </span>
  );
}

const TYPE_COLORS = {
  acao:       { bg: 'rgba(108,99,255,0.2)',  color: '#a78bfa' },
  fii:        { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  renda_fixa: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80' },
};


export default function AssetsTable({ portfolioVersion = 0, onSellSuccess }) {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sellHolding, setSellHolding] = useState(null);

  function fetchPortfolio() {
    return getPortfolio()
      .then(data => setHoldings(data.positions ?? data.holdings ?? []))
      .catch(() => setError('Não foi possível carregar seus ativos.'));
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getPortfolio()
      .then(data => { if (!cancelled) setHoldings(data.positions ?? data.holdings ?? []); })
      .catch(() => { if (!cancelled) setError('Não foi possível carregar seus ativos.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [portfolioVersion]);

  function handleSellSuccess(wallet) {
    fetchPortfolio();
    onSellSuccess?.(wallet);
  }

  return (
    <>
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.title}>Meus ativos</span>
        <span style={styles.count}>{loading ? '...' : `${holdings.length} ativo${holdings.length !== 1 ? 's' : ''}`}</span>
      </div>

      {loading && (
        <div style={styles.state}>Carregando...</div>
      )}
      {!loading && error && (
        <div style={{ ...styles.state, color: '#f87171' }}>{error}</div>
      )}
      {!loading && !error && holdings.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyTitle}>Nenhum ativo na carteira</div>
          <div style={styles.emptySub}>Explore o mercado e faça sua primeira compra!</div>
        </div>
      )}
      {!loading && !error && holdings.length > 0 && (
        <table style={styles.table}>
          <thead>
            <tr>
              {['Ativo', 'Qtd.', 'Preço médio', 'Valor total', 'Retorno', ''].map((h, i) => (
                <th key={i} style={{ ...styles.th, textAlign: i >= 3 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {holdings.map((asset) => {
              const ticker        = asset.ticker ?? asset.symbol;
              const qty           = asset.qty ?? asset.quantity ?? 0;
              const avgPrice      = asset.avgPrice ?? asset.averagePrice ?? asset.average_price ?? 0;
              const currentPrice  = asset.currentPrice ?? avgPrice;
              const tc = TYPE_COLORS[asset.assetType ?? asset.type] || TYPE_COLORS.acao;
              const totalValue    = asset.totalValue ?? asset.totalInvested ?? (qty * avgPrice);
              const returnPct     = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;
              return (
                <tr key={ticker} style={styles.row}>
                  <td style={styles.td}>
                    <span style={{ ...styles.ticker, background: tc.bg, color: tc.color }}>
                      {ticker}
                    </span>
                    <span style={styles.assetName}>{asset.name}</span>
                  </td>
                  <td style={styles.td}>{qty}</td>
                  <td style={styles.td}>R$ {fmt(avgPrice)}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>R$ {fmt(totalValue)}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}><Badge value={returnPct} /></td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <button style={styles.sellBtn} onClick={() => setSellHolding({ ...asset, ticker, qty, avgPrice, currentPrice, totalValue })}>
                      Vender
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

    </div>

    {sellHolding && (
      <SellModal
        holding={sellHolding}
        onClose={() => setSellHolding(null)}
        onSuccess={(wallet) => {
          setSellHolding(null);
          handleSellSuccess(wallet);
        }}
      />
    )}
    </>
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
  state: {
    padding: '28px 18px',
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  emptyState: {
    padding: '32px 18px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.25)',
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
  sellBtn: {
    background: 'rgba(167,139,250,0.12)',
    border: '0.5px solid rgba(167,139,250,0.3)',
    color: '#a78bfa',
    borderRadius: 6,
    padding: '4px 10px',
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'background 0.15s',
  },
};
