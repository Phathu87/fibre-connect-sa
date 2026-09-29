import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Outlet, useLocation, useSearchParams } from "react-router-dom";

const auth = vi.hoisted(() => ({
  current: {
    user: null,
    isAuthenticated: false,
    isLoadingAuth: false,
    authChecked: true,
    authError: null,
    checkUserAuth: vi.fn(),
  },
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Navigate: ({ to, replace }) => (
      <div data-navigate-to={to} data-replace={String(Boolean(replace))} />
    ),
  };
});

vi.mock("@/lib/AuthContext", () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => auth.current,
}));
vi.mock("@/lib/utils", () => ({
  cn: (...values) => values.filter(Boolean).join(" "),
}));
vi.mock("@/components/ui/toaster", () => ({ default: () => null, Toaster: () => null }));

vi.mock("@/components/layout/Layout", () => ({ default: () => <Outlet /> }));
vi.mock("@/components/account/AccountLayout", () => ({ default: () => <Outlet /> }));
vi.mock("@/components/admin/AdminLayout", () => ({ default: () => <Outlet /> }));

vi.mock("@/pages/Home", () => ({ default: () => <div data-route="home" /> }));
vi.mock("@/pages/Packages", () => ({ default: () => <div data-route="packages" /> }));
vi.mock("@/pages/PackageDetail", () => ({ default: () => <div data-route="package-detail" /> }));
vi.mock("@/pages/Coverage", () => ({ default: () => <div data-route="coverage" /> }));
vi.mock("@/pages/Login", () => ({ default: () => <div data-route="login" /> }));
vi.mock("@/pages/PageNotFound", () => ({ default: () => <div data-route="not-found" /> }));
vi.mock("@/pages/account/Account", () => ({ default: () => <div data-route="account" /> }));
vi.mock("@/pages/admin/AdminDashboard", () => ({ default: () => <div data-route="admin" /> }));

import { AuthenticatedApp } from "../src/App.jsx";
import { safeReturnTo } from "../src/lib/authReturnTo.js";

const authenticated = (role = "USER") => ({
  user: { id: "user-1", role },
  isAuthenticated: true,
  isLoadingAuth: false,
  authChecked: true,
  authError: null,
  checkUserAuth: vi.fn(),
});

function renderRoute(path) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AuthenticatedApp />
    </MemoryRouter>,
  );
}

function QueryProbe() {
  const location = useLocation();
  const [params] = useSearchParams();
  return <div data-path={location.pathname} data-package={params.get("package") || ""} />;
}

function setLocation(search, origin = "https://fibreconnect.example") {
  vi.stubGlobal("window", { location: { search, origin } });
}

afterEach(() => {
  auth.current = {
    user: null,
    isAuthenticated: false,
    isLoadingAuth: false,
    authChecked: true,
    authError: null,
    checkUserAuth: vi.fn(),
  };
  vi.unstubAllGlobals();
});

describe("declarative application routes", () => {
  it.each([
    ["/", "home"],
    ["/packages", "packages"],
    ["/packages/fibre-100", "package-detail"],
    ["/coverage", "coverage"],
    ["/login", "login"],
    ["/missing-route", "not-found"],
  ])("matches %s to the %s route", (path, route) => {
    expect(renderRoute(path)).toContain(`data-route="${route}"`);
  });

  it("preserves query parameters on internal routes", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/enquire?package=fibre-100"]}>
        <QueryProbe />
      </MemoryRouter>,
    );
    expect(html).toContain('data-path="/enquire"');
    expect(html).toContain('data-package="fibre-100"');
  });
});

describe("protected route guards", () => {
  it("does not render account content for an anonymous user", () => {
    const html = renderRoute("/account");
    expect(html).not.toContain('data-route="account"');
    expect(html).toContain('data-navigate-to="/login"');
    expect(html).toContain('data-replace="true"');
  });

  it("renders account content for an authenticated user", () => {
    auth.current = authenticated();
    expect(renderRoute("/account")).toContain('data-route="account"');
  });

  it("does not render admin content for a normal user", () => {
    auth.current = authenticated("USER");
    const html = renderRoute("/admin");
    expect(html).not.toContain('data-route="admin"');
    expect(html).toContain('data-navigate-to="/"');
    expect(html).toContain('data-replace="true"');
  });

  it("renders admin content for an administrator", () => {
    auth.current = authenticated("ADMIN");
    expect(renderRoute("/admin")).toContain('data-route="admin"');
  });
});

describe("safeReturnTo", () => {
  it("accepts a safe same-origin path and preserves ordinary query data", () => {
    setLocation("?returnTo=%2Faccount%2Fenquiries%3Fpage%3D2");
    expect(safeReturnTo()).toBe("/account/enquiries?page=2");
  });

  it("rejects an external destination", () => {
    setLocation("?returnTo=https%3A%2F%2Fevil.example%2Fsteal");
    expect(safeReturnTo()).toBe("/");
  });

  it.each([
    "%2F%2Fevil.example%2Fsteal",
    "%2F%5Cevil.example%2Fsteal",
    "%5C%5Cevil.example%5Csteal",
  ])("rejects protocol-relative or backslash escape %s", (value) => {
    setLocation(`?returnTo=${value}`);
    expect(safeReturnTo()).toBe("/");
  });

  it("removes authentication-shaped parameters from a safe return path", () => {
    setLocation("?returnTo=%2Faccount%3Faccess_token%3Dsecret%26page%3D2");
    expect(safeReturnTo()).toBe("/account?page=2");
  });
});
