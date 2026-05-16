import React, { useEffect, useState, useRef } from 'react';
import { X, Search, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { listStocks, getQuote } from '../../services/marketService';
import { getWallet } from '../../services/walletService';
import { buyAsset } from '../../services/portfolioService';

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v) {
  const n = Number(v);
  return (n >= 0 ? '+' : '') + n.toFixed(2).replace('.', ',') + '%';
}

export default function QuickBuyModal({ onClose, onSuccess }) {
  const [step, setStep]           = useState('list'); // 'list' | 'form'
  const [activeTab, setActiveTab] = useState('stocks');
  const [search, setSearch]       = useState('');
  const [stocks, setStocks]       = useState([]);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState('');

  const [selected, setSelected]     = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [priceError, setPriceError]     = useState('');
  const [availableBalance, setAvail]    = useState(null);

  const [qtyStr, setQtyStr]   = useState('');
  const [buying, setBuying]   = useState(false);
  const [buyError, setBuyError] = useState('');
  const [success, setSuccess] = useState(false);

  const debounceRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [search, activeTab]);

  useEffect(() => {
    setLoadingList(true);
    setListError('');
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      listStocks({
        search,
        page,
        limit: 20,
        sortBy: 'close',
        sortOrder: 'desc',
        type: activeTab === 'fiis' ? 'fund' : 'stock',
      })
        .then(res => { setStocks(res.stocks ?? []); setTotalPages(res.totalPages ?? 1); })
        .catch(() => setListError('Não foi possível carregar os ativos.'))
        .finally(() => setLoadingList(false));
    }, search ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [search, activeTab, page]);

  function selectStock(row) {
    setSelected(row);
    setStep('form');
    setQtyStr('');
    setBuyError('');
    setCurrentPrice(null);
    setPriceError('');
    setLoadingPrice(true);
    Promise.all([getQuote(row.stock), getWallet()])
      .then(([quoteRes, walletRes]) => {
        const r = quoteRes?.results?.[0];
        setCurrentPrice(r ? Number(r.regularMarketPrice) : null);
        if (!r) setPriceError('Cotação indisponível.');
        setAvail(walletRes.balance ?? 0);
      })
      .catch(() => setPriceError('Erro ao buscar cotação.'))
      .finally(() => setLoadingPrice(false));
  }

  const qty     = parseInt(qtyStr, 10) || 0;
  const price   = currentPrice ?? 0;
  const total   = price * qty;
  const canBuy  = qty > 0 && availableBalance !== null && total <= availableBalance && currentPrice !== null && !buying;

  async function handleBuy(e) {
    e.preventDefault();
    if (!canBuy) {
      if (availableBalance !== null && total > availableBalance) setBuyError('Saldo insuficiente para esta compra.');
      return;
    }
    setBuying(true);
    setBuyError('');
    try {
      const result = await buyAsset({
        ticker: selected.stock,
        name: selected.name || selected.stock,
        type: activeTab === 'fiis' ? 'fii' : 'acao',
        qty,
        price,
      });
      setSuccess(true);
      setTimeout(() => { onSuccess(result); onClose(); }, 1400);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      setBuyError(typeof msg === 'string' ? msg : 'Erro ao realizar compra.');
    } finally {
      setBuying(false);
    }
  }

  return (
    <>
    <style>{`
      @keyframes shimmer {
        0%   { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
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
              {step === 'list' ? 'Comprar ativo' : selected?.stock}
            </span>
          </div>
          <button style={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        {success ? (
          <div style={s.stateWrap}>
            <CheckCircle size={44} color="#4ade80" />
            <div style={{ color: '#4ade80', fontWeight: 700, fontSize: 15, marginTop: 10 }}>Compra realizada!</div>
          </div>
        ) : step === 'list' ? (
          <>
            <div style={s.controls}>
              <div style={s.tabs}>
                <button
                  style={{ ...s.tab, ...(activeTab === 'stocks' ? s.tabActive : {}) }}
                  onClick={() => { setActiveTab('stocks'); setSearch(''); }}
                >Ações</button>
                <button
                  style={{ ...s.tab, ...(activeTab === 'fiis' ? s.tabActive : {}) }}
                  onClick={() => { setActiveTab('fiis'); setSearch(''); }}
                >FIIs</button>
              </div>
              <div style={s.searchWrap}>
                <Search size={12} color="rgba(255,255,255,0.3)" />
                <input
                  style={s.searchInput}
                  placeholder="Buscar ticker ou nome..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
            </div>

            {loadingList && (
              <div style={s.stockList}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={s.skeletonItem}>
                    <div style={s.skeletonLeft}>
                      <div style={{ ...s.bone, width: 52, height: 13 }} />
                      <div style={{ ...s.bone, width: 110 + (i % 3) * 30, height: 10, marginTop: 5 }} />
                    </div>
                    <div style={s.skeletonRight}>
                      <div style={{ ...s.bone, width: 62, height: 13 }} />
                      <div style={{ ...s.bone, width: 38, height: 10, marginTop: 5 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {listError  && <div style={{ ...s.state, color: '#f87171' }}>{listError}</div>}
            {!loadingList && !listError && stocks.length === 0 && (
              <div style={s.state}>Nenhum ativo encontrado.</div>
            )}
            {!loadingList && !listError && stocks.length > 0 && (
              <>
                <div style={s.stockList}>
                  {stocks.map((row) => {
                    const positive = Number(row.change) >= 0;
                    return (
                      <button key={row.stock} style={s.stockItem} onClick={() => selectStock(row)}>
                        <div style={s.stockLeft}>
                          <span style={s.stockTicker}>{row.stock}</span>
                          <span style={s.stockName}>{row.name ?? ''}</span>
                        </div>
                        <div style={s.stockRight}>
                          <span style={s.stockPrice}>R$ {fmt(row.close ?? 0)}</span>
                          <span style={{ ...s.stockChange, color: positive ? '#4ade80' : '#f87171' }}>
                            {positive ? '▲' : '▼'} {Math.abs(Number(row.change)).toFixed(2).replace('.', ',')}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div style={s.pagination}>
                    <button
                      style={{ ...s.pageBtn, opacity: page <= 1 ? 0.35 : 1 }}
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft size={13} /> Anterior
                    </button>
                    <span style={s.pageInfo}>{page} / {totalPages}</span>
                    <button
                      style={{ ...s.pageBtn, opacity: page >= totalPages ? 0.35 : 1 }}
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Próxima <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div style={s.quoteCard}>
              <div style={s.quoteName}>{selected.name || selected.stock}</div>
              <div style={s.quoteRow}>
                <span style={s.quoteLabel}>Cotação atual</span>
                <span style={{ ...s.quoteVal, color: '#4ade80' }}>
                  {loadingPrice ? '...' : priceError ? '—' : `R$ ${fmt(currentPrice)}`}
                </span>
              </div>
              {availableBalance !== null && (
                <div style={s.quoteRow}>
                  <span style={s.quoteLabel}>Saldo disponível</span>
                  <span style={{ ...s.quoteVal, color: '#60a5fa' }}>
                    R$ {fmt(availableBalance)}
                  </span>
                </div>
              )}
            </div>

            {priceError && <div style={{ ...s.error, marginBottom: 14 }}>{priceError}</div>}

            <form onSubmit={handleBuy} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={s.label}>Quantidade</div>
                <input
                  style={s.input}
                  type="number"
                  min="1"
                  step="1"
                  placeholder="0"
                  value={qtyStr}
                  onChange={(e) => { setQtyStr(e.target.value.replace(/\D/g, '')); setBuyError(''); }}
                  autoFocus
                />
              </div>

              {qty > 0 && currentPrice !== null && (
                <div style={s.totalRow}>
                  <span style={s.totalLabel}>Total</span>
                  <span style={{ ...s.totalVal, color: total > (availableBalance ?? Infinity) ? '#f87171' : '#fff' }}>
                    R$ {fmt(total)}
                  </span>
                </div>
              )}

              {buyError && <div style={s.error}>{buyError}</div>}

              <button
                style={{ ...s.buyBtn, opacity: !canBuy ? 0.5 : 1 }}
                type="submit"
                disabled={!canBuy}
              >
                {buying
                  ? 'Processando...'
                  : qty > 0
                    ? `Comprar ${qty} ${selected.stock}`
                    : 'Confirmar compra'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
    </>
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
    borderRadius: 16, padding: '28px 28px 24px', width: 440,
    boxShadow: '0 28px 80px rgba(0,0,0,0.6)',
    maxHeight: '85vh', display: 'flex', flexDirection: 'column',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexShrink: 0 },
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
  controls: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14, flexShrink: 0 },
  tabs: { display: 'flex', gap: 6 },
  tab: {
    padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit', border: '0.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)',
    transition: 'all 0.15s',
  },
  tabActive: {
    background: 'rgba(108,99,255,0.2)', borderColor: 'rgba(108,99,255,0.4)', color: '#a78bfa',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 9, padding: '9px 12px',
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: 13, fontFamily: 'inherit', width: '100%',
  },
  state: { padding: '28px 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  stockList: { overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0 },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingTop: 12, marginTop: 4, borderTop: '0.5px solid rgba(255,255,255,0.06)', flexShrink: 0,
  },
  pageBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '5px 12px', borderRadius: 7,
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
  },
  pageInfo: { fontSize: 12, color: 'rgba(255,255,255,0.35)', minWidth: 36, textAlign: 'center' },
  skeletonItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 9, padding: '11px 14px',
  },
  skeletonLeft:  { display: 'flex', flexDirection: 'column' },
  skeletonRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  bone: {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.11) 50%, rgba(255,255,255,0.06) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: 4,
  },
  stockItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
    borderRadius: 9, padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
    fontFamily: 'inherit', transition: 'background 0.12s',
  },
  stockLeft: { display: 'flex', flexDirection: 'column', gap: 3 },
  stockTicker: { fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'monospace' },
  stockName: { fontSize: 11, color: 'rgba(255,255,255,0.35)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  stockRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 },
  stockPrice: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' },
  stockChange: { fontSize: 11, fontWeight: 500 },
  quoteCard: {
    background: 'rgba(108,99,255,0.08)', border: '0.5px solid rgba(108,99,255,0.2)',
    borderRadius: 12, padding: '14px 16px', marginBottom: 18,
    display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0,
  },
  quoteName: { fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2 },
  quoteRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  quoteLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  quoteVal: { fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' },
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
  totalRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
    borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.08)',
  },
  totalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  totalVal: { fontSize: 16, fontWeight: 700 },
  error: {
    padding: '10px 13px', background: 'rgba(248,113,113,0.1)',
    border: '0.5px solid rgba(248,113,113,0.3)', borderRadius: 8, fontSize: 12, color: '#f87171',
  },
  buyBtn: {
    padding: '13px', background: 'linear-gradient(135deg, #6c63ff, #7c73ff)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%',
    boxShadow: '0 4px 16px rgba(108,99,255,0.3)', transition: 'opacity 0.15s', flexShrink: 0,
  },
  stateWrap: {
    textAlign: 'center', padding: '20px 0 8px',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
};
