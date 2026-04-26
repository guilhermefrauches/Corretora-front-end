import React, { useState } from 'react';
import { Plus, ArrowUp, TrendingUp, TrendingDown, X } from 'lucide-react';
import { deposit, withdraw } from '../../services/walletService';

function Modal({ title, onClose, onConfirm, loading, error, accentColor }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) return;
    onConfirm(parsed, description);
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <span style={styles.modalTitle}>{title}</span>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Valor (R$)</label>
          <input
            style={styles.input}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />

          <label style={styles.label}>Descrição (opcional)</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Ex: Transferência bancária"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {error && <div style={styles.error}>{error}</div>}

          <button
            style={{ ...styles.confirmBtn, background: accentColor, opacity: loading ? 0.6 : 1 }}
            type="submit"
            disabled={loading}
          >
            {loading ? 'Aguarde...' : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function QuickActions({ onWalletUpdate }) {
  const [modal, setModal] = useState(null); // 'deposit' | 'withdraw' | null
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function openModal(type) {
    setError('');
    setModal(type);
  }

  function closeModal() {
    if (loading) return;
    setModal(null);
    setError('');
  }

  async function handleDeposit(amount, description) {
    setLoading(true);
    setError('');
    try {
      await deposit(amount, description || 'Depósito');
      setModal(null);
      onWalletUpdate?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao depositar.';
      setError(typeof msg === 'string' ? msg : 'Erro ao depositar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw(amount, description) {
    setLoading(true);
    setError('');
    try {
      await withdraw(amount, description || 'Saque');
      setModal(null);
      onWalletUpdate?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Saldo insuficiente ou erro ao sacar.';
      setError(typeof msg === 'string' ? msg : 'Saldo insuficiente ou erro ao sacar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div style={styles.row}>
        <button style={{ ...styles.btn, ...styles.primary }} onClick={() => openModal('deposit')}>
          <Plus size={14} /> Depositar
        </button>
        <button style={styles.btn} onClick={() => openModal('withdraw')}>
          <ArrowUp size={14} /> Sacar
        </button>
        <button style={styles.btn} onClick={() => {}}>
          <TrendingUp size={14} /> Comprar
        </button>
        <button style={styles.btn} onClick={() => {}}>
          <TrendingDown size={14} /> Vender
        </button>
      </div>

      {modal === 'deposit' && (
        <Modal
          title="Depositar"
          accentColor="#6c63ff"
          onClose={closeModal}
          onConfirm={handleDeposit}
          loading={loading}
          error={error}
        />
      )}

      {modal === 'withdraw' && (
        <Modal
          title="Sacar"
          accentColor="#f59e0b"
          onClose={closeModal}
          onConfirm={handleWithdraw}
          loading={loading}
          error={error}
        />
      )}
    </>
  );
}

const styles = {
  row: { display: 'flex', gap: 10 },
  btn: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    padding: 11,
    borderRadius: 8,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  primary: {
    background: '#6c63ff',
    borderColor: '#6c63ff',
    color: '#fff',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#1a1d2e',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: '28px 28px 24px',
    width: 360,
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  modalTitle: { fontSize: 16, fontWeight: 600, color: '#fff' },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8, marginBottom: 2 },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 14,
    color: '#fff',
    outline: 'none',
    fontFamily: 'inherit',
  },
  error: {
    marginTop: 6,
    padding: '9px 12px',
    background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)',
    borderRadius: 8,
    fontSize: 12,
    color: '#f87171',
  },
  confirmBtn: {
    marginTop: 18,
    padding: '12px',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
