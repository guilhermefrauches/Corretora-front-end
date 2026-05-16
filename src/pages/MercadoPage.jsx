import React, { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { listStocks } from '../services/marketService';

function fmt(value) {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtVolume(value) {
  if (value == null) return '-';
  const n = Number(value);
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(0) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
  return String(n);
}

export default function MercadoPage() {
  const [activeTab, setActiveTab] = useState('stocks');
  const [stocks, setStocks]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  // lista de ativos / FIIs
  useEffect(() => {
    if (activeTab !== 'stocks' && activeTab !== 'fiis') return;
    let cancelled = false;
    setLoading(true);
    setError('');

    const timer = setTimeout(() => {
      listStocks({
        search,
        page,
        limit: 20,
        sortBy: 'close',
        sortOrder: 'desc',
        type: activeTab === 'fiis' ? 'fund' : 'stock',
      })
        .then(res => {
          if (cancelled) return;
          setStocks(res.stocks ?? []);
          setTotalPages(res.totalPages ?? 1);
        })
        .catch(() => { if (!cancelled) setError('Não foi possível carregar os ativos.'); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 500);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [search, page, activeTab]);

  function handleSearch(e) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleTabChange(e) {
    setActiveTab(e.target.value);
    setSearch('');
    setPage(1);
  }

  const showSearch = activeTab === 'stocks' || activeTab === 'fiis';

  return (
    <>
    <div style={styles.wrap}>
      <div style={styles.pageTitle}>Mercado</div>

      {/* Card principal */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <select style={styles.tabSelect} value={activeTab} onChange={handleTabChange}>
            <option value="stocks">Ações</option>
            <option value="fiis">FIIs</option>
          </select>

          {showSearch && (
            <div style={styles.searchWrap}>
              <Search size={13} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0 }} />
              <input
                style={styles.searchInput}
                placeholder="Buscar ativo..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          )}
        </div>

        {(activeTab === 'stocks' || activeTab === 'fiis') && (
          <>
            {loading && <div style={styles.state}>Carregando...</div>}
            {error    && <div style={{ ...styles.state, color: '#f87171' }}>{error}</div>}
            {!loading && !error && stocks.length === 0 && (
              <div style={styles.state}>Nenhum ativo encontrado.</div>
            )}
            {!loading && !error && stocks.length > 0 && (
              <>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {['Ticker', 'Nome', 'Preço', 'Variação', 'Volume'].map((h, i) => (
                        <th key={i} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stocks.map((row) => {
                      const positive = Number(row.change) >= 0;
                      return (
                        <tr key={row.stock} style={styles.tr}>
                          <td style={styles.tdTicker}>{row.stock}</td>
                          <td style={styles.td}>{row.name ?? '-'}</td>
                          <td style={styles.td}>R$ {fmt(row.close ?? 0)}</td>
                          <td style={{ ...styles.td, color: positive ? '#4ade80' : '#f87171', fontWeight: 500 }}>
                            {positive ? '▲' : '▼'} {Math.abs(Number(row.change)).toFixed(2).replace('.', ',')}%
                          </td>
                          <td style={{ ...styles.td, color: 'rgba(255,255,255,0.45)' }}>
                            {fmtVolume(row.volume)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {totalPages > 1 && (
                  <div style={styles.pagination}>
                    <button
                      style={{ ...styles.paginationBtn, opacity: page <= 1 ? 0.35 : 1 }}
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      <ChevronLeft size={14} /> Anterior
                    </button>
                    <span style={styles.paginationInfo}>{page} / {totalPages}</span>
                    <button
                      style={{ ...styles.paginationBtn, opacity: page >= totalPages ? 0.35 : 1 }}
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Próxima <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

    </div>
    </>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20 },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  card: {
    background: '#1a1d2e',
    borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)',
    padding: 18,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
    flexWrap: 'wrap',
  },
  tabSelect: {
    background: '#13152a',
    border: '0.5px solid rgba(255,255,255,0.12)',
    borderRadius: 8,
    color: '#fff',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    padding: '7px 32px 7px 12px',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'auto',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#13152a', border: '0.5px solid rgba(255,255,255,0.1)',
    borderRadius: 8, padding: '7px 12px', minWidth: 180,
  },
  searchInput: {
    background: 'none', border: 'none', outline: 'none',
    color: '#fff', fontSize: 13, fontFamily: 'inherit', width: '100%',
  },
  state: { padding: '24px 0', textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '0 12px 10px',
  },
  tr: { borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  td: { padding: '11px 12px', fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  tdTicker: {
    padding: '11px 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    fontFamily: 'monospace',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
    marginTop: 16, paddingTop: 14, borderTop: '0.5px solid rgba(255,255,255,0.06)',
  },
  paginationBtn: {
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '6px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s',
  },
  paginationInfo: { fontSize: 12, color: 'rgba(255,255,255,0.35)', minWidth: 40, textAlign: 'center' },
};
