const KEY = 'fc_coverage_result';
export const coverageSessionService = {
  set(input, result) { sessionStorage.setItem(KEY, JSON.stringify({ input, result })); },
  get() { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } },
};
