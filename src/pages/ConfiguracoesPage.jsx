import React, { useState } from 'react';
import { usePrefs } from '../context/PrefsContext';
import { useAuth } from '../context/AuthContext';
import { Layout, Bell, Lock, Check, AlertCircle, Loader } from 'lucide-react';

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

function InputField({ label, type = 'text', value, onChange, placeholder, autoComplete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={styles.fieldLabel}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={styles.input}
      />
    </div>
  );
}

function StatusMsg({ status }) {
  if (!status) return null;
  const isError = status.type === 'error';
  return (
    <div style={{ ...styles.status, background: isError ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', borderColor: isError ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)', color: isError ? '#f87171' : '#4ade80' }}>
      {isError ? <AlertCircle size={13} /> : <Check size={13} />}
      {status.msg}
    </div>
  );
}

export default function ConfiguracoesPage() {
  const { prefs, updatePref } = usePrefs();
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileStatus, setProfileStatus] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passStatus, setPassStatus] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  async function handleSaveProfile(e) {
    e.preventDefault();
    const trimName = name.trim();
    const trimEmail = email.trim();
    if (!trimName && !trimEmail) return;
    const changed = trimName !== (user?.name ?? '') || trimEmail !== (user?.email ?? '');
    if (!changed) return;

    setProfileLoading(true);
    setProfileStatus(null);
    try {
      await updateProfile({
        name: trimName !== user?.name ? trimName : undefined,
        email: trimEmail !== user?.email ? trimEmail : undefined,
      });
      setProfileStatus({ type: 'ok', msg: 'Dados atualizados com sucesso.' });
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Erro ao atualizar os dados.';
      setProfileStatus({ type: 'error', msg });
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleSavePassword(e) {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPassStatus({ type: 'error', msg: 'Preencha todos os campos de senha.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassStatus({ type: 'error', msg: 'As senhas novas não coincidem.' });
      return;
    }
    if (newPassword.length < 6) {
      setPassStatus({ type: 'error', msg: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setPassLoading(true);
    setPassStatus(null);
    try {
      await updateProfile({ currentPassword, newPassword });
      setPassStatus({ type: 'ok', msg: 'Senha alterada com sucesso.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Erro ao alterar a senha.';
      setPassStatus({ type: 'error', msg });
    } finally {
      setPassLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Configurações</div>

      <Section title="Conta" icon={Lock}>
        <form onSubmit={handleSaveProfile} style={styles.form}>
          <InputField
            label="Nome"
            value={name}
            onChange={setName}
            placeholder={user?.name ?? 'Seu nome'}
            autoComplete="name"
          />
          <InputField
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder={user?.email ?? 'seu@email.com'}
            autoComplete="email"
          />
          <StatusMsg status={profileStatus} />
          <button type="submit" style={styles.saveBtn} disabled={profileLoading}>
            {profileLoading ? <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Check size={13} />}
            {profileLoading ? 'Salvando...' : 'Salvar dados'}
          </button>
        </form>
      </Section>

      <Section title="Alterar senha" icon={Lock}>
        <form onSubmit={handleSavePassword} style={styles.form}>
          <InputField
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <InputField
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <InputField
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
          />
          <StatusMsg status={passStatus} />
          <button type="submit" style={styles.saveBtn} disabled={passLoading}>
            {passLoading ? <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} /> : <Check size={13} />}
            {passLoading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
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
  form: { display: 'flex', flexDirection: 'column', gap: 14, padding: '20px 20px' },
  fieldLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.4px' },
  input: {
    background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '9px 12px', color: '#fff', fontSize: 13,
    fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    background: 'rgba(108,99,255,0.2)', border: '0.5px solid rgba(108,99,255,0.45)',
    borderRadius: 8, color: '#a78bfa', fontSize: 12, fontWeight: 600,
    padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  },
  status: {
    display: 'flex', alignItems: 'center', gap: 7,
    fontSize: 12, padding: '8px 12px', borderRadius: 8,
    border: '0.5px solid', fontWeight: 500,
  },
  settingRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 16, padding: '16px 20px',
    borderBottom: '0.5px solid rgba(255,255,255,0.05)',
  },
  settingLabel: { fontSize: 14, color: '#fff', fontWeight: 500, marginBottom: 3 },
  settingDesc: { fontSize: 12, color: 'rgba(255,255,255,0.38)' },
};
