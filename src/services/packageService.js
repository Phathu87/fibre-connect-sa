import { apiGet } from '@/services/apiClient';

export const packageService = {
  list(filters = {}, sort = 'recommended', page = 1, pageSize = 12) {
    return apiGet('/catalogue/packages', { ...filters, sort, page, pageSize });
  },
  listAll() {
    return apiGet('/catalogue/packages', { all: true });
  },
  getBySlug(slug) {
    return apiGet(`/catalogue/packages/${encodeURIComponent(slug)}`);
  },
  getRelated(slug) {
    return apiGet(`/catalogue/packages/${encodeURIComponent(slug)}/related`);
  },
  async getFeatured() {
    const result = await apiGet('/catalogue/packages', { pageSize: 6, sort: 'recommended' });
    return result.items.filter(item => item.featured || item.recommended).slice(0, 6);
  },
  async getPopular() {
    const result = await apiGet('/catalogue/packages', { pageSize: 8, sort: 'most-popular' });
    return result.items;
  },
  getForProvider(providerId) {
    return this.list({ providerId }, 'recommended', 1, 100).then(result => result.items);
  },
  getForNetwork(networkId) {
    return this.list({ networkId }, 'recommended', 1, 100).then(result => result.items);
  },
  async filterOptions() {
    const [providers, networks] = await Promise.all([
      apiGet('/catalogue/providers'),
      apiGet('/catalogue/networks'),
    ]);
    return {
      providers: providers.map(provider => ({ id: provider.id, name: provider.name })),
      networks: networks.map(network => ({ id: network.id, name: network.name })),
      connectivityTypes: ['Fibre', '5G', 'LTE'],
    };
  },
};
