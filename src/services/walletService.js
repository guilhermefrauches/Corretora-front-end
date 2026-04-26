import api from './api';

export async function getWallet() {
  const { data } = await api.get('/api/wallet');
  return data;
}

export async function deposit(amount, description) {
  const { data } = await api.post('/api/wallet/deposit', { amount, description });
  return data;
}

export async function withdraw(amount, description) {
  const { data } = await api.post('/api/wallet/withdraw', { amount, description });
  return data;
}

export async function createPaymentIntent(amount) {
  const { data } = await api.post('/api/stripe/create-payment-intent', {
    amount,
    currency: 'brl',
  });
  return data;
}
