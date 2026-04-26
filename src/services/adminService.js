import api from './api';

export async function getAllUsers() {
  const { data } = await api.get('/api/admin/users');
  return data;
}

export async function getUserWallet(userId) {
  const { data } = await api.get(`/api/admin/users/${userId}/wallet`);
  return data;
}

export async function promoteToAdmin(userId) {
  const { data } = await api.put(`/api/admin/users/${userId}/role`, { role: 'ADMIN' });
  return data;
}
