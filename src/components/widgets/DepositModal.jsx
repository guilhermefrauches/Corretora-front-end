import React, { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { createPaymentIntent, confirmDeposit } from '../../services/walletService';

function formatBRL(digits) {
  if (!digits) return '';
  return (parseInt(digits, 10) / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function Spinner({ size = 20, color = 'rgba(255,255,255,0.5)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid rgba(255,255,255,0.12)`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

const NUM_STYLE = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      fontSize: '17px',
      fontWeight: '600',
      letterSpacing: '3px',
      '::placeholder': { color: 'rgba(255,255,255,0.28)', letterSpacing: '3px' },
    },
    invalid: { color: '#f87171' },
  },
};

const SMALL_STYLE = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"Inter", sans-serif',
      fontSize: '14px',
      fontWeight: '500',
      '::placeholder': { color: 'rgba(255,255,255,0.28)' },
    },
    invalid: { color: '#f87171' },
  },
};

function CardForm({ clientSecret, paymentIntentId, parsedAmount, intentReady, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements || !intentReady || parsedAmount <= 0) return;

    setStatus('processing');
    onError('');

    const cardNumber = elements.getElement(CardNumberElement);
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardNumber },
    });

    if (error) {
      setStatus('idle');
      onError(error.message);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      setStatus('crediting');
      try {
        const wallet = await confirmDeposit(paymentIntentId);
        setStatus('success');
        setTimeout(() => onSuccess(wallet), 1400);
      } catch (err) {
        setStatus('failed');
        onError(err.response?.data?.message || 'Erro ao confirmar depósito no servidor.');
      }
    } else {
      setStatus('idle');
      onError('Pagamento não aprovado. Verifique os dados do cartão.');
    }
  }

  if (status === 'processing' || status === 'crediting') {
    return (
      <div style={styles.stateWrap}>
        <Spinner size={32} color="#a78bfa" />
        <div style={styles.stateText}>
          {status === 'processing' ? 'Confirmando pagamento...' : 'Creditando saldo...'}
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={styles.stateWrap}>
        <CheckCircle size={44} color="#4ade80" />
        <div style={{ ...styles.stateText, color: '#4ade80' }}>Depósito confirmado!</div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={styles.stateWrap}>
        <XCircle size={44} color="#f87171" />
        <div style={{ ...styles.stateText, color: '#f87171' }}>Falha na confirmação</div>
        <div style={styles.stateSubText}>
          O pagamento foi processado, mas o servidor não confirmou o crédito.
        </div>
      </div>
    );
  }

  const amountFormatted = parsedAmount > 0
    ? `R$ ${parsedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  const canPay = stripe && intentReady && parsedAmount > 0;

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Card visual with embedded Stripe elements */}
      <div style={styles.cardVisual}>
        {/* Chip */}
        <div style={styles.cardChip}>
          <div style={styles.chipLine} />
          <div style={styles.chipLine} />
        </div>

        {/* Card number element */}
        <div style={styles.cardNumberWrap}>
          <CardNumberElement options={NUM_STYLE} />
        </div>

        {/* Footer: expiry + cvc + value */}
        <div style={styles.cardFooter}>
          <div style={styles.cardField}>
            <div style={styles.cardMeta}>VÁLIDO ATÉ</div>
            <div style={styles.cardFieldEl}>
              <CardExpiryElement options={SMALL_STYLE} />
            </div>
          </div>
          <div style={styles.cardField}>
            <div style={styles.cardMeta}>CVC</div>
            <div style={styles.cardFieldEl}>
              <CardCvcElement options={SMALL_STYLE} />
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={styles.cardMeta}>VALOR</div>
            <div style={{
              ...styles.cardAmount,
              color: parsedAmount > 0 ? '#fff' : 'rgba(255,255,255,0.3)',
              fontSize: parsedAmount > 0 ? 16 : 14,
            }}>
              {amountFormatted}
            </div>
          </div>
        </div>

        {/* Decorative glows */}
        <div style={styles.cardShine} />
        <div style={styles.cardGlow} />

        {/* Overlay when intent is loading */}
        {!intentReady && (
          <div style={styles.cardOverlay}>
            <Spinner size={22} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>
              {parsedAmount > 0 ? 'Preparando...' : 'Informe o valor'}
            </span>
          </div>
        )}
      </div>

      <div style={styles.hint}>Teste: 4242 4242 4242 4242 · MM/AA futuro · CVC qualquer</div>

      <button
        style={{ ...styles.btn, opacity: canPay ? 1 : 0.45 }}
        type="submit"
        disabled={!canPay}
      >
        {!intentReady && parsedAmount > 0
          ? 'Preparando pagamento...'
          : parsedAmount > 0
            ? `Pagar ${amountFormatted}`
            : 'Informe o valor acima'}
      </button>
    </form>
  );
}

function StaticCardPlaceholder({ parsedAmount, loading }) {
  const amountFormatted = parsedAmount > 0
    ? `R$ ${parsedAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...styles.cardVisual, opacity: 0.6 }}>
        <div style={styles.cardChip}>
          <div style={styles.chipLine} />
          <div style={styles.chipLine} />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, letterSpacing: '4px', marginBottom: 20 }}>
          •••• •••• •••• ••••
        </div>
        <div style={styles.cardFooter}>
          <div style={styles.cardField}>
            <div style={styles.cardMeta}>VÁLIDO ATÉ</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>••/••</div>
          </div>
          <div style={styles.cardField}>
            <div style={styles.cardMeta}>CVC</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>•••</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={styles.cardMeta}>VALOR</div>
            <div style={{ ...styles.cardAmount, color: parsedAmount > 0 ? '#fff' : 'rgba(255,255,255,0.3)', fontSize: parsedAmount > 0 ? 16 : 14 }}>
              {amountFormatted}
            </div>
          </div>
        </div>
        <div style={styles.cardShine} />
        <div style={styles.cardGlow} />
        {loading && (
          <div style={styles.cardOverlay}>
            <Spinner size={22} color="rgba(255,255,255,0.7)" />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginLeft: 8 }}>Preparando...</span>
          </div>
        )}
      </div>
      <button style={{ ...styles.btn, opacity: 0.35 }} disabled>
        {parsedAmount > 0 ? 'Preparando pagamento...' : 'Informe o valor acima'}
      </button>
    </div>
  );
}

