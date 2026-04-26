import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CheckCircle, XCircle, Loader } from 'lucide-react';
import { createPaymentIntent, confirmDeposit } from '../../services/walletService';

const CARD_STYLE = {
  style: {
    base: {
      color: '#fff',
      fontFamily: 'inherit',
      fontSize: '14px',
      '::placeholder': { color: 'rgba(255,255,255,0.3)' },
    },
    invalid: { color: '#f87171' },
  },
};

function CardForm({ clientSecret, paymentIntentId, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState('idle'); // idle | confirming | confirming-backend | success | failed

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setStatus('confirming');
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (error) {
      setStatus('idle');
      onError(error.message);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      setStatus('confirming-backend');
      try {
        const wallet = await confirmDeposit(paymentIntentId);
        setStatus('success');
        setTimeout(() => onSuccess(wallet), 1200);
      } catch (err) {
        setStatus('failed');
        onError(err.response?.data?.message || 'Erro ao confirmar depósito no servidor.');
      }
    } else {
      setStatus('idle');
      onError('Pagamento não foi aprovado. Verifique os dados do cartão.');
    }
  }

  if (status === 'confirming') {
    return <StateView icon={<Loader size={32} color="rgba(255,255,255,0.4)" />} text="Confirmando pagamento..." />;
  }

  if (status === 'confirming-backend') {
    return <StateView icon={<Loader size={32} color="rgba(255,255,255,0.4)" />} text="Creditando saldo..." />;
  }

  if (status === 'success') {
    return (
      <div style={styles.stateWrap}>
        <CheckCircle size={40} color="#4ade80" />
        <div style={{ color: '#4ade80', fontWeight: 600, fontSize: 15, marginTop: 10 }}>Depósito confirmado!</div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={styles.stateWrap}>
        <XCircle size={40} color="#f87171" />
        <div style={{ color: '#f87171', fontWeight: 600, fontSize: 15, marginTop: 10 }}>Depósito não confirmado</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>
          O pagamento foi processado, mas o servidor não confirmou o crédito.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div style={styles.label}>Dados do cartão</div>
        <div style={styles.cardBox}>
          <CardElement options={CARD_STYLE} />
        </div>
        <div style={styles.hint}>Teste: 4242 4242 4242 4242 · data futura · CVC qualquer</div>
      </div>
      <button style={{ ...styles.btn, opacity: !stripe ? 0.6 : 1 }} type="submit" disabled={!stripe}>
        Pagar
      </button>
    </form>
  );
}

function StateView({ icon, text }) {
  return (
    <div style={styles.stateWrap}>
      {icon}
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: icon ? 10 : 0 }}>{text}</div>
    </div>
  );
}

export default function DepositModal({ onClose, onSuccess }) {
  const [step, setStep] = useState('amount');
  const [amount, setAmount] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAmountSubmit(e) {
    e.preventDefault();
    const parsed = parseFloat(amount.replace(',', '.'));
    if (!parsed || parsed <= 0) { setError('Informe um valor válido.'); return; }

    setLoading(true);
    setError('');
    try {
      const data = await createPaymentIntent(parsed);
      setStripePromise(loadStripe(data.publicKey));
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setStep('card');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setError(typeof msg === 'string' ? msg : 'Erro ao iniciar pagamento.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay} onClick={() => !loading && onClose()}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>
            {step === 'amount' ? 'Depositar' : `Depositar R$ ${parseFloat(amount || 0).toFixed(2).replace('.', ',')}`}
          </span>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {step === 'amount' && (
          <form onSubmit={handleAmountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={styles.label}>Valor (R$)</div>
            <input
              style={styles.input}
              type="number" min="0.01" step="0.01" placeholder="0,00"
              value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus
            />
            {error && <div style={styles.error}>{error}</div>}
            <button style={{ ...styles.btn, marginTop: 12, opacity: loading ? 0.6 : 1 }} type="submit" disabled={loading}>
              {loading ? 'Aguarde...' : 'Continuar →'}
            </button>
          </form>
        )}

        {step === 'card' && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            {error && <div style={{ ...styles.error, marginBottom: 12 }}>{error}</div>}
            <CardForm
              clientSecret={clientSecret}
              paymentIntentId={paymentIntentId}
              onSuccess={(wallet) => { onSuccess(wallet); onClose(); }}
              onError={setError}
            />
          </Elements>
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
    borderRadius: 14, padding: '28px 28px 24px', width: 380,
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  title: { fontSize: 16, fontWeight: 600, color: '#fff' },
  closeBtn: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 4, display: 'flex' },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '11px 14px', fontSize: 14, color: '#fff',
    outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  cardBox: {
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '12px 14px',
  },
  hint: { marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.25)' },
  error: {
    padding: '9px 12px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 12, color: '#f87171',
  },
  btn: {
    padding: '12px', background: '#6c63ff', color: '#fff', border: 'none',
    borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    fontFamily: 'inherit', width: '100%',
  },
  stateWrap: { textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
};
