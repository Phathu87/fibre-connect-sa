import { apiDelete, apiGet, apiPatch, apiPost, apiPut, ApiError } from './apiClient';
import { storage, KEYS } from './storageService';

function isUnauthenticated(error) { return error instanceof ApiError && error.status === 401; }

export const savedService = {
  async list() { try { return (await apiGet('/me/saved-packages')).items; } catch (error) { if (!isUnauthenticated(error)) throw error; return []; } },
  listSync() { return storage.get(KEYS.SAVED, []); },
  async toggle(id) { try { return await apiPost(`/me/saved-packages/${id}/toggle`); } catch (error) { if (!isUnauthenticated(error)) throw error; const ids = storage.get(KEYS.SAVED, []); const saved = !ids.includes(id); storage.set(KEYS.SAVED, saved ? [...ids, id] : ids.filter(value => value !== id)); return { saved, ids: storage.get(KEYS.SAVED, []) }; } },
};

export const compareService = {
  listSync() { return storage.get(KEYS.COMPARE, []); },
  async listIds() { try { return ((await apiGet('/me/comparison')).comparison?.items ?? []).map(item => item.packageId); } catch (error) { if (!isUnauthenticated(error)) throw error; return this.listSync(); } },
  async persist(ids) { try { await apiPut('/me/comparison', { packageIds: ids }); } catch (error) { if (!isUnauthenticated(error)) throw error; storage.set(KEYS.COMPARE, ids); } return ids; },
  async toggle(id) { const ids = await this.listIds(); if (ids.includes(id)) return { added: false, ids: await this.persist(ids.filter(value => value !== id)) }; if (ids.length >= 4) return { added: false, ids, full: true }; return { added: true, ids: await this.persist([...ids, id]) }; },
  async remove(id) { return this.persist((await this.listIds()).filter(value => value !== id)); },
  async clear() { return this.persist([]); },
};

export const enquiryService = {
  async create(data) { const payload = { packageId: data.packageId, address: data.address, firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, contactMethod: data.contactMethod, propertyType: data.propertyType, dwelling: data.dwelling, unit: data.unit || undefined, accessNotes: data.accessNotes || undefined, landlordAck: data.landlordAck, privacy: data.privacy, terms: data.terms, providerContact: data.providerContact, marketing: data.marketing }; return (await apiPost('/enquiries', payload)).enquiry; },
  async list() { return (await apiGet('/me/enquiries')).items; },
  async listAdmin() { return (await apiGet('/admin/enquiries')).items; },
  async updateAdmin(id, data) {
    const statusMap = {
      Submitted: 'SUBMITTED',
      'Under review': 'UNDER_REVIEW',
      'Provider contacted': 'PROVIDER_CONTACTED',
      'Awaiting customer': 'AWAITING_CUSTOMER',
      Approved: 'APPROVED',
      'Installation scheduled': 'INSTALLATION_SCHEDULED',
      Completed: 'COMPLETED',
      Cancelled: 'CANCELLED',
    };
    const payload = data.status ? { ...data, status: statusMap[data.status] || data.status } : data;
    return (await apiPatch(`/admin/enquiries/${id}`, payload)).enquiry;
  },
};

export const userService = {
  async getAddresses() { return (await apiGet('/me/addresses')).items; },
  async addAddress(address) { return (await apiPost('/me/addresses', address)).address; },
  async removeAddress(id) { return apiDelete(`/me/addresses/${id}`); },
  async setPreferred(id) { return (await apiPatch(`/me/addresses/${id}/preferred`, {})).address; },
};

export const notificationService = {
  async getPrefs() { return (await apiGet('/me/notification-preferences')).preferences; },
  async setPrefs(preferences) { return (await apiPut('/me/notification-preferences', preferences)).preferences; },
};

export const privacyService = {
  async exportData() { return apiGet('/me/data-export'); },
  async deleteAccount(password) { return apiDelete('/me/account', { password }); },
};

export const auditService = {
  async list(params) { return apiGet('/admin/audit-logs', params); },
};

export const searchHistoryService = { list() { return storage.get(KEYS.RECENT_SEARCHES, []); }, add(address) { const list = storage.get(KEYS.RECENT_SEARCHES, []); const key = JSON.stringify(address); storage.set(KEYS.RECENT_SEARCHES, [address, ...list.filter(item => JSON.stringify(item) !== key)].slice(0, 5)); }, clear() { storage.remove(KEYS.RECENT_SEARCHES); } };
export const coverageHistoryService = { list() { return storage.get(KEYS.COVERAGE_HISTORY, []); }, add(entry) { storage.set(KEYS.COVERAGE_HISTORY, [{ id: `ch-${Date.now().toString(36)}`, ...entry, at: new Date().toISOString() }, ...storage.get(KEYS.COVERAGE_HISTORY, [])].slice(0, 20)); } };
