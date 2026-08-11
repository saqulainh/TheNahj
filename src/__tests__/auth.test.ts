import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  isAdminAuthConfigured,
  verifyAdminPassword,
  createAdminToken,
  verifyAdminToken,
} from "@/lib/auth";

describe("Admin Authentication Helper", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return false when ADMIN_PASSWORD is missing", () => {
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SECRET;
    expect(isAdminAuthConfigured()).toBe(false);
  });

  it("should return true when ADMIN_PASSWORD is set", () => {
    process.env.ADMIN_PASSWORD = "test-secret-password";
    expect(isAdminAuthConfigured()).toBe(true);
  });

  it("should verify admin password correctly", () => {
    process.env.ADMIN_PASSWORD = "my-secure-password";
    expect(verifyAdminPassword("my-secure-password")).toBe(true);
    expect(verifyAdminPassword("wrong-password")).toBe(false);
  });

  it("should generate and verify valid admin token", async () => {
    process.env.ADMIN_PASSWORD = "test-password";
    process.env.ADMIN_SECRET = "super-secret-key-12345";

    const token = await createAdminToken();
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const isValid = await verifyAdminToken(token);
    expect(isValid).toBe(true);
  });

  it("should reject tampered or invalid tokens", async () => {
    process.env.ADMIN_PASSWORD = "test-password";
    process.env.ADMIN_SECRET = "super-secret-key-12345";

    expect(await verifyAdminToken(null)).toBe(false);
    expect(await verifyAdminToken("")).toBe(false);
    expect(await verifyAdminToken("invalid.token.structure")).toBe(false);
  });
});
