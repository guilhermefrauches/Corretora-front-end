import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, LogOut, Settings, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getWallet } from '../../services/walletService';

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return isNaN(dt) ? '' : dt.toLocaleDateString('pt-BR');
}
function isPositive(type) {
  return ['DEPOSIT', 'COMPRA'].includes((type ?? '').toUpperCase());
}
function typeLabel(type) {
  const map = { DEPOSIT: 'Depósito', WITHDRAW: 'Saque', COMPRA: 'Compra', VENDA: 'Venda' };
  return map[(type ?? '').toUpperCase()] ?? type ?? '-';
}

function useClickOutside(ref, cb) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) cb();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

// ── Profile dropdown ──────────────────────────────────────────────────────────
function ProfileDropdown({ onClose, onNavigate }) {
  const { user, logout } = useAuth();
  const ref = useRef(null);
  useClickOutside(ref, onClose);

  const initials = (user?.name ?? 'U').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div ref={ref} style={styles.dropdown}>
      {/* Header */}
      <div style={styles.ddHeader}>
        <div style={styles.ddAvatar}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={styles.ddName}>{user?.name ?? 'Usuário'}</div>
          <div style={styles.ddEmail}>{user?.email ?? ''}</div>
        </div>
        {user?.role === 'ADMIN' && (
          <span style={styles.roleBadge}><ShieldCheck size={10} /> Admin</span>
        )}
      </div>

      <div style={styles.ddDivider} />

      <div style={styles.ddItem} onClick={() => { onNavigate('perfil'); onClose(); }}>
        <User size={14} /> Meu perfil
      </div>
      <div style={styles.ddItem} onClick={() => { onNavigate('configuracoes'); onClose(); }}>
        <Settings size={14} /> Configurações
      </div>

      <div style={styles.ddDivider} />

      <div style={{ ...styles.ddItem, color: '#f87171' }} onClick={() => { logout(); onClose(); }}>
        <LogOut size={14} /> Sair
      </div>
    </div>
  );
}

// ── Notifications dropdown ────────────────────────────────────────────────────
function NotificationsDropdown({ onClose }) {
  const ref = useRef(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  useClickOutside(ref, onClose);

  useEffect(() => {
    getWallet()
      .then(w => setTxs((w.transactions ?? []).slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div ref={ref} style={{ ...styles.dropdown, width: 300, right: 44 }}>
      <div style={styles.ddTopRow}>
        <span style={styles.ddTitle}>Notificações</span>
        <button style={styles.ddClose} onClick={onClose}><X size={14} /></button>
      </div>
      <div style={styles.ddDivider} />

      {loading && <div style={styles.ddEmpty}>Carregando...</div>}

      {!loading && txs.length === 0 && (
        <div style={styles.ddEmpty}>Nenhuma transação recente.</div>
      )}

      {!loading && txs.map((tx, i) => (
        <div key={tx.id ?? i} style={styles.notifItem}>
          <div style={{
            ...styles.notifDot,
            background: isPositive(tx.type) ? '#4ade80' : '#f87171',
          }} />
          <div style={{ flex: 1 }}>
            <div style={styles.notifLabel}>{typeLabel(tx.type)}</div>
            <div style={styles.notifSub}>{tx.description ?? ''}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600,
              color: isPositive(tx.type) ? '#4ade80' : '#f87171',
            }}>
              {isPositive(tx.type) ? '+' : '-'} R$ {fmt(Math.abs(tx.amount ?? tx.total ?? 0))}
            </div>
            <div style={styles.notifDate}>{fmtDate(tx.date ?? tx.createdAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
export default function TopBar({ userName, onNavigate }) {
  const { user } = useAuth();
  const name = user?.name ?? userName ?? 'Usuário';
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div style={styles.bar}>
      <div>
        <div style={styles.date}>{today}</div>
        <div style={styles.greeting}>{greeting}, {name.split(' ')[0]}</div>
      </div>

      <div style={styles.actions}>
        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <div
            style={{ ...styles.iconBtn, background: showNotifs ? 'rgba(108,99,255,0.15)' : undefined }}
            onClick={() => { setShowNotifs(v => !v); setShowProfile(false); }}
          >
            <Bell size={15} color="rgba(255,255,255,0.6)" />
          </div>
          {showNotifs && (
            <NotificationsDropdown onClose={() => setShowNotifs(false)} />
          )}
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div
            style={{ ...styles.avatar, cursor: 'pointer', outline: showProfile ? '2px solid #6c63ff' : 'none', outlineOffset: 2 }}
            onClick={() => { setShowProfile(v => !v); setShowNotifs(false); }}
          >
            {initials}
          </div>
          {showProfile && (
            <ProfileDropdown
              onClose={() => setShowProfile(false)}
              onNavigate={onNavigate}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  date: {
    fontSize: 11, color: 'rgba(255,255,255,0.35)',
    marginBottom: 2, textTransform: 'capitalize',
  },
  greeting: { fontSize: 15, fontWeight: 500, color: '#fff' },
  actions: { display: 'flex', alignItems: 'center', gap: 10, position: 'relative' },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', transition: 'background 0.15s',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 600, color: '#fff',
    transition: 'outline 0.15s',
  },

  // Dropdown shared
  dropdown: {
    position: 'absolute', top: 40, right: 0, zIndex: 200,
    background: '#1a1d2e',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 12, width: 240,
    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
    animation: 'modalIn 0.18s cubic-bezier(0.34,1.56,0.64,1)',
    overflow: 'hidden',
  },
  ddHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px 16px 14px', position: 'relative',
  },
  ddAvatar: {
    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, color: '#fff',
  },
  ddName: { fontSize: 13, fontWeight: 600, color: '#fff' },
  ddEmail: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  roleBadge: {
    position: 'absolute', top: 14, right: 14,
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 10, fontWeight: 600, color: '#a78bfa',
    background: 'rgba(108,99,255,0.15)',
    border: '0.5px solid rgba(108,99,255,0.25)',
    borderRadius: 6, padding: '2px 6px',
  },
  ddDivider: { height: '0.5px', background: 'rgba(255,255,255,0.07)' },
  ddItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 16px', fontSize: 13,
    color: 'rgba(255,255,255,0.65)', cursor: 'pointer',
    transition: 'background 0.1s',
  },
  ddTitle: { fontSize: 13, fontWeight: 600, color: '#fff' },
  ddTopRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px',
  },
  ddClose: {
    background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
    cursor: 'pointer', display: 'flex', padding: 2,
  },
  ddEmpty: {
    padding: '20px 16px', textAlign: 'center',
    fontSize: 12, color: 'rgba(255,255,255,0.35)',
  },
  notifItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 16px',
    borderTop: '0.5px solid rgba(255,255,255,0.05)',
  },
  notifDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  notifLabel: { fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  notifSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)' },
  notifDate: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
};
