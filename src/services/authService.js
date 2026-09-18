import { apiGet, apiPatch, apiPost } from '@/services/apiClient';

export const authService = {
  async me() { try { return (await apiGet('/me')).user; } catch (error) { if (error.status === 401) return null; throw error; } },
  async isAuthenticated() { return Boolean(await this.me()); },
  async login(email, password) { return (await apiPost('/auth/login', { email, password })).user; },
  register(data) { return apiPost('/auth/register', data); },
  resetRequest(email) { return apiPost('/auth/forgot-password', { email }); },
  reset({ resetToken, newPassword }) { return apiPost('/auth/reset-password', { token: resetToken, password: newPassword }); },
  verifyEmail(token) { return apiPost('/auth/verify-email', { token }); },
  async logout() { await apiPost('/auth/logout'); },
  async updateMe(data) { return (await apiPatch('/me', data)).user; },
};