export default function DepositModal({ onClose, onSuccess }) {
  const [digits, setDigits] = useState('');
  const [stripePromise, setStripePromise] = useState(null);
  const [intentData, setIntentData] = useState(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState('');
  const genRef = useRef(0);

  const parsedAmount = digits ? parseInt(digits, 10) / 100 : 0;
  const intentReady = !!(intentData && intentData.amount === parsedAmount);

  function handleAmountChange(e) {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
    setDigits(raw);
    setError('');
  }

  useEffect(() => {
    if (parsedAmount <= 0) {
      setIntentData(null);
      setLoadingIntent(false);
      return;
    }

    const gen = ++genRef.current;
    setLoadingIntent(true);
    setIntentData(null);

    const timer = setTimeout(async () => {
      try {
        const data = await createPaymentIntent(parsedAmount);
        if (gen !== genRef.current) return;
        setStripePromise(prev => prev || loadStripe(data.publicKey));
        setIntentData({ clientSecret: data.clientSecret, paymentIntentId: data.paymentIntentId, amount: parsedAmount });
      } catch {
        // silent — retry on next change
      } finally {
        if (gen === genRef.current) setLoadingIntent(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [parsedAmount]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>Depositar</span>
          <button style={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <div style={styles.section}>
          <div style={styles.label}>Valor</div>
          <div style={styles.amountRow}>
            <span style={styles.currency}>R$</span>
            <input
              style={styles.amountInput}
              type="text"
              inputMode="numeric"
              placeholder="0,00"
              value={formatBRL(digits)}
              onChange={handleAmountChange}
              autoFocus
            />
          </div>
        </div>

        {error && <div style={{ ...styles.error, marginBottom: 12 }}>{error}</div>}

        {stripePromise ? (
          <Elements stripe={stripePromise}>
            <CardForm
              clientSecret={intentData?.clientSecret}
              paymentIntentId={intentData?.paymentIntentId}
              parsedAmount={parsedAmount}
              intentReady={intentReady}
              onSuccess={(wallet) => { onSuccess(wallet); onClose(); }}
              onError={setError}
            />
          </Elements>
        ) : (
          <StaticCardPlaceholder parsedAmount={parsedAmount} loading={loadingIntent} />
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '28px 28px 24px', width: 420,
    boxShadow: '0 28px 80px rgba(0,0,0,0.6)',
    animation: 'modalIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 6, display: 'flex',
    borderRadius: 8,
  },
  section: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase' },
  amountRow: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 10, padding: '0 16px',
  },
  currency: { fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.5)', flexShrink: 0 },
  amountInput: {
    background: 'transparent', border: 'none', outline: 'none',
    fontSize: 22, fontWeight: 700, color: '#fff', width: '100%',
    padding: '14px 0', fontFamily: 'inherit', letterSpacing: '-0.5px',
  },

  // Card visual
  cardVisual: {
    background: 'linear-gradient(135deg, #5c54e8 0%, #3b2f8c 55%, #1e1b4b 100%)',
    borderRadius: 14, padding: '18px 20px 16px',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 10px 40px rgba(92, 84, 232, 0.35)',
  },
  cardChip: {
    width: 32, height: 24,
    background: 'linear-gradient(135deg, #c9a227 0%, #f0d060 50%, #c9a227 100%)',
    borderRadius: 5, marginBottom: 14,
    display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5, padding: '0 5px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  },
  chipLine: { height: 1.5, background: 'rgba(0,0,0,0.25)', borderRadius: 2 },
  cardNumberWrap: { marginBottom: 16 },
  cardFooter: { display: 'flex', alignItems: 'flex-end', gap: 20 },
  cardField: { display: 'flex', flexDirection: 'column', gap: 3 },
  cardFieldEl: { minWidth: 70 },
  cardMeta: { fontSize: 9, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px', marginBottom: 2 },
  cardAmount: { fontWeight: 700, letterSpacing: '0.3px', transition: 'font-size 0.15s, color 0.15s' },
  cardShine: {
    position: 'absolute', top: -60, right: -60,
    width: 200, height: 200,
    background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 65%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  cardGlow: {
    position: 'absolute', bottom: -40, left: -20,
    width: 160, height: 160,
    background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)',
    borderRadius: '50%', pointerEvents: 'none',
  },
  cardOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(20, 18, 50, 0.55)',
    backdropFilter: 'blur(1px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14,
  },

  hint: { fontSize: 11, color: 'rgba(255,255,255,0.22)', lineHeight: 1.5 },
  error: {
    padding: '10px 13px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 12, color: '#f87171',
  },
  btn: {
    padding: '13px',
    background: 'linear-gradient(135deg, #6c63ff, #5c54e8)',
    color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit', width: '100%',
    boxShadow: '0 4px 16px rgba(108,99,255,0.35)',
    transition: 'opacity 0.15s',
  },
  stateWrap: {
    textAlign: 'center', padding: '24px 0 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
  },
  stateText: { fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
  stateSubText: { fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5, maxWidth: 280 },
};
