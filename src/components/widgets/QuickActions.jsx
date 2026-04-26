import React, { useState } from 'react';
import { Plus, ArrowUp, TrendingUp, TrendingDown, X, Landmark, CheckCircle } from 'lucide-react';
import { withdraw } from '../../services/walletService';
import DepositModal from './DepositModal';

function formatBRL(digits) {
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function WithdrawModal({ onClose, onSuccess }) {
  const [digits, setDigits] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const parsed = digits ? parseInt(digits, 10) / 100 : 0;

  function handleAmountChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setDigits(raw);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!parsed || parsed <= 0) { setError('Informe um valor válido.'); return; }

    setLoading(true);
    setError('');
    try {
      const wallet = await withdraw(parsed, description || 'Saque');
      setSuccess(true);
      setTimeout(() => { onSuccess(wallet); onClose(); }, 1400);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Saldo insuficiente ou erro ao sacar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={wStyles.overlay} onClick={onClose}>
      <div style={wStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={wStyles.header}>
          <span style={wStyles.title}>Sacar</span>
          <button style={wStyles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {success ? (
          <div style={wStyles.stateWrap}>
            <CheckCircle size={44} color="#4ade80" />
            <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15, marginTop: 10 }}>Saque solicitado!</div>
          </div>
        ) : (
          <>
            <div style={wStyles.walletVisual}>
              <Landmark size={22} color="rgba(255,255,255,0.6)" />
              <div style={wStyles.walletInfo}>
                <div style={wStyles.walletLabel}>Conta corrente</div>
                <div style={wStyles.walletSub}>Transferência via saldo disponível</div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={wStyles.label}>Valor</div>
                <div style={wStyles.amountRow}>
                  <span style={wStyles.currency}>R$</span>
                  <input
                    style={wStyles.amountInput}
                    type="text"
                    inputMode="numeric"
                    placeholder="0,00"
                    value={formatBRL(digits)}
                    onChange={handleAmountChange}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <div style={wStyles.label}>Descrição <span style={{ opacity: 0.5, textTransform: 'none', fontSize: 10 }}>(opcional)</span></div>
                <input
                  style={wStyles.input} type="text" placeholder="Ex: Resgate, despesa..."
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {error && <div style={wStyles.error}>{error}</div>}

              <button
                style={{ ...wStyles.btn, opacity: loading ? 0.6 : 1, marginTop: 2 }}
                type="submit"
                disabled={loading}
              >
                {loading
                  ? 'Processando...'
                  : parsed > 0
                    ? `Sacar R$ ${parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : 'Confirmar saque'}
              </button>
            </form>
          </>
        )}
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
          onSuccess={(wallet) => onWalletUpdate?.(wallet)}
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
};

const wStyles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '28px 28px 24px', width: 400,
    boxShadow: '0 28px 80px rgba(0,0,0,0.6)',
    animation: 'modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  title: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 6, display: 'flex',
    borderRadius: 8,
  },
  walletVisual: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)',
    border: '0.5px solid rgba(245,158,11,0.2)',
    borderRadius: 12, padding: '14px 16px', marginBottom: 20,
  },
  walletInfo: { display: 'flex', flexDirection: 'column', gap: 2 },
  walletLabel: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' },
  walletSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  label: {
    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
    marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase',
  },
  amountRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '0 16px',
  },
  currency: { fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.5)', flexShrink: 0 },
  amountInput: {
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: 22, fontWeight: 700, color: '#fff', width: '100%',
    padding: '14px 0', fontFamily: 'inherit', letterSpacing: '-0.5px',
  },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 15px', fontSize: 14, color: '#fff',
    outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  error: {
    padding: '10px 13px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 12, color: '#f87171',
  },
  btn: {
    padding: '13px', background: 'linear-gradient(135deg, #d97706, #f59e0b)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%',
    boxShadow: '0 4px 16px rgba(245,158,11,0.3)',
    transition: 'opacity 0.15s',
  },
  stateWrap: {
    textAlign: 'center', padding: '20px 0 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
};
