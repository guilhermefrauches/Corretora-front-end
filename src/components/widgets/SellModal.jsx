import React, { useState, useEffect } from 'react';
import { X, TrendingDown, AlertCircle } from 'lucide-react';
import { sellAsset } from '../../services/portfolioService';
import { getQuote } from '../../services/marketService';

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function SellModal({ holding, onClose, onSuccess }) {
  const [qty, setQty] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getQuote(holding.ticker)
      .then(data => {
        const price = data?.results?.[0]?.regularMarketPrice;
        setCurrentPrice(price ?? holding.avgPrice);
      })
      .catch(() => setCurrentPrice(holding.avgPrice))
      .finally(() => setLoadingPrice(false));
  }, [holding.ticker, holding.avgPrice]);

  const qtyNum = parseInt(qty, 10) || 0;
  const price = currentPrice ?? holding.avgPrice;
  const total = qtyNum * price;
  const costBasis = qtyNum * holding.avgPrice;
  const pl = total - costBasis;
  const plPct = costBasis > 0 ? (pl / costBasis) * 100 : 0;
  const qtyExceeds = qtyNum > holding.qty;
  const canSell = qtyNum > 0 && !qtyExceeds && !loadingPrice && !submitting;

  async function handleConfirm() {
    if (!canSell) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await sellAsset({
        ticker: holding.ticker,
        qty: qtyNum,
        price,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(result?.wallet); onClose(); }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao executar venda.');
      setSubmitting(false);
    }
  }

  const plColor = pl >= 0 ? '#4ade80' : '#f87171';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Vender</div>
            <div style={styles.subtitle}>{holding.ticker} · {holding.name}</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {success ? (
          <div style={styles.stateWrap}>
            <TrendingDown size={40} color="#a78bfa" />
            <div style={{ ...styles.stateText, color: '#a78bfa' }}>Venda realizada!</div>
            <div style={styles.stateSub}>Valor creditado no saldo disponível</div>
          </div>
        ) : (
          <>
            <div style={styles.priceRow}>
              <div style={styles.priceCard}>
                <div style={styles.cardLabel}>Cotação atual</div>
                <div style={styles.cardValue}>
                  {loadingPrice ? '...' : `R$ ${fmt(price)}`}
                </div>
              </div>
              <div style={styles.priceCard}>
                <div style={styles.cardLabel}>Você possui</div>
                <div style={styles.cardValue}>{holding.qty} cotas</div>
              </div>
            </div>

            <div style={styles.inputWrap}>
              <label style={styles.inputLabel}>Quantidade a vender (máx. {holding.qty})</label>
              <input
                style={{
                  ...styles.input,
                  borderColor: qtyExceeds ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.12)',
                }}
                type="number"
                min="1"
                max={holding.qty}
                step="1"
                placeholder="0"
                value={qty}
                onChange={e => { setQty(e.target.value.replace(/\D/g, '')); setError(''); }}
                autoFocus
              />
            </div>

            <div style={styles.totalRow}>
              <div>
                <div style={styles.totalLabel}>Você receberá</div>
                <div style={{ ...styles.totalValue, color: qtyNum > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                  {qtyNum > 0 && !loadingPrice ? `R$ ${fmt(total)}` : '—'}
                </div>
              </div>
              {qtyNum > 0 && !loadingPrice && (
                <div style={{ textAlign: 'right' }}>
                  <div style={styles.totalLabel}>Resultado</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: plColor }}>
                    {pl >= 0 ? '+' : ''}R$ {fmt(Math.abs(pl))} ({plPct >= 0 ? '+' : ''}{plPct.toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>

            {qtyExceeds && (
              <div style={styles.alertRow}>
                <AlertCircle size={13} />
                Quantidade maior que o saldo em carteira ({holding.qty})
              </div>
            )}

            {error && <div style={styles.errorBox}>{error}</div>}

            <button
              style={{ ...styles.btn, opacity: canSell ? 1 : 0.4 }}
              disabled={!canSell}
              onClick={handleConfirm}
            >
              {submitting
                ? 'Vendendo...'
                : qtyNum > 0 && !qtyExceeds
                  ? `Vender ${qtyNum} ${holding.ticker} · R$ ${fmt(total)}`
                  : 'Informe a quantidade'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '24px 24px 20px', width: 380,
    boxShadow: '0 28px 80px rgba(0,0,0,0.6)',
    animation: 'modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 700, color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 6, display: 'flex',
    borderRadius: 8, flexShrink: 0,
  },
  priceRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 },
  priceCard: {
    background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '12px 14px',
  },
  cardLabel: {
    fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
    letterSpacing: '0.5px', marginBottom: 5,
  },
  cardValue: { fontSize: 15, fontWeight: 600, color: '#fff' },
  inputWrap: { marginBottom: 14 },
  inputLabel: {
    display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6,
  },
  input: {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '12px 14px',
    fontSize: 20, fontWeight: 700, color: '#fff',
    fontFamily: 'inherit', outline: 'none',
  },
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    padding: '12px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  totalLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  totalValue: { fontSize: 16, fontWeight: 700 },
  alertRow: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 12, color: '#f87171', marginBottom: 12,
  },
  errorBox: {
    padding: '10px 13px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8,
    fontSize: 12, color: '#f87171', marginBottom: 12,
  },
  btn: {
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(167,139,250,0.25)',
    transition: 'opacity 0.15s',
  },
  stateWrap: {
    textAlign: 'center', padding: '24px 0 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  stateText: { fontSize: 15, fontWeight: 600 },
  stateSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
};
