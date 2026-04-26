import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Zap, PieChart } from 'lucide-react';

const features = [
  { icon: Zap,      text: 'Comece a investir em menos de 2 minutos' },
  { icon: PieChart, text: 'Portfólio diversificado na palma da mão' },
  { icon: Lock,     text: 'Seus dados protegidos com criptografia' },
];

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e) {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) { setError('Preencha todos os campos.'); return; }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem.'); return; }
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Erro ao criar conta.';
      setError(typeof msg === 'string' ? msg : 'Erro ao criar conta. Tente novamente.');
    }
  }

  return (
    <div style={styles.page}>
      <div style={{ ...styles.orb1, transform: `translate(${mouse.x * 60}px, ${mouse.y * 40}px)` }} />
      <div style={{ ...styles.orb2, transform: `translate(${-mouse.x * 50}px, ${-mouse.y * 35}px)` }} />
      <div style={{ ...styles.orb3, transform: `translate(${mouse.x * 30}px, ${-mouse.y * 25}px)` }} />

      <div style={styles.layout}>
        {/* Left panel */}
        <div style={styles.left}>
          <div style={styles.brand}>
            <div style={styles.logoIcon}>C</div>
            <span style={styles.logoText}>CarteiraInvest</span>
          </div>

          <div style={styles.leftContent}>
            <h2 style={styles.heroTitle}>Comece sua<br />jornada hoje.</h2>
            <p style={styles.heroSub}>
              Crie sua conta gratuitamente e tenha acesso a ferramentas profissionais de investimento.
            </p>

            <div style={styles.featureList}>
              {features.map(({ icon: Icon, text }) => (
                <div key={text} style={styles.featureItem}>
                  <div style={styles.featureIcon}><Icon size={14} /></div>
                  <span style={styles.featureText}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.leftDecor} />
        </div>

        {/* Right panel */}
        <div style={styles.right}>
          <div style={styles.card}>
            <h1 style={styles.title}>Criar conta</h1>
            <p style={styles.subtitle}>Leva menos de 2 minutos</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Nome completo</label>
                <input
                  style={styles.input}
                  type="text" name="name"
                  placeholder="Seu nome"
                  value={form.name} onChange={handleChange}
                  autoComplete="name" autoFocus
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>E-mail</label>
                <input
                  style={styles.input}
                  type="email" name="email"
                  placeholder="seu@email.com"
                  value={form.email} onChange={handleChange}
                  autoComplete="email"
                />
              </div>

              <div style={styles.row2}>
                <div style={styles.field}>
                  <label style={styles.label}>Senha</label>
                  <input
                    style={styles.input}
                    type="password" name="password"
                    placeholder="Mín. 6 caracteres"
                    value={form.password} onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Confirmar senha</label>
                  <input
                    style={styles.input}
                    type="password" name="confirmPassword"
                    placeholder="Repita a senha"
                    value={form.confirmPassword} onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <button
                style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
                type="submit" disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta grátis'}
              </button>
            </form>

            <p style={styles.foot}>
              Já tem conta?{' '}
              <Link to="/login" style={styles.link}>Entrar</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#07090f',
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
  orb1: {
    position: 'fixed', top: '-180px', left: '-100px',
    width: 550, height: 550,
    background: 'radial-gradient(circle, rgba(108,99,255,0.20) 0%, transparent 65%)',
    borderRadius: '50%', pointerEvents: 'none',
    transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  orb2: {
    position: 'fixed', bottom: '-150px', right: '-80px',
    width: 480, height: 480,
    background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 65%)',
    borderRadius: '50%', pointerEvents: 'none',
    transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  orb3: {
    position: 'fixed', top: '55%', left: '40%',
    width: 300, height: 300,
    background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)',
    borderRadius: '50%', pointerEvents: 'none',
    transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  layout: {
    display: 'flex', width: '100%', minHeight: '100vh',
    position: 'relative', zIndex: 1,
  },
  left: {
    flex: '0 0 45%',
    display: 'flex', flexDirection: 'column',
    padding: '40px 48px',
    borderRight: '0.5px solid rgba(255,255,255,0.06)',
    position: 'relative', overflow: 'hidden',
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 34, height: 34, borderRadius: 10,
    background: 'linear-gradient(135deg, #6c63ff, #5c54e8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 800, color: '#fff',
    boxShadow: '0 4px 16px rgba(108,99,255,0.4)',
  },
  logoText: { fontSize: 16, fontWeight: 600, color: '#fff' },
  leftContent: {
    flex: 1, display: 'flex', flexDirection: 'column',
    justifyContent: 'center', paddingBottom: 60,
  },
  heroTitle: {
    fontSize: 42, fontWeight: 700, color: '#fff',
    lineHeight: 1.15, margin: '0 0 18px', letterSpacing: '-1px',
  },
  heroSub: {
    fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
    margin: '0 0 40px', maxWidth: 320,
  },
  featureList: { display: 'flex', flexDirection: 'column', gap: 16 },
  featureItem: { display: 'flex', alignItems: 'center', gap: 12 },
  featureIcon: {
    width: 30, height: 30, borderRadius: 8,
    background: 'rgba(108,99,255,0.15)',
    border: '0.5px solid rgba(108,99,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#a78bfa', flexShrink: 0,
  },
  featureText: { fontSize: 13, color: 'rgba(255,255,255,0.55)' },
  leftDecor: {
    position: 'absolute', bottom: -80, right: -80,
    width: 280, height: 280,
    background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 65%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  right: {
    flex: 1, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '40px 32px',
  },
  card: {
    width: '100%', maxWidth: 400,
    background: 'rgba(255,255,255,0.03)',
    border: '0.5px solid rgba(255,255,255,0.09)',
    borderRadius: 20, padding: '36px 36px 32px',
    backdropFilter: 'blur(20px)',
    animation: 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  title: {
    fontSize: 24, fontWeight: 700, color: '#fff',
    margin: '0 0 4px', letterSpacing: '-0.4px',
  },
  subtitle: {
    fontSize: 13, color: 'rgba(255,255,255,0.38)', margin: '0 0 28px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 7 },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label: {
    fontSize: 11, fontWeight: 600,
    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4px',
    textTransform: 'uppercase',
  },
  input: {
    background: 'rgba(255,255,255,0.05)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px',
    fontSize: 14, color: '#fff', outline: 'none',
    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  error: {
    padding: '10px 14px',
    background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)',
    borderRadius: 8, fontSize: 13, color: '#f87171',
  },
  btn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #6c63ff, #5c54e8)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', width: '100%', marginTop: 2,
    boxShadow: '0 4px 20px rgba(108,99,255,0.35)',
    transition: 'opacity 0.15s',
  },
  foot: {
    marginTop: 22, textAlign: 'center',
    fontSize: 13, color: 'rgba(255,255,255,0.38)',
  },
  link: { color: '#a78bfa', textDecoration: 'none', fontWeight: 600 },
};
