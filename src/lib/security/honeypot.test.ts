import { describe, it, expect } from "vitest";
import { isHoneypotTriggered } from "./honeypot";

describe("isHoneypotTriggered", () => {
  it("treats empty / missing values as human", () => {
    expect(isHoneypotTriggered("")).toBe(false);
    expect(isHoneypotTriggered("   ")).toBe(false);
    expect(isHoneypotTriggered(undefined)).toBe(false);
    expect(isHoneypotTriggered(null)).toBe(false);
  });

  it("flags any non-empty string as a bot", () => {
    expect(isHoneypotTriggered("Acme Inc")).toBe(true);
    expect(isHoneypotTriggered("  x  ")).toBe(true);
  });

  it("flags non-string values (tampering) as a bot", () => {
    expect(isHoneypotTriggered(1)).toBe(true);
    expect(isHoneypotTriggered(true)).toBe(true);
    expect(isHoneypotTriggered({})).toBe(true);
    expect(isHoneypotTriggered([])).toBe(true);
  });
});
