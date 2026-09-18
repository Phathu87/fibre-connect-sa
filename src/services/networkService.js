import { apiGet } from '@/services/apiClient';

export const networkService = {
  list() {
    return apiGet('/catalogue/networks');
  },
  getBySlug(slug) {
    return apiGet(`/catalogue/networks/${encodeURIComponent(slug)}`);
  },
  packages(slug) {
    return apiGet(`/catalogue/networks/${encodeURIComponent(slug)}/packages`);
  },
};
