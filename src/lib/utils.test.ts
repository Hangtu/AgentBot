import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge tailwind classes correctly", () => {
    expect(cn("px-2 py-1", "bg-red-500")).toBe("px-2 py-1 bg-red-500");
  });

  it("should override conflicting tailwind classes", () => {
    // tailwind-merge resolves conflicts, so bg-blue-500 overrides bg-red-500
    expect(cn("bg-red-500 px-2", "bg-blue-500")).toBe("px-2 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const isDisabled = false;

    expect(
      cn("base-class", {
        "active-class": isActive,
        "disabled-class": isDisabled,
      })
    ).toBe("base-class active-class");
  });
});
