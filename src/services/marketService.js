import api from './api';

export async function getQuote(tickers) {
  const { data } = await api.get(`/api/market/quote/${tickers}`);
  return data;
}

export async function getQuoteHistory(tickers, range, interval) {
  const { data } = await api.get(`/api/market/quote/${tickers}/history`, {
    params: { range, interval },
  });
  return data;
}

export async function listStocks(params) {
  const { data } = await api.get('/api/market/stocks', { params });
  return data;
}

export async function getInflation(params) {
  const { data } = await api.get('/api/market/inflation', { params });
  return data;
}

export async function getPrimeRate(params) {
  const { data } = await api.get('/api/market/prime-rate', { params });
  return data;
}
