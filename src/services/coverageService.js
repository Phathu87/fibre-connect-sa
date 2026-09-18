import { apiPost } from '@/services/apiClient';

export const coverageService = {
  check(address) { return apiPost('/coverage/check', address); },
};
