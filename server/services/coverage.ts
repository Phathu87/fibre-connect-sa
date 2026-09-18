import type { GeocodingProvider } from "../coverage/geocoding.js";
import type { CoverageProvider } from "../coverage/provider.js";
import type { CoverageInput, CoverageResult, SafeLocation } from "../coverage/types.js";

type Recorder = (location: SafeLocation, result: CoverageResult) => Promise<void>;

export class CoverageService {
  constructor(private readonly geocoder: GeocodingProvider, private readonly provider: CoverageProvider, private readonly record: Recorder, private readonly timeoutMs = 10_000) {}
  async check(input: CoverageInput): Promise<CoverageResult> {
    const location = await this.withTimeout(this.geocoder.geocode(input));
    let result: CoverageResult;
    try {
      result = await this.withTimeout(this.provider.check(location));
    } catch {
      const { recognized: _recognized, ...safe } = location;
      result = { status: "PROVIDER_UNAVAILABLE", source: "DEMO", location: safe, networks: [], packages: [], message: "Coverage checking is temporarily unavailable. Please try again.", disclaimer: "No availability decision was made." };
    }
    await this.record(location, result).catch(() => undefined);
    return result;
  }
  private async withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: NodeJS.Timeout | undefined;
    try { return await Promise.race([promise, new Promise<T>((_, reject) => { timer = setTimeout(() => reject(new Error("provider timeout")), this.timeoutMs); })]); }
    finally { if (timer) clearTimeout(timer); }
  }
}
