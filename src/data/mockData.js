// Demo data for FibreConnect SA. This is SAMPLE data, not sourced from a live provider feed.
// Codex will replace this with a real backend API. The service layer abstracts access.

export const PROVIDERS = [
  { id: 'afrihost', slug: 'afrihost', name: 'Afrihost', logoText: 'afrihost', color: '#e87722', connectivity: ['Fibre', '5G', 'LTE'], rating: 4.5, reviewCount: 2103, description: 'Consumer-friendly ISP known for transparent pricing and uncapped fibre packages on multiple networks.', packageCount: 0 },
  { id: 'vox', slug: 'vox', name: 'Vox', logoText: 'VOX', color: '#7c3aed', connectivity: ['Fibre', 'LTE'], rating: 4.1, reviewCount: 876, description: 'Telecommunications provider offering residential and business fibre and wireless solutions.', packageCount: 0 },
  { id: 'cool-ideas', slug: 'cool-ideas', name: 'Cool Ideas', logoText: 'CI', color: '#0ea5e9', connectivity: ['Fibre'], rating: 4.6, reviewCount: 1542, description: 'Fibre-focused ISP recognised for responsive support and competitive uncapped pricing.', packageCount: 0 },
  { id: 'openserve-direct', slug: 'openserve-direct', name: 'Openserve Direct', logoText: 'OD', color: '#dc2626', connectivity: ['Fibre'], rating: 4.0, reviewCount: 632, description: 'Direct-to-consumer fibre from Openserve, the national open-access fibre network.', packageCount: 0 },
  { id: 'web-africa', slug: 'web-africa', name: 'Web Africa', logoText: 'WA', color: '#0891b2', connectivity: ['Fibre', 'LTE'], rating: 4.2, reviewCount: 721, description: 'Value-focused ISP offering fibre and capped/uncapped LTE options.', packageCount: 0 },
  { id: 'telkom', slug: 'telkom', name: 'Telkom', logoText: 'T', color: '#16a34a', connectivity: ['Fibre', '5G', 'LTE'], rating: 3.8, reviewCount: 3402, description: 'National operator providing fibre, 5G and LTE connectivity across South Africa.', packageCount: 0 },
  { id: 'rain', slug: 'rain', name: 'rain', logoText: 'rain', color: '#1f2937', connectivity: ['5G', 'LTE'], rating: 3.9, reviewCount: 1890, description: 'Data-only mobile network offering 5G fixed wireless and LTE services.', packageCount: 0 },
];

