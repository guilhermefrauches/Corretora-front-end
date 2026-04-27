import React, { useEffect, useState, useMemo } from 'react';
import { FileText, Printer, Loader } from 'lucide-react';
import { getWallet } from '../services/walletService';
import { useAuth } from '../context/AuthContext';

function fmt(v) {
  return Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return '-';
  const dt = new Date(d);
  return isNaN(dt) ? '-' : dt.toLocaleDateString('pt-BR');
}
function isPositive(type) {
  return ['DEPOSIT', 'COMPRA'].includes((type ?? '').toUpperCase());
}
function typeLabel(type) {
  const map = { DEPOSIT: 'Depósito', WITHDRAW: 'Saque', COMPRA: 'Compra', VENDA: 'Venda' };
  return map[(type ?? '').toUpperCase()] ?? type ?? '-';
}

function monthKey(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [year, month] = key.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function printExtrato({ transactions, monthKey, userName, balance }) {
  const label = monthLabel(monthKey);
  const totalIn  = transactions.filter(t => isPositive(t.type)).reduce((s, t) => s + Math.abs(t.amount ?? t.total ?? 0), 0);
  const totalOut = transactions.filter(t => !isPositive(t.type)).reduce((s, t) => s + Math.abs(t.amount ?? t.total ?? 0), 0);

  const rows = transactions.map(tx => `
    <tr>
      <td>${fmtDate(tx.date ?? tx.createdAt)}</td>
      <td>${typeLabel(tx.type)}</td>
      <td>${tx.description ?? '-'}</td>
      <td class="${isPositive(tx.type) ? 'pos' : 'neg'}" style="text-align:right">
        ${isPositive(tx.type) ? '+' : '-'} R$ ${fmt(Math.abs(tx.amount ?? tx.total ?? 0))}
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Extrato ${label}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #111; background: #fff; padding: 40px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #111; }
    .brand { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .brand span { color: #5c54e8; }
    .header-right { text-align: right; color: #555; font-size: 12px; line-height: 1.7; }
    h2 { font-size: 15px; font-weight: 700; margin-bottom: 16px; }
    .summary { display: flex; gap: 24px; margin-bottom: 28px; }
    .summary-box { flex: 1; border: 1px solid #e5e5e5; border-radius: 8px; padding: 14px 16px; }
    .summary-box .lbl { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 6px; }
    .summary-box .val { font-size: 16px; font-weight: 700; }
    .pos { color: #16a34a; }
    .neg { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; }
    thead th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; padding: 8px 10px; border-bottom: 1px solid #e5e5e5; }
    tbody td { padding: 10px 10px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: none; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #aaa; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Carteira<span>Invest</span></div>
      <div style="color:#888;font-size:12px;margin-top:4px">Extrato de transações</div>
    </div>
    <div class="header-right">
      <div><strong>${userName}</strong></div>
      <div>Período: ${label}</div>
      <div>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</div>
    </div>
  </div>

  <h2>Resumo do período</h2>
  <div class="summary">
    <div class="summary-box">
      <div class="lbl">Total de entradas</div>
      <div class="val pos">+ R$ ${fmt(totalIn)}</div>
    </div>
    <div class="summary-box">
      <div class="lbl">Total de saídas</div>
      <div class="val neg">- R$ ${fmt(totalOut)}</div>
    </div>
    <div class="summary-box">
      <div class="lbl">Saldo atual</div>
      <div class="val">R$ ${fmt(balance ?? 0)}</div>
    </div>
  </div>

  <h2>Transações (${transactions.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Data</th><th>Tipo</th><th>Descrição</th><th style="text-align:right">Valor</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">CarteiraInvest · Documento gerado automaticamente · ${new Date().toLocaleString('pt-BR')}</div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=700');
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

export default function RelatoriosPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printing, setPrinting] = useState(null);

  useEffect(() => {
    getWallet()
      .then(setWallet)
      .catch(() => setError('Não foi possível carregar as transações.'))
      .finally(() => setLoading(false));
  }, []);

  // Group transactions by month, most recent first
  const months = useMemo(() => {
    if (!wallet?.transactions?.length) return [];
    const groups = {};
    wallet.transactions.forEach(tx => {
      const key = monthKey(tx.date ?? tx.createdAt);
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(tx);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, txs]) => ({ key, txs }));
  }, [wallet]);

  function handlePrint(key, txs) {
    setPrinting(key);
    setTimeout(() => {
      printExtrato({
        transactions: txs,
        monthKey: key,
        userName: user?.name ?? 'Usuário',
        balance: wallet?.balance,
      });
      setPrinting(null);
    }, 100);
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div style={styles.pageTitle}>Relatórios</div>
        <div style={styles.subtitle}>Extratos gerados a partir das suas transações reais</div>
      </div>

      {loading && <div style={styles.state}>Carregando...</div>}
      {error  && <div style={{ ...styles.state, color: '#f87171' }}>{error}</div>}

      {!loading && !error && months.length === 0 && (
        <div style={styles.state}>Nenhuma transação encontrada para gerar relatórios.</div>
      )}

      {!loading && !error && months.length > 0 && (
        <div style={styles.card}>
          {months.map(({ key, txs }, i) => {
            const totalIn  = txs.filter(t => isPositive(t.type)).reduce((s, t) => s + Math.abs(t.amount ?? t.total ?? 0), 0);
            const totalOut = txs.filter(t => !isPositive(t.type)).reduce((s, t) => s + Math.abs(t.amount ?? t.total ?? 0), 0);
            const isPrinting = printing === key;

            return (
              <div key={key} style={{ ...styles.row, ...(i > 0 ? styles.rowBorder : {}) }}>
                <div style={styles.left}>
                  <div style={styles.docIcon}>
                    <FileText size={16} color="#a78bfa" />
                  </div>
                  <div>
                    <div style={styles.docName}>Extrato — {monthLabel(key)}</div>
                    <div style={styles.docMeta}>
                      {txs.length} transaç{txs.length === 1 ? 'ão' : 'ões'}
                      &nbsp;·&nbsp;
                      <span style={{ color: '#4ade80' }}>+R$ {fmt(totalIn)}</span>
                      &nbsp;
                      <span style={{ color: '#f87171' }}>-R$ {fmt(totalOut)}</span>
                    </div>
                  </div>
                </div>

                <button
                  style={{ ...styles.printBtn, opacity: isPrinting ? 0.6 : 1 }}
                  disabled={isPrinting}
                  onClick={() => handlePrint(key, txs)}
                >
                  {isPrinting
                    ? <Loader size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                    : <Printer size={13} />}
                  {isPrinting ? 'Abrindo...' : 'Imprimir / PDF'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 20 },
  header: { display: 'flex', flexDirection: 'column', gap: 4 },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#fff' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  card: {
    background: '#1a1d2e', borderRadius: 12,
    border: '0.5px solid rgba(255,255,255,0.07)', padding: '4px 0',
  },
  row: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', padding: '14px 18px',
  },
  rowBorder: { borderTop: '0.5px solid rgba(255,255,255,0.06)' },
  left: { display: 'flex', alignItems: 'center', gap: 12 },
  docIcon: {
    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
    background: 'rgba(108,99,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  docName: { fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 4 },
  docMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  printBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(108,99,255,0.15)', border: '0.5px solid rgba(108,99,255,0.4)',
    borderRadius: 8, color: '#a78bfa', fontSize: 12, fontWeight: 600,
    padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'opacity 0.15s', flexShrink: 0,
  },
  state: {
    padding: '40px 0', textAlign: 'center',
    fontSize: 13, color: 'rgba(255,255,255,0.4)',
  },
};
