import React from 'react';
import { LayoutDashboard, Wallet, TrendingUp, History, FileText, Settings, LogOut, ShieldCheck } from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Visão geral',  page: 'overview' },
  { icon: Wallet,          label: 'Carteira',     page: 'carteira' },
  { icon: TrendingUp,      label: 'Mercado',      page: 'mercado' },
  { icon: History,         label: 'Histórico',    page: 'historico' },
  { icon: FileText,        label: 'Relatórios',   page: 'relatorios' },
];

export default function Sidebar({ activePage, onNavigate, onLogout, userRole }) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>C</div>
        CarteiraInvest
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.page}
              style={{ ...styles.navItem, ...(activePage === item.page ? styles.navItemActive : {}) }}
              onClick={() => onNavigate(item.page)}
            >
              <Icon size={16} style={styles.navIcon} />
              {item.label}
            </div>
          );
        })}

        {userRole === 'ADMIN' && (
          <div
            style={{ ...styles.navItem, ...(activePage === 'admin' ? styles.navItemActive : {}), marginTop: 8, borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: 18 }}
            onClick={() => onNavigate('admin')}
          >
            <ShieldCheck size={16} style={styles.navIcon} />
            Admin
          </div>
        )}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{ ...styles.navItem, ...(activePage === 'configuracoes' ? styles.navItemActive : {}) }}
        onClick={() => onNavigate('configuracoes')}
      >
        <Settings size={16} style={styles.navIcon} />
        Configurações
      </div>

      {onLogout && (
        <div style={{ ...styles.navItem, color: '#f87171', marginTop: 4 }} onClick={onLogout}>
          <LogOut size={16} style={styles.navIcon} />
          Sair
        </div>
      )}
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 200,
    background: '#13151f',
    borderRight: '0.5px solid rgba(255,255,255,0.07)',
    padding: '20px 0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  logo: {
    padding: '0 20px 24px',
    fontSize: 15,
    fontWeight: 500,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: '#6c63ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: '#fff',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 20px',
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    borderLeft: '2px solid transparent',
    transition: 'all 0.15s',
  },
  navItemActive: {
    color: '#fff',
    borderLeft: '2px solid #6c63ff',
    background: 'rgba(108,99,255,0.12)',
  },
  navIcon: {
    flexShrink: 0,
  },
};
