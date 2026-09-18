import type { CoverageResult, SafeLocation } from "./types.js";

export interface CoverageProvider { check(location: SafeLocation): Promise<CoverageResult> }
type Lookup = (location: SafeLocation) => Promise<{ networks: unknown[]; packages: Array<{ connectivityType?: string }> }>;

export class DemoCoverageProvider implements CoverageProvider {
  constructor(private readonly lookup: Lookup) {}
  async check(location: SafeLocation): Promise<CoverageResult> {
    const { recognized: _recognized, ...safe } = location;
    const base = { source: "DEMO" as const, location: safe, disclaimer: "Demo coverage estimate. Provider verification is required before ordering." };
    if (!location.recognized) return { ...base, status: "UNKNOWN", networks: [], packages: [], message: "We could not identify this location in the demo coverage dataset." };
    const { networks, packages } = await this.lookup(location);
    if (!packages.length) return { ...base, status: "UNAVAILABLE", networks: [], packages: [], message: "No demo services are recorded for this area." };
    const fibre = packages.filter((item) => item.connectivityType === "Fibre");
    if (!fibre.length) return { ...base, status: "WIRELESS_ONLY", networks, packages, message: "Demo wireless coverage is recorded for this area." };
    const status = fibre.length === packages.length ? "AVAILABLE" : "PARTIAL";
    return { ...base, status, networks, packages, message: `${networks.length} demo network operator${networks.length === 1 ? " is" : "s are"} recorded for this area.` };
  }
}
