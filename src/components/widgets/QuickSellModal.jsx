import React, { useEffect, useState } from 'react';
import { X, CheckCircle, ChevronLeft } from 'lucide-react';
import { getQuote } from '../../services/marketService';
import { getPortfolio, sellAsset } from '../../services/portfolioService';

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TYPE_LABELS = { acao: 'Ação', fii: 'FII', renda_fixa: 'Renda Fixa' };


export default function QuickSellModal({ onClose, onSuccess }) {
  const [step, setStep]           = useState('list'); // 'list' | 'form'
  const [holdings, setHoldings]   = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');
  const [selected, setSelected]   = useState(null);

  const [currentPrice, setCurrentPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError]     = useState('');
  const [qtyStr, setQtyStr]             = useState('');
  const [selling, setSelling]           = useState(false);
  const [sellError, setSellError]       = useState('');
  const [success, setSuccess]           = useState(false);

  useEffect(() => {
    getPortfolio()
      .then(data => setHoldings(data.positions ?? data.holdings ?? []))
      .catch(() => setListError('Não foi possível carregar sua carteira.'))
      .finally(() => setLoadingList(false));
  }, []);

  function selectHolding(h) {
    setSelected(h);
    setStep('form');
    setQtyStr('');
    setSellError('');
    setPriceError('');
    if (h.currentPrice != null) {
      setCurrentPrice(Number(h.currentPrice));
      setLoadingPrice(false);
    } else {
      setCurrentPrice(null);
      setLoadingPrice(true);
      getQuote(h.ticker)
        .then(res => {
          const r = res?.results?.[0];
          setCurrentPrice(r ? Number(r.regularMarketPrice) : null);
          if (!r) setPriceError('Cotação indisponível, tente novamente.');
        })
        .catch(() => setPriceError('Erro ao buscar cotação.'))
        .finally(() => setLoadingPrice(false));
    }
  }

  const qty     = parseInt(qtyStr, 10) || 0;
  const price   = currentPrice ?? 0;
  const proceeds = price * qty;
  const cost    = selected ? (selected.avgPrice * qty) : 0;
  const pnl     = proceeds - cost;
  const canSell = qty > 0 && qty <= (selected?.qty ?? 0) && currentPrice !== null && !selling;

  async function handleSell(e) {
    e.preventDefault();
    if (!canSell) return;
    setSelling(true);
    setSellError('');
    try {
      const result = await sellAsset({ ticker: selected.ticker, qty, price });
      setSuccess(true);
      setTimeout(() => { onSuccess(result); onClose(); }, 1400);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setSellError(typeof msg === 'string' ? msg : 'Erro ao realizar venda.');
    } finally {
      setSelling(false);
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {step === 'form' && !success && (
              <button style={s.backBtn} onClick={() => setStep('list')}>
                <ChevronLeft size={14} />
              </button>
            )}
            <span style={s.title}>
              {step === 'list' ? 'Vender ativo' : selected?.ticker}
            </span>
          </div>
          <button style={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {success ? (
          <div style={s.stateWrap}>
            <CheckCircle size={44} color="#4ade80" />
            <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15, marginTop: 10 }}>Venda realizada!</div>
          </div>
        ) : step === 'list' ? (
          <>
            {loadingList && <div style={s.state}>Carregando carteira...</div>}
            {listError  && <div style={{ ...s.state, color: '#f87171' }}>{listError}</div>}
            {!loadingList && !listError && holdings.length === 0 && (
              <div style={s.state}>Você não possui ativos na carteira.</div>
            )}
            {!loadingList && !listError && holdings.length > 0 && (
              <div style={s.holdingList}>
                {holdings.map((h) => {
                  const ticker       = h.ticker ?? h.symbol;
                  const qty          = h.qty ?? h.quantity ?? 0;
                  const avgPrice     = h.avgPrice ?? h.averagePrice ?? h.average_price ?? 0;
                  const currentPrice = h.currentPrice ?? null;
                  const norm         = { ...h, ticker, qty, avgPrice, currentPrice };
                  return (
                    <button key={ticker} style={s.holdingItem} onClick={() => selectHolding(norm)}>
                      <div style={s.holdingLeft}>
                        <span style={s.holdingTicker}>{ticker}</span>
                        <span style={s.holdingName}>{h.name}</span>
                      </div>
                      <div style={s.holdingRight}>
                        <span style={s.holdingQty}>{qty} un.</span>
                        <span style={s.holdingType}>{TYPE_LABELS[h.assetType ?? h.type] || h.assetType || h.type}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={s.quoteCard}>
              <div style={s.holdingName2}>{selected.name}</div>
              <div style={s.quoteRow}>
                <span style={s.quoteLabel}>Em carteira</span>
                <span style={s.quoteVal}>{selected.qty} un.</span>
              </div>
              <div style={s.quoteRow}>
                <span style={s.quoteLabel}>Preço médio</span>
                <span style={s.quoteVal}>R$ {fmt(selected.avgPrice)}</span>
              </div>
              <div style={s.quoteRow}>
                <span style={s.quoteLabel}>Cotação atual</span>
                <span style={{ ...s.quoteVal, color: '#4ade80' }}>
                  {loadingPrice ? '...' : priceError ? '—' : `R$ ${fmt(currentPrice)}`}
                </span>
              </div>
            </div>

            {priceError && <div style={{ ...s.error, marginBottom: 14 }}>{priceError}</div>}

            <form onSubmit={handleSell} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={s.label}>Quantidade a vender</div>
                <input
                  style={s.input}
                  type="number"
                  min="1"
                  max={selected.qty}
                  step="1"
                  placeholder={`máx. ${selected.qty}`}
                  value={qtyStr}
                  onChange={(e) => { setQtyStr(e.target.value.replace(/\D/g, '')); setSellError(''); }}
                  autoFocus
                />
                {qty > selected.qty && (
                  <div style={{ fontSize: 11, color: '#f87171', marginTop: 4 }}>
                    Máximo disponível: {selected.qty} un.
                  </div>
                )}
              </div>

              {qty > 0 && currentPrice !== null && (
                <div style={s.pnlCard}>
                  <div style={s.quoteRow}>
                    <span style={s.quoteLabel}>Receita bruta</span>
                    <span style={s.quoteVal}>R$ {fmt(proceeds)}</span>
                  </div>
                  <div style={s.quoteRow}>
                    <span style={s.quoteLabel}>Custo ({qty} × R$ {fmt(selected.avgPrice)})</span>
                    <span style={s.quoteVal}>R$ {fmt(cost)}</span>
                  </div>
                  <div style={{ ...s.quoteRow, paddingTop: 8, borderTop: '0.5px solid rgba(255,255,255,0.08)', marginTop: 4 }}>
                    <span style={{ ...s.quoteLabel, fontWeight: 600 }}>Resultado</span>
                    <span style={{ ...s.quoteVal, color: pnl >= 0 ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                      {pnl >= 0 ? '+' : ''}R$ {fmt(pnl)}
                    </span>
                  </div>
                </div>
              )}

              {sellError && <div style={s.error}>{sellError}</div>}

              <button
                style={{ ...s.sellBtn, opacity: !canSell ? 0.5 : 1 }}
                type="submit"
                disabled={!canSell}
              >
                {selling
                  ? 'Processando...'
                  : qty > 0
                    ? `Vender ${qty} ${selected.ticker}`
                    : 'Confirmar venda'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    background: '#1a1d2e', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 16, padding: '28px 28px 24px', width: 420,
    boxShadow: '0 28px 80px rgba(0,0,0,0.6)',
    maxHeight: '85vh', overflowY: 'auto',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  title: { fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.2px' },
  backBtn: {
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 5, display: 'flex',
    borderRadius: 7, alignItems: 'center',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 6, display: 'flex', borderRadius: 8,
  },
  state: { padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  holdingList: { display: 'flex', flexDirection: 'column', gap: 8 },
  holdingItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '13px 16px', cursor: 'pointer', textAlign: 'left',
    transition: 'background 0.15s', fontFamily: 'inherit',
  },
  holdingLeft: { display: 'flex', flexDirection: 'column', gap: 4 },
  holdingTicker: { fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'monospace' },
  holdingName: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  holdingRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 },
  holdingQty: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' },
  holdingType: { fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  quoteCard: {
    background: 'rgba(248,113,113,0.07)', border: '0.5px solid rgba(248,113,113,0.2)',
    borderRadius: 12, padding: '14px 16px', marginBottom: 18,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  holdingName2: { fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 },
  quoteRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  quoteLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  quoteVal: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' },
  pnlCard: {
    background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
  },
  label: {
    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
    marginBottom: 8, letterSpacing: '0.5px', textTransform: 'uppercase',
  },
  input: {
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 15px', fontSize: 18, fontWeight: 700,
    color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box',
    fontFamily: 'inherit', letterSpacing: '-0.5px',
  },
  error: {
    padding: '10px 13px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 12, color: '#f87171',
  },
  sellBtn: {
    padding: '13px', background: 'linear-gradient(135deg, #d97706, #f59e0b)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%',
    boxShadow: '0 4px 16px rgba(245,158,11,0.3)', transition: 'opacity 0.15s',
  },
  stateWrap: {
    textAlign: 'center', padding: '20px 0 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
};