export const NETWORKS = [
  { id: 'vumatel', slug: 'vumatel', name: 'Vumatel', logo: '/assets/networks/vumatel.png', logoText: 'Vuma', color: '#7c3aed', infrastructure: 'FTTH GPON', supportedProviders: ['afrihost', 'cool-ideas', 'web-africa'], coverageAreas: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'], description: 'Open-access fibre network operator with broad coverage in major metros.' },
  { id: 'openserve', slug: 'openserve', name: 'Openserve', logo: '/assets/networks/openserve.png', logoText: 'OS', color: '#dc2626', infrastructure: 'FTTH GPON', supportedProviders: ['telkom', 'vox', 'openserve-direct'], coverageAreas: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape', 'Free State', 'Mpumalanga', 'Limpopo', 'North West', 'Northern Cape'], description: 'National open-access fibre network operated by Telkom, the widest footprint in SA.' },
  { id: 'metrofibre', slug: 'metrofibre', name: 'MetroFibre', logo: '/assets/networks/metrofibre.png', logoText: 'MF', color: '#0284c7', infrastructure: 'FTTH GPON', supportedProviders: ['vox', 'afrihost'], coverageAreas: ['Gauteng', 'Western Cape'], description: 'Metro fibre operator focused on Gauteng and Western Cape suburbs.' },
  { id: 'frogfoot', slug: 'frogfoot', name: 'Frogfoot', logo: '/assets/networks/frogfoot.png', logoText: 'FF', color: '#16a34a', infrastructure: 'FTTH GPON', supportedProviders: ['afrihost', 'cool-ideas', 'web-africa'], coverageAreas: ['Gauteng', 'Western Cape', 'KwaZulu-Natal', 'Eastern Cape'], description: 'Open-access fibre network expanding across suburban South Africa.' },
  { id: 'octotel', slug: 'octotel', name: 'Octotel', logo: '/assets/networks/octotel.png', logoText: 'OC', color: '#ea580c', infrastructure: 'FTTH GPON', supportedProviders: ['cool-ideas', 'afrihost', 'web-africa'], coverageAreas: ['Western Cape'], description: 'Western Cape-focused open-access fibre operator.' },
  { id: 'link-layer', slug: 'link-layer', name: 'Link Layer', logo: '/assets/networks/link-layer.png', logoText: 'LL', color: '#0f172a', infrastructure: 'FTTH GPON', supportedProviders: ['vox', 'cool-ideas'], coverageAreas: ['Gauteng'], description: 'Gauteng-based fibre network operator.' },
  { id: 'vodacom-5g', slug: 'vodacom-5g', name: 'Vodacom 5G', logo: '/assets/networks/vodacom-5g.png', logoText: 'V5G', color: '#e60012', infrastructure: '5G FWA', supportedProviders: ['telkom'], coverageAreas: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'], description: 'Vodacom 5G fixed wireless access network.' },
  { id: 'mtn-5g', slug: 'mtn-5g', name: 'MTN 5G', logoText: 'M5G', color: '#ffcc00', infrastructure: '5G FWA', supportedProviders: ['telkom', 'web-africa'], coverageAreas: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'], description: 'MTN 5G fixed wireless access network.' },
];

const PROVINCES = [
  { slug: 'gauteng', name: 'Gauteng' },
  { slug: 'western-cape', name: 'Western Cape' },
  { slug: 'kwaZulu-natal', name: 'KwaZulu-Natal' },
  { slug: 'limpopo', name: 'Limpopo' },
  { slug: 'eastern-cape', name: 'Eastern Cape' },
  { slug: 'free-state', name: 'Free State' },
  { slug: 'mpumalanga', name: 'Mpumalanga' },
  { slug: 'north-west', name: 'North West' },
  { slug: 'northern-cape', name: 'Northern Cape' },
];

export const CITIES = [
  { slug: 'johannesburg', name: 'Johannesburg', province: 'gauteng' },
  { slug: 'pretoria', name: 'Pretoria', province: 'gauteng' },
  { slug: 'cape-town', name: 'Cape Town', province: 'western-cape' },
  { slug: 'durban', name: 'Durban', province: 'kwaZulu-natal' },
  { slug: 'midrand', name: 'Midrand', province: 'gauteng' },
  { slug: 'centurion', name: 'Centurion', province: 'gauteng' },
  { slug: 'sandton', name: 'Sandton', province: 'gauteng' },
  { slug: 'roodepoort', name: 'Roodepoort', province: 'gauteng' },
  { slug: 'stellenbosch', name: 'Stellenbosch', province: 'western-cape' },
];

export const SUBURBS = [
  { slug: 'fourways', name: 'Fourways', city: 'johannesburg', province: 'gauteng', networks: ['vumatel', 'frogfoot', 'openserve'] },
  { slug: 'sandton-cbd', name: 'Sandton CBD', city: 'johannesburg', province: 'gauteng', networks: ['vumatel', 'metrofibre', 'openserve'] },
  { slug: 'randburg', name: 'Randburg', city: 'johannesburg', province: 'gauteng', networks: ['vumatel', 'frogfoot'] },
  { slug: 'soweto', name: 'Soweto', city: 'johannesburg', province: 'gauteng', networks: ['openserve', 'frogfoot'] },
  { slug: 'centurion-central', name: 'Centurion Central', city: 'centurion', province: 'gauteng', networks: ['vumatel', 'openserve', 'metrofibre'] },
  { slug: 'hatfield', name: 'Hatfield', city: 'pretoria', province: 'gauteng', networks: ['openserve', 'frogfoot'] },
  { slug: 'claremont', name: 'Claremont', city: 'cape-town', province: 'western-cape', networks: ['octotel', 'openserve'] },
  { slug: 'bellville', name: 'Bellville', city: 'cape-town', province: 'western-cape', networks: ['octotel', 'openserve'] },
  { slug: 'umhlanga', name: 'Umhlanga', city: 'durban', province: 'kwaZulu-natal', networks: ['vumatel', 'openserve'] },
];

// Helper to build packages
function pkg(id, slug, providerId, networkId, name, type, dl, ul, price, opts = {}) {
  return {
    id,
    slug,
    providerId,
    networkId,
    name,
    connectivityType: type,
    downloadMbps: dl,
    uploadMbps: ul,
    monthlyPrice: price,
    promotionalPrice: opts.promo ?? null,
    promotionStart: opts.promo ? '2026-09-01' : null,
    promotionEnd: opts.promo ? '2026-10-31' : null,
    installationFee: opts.install ?? 0,
    routerIncluded: opts.router ?? false,
    routerFee: opts.routerFee ?? 0,
    contractMonths: opts.contract ?? 24,
    uncapped: opts.uncapped ?? true,
    dataAllowanceGb: opts.capped ?? null,
    fairUsagePolicy: opts.fup ?? 'Standard fair usage policy applies. Heavy continuous downloading may be throttled during peak hours.',
    activationEstimate: opts.activation ?? '3–7 working days',
    residential: opts.residential ?? true,
    business: opts.business ?? false,
    featured: opts.featured ?? false,
    recommended: opts.recommended ?? false,
    bestValue: opts.bestValue ?? false,
    mostPopular: opts.popular ?? false,
    active: true,
    description: opts.description ?? `${name} — ${type} package with ${dl}Mbps download and ${ul}Mbps upload.`,
    extras: opts.extras ?? [],
    bestUseCase: opts.useCase ?? 'General household streaming and browsing',
    rating: opts.rating ?? (4 + Math.round(Math.random() * 10) / 10),
    reviewCount: opts.reviewCount ?? Math.floor(50 + Math.random() * 400),
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  };
}

export const PACKAGES = [
  // Afrihost
  pkg('p8', 'afrihost-fibre-50-50', 'afrihost', 'vumatel', 'Afrihost Pure Fibre 50/50', 'Fibre', 50, 50, 699, { install: 0, router: true, featured: true, useCase: 'Symmetrical upload for content creators' }),
  pkg('p9', 'afrihost-fibre-100-100', 'afrihost', 'frogfoot', 'Afrihost Pure Fibre 100/100', 'Fibre', 100, 100, 899, { install: 0, router: true, promo: 799, popular: true, useCase: 'Symmetrical speeds for WFH and gaming' }),
  pkg('p10', 'afrihost-fibre-200-200', 'afrihost', 'openserve', 'Afrihost Pure Fibre 200/200', 'Fibre', 200, 200, 1199, { install: 250, router: true, recommended: true, useCase: 'Heavy households, large uploads' }),
  pkg('p11', 'afrihost-fibre-500-500', 'afrihost', 'vumatel', 'Afrihost Pure Fibre 500/500', 'Fibre', 500, 500, 1799, { install: 500, router: true, useCase: 'Professional creators and small offices' }),
  pkg('p12', 'afrihost-5g-300', 'afrihost', 'vodacom-5g', 'Afrihost 5G 300/100', '5G', 300, 100, 999, { install: 0, router: true, contract: 24, useCase: 'Fast wireless where fibre unavailable' }),
  // Vox
  pkg('p13', 'vox-fibre-100-50', 'vox', 'metrofibre', 'Vox Fibre 100/50 Uncapped', 'Fibre', 100, 50, 899, { install: 0, router: true, useCase: 'Standard family fibre' }),
  pkg('p14', 'vox-fibre-200-200', 'vox', 'metrofibre', 'Vox Fibre 200/200 Uncapped', 'Fibre', 200, 200, 1099, { install: 250, router: true, bestValue: true, useCase: 'Symmetrical high-speed home' }),
  pkg('p15', 'vox-business-fibre-400-400', 'vox', 'openserve', 'Vox Business Fibre 400/400', 'Fibre', 400, 400, 2499, { install: 1000, router: true, residential: false, business: true, useCase: 'Small business with SLA needs' }),
  // Cool Ideas
  pkg('p16', 'cool-fibre-100-100', 'cool-ideas', 'octotel', 'Cool Ideas 100/100 Uncapped', 'Fibre', 100, 100, 849, { install: 0, router: true, featured: true, popular: true, useCase: 'Symmetrical fibre, great support' }),
  pkg('p17', 'cool-fibre-200-200', 'cool-ideas', 'vumatel', 'Cool Ideas 200/200 Uncapped', 'Fibre', 200, 200, 1149, { install: 0, router: true, recommended: true, useCase: 'Power household' }),
  pkg('p18', 'cool-fibre-500-500', 'cool-ideas', 'frogfoot', 'Cool Ideas 500/500 Uncapped', 'Fibre', 500, 500, 1699, { install: 250, router: true, useCase: 'Enthusiasts and home offices' }),
  // Openserve Direct
  pkg('p19', 'openserve-direct-50-10', 'openserve-direct', 'openserve', 'Openserve Direct 50/10', 'Fibre', 50, 10, 649, { install: 0, router: false, useCase: 'Entry fibre direct from network' }),
  pkg('p20', 'openserve-direct-100-50', 'openserve-direct', 'openserve', 'Openserve Direct 100/50', 'Fibre', 100, 50, 899, { install: 0, router: true, promo: 799, useCase: 'Mid-tier direct fibre' }),
  // Web Africa
  pkg('p21', 'webafrica-fibre-100-50', 'web-africa', 'frogfoot', 'Web Africa Fibre 100/50 Uncapped', 'Fibre', 100, 50, 849, { install: 0, router: true, useCase: 'Value uncapped fibre' }),
  pkg('p22', 'webafrica-fibre-200-100', 'web-africa', 'octotel', 'Web Africa Fibre 200/100 Uncapped', 'Fibre', 200, 100, 1199, { install: 250, router: true, useCase: 'High-speed family fibre' }),
  pkg('p23', 'webafrica-lte-200gb', 'web-africa', 'mtn-5g', 'Web Africa Fixed LTE 200GB', 'LTE', 150, 50, 649, { install: 0, router: false, uncapped: false, capped: 200, contract: 12, useCase: 'Capped LTE backup' }),
  // Telkom
  pkg('p24', 'telkom-fibre-100-50', 'telkom', 'openserve', 'Telkom Fibre 100/50 Uncapped', 'Fibre', 100, 50, 899, { install: 0, router: true, popular: true, useCase: 'National coverage fibre' }),
  pkg('p25', 'telkom-5g-home', 'telkom', 'vodacom-5g', 'Telkom 5G Home Unlimited', '5G', 300, 100, 899, { install: 0, router: true, contract: 36, featured: true, useCase: '5G fixed wireless home internet' }),
  pkg('p26', 'telkom-lte-uncapped', 'telkom', 'mtn-5g', 'Telkom Fixed LTE Uncapped', 'LTE', 100, 30, 699, { install: 0, router: true, useCase: 'LTE where fibre unavailable' }),
  // Rain
  pkg('p27', 'rain-5g-home', 'rain', 'vodacom-5g', 'rain 5G Home Standard', '5G', 200, 50, 555, { install: 0, router: true, contract: 0, bestValue: true, useCase: 'Month-to-month 5G, no contract' }),
  pkg('p28', 'rain-5g-premium', 'rain', 'mtn-5g', 'rain 5G Home Premium', '5G', 400, 100, 699, { install: 0, router: true, contract: 0, recommended: true, useCase: 'Premium 5G speeds, month-to-month' }),
];

// Compute provider package counts
PROVIDERS.forEach(p => { p.packageCount = PACKAGES.filter(pk => pk.providerId === p.id).length; });

export const FAQS = [
  { id: 'f1', category: 'Coverage', question: 'How do I check if fibre is available at my address?', answer: 'Enter your street address, suburb, city and province in the coverage checker and select "Check coverage". We compare the available fibre network operators in your area and show which packages you can order. Coverage data shown here is sample data for demonstration; live availability is confirmed by the network operator during the application process.' },
  { id: 'f2', category: 'Coverage', question: 'What if fibre is not available at my address?', answer: 'If fibre has not reached your area yet, we recommend fixed LTE or 5G wireless alternatives where coverage exists. You can also register for a notify-me alert so we can let you know when fibre becomes available at your address.' },
  { id: 'f3', category: 'Packages', question: 'What is the difference between capped and uncapped?', answer: 'Uncapped packages allow unlimited data usage subject to a fair usage policy. Capped packages include a fixed monthly data allowance (for example 100GB) and may slow or stop once the cap is reached.' },
  { id: 'f4', category: 'Packages', question: 'What does "router included" mean?', answer: 'A router-included package provides a compatible Wi-Fi router as part of the deal. Some packages require you to supply your own router, which is noted in the package details.' },
  { id: 'f5', category: 'Comparisons', question: 'How many packages can I compare at once?', answer: 'You can compare between 2 and 4 packages side by side. Add packages using the compare toggle on any package card and open the comparison page to see a full feature breakdown.' },
  { id: 'f6', category: 'Applications', question: 'What happens after I submit an enquiry?', answer: 'Your enquiry is assigned a reference number. Our team reviews it and forwards your details to the relevant provider, who will contact you to finalise the order and schedule installation. You can track the status of your enquiry in your account.' },
  { id: 'f7', category: 'Installation', question: 'How long does installation take?', answer: 'Most fibre installations are completed within 3 to 7 working days after your application is approved, depending on the network operator and whether a site visit is required.' },
  { id: 'f8', category: 'Billing', question: 'What is the total first-month cost?', answer: 'The first-month cost typically includes your first monthly subscription plus any once-off installation or router fees. Promotional pricing may apply for the first few months. Each package detail page shows an estimated first-month total.' },
  { id: 'f9', category: 'Connectivity', question: 'Fibre vs LTE vs 5G — which is right for me?', answer: 'Fibre offers the most reliable, lowest-latency speeds and is ideal where available. 5G fixed wireless provides fast speeds without a cable and is great where fibre is not yet laid. Fixed LTE is a flexible backup or temporary option with moderate speeds.' },
  { id: 'f10', category: 'Account', question: 'Do I need an account to use FibreConnect SA?', answer: 'You can browse, compare and check coverage without an account. Creating an account lets you save packages, track enquiries and manage your addresses and communication preferences.' },
];

export const HELP_ARTICLES = [
  { slug: 'how-coverage-checker-works', title: 'How the coverage checker works', category: 'Coverage', excerpt: 'Understanding address-based availability and what the results mean.' },
  { slug: 'understanding-package-speeds', title: 'Understanding download and upload speeds', category: 'Packages', excerpt: 'What Mbps numbers mean for your real-world usage.' },
  { slug: 'compare-packages', title: 'How to compare packages', category: 'Comparisons', excerpt: 'Adding packages to comparison and reading the differences.' },
  { slug: 'track-your-application', title: 'Tracking your application', category: 'Applications', excerpt: 'Enquiry statuses and what each one means.' },
  { slug: 'manage-saved-packages', title: 'Managing saved packages', category: 'Account', excerpt: 'Saving, organising and comparing your shortlist.' },
  { slug: 'installation-what-to-expect', title: 'Installation: what to expect', category: 'Installation', excerpt: 'Site visits, lead times and preparing your home.' },
  { slug: 'understanding-your-first-invoice', title: 'Understanding your first invoice', category: 'Billing', excerpt: 'Pro-rata, installation fees and promotional pricing.' },
  { slug: 'fibre-vs-lte-vs-5g', title: 'Fibre vs LTE vs 5G explained', category: 'Connectivity terminology', excerpt: 'Choosing the right connectivity type for your needs.' },
];

export const ENQUIRY_STATUSES = [
  'Submitted', 'Under review', 'Provider contacted', 'Awaiting customer', 'Approved', 'Installation scheduled', 'Completed', 'Cancelled'
];

export const POPULAR_LOCATIONS = [
  { province: 'gauteng', city: 'johannesburg', suburb: 'fourways', label: 'Fourways, Johannesburg' },
  { province: 'gauteng', city: 'johannesburg', suburb: 'sandton-cbd', label: 'Sandton, Johannesburg' },
  { province: 'gauteng', city: 'pretoria', suburb: 'hatfield', label: 'Hatfield, Pretoria' },
  { province: 'western-cape', city: 'cape-town', suburb: 'claremont', label: 'Claremont, Cape Town' },
  { province: 'kwaZulu-natal', city: 'durban', suburb: 'umhlanga', label: 'Umhlanga, Durban' },
  { province: 'gauteng', city: 'centurion', suburb: 'centurion-central', label: 'Centurion, Gauteng' },
];

export function getProvider(id) { return PROVIDERS.find(p => p.id === id); }
export function getProviderBySlug(slug) { return PROVIDERS.find(p => p.slug === slug); }
export function getNetwork(id) { return NETWORKS.find(n => n.id === id); }
export function getNetworkBySlug(slug) { return NETWORKS.find(n => n.slug === slug); }
export function getPackage(id) { return PACKAGES.find(p => p.id === id); }
export function getPackageBySlug(slug) { return PACKAGES.find(p => p.slug === slug); }
export function getProvince(slug) { return PROVINCES.find(p => p.slug === slug); }
export function getCity(slug) { return CITIES.find(c => c.slug === slug); }
export function getSuburb(slug) { return SUBURBS.find(s => s.slug === slug); }
export { PROVINCES };
