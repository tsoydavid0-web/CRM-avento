import { describe, it, expect } from "vitest";
import { leadSchema } from "./validation";

const valid = {
  name: "Ana Silva",
  phone: "+351 912 345 678",
  consent: true,
};

describe("leadSchema", () => {
  it("accepts a minimal valid lead and defaults mortgage to false", () => {
    const r = leadSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ana Silva");
      expect(r.data.mortgage).toBe(false);
      expect(r.data.city).toBeUndefined();
    }
  });

  it("trims name and phone", () => {
    const r = leadSchema.safeParse({
      name: "  Ana  ",
      phone: "  912345678 ",
      consent: true,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Ana");
      expect(r.data.phone).toBe("912345678");
    }
  });

  it("rejects a missing / empty name", () => {
    expect(leadSchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
    expect(leadSchema.safeParse({ phone: valid.phone }).success).toBe(false);
  });

  it("enforces max lengths", () => {
    expect(
      leadSchema.safeParse({ ...valid, name: "a".repeat(101) }).success,
    ).toBe(false);
    expect(
      leadSchema.safeParse({ ...valid, comment: "a".repeat(2001) }).success,
    ).toBe(false);
  });

  it("rejects CRLF in name/phone (email header injection)", () => {
    expect(
      leadSchema.safeParse({ ...valid, name: "Ana\r\nBcc: x@y.z" }).success,
    ).toBe(false);
    expect(
      leadSchema.safeParse({ ...valid, phone: "912\n345" }).success,
    ).toBe(false);
  });

  describe("phone", () => {
    it("accepts +, digits and human separators", () => {
      for (const phone of [
        "+351912345678",
        "912 345 678",
        "(351) 912-345-678",
        "+351 912.345.678",
      ]) {
        expect(leadSchema.safeParse({ ...valid, phone }).success).toBe(true);
      }
    });

    it("rejects letters and too few/many digits", () => {
      for (const phone of ["abcdef", "12345", "+" + "9".repeat(16)]) {
        expect(leadSchema.safeParse({ ...valid, phone }).success).toBe(false);
      }
    });
  });

  describe("optional text fields", () => {
    it("treats empty/whitespace as undefined", () => {
      const r = leadSchema.safeParse({ ...valid, city: "", comment: "   " });
      expect(r.success).toBe(true);
      if (r.success) {
        expect(r.data.city).toBeUndefined();
        expect(r.data.comment).toBeUndefined();
      }
    });

    it("keeps real values", () => {
      const r = leadSchema.safeParse({ ...valid, city: "Porto" });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.city).toBe("Porto");
    });
  });

  describe("mortgage", () => {
    it("does not coerce strings to true", () => {
      // A string is not a boolean -> invalid (no truthiness coercion).
      expect(
        leadSchema.safeParse({ ...valid, mortgage: "false" }).success,
      ).toBe(false);
    });

    it("accepts explicit booleans", () => {
      const r = leadSchema.safeParse({ ...valid, mortgage: true });
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.mortgage).toBe(true);
    });
  });

  describe("source (lead attribution)", () => {
    it("is optional — absence is valid and leaves source undefined", () => {
      const r = leadSchema.safeParse(valid);
      expect(r.success).toBe(true);
      if (r.success) expect(r.data.source).toBeUndefined();
    });

    it("treats empty / whitespace-only / null as not provided", () => {
      for (const source of ["", "   ", null]) {
        const r = leadSchema.safeParse({ ...valid, source });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.source).toBeUndefined();
      }
    });

    it("accepts allowlisted values (case/space insensitive)", () => {
      for (const [input, expected] of [
        ["home", "home"],
        ["buy", "buy"],
        ["sell", "sell"],
        ["services", "services"],
        ["contacts", "contacts"],
        ["taxes", "taxes"],
        ["investors", "investors"],
        ["relocation", "relocation"],
        [" Buy ", "buy"],
        ["HOME", "home"],
      ] as const) {
        const r = leadSchema.safeParse({ ...valid, source: input });
        expect(r.success).toBe(true);
        if (r.success) expect(r.data.source).toBe(expected);
      }
    });

    it("rejects values outside the allowlist (no arbitrary strings stored)", () => {
      for (const source of ["admin", "buyer", "home ; DROP TABLE leads", "<script>"]) {
        expect(leadSchema.safeParse({ ...valid, source }).success).toBe(false);
      }
    });

    it("rejects oversized source", () => {
      expect(
        leadSchema.safeParse({ ...valid, source: "a".repeat(500) }).success,
      ).toBe(false);
    });

    it("rejects CR/LF-laden source (email header / log injection)", () => {
      // Interior CR/LF cannot normalize to an allowlisted value -> rejected.
      for (const source of ["buy\r\nBcc: x@y.z", "ho\nme", "buy\r\n injected"]) {
        expect(leadSchema.safeParse({ ...valid, source }).success).toBe(false);
      }
    });

    it("rejects non-string source (no type coercion into the enum)", () => {
      for (const source of [123, true, { home: 1 }, ["buy"]]) {
        expect(leadSchema.safeParse({ ...valid, source }).success).toBe(false);
      }
    });
  });

  describe("consent (GDPR)", () => {
    it("requires an explicit true — absent, false, or a string are rejected", () => {
      const noConsent = { name: valid.name, phone: valid.phone };
      expect(leadSchema.safeParse(noConsent).success).toBe(false);
      expect(leadSchema.safeParse({ ...valid, consent: false }).success).toBe(
        false,
      );
      // no truthy / string coercion
      expect(leadSchema.safeParse({ ...valid, consent: "on" }).success).toBe(
        false,
      );
      expect(leadSchema.safeParse({ ...valid, consent: 1 }).success).toBe(false);
    });

    it("accepts an explicit true", () => {
      expect(leadSchema.safeParse(valid).success).toBe(true);
    });
  });

  it("passes the honeypot field through without failing parse", () => {
    // Honeypot enforcement is separate; schema must still accept the field.
    const r = leadSchema.safeParse({ ...valid, company: "" });
    expect(r.success).toBe(true);
  });
});
