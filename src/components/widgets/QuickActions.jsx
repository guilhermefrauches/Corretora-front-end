import React, { useState } from 'react';
import { Plus, ArrowUp, TrendingUp, TrendingDown, X } from 'lucide-react';
import { withdraw } from '../../services/walletService';
import DepositModal from './DepositModal';

function WithdrawModal({ onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) { setError('Informe um valor válido.'); return; }

    setLoading(true);
    setError('');
    try {
      await withdraw(parsed, description || 'Saque');
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Saldo insuficiente ou erro ao sacar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>Sacar</span>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={styles.label}>Valor (R$)</div>
          <input
            style={styles.input} type="number" min="0.01" step="0.01"
            placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
          />
          <div style={styles.label}>Descrição (opcional)</div>
          <input
            style={styles.input} type="text" placeholder="Ex: Resgate"
            value={description} onChange={(e) => setDescription(e.target.value)}
          />
          {error && <div style={styles.error}>{error}</div>}
          <button style={{ ...styles.btn, marginTop: 12, background: '#f59e0b', opacity: loading ? 0.6 : 1 }}
            type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function QuickActions({ onWalletUpdate }) {
  const [modal, setModal] = useState(null);

  return (
    <>
      <div style={styles.row}>
        <button style={{ ...styles.actionBtn, ...styles.primary }} onClick={() => setModal('deposit')}>
          <Plus size={14} /> Depositar
        </button>
        <button style={styles.actionBtn} onClick={() => setModal('withdraw')}>
          <ArrowUp size={14} /> Sacar
        </button>
        <button style={styles.actionBtn}><TrendingUp size={14} /> Comprar</button>
        <button style={styles.actionBtn}><TrendingDown size={14} /> Vender</button>
      </div>

      {modal === 'deposit' && (
        <DepositModal
          onClose={() => setModal(null)}
          onSuccess={(wallet) => { setModal(null); onWalletUpdate?.(wallet); }}
        />
      )}

      {modal === 'withdraw' && (
        <WithdrawModal
          onClose={() => setModal(null)}
          onSuccess={() => onWalletUpdate?.()}
        />
      )}
    </>
  );
}

const styles = {
  row: { display: 'flex', gap: 10 },
  actionBtn: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    padding: 11,
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'inherit',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primary: { background: '#6c63ff', borderColor: '#6c63ff', color: '#fff' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '28px 28px 24px', width: 360,
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  title: { fontSize: 16, fontWeight: 600, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, display: 'flex' },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4, marginTop: 8 },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff',
    outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  error: {
    padding: '9px 12px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 12, color: '#f87171',
  },
  btn: {
    padding: '12px', color: '#fff', border: 'none', borderRadius: 8,
    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', width: '100%',
  },
};
