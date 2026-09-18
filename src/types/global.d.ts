export {};

declare global {
  interface Window {
    fcAnalyticsLog?: (event: {
      event: string;
      properties: Record<string, unknown>;
    }) => void;
  }
}
