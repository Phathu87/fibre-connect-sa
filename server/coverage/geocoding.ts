import type { CoverageInput, SafeLocation } from "./types.js";

export interface GeocodingProvider { geocode(input: CoverageInput): Promise<SafeLocation> }

const knownLocations = [
  { suburb: "Fourways", city: "Johannesburg", province: "Gauteng", postalCode: "2055", latitude: -26.025, longitude: 28.012 },
  { suburb: "Claremont", city: "Cape Town", province: "Western Cape", postalCode: "7708", latitude: -33.984, longitude: 18.462 },
  { suburb: "Polokwane Central", city: "Polokwane", province: "Limpopo", postalCode: "0699", latitude: -23.904, longitude: 29.469 },
  { suburb: "Keidebees", city: "Upington", province: "Northern Cape", postalCode: "8801", latitude: -28.448, longitude: 21.256 },
] as const;
const normalize = (value?: string) => value?.trim().toLowerCase().replace(/-/g, " ");

export class DemoGeocodingProvider implements GeocodingProvider {
  async geocode(input: CoverageInput): Promise<SafeLocation> {
    let match = knownLocations.find((location) => (input.suburb && normalize(location.suburb) === normalize(input.suburb)) || (input.city && normalize(location.city) === normalize(input.city)));
    if (!match && input.latitude !== undefined && input.longitude !== undefined) match = knownLocations.find((location) => Math.abs(location.latitude - input.latitude!) < 0.15 && Math.abs(location.longitude - input.longitude!) < 0.15);
    if (!match) return { suburb: input.suburb, city: input.city, province: input.province, postalCode: input.postalCode, latitude: input.latitude, longitude: input.longitude, recognized: false };
    return { ...match, recognized: true };
  }
}
