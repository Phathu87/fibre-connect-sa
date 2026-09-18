import { describe, expect, it, vi } from "vitest";
import { DemoGeocodingProvider } from "../server/coverage/geocoding.js";
import { DemoCoverageProvider } from "../server/coverage/provider.js";
import { CoverageService } from "../server/services/coverage.js";

const geocoder = new DemoGeocodingProvider();
const packageItem = (connectivityType: string) => ({ connectivityType });

describe("coverage engine", () => {
  it.each([
    ["Fourways", [packageItem("Fibre")], "AVAILABLE"],
    ["Polokwane Central", [packageItem("5G")], "WIRELESS_ONLY"],
    ["Keidebees", [], "UNAVAILABLE"],
  ])("returns a deterministic result for %s", async (suburb, packages, status) => {
    const provider = new DemoCoverageProvider(async () => ({ networks: packages.length ? [{ id: "network" }] : [], packages }));
    const result = await provider.check(await geocoder.geocode({ suburb }));
    expect(result.status).toBe(status);
    expect(result.source).toBe("DEMO");
  });

  it("returns UNKNOWN for a location outside the demo geocoder", async () => {
    const provider = new DemoCoverageProvider(async () => ({ networks: [], packages: [] }));
    expect((await provider.check(await geocoder.geocode({ suburb: "Nowhere" }))).status).toBe("UNKNOWN");
  });

  it("converts provider failure and timeout into a safe retryable state", async () => {
    const record = vi.fn(async () => undefined);
    const failing = new CoverageService(geocoder, { check: async () => { throw new Error("secret provider failure"); } }, record, 10);
    const slow = new CoverageService(geocoder, { check: () => new Promise(() => undefined) }, record, 5);
    expect((await failing.check({ suburb: "Fourways" })).status).toBe("PROVIDER_UNAVAILABLE");
    expect((await slow.check({ suburb: "Fourways" })).status).toBe("PROVIDER_UNAVAILABLE");
    expect(record).toHaveBeenCalledTimes(2);
  });

  it("never exposes the submitted street through the provider result", async () => {
    const provider = new DemoCoverageProvider(async () => ({ networks: [], packages: [] }));
    const result = await new CoverageService(geocoder, provider, async () => undefined).check({ street: "42 Private Road", suburb: "Keidebees" });
    expect(JSON.stringify(result)).not.toContain("42 Private Road");
  });
});
