import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
import { buyAsset } from '../../services/portfolioService';
import { getWallet } from '../../services/walletService';

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BuyModal({ stock, type, onClose, onSuccess }) {
  // stock = { stock: "PETR4", name: "Petrobras PN", close: 38.30 }
  const [qty, setQty] = useState('');
  const [availableBalance, setAvailableBalance] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getWallet()
      .then(w => setAvailableBalance(w.balance))
      .catch(() => setAvailableBalance(null))
      .finally(() => setLoadingWallet(false));
  }, []);

  const price = stock.close ?? 0;
  const qtyNum = parseInt(qty, 10) || 0;
  const total = qtyNum * price;
  const insufficient = availableBalance !== null && total > availableBalance && qtyNum > 0;
  const canBuy = qtyNum > 0 && !insufficient && !loadingWallet && !submitting;

  async function handleConfirm() {
    if (!canBuy) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await buyAsset({
        ticker: stock.stock,
        name: stock.name,
        type,
        qty: qtyNum,
        price,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(result?.wallet); onClose(); }, 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao executar compra.');
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Comprar</div>
            <div style={styles.subtitle}>{stock.stock} · {stock.name}</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {success ? (
          <div style={styles.stateWrap}>
            <ShoppingCart size={40} color="#4ade80" />
            <div style={{ ...styles.stateText, color: '#4ade80' }}>Compra realizada!</div>
            <div style={styles.stateSub}>Ativo adicionado à sua carteira</div>
          </div>
        ) : (
          <>
            <div style={styles.priceRow}>
              <div style={styles.priceCard}>
                <div style={styles.cardLabel}>Cotação atual</div>
                <div style={styles.cardValue}>R$ {fmt(price)}</div>
              </div>
              <div style={styles.priceCard}>
                <div style={styles.cardLabel}>Saldo disponível</div>
                <div style={styles.cardValue}>
                  {loadingWallet ? '...' : availableBalance === null ? '—' : `R$ ${fmt(availableBalance)}`}
                </div>
              </div>
            </div>

            <div style={styles.inputWrap}>
              <label style={styles.inputLabel}>Quantidade</label>
              <input
                style={styles.input}
                type="number"
                min="1"
                step="1"
                placeholder="0"
                value={qty}
                onChange={e => { setQty(e.target.value.replace(/\D/g, '')); setError(''); }}
                autoFocus
              />
            </div>

            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total da operação</span>
              <span style={{ ...styles.totalValue, color: qtyNum > 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                {qtyNum > 0 ? `R$ ${fmt(total)}` : '—'}
              </span>
            </div>

            {insufficient && (
              <div style={styles.alertRow}>
                <AlertCircle size={13} />
                Saldo insuficiente. Disponível: R$ {fmt(availableBalance)}
              </div>
            )}

            {error && <div style={styles.errorBox}>{error}</div>}

            <button
              style={{ ...styles.btn, opacity: canBuy ? 1 : 0.4 }}
              disabled={!canBuy}
              onClick={handleConfirm}
            >
              {submitting
                ? 'Comprando...'
                : qtyNum > 0
                  ? `Comprar ${qtyNum} ${stock.stock} · R$ ${fmt(total)}`
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
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)',
    marginBottom: 14,
  },
  totalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
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
    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
    color: '#0f1117', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(74,222,128,0.25)',
    transition: 'opacity 0.15s',
  },
  stateWrap: {
    textAlign: 'center', padding: '24px 0 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  stateText: { fontSize: 15, fontWeight: 600 },
  stateSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
};
