import React from 'react';
import { usePrefs } from '../context/PrefsContext';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Layout, Bell, Lock } from 'lucide-react';

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
        background: value ? '#6c63ff' : 'rgba(255,255,255,0.1)',
        border: `0.5px solid ${value ? '#6c63ff' : 'rgba(255,255,255,0.15)'}`,
        position: 'relative', transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, left: value ? 20 : 3,
        width: 14, height: 14, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>
        <Icon size={14} style={{ color: '#a78bfa' }} />
        {title}
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  );
}

function SettingRow({ label, description, children }) {
  return (
    <div style={styles.settingRow}>
      <div>
        <div style={styles.settingLabel}>{label}</div>
        {description && <div style={styles.settingDesc}>{description}</div>}
      </div>
      {children}
    </div>
  );
}

export default function ConfiguracoesPage() {
  const { prefs, updatePref } = usePrefs();
  const { user } = useAuth();

  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Configurações</div>

      <Section title="Conta" icon={Lock}>
        <SettingRow label="Nome" description={user?.name ?? '-'}>
          <span style={styles.soon}>em breve</span>
        </SettingRow>
        <SettingRow label="E-mail" description={user?.email ?? '-'}>
          <span style={styles.soon}>em breve</span>
        </SettingRow>
        <SettingRow label="Senha" description="Alterar senha da conta">
          <span style={styles.soon}>em breve</span>
        </SettingRow>
      </Section>

      <Section title="Exibição" icon={Layout}>
        <SettingRow
          label="Ocultar saldo"
          description="Esconde os valores monetários na tela inicial"
        >
          <Toggle value={prefs.hideBalance} onChange={v => updatePref('hideBalance', v)} />
        </SettingRow>
        <SettingRow
          label="Modo compacto"
          description="Reduz o espaçamento entre elementos"
        >
          <Toggle value={prefs.compactMode} onChange={v => updatePref('compactMode', v)} />
        </SettingRow>
      </Section>

      <Section title="Notificações" icon={Bell}>
        <SettingRow
          label="Notificações de transação"
          description="Exibe alertas ao realizar depósitos e saques"
        >
          <Toggle value={prefs.notifications} onChange={v => updatePref('notifications', v)} />
        </SettingRow>
      </Section>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  section: {
    background: '#1a1d2e', borderRadius: 14,
    border: '0.5px solid rgba(255,255,255,0.07)', overflow: 'hidden',
  },
  sectionTitle: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.5px', textTransform: 'uppercase',
    padding: '14px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.07)',
  },
  sectionBody: { display: 'flex', flexDirection: 'column' },
  settingRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16, padding: '16px 20px',
    borderBottom: '0.5px solid rgba(255,255,255,0.05)',
  },
  settingLabel: { fontSize: 14, color: '#fff', fontWeight: 500, marginBottom: 3 },
  settingDesc: { fontSize: 12, color: 'rgba(255,255,255,0.38)' },
  soon: {
    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 6, padding: '3px 8px',
  },
};
