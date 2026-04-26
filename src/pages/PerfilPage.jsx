import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, ShieldCheck, Calendar } from 'lucide-react';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div style={styles.infoRow}>
      <div style={styles.infoIcon}><Icon size={14} /></div>
      <div>
        <div style={styles.infoLabel}>{label}</div>
        <div style={styles.infoValue}>{value}</div>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  const { user } = useAuth();
  const name = user?.name ?? 'Usuário';
  const initials = name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Meu Perfil</div>

      <div style={styles.card}>
        {/* Avatar + nome */}
        <div style={styles.avatarSection}>
          <div style={styles.avatar}>{initials}</div>
          <div>
            <div style={styles.name}>{name}</div>
            <div style={styles.roleBadgeWrap}>
              {isAdmin
                ? <span style={{ ...styles.badge, ...styles.badgeAdmin }}><ShieldCheck size={11} /> Administrador</span>
                : <span style={styles.badge}>Investidor</span>
              }
            </div>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Info rows */}
        <div style={styles.infoList}>
          <InfoRow icon={User}     label="Nome completo" value={name} />
          <InfoRow icon={Mail}     label="E-mail"        value={user?.email ?? '-'} />
          <InfoRow icon={ShieldCheck} label="Função"     value={isAdmin ? 'Administrador' : 'Investidor'} />
          <InfoRow icon={Calendar} label="Membro desde"  value="2025" />
        </div>
      </div>

      <div style={styles.notice}>
        Alterações de nome e e-mail estarão disponíveis em breve.
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  card: {
    background: '#1a1d2e', borderRadius: 14,
    border: '0.5px solid rgba(255,255,255,0.07)', padding: '28px 28px',
  },
  avatarSection: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 },
  avatar: {
    width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700, color: '#fff',
    boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
  },
  name: { fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 },
  roleBadgeWrap: { display: 'flex' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  },
  badgeAdmin: {
    background: 'rgba(108,99,255,0.15)', borderColor: 'rgba(108,99,255,0.3)',
    color: '#a78bfa',
  },
  divider: { height: '0.5px', background: 'rgba(255,255,255,0.07)', margin: '0 0 24px' },
  infoList: { display: 'flex', flexDirection: 'column', gap: 18 },
  infoRow: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  infoIcon: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    background: 'rgba(108,99,255,0.1)', border: '0.5px solid rgba(108,99,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#a78bfa', marginTop: 2,
  },
  infoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.38)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px' },
  infoValue: { fontSize: 14, color: '#fff', fontWeight: 500 },
  notice: { fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' },
};
