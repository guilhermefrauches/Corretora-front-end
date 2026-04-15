export const portfolioSummary = {
  totalValue: 87432.90,
  dailyChange: 1847.22,
  dailyChangePct: 2.16,
  monthReturn: 5.38,
  cdiMonth: 0.89,
  ibovMonth: 3.12,
  accumulatedReturn: 12198.40,
  accumulatedReturnPct: 16.2,
};

export const allocationData = [
  { label: "Renda Fixa", pct: 38, color: "#6c63ff" },
  { label: "Ações",      pct: 27, color: "#4ade80" },
  { label: "FIIs",       pct: 18, color: "#f59e0b" },
  { label: "Internacional", pct: 11, color: "#f87171" },
  { label: "Cripto",     pct: 6,  color: "#818cf8" },
];

export const assets = [
  { ticker: "PETR4",  name: "Petrobras",      qty: 200,  avgPrice: 34.20,    totalValue: 7660.00,   returnPct: 11.8,  dayPct: 4.12,  type: "acao" },
  { ticker: "VALE3",  name: "Vale",           qty: 120,  avgPrice: 68.90,    totalValue: 8148.00,   returnPct: -2.4,  dayPct: -1.23, type: "acao" },
  { ticker: "ITUB4",  name: "Itaú Unibanco",  qty: 300,  avgPrice: 31.60,    totalValue: 11490.00,  returnPct: 8.2,   dayPct: -0.72, type: "acao" },
  { ticker: "MXRF11", name: "Maxi Renda",     qty: 450,  avgPrice: 10.48,    totalValue: 5220.00,   returnPct: 4.1,   dayPct: 0.58,  type: "fii" },
  { ticker: "KNRI11", name: "Kinea Reit",     qty: 200,  avgPrice: 141.50,   totalValue: 29800.00,  returnPct: 5.8,   dayPct: 1.08,  type: "fii" },
  { ticker: "TESOURO SELIC 2029", name: "Tesouro Direto", qty: 3, avgPrice: 15200.00, totalValue: 33210.00, returnPct: 7.9, dayPct: 0.04, type: "renda_fixa" },
];

export const marketIndices = [
  { label: 'IBOVESPA', value: '128.450', change: '+1,23%', positive: true },
  { label: 'CDI (ano)', value: '10,65%', change: '+0,04%', positive: true },
  { label: 'IPCA (mês)', value: '0,38%', change: '-0,05%', positive: false },
  { label: 'Dólar (USD)', value: 'R$ 5,12', change: '-0,82%', positive: false },
  { label: 'S&P 500', value: '5.204', change: '+0,57%', positive: true },
];

export const marketHighlights = [
  { ticker: 'PETR4',  name: 'Petrobras PN',    price: '38.30', change: '+4,12%', volume: '312M', positive: true },
  { ticker: 'VALE3',  name: 'Vale ON',          price: '67.44', change: '-1,23%', volume: '210M', positive: false },
  { ticker: 'ITUB4',  name: 'Itaú PN',          price: '38.30', change: '-0,72%', volume: '185M', positive: false },
  { ticker: 'BBDC4',  name: 'Bradesco PN',      price: '13.92', change: '+1,45%', volume: '120M', positive: true },
  { ticker: 'WEGE3',  name: 'WEG ON',           price: '49.87', change: '+2,11%', volume: '98M',  positive: true },
  { ticker: 'MGLU3',  name: 'Magazine Luiza ON', price: '3.41', change: '-3,50%', volume: '76M',  positive: false },
];

export const transactions = [
  { date: '13/04/2026', type: 'Compra', ticker: 'PETR4',  name: 'Petrobras PN',    qty: 100, price: 36.80, total: 3680.00 },
  { date: '10/04/2026', type: 'Venda',  ticker: 'VALE3',  name: 'Vale ON',          qty: 50,  price: 69.20, total: 3460.00 },
  { date: '05/04/2026', type: 'Compra', ticker: 'MXRF11', name: 'Maxi Renda FII',  qty: 100, price: 10.52, total: 1052.00 },
  { date: '28/03/2026', type: 'Compra', ticker: 'ITUB4',  name: 'Itaú PN',          qty: 150, price: 31.60, total: 4740.00 },
  { date: '20/03/2026', type: 'Venda',  ticker: 'BBDC4',  name: 'Bradesco PN',      qty: 200, price: 14.10, total: 2820.00 },
  { date: '15/03/2026', type: 'Compra', ticker: 'KNRI11', name: 'Kinea Reit FII',  qty: 50,  price: 140.20, total: 7010.00 },
  { date: '01/03/2026', type: 'Compra', ticker: 'WEGE3',  name: 'WEG ON',           qty: 80,  price: 47.30, total: 3784.00 },
];

export const reports = [
  { name: 'Informe de Rendimentos 2025', date: 'Jan 2026', type: 'IR', size: '124 KB' },
  { name: 'Extrato Consolidado — Mar 2026', date: 'Abr 2026', type: 'Extrato', size: '86 KB' },
  { name: 'Extrato Consolidado — Fev 2026', date: 'Mar 2026', type: 'Extrato', size: '79 KB' },
  { name: 'Extrato Consolidado — Jan 2026', date: 'Fev 2026', type: 'Extrato', size: '81 KB' },
  { name: 'Nota de Corretagem — Abr/2026', date: 'Abr 2026', type: 'Corretagem', size: '42 KB' },
  { name: 'Nota de Corretagem — Mar/2026', date: 'Mar 2026', type: 'Corretagem', size: '38 KB' },
  { name: 'Relatório de Performance — 1T26', date: 'Abr 2026', type: 'Performance', size: '210 KB' },
];

export const performanceData = {
  "1M": {
    labels: ["01/03","08/03","15/03","22/03","29/03","05/04","13/04"],
    carteira: [0, 1.2, 0.8, 2.1, 3.4, 4.2, 5.38],
    cdi:      [0, 0.2, 0.44, 0.62, 0.75, 0.82, 0.89],
    ibov:     [0, -0.5, 0.8, 1.9, 2.1, 2.8, 3.12],
  },
  "3M": {
    labels: ["Jan","Fev","Mar","Abr"],
    carteira: [0, 2.8, 4.1, 5.38],
    cdi:      [0, 0.9, 1.7, 2.6],
    ibov:     [0, 1.5, 2.8, 3.12],
  },
  "6M": {
    labels: ["Out","Nov","Dez","Jan","Fev","Mar","Abr"],
    carteira: [0, 3.2, 5.1, 7.8, 9.4, 11.2, 13.1],
    cdi:      [0, 0.9, 1.75, 2.6, 3.5, 4.4, 5.3],
    ibov:     [0, 2.1, 4.2, 5.8, 6.5, 8.3, 9.9],
  },
  "1A": {
    labels: ["Abr/24","Jun","Ago","Out","Dez","Fev","Abr/25"],
    carteira: [0, 2.4, 4.8, 7.1, 9.3, 13.8, 16.2],
    cdi:      [0, 1.8, 3.6, 5.4, 7.2, 9.0, 10.8],
    ibov:     [0, 1.5, 2.2, 4.8, 6.1, 7.4, 9.2],
  },
  "MAX": {
    labels: ["Jan/23","Jul","Jan/24","Jul","Jan/25","Abr"],
    carteira: [0, 5.2, 9.8, 13.1, 15.4, 16.2],
    cdi:      [0, 3.4, 6.9, 10.5, 14.2, 15.8],
    ibov:     [0, 4.1, 6.8, 8.2, 10.5, 11.9],
  },
};
