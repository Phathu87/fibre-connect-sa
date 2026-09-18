import { apiGet } from '@/services/apiClient';

export const providerService = {
  list() {
    return apiGet('/catalogue/providers');
  },
  getBySlug(slug) {
    return apiGet(`/catalogue/providers/${encodeURIComponent(slug)}`);
  },
  packages(slug) {
    return apiGet(`/catalogue/providers/${encodeURIComponent(slug)}/packages`);
  },
};
