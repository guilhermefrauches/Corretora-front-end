import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Preencha e-mail e senha.');
      return;
    }

    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'E-mail ou senha inválidos.';
      setError(typeof msg === 'string' ? msg : 'E-mail ou senha inválidos.');
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>C</div>
          <span style={styles.logoText}>CarteiraInvest</span>
        </div>

        <h1 style={styles.title}>Entrar na sua conta</h1>
        <p style={styles.subtitle}>Bem-vindo de volta</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>E-mail</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <label style={styles.label}>Senha</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          {error && <div style={styles.error}>{error}</div>}

          <button style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.foot}>
          Não tem conta?{' '}
          <Link to="/register" style={styles.link}>
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0f1117',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    background: '#1a1d2e',
    border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    background: '#6c63ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    margin: '0 0 28px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: '11px 14px',
    fontSize: 14,
    color: '#fff',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  error: {
    marginTop: 8,
    padding: '10px 14px',
    background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)',
    borderRadius: 8,
    fontSize: 13,
    color: '#f87171',
  },
  btn: {
    marginTop: 20,
    padding: '12px',
    background: '#6c63ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  foot: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  link: {
    color: '#6c63ff',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
