import api from './api';

export async function getPortfolio() {
  const { data } = await api.get('/api/portfolio');
  return data;
}

export async function buyAsset({ ticker, name, type, qty, price }) {
  const { data } = await api.post('/api/portfolio/buy', { ticker, name, assetType: type, quantity: qty, price });
  return data;
}

export async function sellAsset({ ticker, qty, price }) {
  const { data } = await api.post('/api/portfolio/sell', { ticker, quantity: qty, price });
  return data;
}

export async function getPortfolioHistory(period = '3M') {
  const { data } = await api.get(`/api/portfolio/history?period=${period}`);
  return data;
}
