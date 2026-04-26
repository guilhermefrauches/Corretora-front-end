import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getUserWallet } from '../services/adminService';

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(str) {
  if (!str) return '-';
  return new Date(str).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function typeLabel(type) {
  const map = { DEPOSIT: 'Depósito', WITHDRAW: 'Saque' };
  return map[(type ?? '').toUpperCase()] ?? type;
}

function isPositive(type) {
  return (type ?? '').toUpperCase() === 'DEPOSIT';
}

export default function UserWalletModal({ user, onClose }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getUserWallet(user.id)
      .then(setWallet)
      .catch(() => setError('Erro ao carregar a wallet.'))
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>Wallet — {user.name}</div>
            <div style={styles.email}>{user.email}</div>
          </div>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {loading && <div style={styles.state}>Carregando...</div>}
        {error && <div style={{ ...styles.state, color: '#f87171' }}>{error}</div>}

        {wallet && (
          <>
            <div style={styles.balanceCard}>
              <div style={styles.balanceLabel}>Saldo atual</div>
              <div style={styles.balanceValue}>R$ {fmt(wallet.balance)}</div>
            </div>

            <div style={styles.txTitle}>Transações</div>

            {(!wallet.transactions || wallet.transactions.length === 0) && (
              <div style={styles.state}>Nenhuma transação.</div>
            )}

            {wallet.transactions?.length > 0 && (
              <div style={styles.txList}>
                {wallet.transactions.map((tx, i) => (
                  <div key={tx.id ?? i} style={styles.txRow}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ ...styles.badge, ...(isPositive(tx.type) ? styles.badgeIn : styles.badgeOut) }}>
                        {typeLabel(tx.type)}
                      </span>
                      <span style={styles.txDesc}>{tx.description || '-'}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: isPositive(tx.type) ? '#4ade80' : '#f87171', fontWeight: 500, fontSize: 13 }}>
                        {isPositive(tx.type) ? '+' : '-'} R$ {fmt(Math.abs(tx.amount ?? 0))}
                      </div>
                      <div style={styles.txDate}>{fmtDate(tx.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 14, padding: '28px', width: 460, maxHeight: '80vh',
    overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 600, color: '#fff' },
  email: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, display: 'flex' },
  balanceCard: {
    background: 'rgba(108,99,255,0.1)', border: '0.5px solid rgba(108,99,255,0.3)',
    borderRadius: 10, padding: '14px 16px', marginBottom: 20,
  },
  balanceLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  balanceValue: { fontSize: 22, fontWeight: 600, color: '#fff' },
  txTitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 },
  txList: { display: 'flex', flexDirection: 'column', gap: 1 },
  txRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderTop: '0.5px solid rgba(255,255,255,0.06)',
  },
  badge: {
    display: 'inline-block', borderRadius: 5, padding: '2px 7px',
    fontSize: 11, fontWeight: 600,
  },
  badgeIn: { background: 'rgba(74,222,128,0.12)', color: '#4ade80' },
  badgeOut: { background: 'rgba(248,113,113,0.12)', color: '#f87171' },
  txDesc: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  txDate: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  state: { textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
};
