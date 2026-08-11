import { describe, it, expect } from "vitest";
import { normalizeQuery, slugifyTaxonomy } from "@/lib/discovery";

describe("Discovery & Search Helpers", () => {
  it("should normalize search query strings", () => {
    expect(normalizeQuery("  Patience  &   Justice  ")).toBe("patience justice");
    expect(normalizeQuery("IMAM ALI SAYS")).toBe("imam ali says");
  });

  it("should slugify taxonomy terms consistently", () => {
    expect(slugifyTaxonomy("Self Discipline")).toBe("self-discipline");
    expect(slugifyTaxonomy("Time Management")).toBe("time-management");
    expect(slugifyTaxonomy("Spiritual Growth!")).toBe("spiritual-growth");
  });
});
