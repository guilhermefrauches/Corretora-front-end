import React, { useEffect, useState } from 'react';
import { ShieldCheck, Wallet } from 'lucide-react';
import { getAllUsers, promoteToAdmin } from '../services/adminService';
import UserWalletModal from '../components/UserWalletModal';

function roleBadge(role) {
  const isAdmin = role === 'ADMIN';
  return (
    <span style={{
      display: 'inline-block', borderRadius: 5, padding: '2px 8px',
      fontSize: 11, fontWeight: 600,
      background: isAdmin ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.07)',
      color: isAdmin ? '#a78bfa' : 'rgba(255,255,255,0.5)',
    }}>
      {role}
    </span>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [promoting, setPromoting] = useState(null);
  const [walletUser, setWalletUser] = useState(null);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      setError('Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  async function handlePromote(user) {
    setPromoting(user.id);
    try {
      await promoteToAdmin(user.id);
      await fetchUsers();
    } catch {
      setError(`Erro ao promover ${user.name}.`);
    } finally {
      setPromoting(null);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Painel de Administração</div>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        {loading && <div style={styles.state}>Carregando usuários...</div>}

        {!loading && users.length === 0 && (
          <div style={styles.state}>Nenhum usuário encontrado.</div>
        )}

        {!loading && users.length > 0 && (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Nome', 'E-mail', 'Role', 'Ações'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.tdName}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{roleBadge(u.role)}</td>
                  <td style={{ ...styles.td, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button style={styles.btnAction} onClick={() => setWalletUser(u)}>
                      <Wallet size={13} /> Ver Wallet
                    </button>
                    {u.role === 'USER' && (
                      <button
                        style={{ ...styles.btnAction, ...styles.btnPromote, opacity: promoting === u.id ? 0.6 : 1 }}
                        onClick={() => handlePromote(u)}
                        disabled={promoting === u.id}
                      >
                        <ShieldCheck size={13} />
                        {promoting === u.id ? 'Promovendo...' : 'Promover para ADMIN'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {walletUser && (
        <UserWalletModal user={walletUser} onClose={() => setWalletUser(null)} />
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20 },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  error: {
    padding: '10px 14px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 13, color: '#f87171',
  },
  card: {
    background: '#1a1d2e', borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)', padding: 18, overflowX: 'auto',
  },
  state: { textAlign: 'center', padding: '24px 0', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: 11, color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 12px 10px',
  },
  tr: { borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  td: { padding: '11px 12px', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  tdName: { padding: '11px 12px', fontSize: 13, fontWeight: 500, color: '#fff' },
  btnAction: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)',
    color: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '5px 10px',
    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
  },
  btnPromote: {
    background: 'rgba(108,99,255,0.12)', border: '0.5px solid rgba(108,99,255,0.3)', color: '#a78bfa',
  },
};
