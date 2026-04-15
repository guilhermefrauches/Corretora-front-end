import React from 'react';
import { Bell } from 'lucide-react';

export default function TopBar({ userName = 'Guilherme' }) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div style={styles.bar}>
      <div>
        <div style={styles.date}>{today}</div>
        <div style={styles.greeting}>Bom dia, {userName}</div>
      </div>
      <div style={styles.actions}>
        <div style={styles.notif}>
          <Bell size={15} color="rgba(255,255,255,0.6)" />
        </div>
        <div style={styles.avatar}>{initials}</div>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  greeting: {
    fontSize: 15,
    fontWeight: 500,
    color: '#fff',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  notif: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg,#6c63ff,#a78bfa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 500,
    color: '#fff',
  },
};
