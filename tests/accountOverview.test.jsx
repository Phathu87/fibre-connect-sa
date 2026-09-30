import { beforeEach, describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  listEnquiries: vi.fn(),
  getPreferences: vi.fn(),
}));

vi.mock("@/hooks/useCollections", () => ({
  useSaved: () => ({ count: 0 }),
  useCompare: () => ({ count: 0 }),
}));

vi.mock("@/services/userDataService", () => ({
  coverageHistoryService: { list: () => [] },
  enquiryService: { list: services.listEnquiries },
  notificationService: { getPrefs: services.getPreferences },
}));

import { countEnabledNotificationChannels, loadAccountOverview } from "../src/pages/account/Account.jsx";

beforeEach(() => {
  services.listEnquiries.mockReset();
  services.getPreferences.mockReset();
});

describe("account overview notification contract", () => {
  it("loads persisted notification preferences through the implemented service method", async () => {
    const enquiries = [{ id: "enquiry-1" }];
    const preferences = { email: true, sms: true, push: false, marketing: false };
    services.listEnquiries.mockResolvedValue(enquiries);
    services.getPreferences.mockResolvedValue(preferences);

    await expect(loadAccountOverview()).resolves.toEqual({
      enquiries,
      notificationPreferences: preferences,
    });
    expect(services.getPreferences).toHaveBeenCalledOnce();
  });

  it("uses non-crashing defaults when overview requests fail", async () => {
    services.listEnquiries.mockRejectedValue(new Error("enquiry unavailable"));
    services.getPreferences.mockRejectedValue(new Error("preferences unavailable"));

    await expect(loadAccountOverview()).resolves.toEqual({
      enquiries: [],
      notificationPreferences: { email: true, sms: false, push: false, marketing: false },
    });
  });

  it("counts enabled persisted communication channels", () => {
    expect(countEnabledNotificationChannels({ email: true, sms: false, push: true, marketing: false })).toBe(2);
  });
});
