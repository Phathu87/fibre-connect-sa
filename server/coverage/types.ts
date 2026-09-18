export type CoverageStatus = "AVAILABLE" | "PARTIAL" | "WIRELESS_ONLY" | "UNAVAILABLE" | "UNKNOWN" | "PROVIDER_UNAVAILABLE";

export type CoverageInput = { street?: string | undefined; suburb?: string | undefined; city?: string | undefined; province?: string | undefined; postalCode?: string | undefined; latitude?: number | undefined; longitude?: number | undefined };
export type SafeLocation = { suburb?: string | undefined; city?: string | undefined; province?: string | undefined; postalCode?: string | undefined; latitude?: number | undefined; longitude?: number | undefined; recognized: boolean };
export type CoverageResult = {
  status: CoverageStatus;
  source: "DEMO" | "LIVE";
  location: Omit<SafeLocation, "recognized">;
  networks: unknown[];
  packages: unknown[];
  message: string;
  disclaimer: string;
};
