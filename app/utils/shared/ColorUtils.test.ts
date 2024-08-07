import { describe, it, expect } from "vitest";
import { getColors, getTailwindColor, colorMap, colorToBg, getBackgroundColor, getBadgeColor, badgeBgColorStrong, badgeBgColor } from "./ColorUtils";
import { Colors } from "~/application/enums/shared/Colors";

describe("getColors", () => {
  it("should return all main colors when main is true", () => {
    const result = getColors(true);
    expect(result).toEqual([
      Colors.GRAY,
      Colors.RED,
      Colors.ORANGE,
      Colors.YELLOW,
      Colors.GREEN,
      Colors.TEAL,
      Colors.CYAN,
      Colors.SKY,
      Colors.BLUE,
      Colors.INDIGO,
      Colors.VIOLET,
      Colors.PURPLE,
      Colors.FUCHSIA,
      Colors.PINK,
      Colors.ROSE,
    ]);
  });

  it("should return all colors when main is not true", () => {
    const result = getColors();
    expect(result).toEqual([
      Colors.SLATE,
      Colors.GRAY,
      Colors.NEUTRAL,
      Colors.STONE,
      Colors.RED,
      Colors.ORANGE,
      Colors.AMBER,
      Colors.YELLOW,
      Colors.LIME,
      Colors.GREEN,
      Colors.EMERALD,
      Colors.TEAL,
      Colors.CYAN,
      Colors.SKY,
      Colors.BLUE,
      Colors.INDIGO,
      Colors.VIOLET,
      Colors.PURPLE,
      Colors.FUCHSIA,
      Colors.PINK,
      Colors.ROSE,
    ]);
  });
});

describe("getTailwindColor", () => {
  it("getTailwindColor returns correct color", () => {
    for (const color in colorMap) {
      const expected = colorMap[color as unknown as Colors];
      const result = getTailwindColor(color as unknown as Colors);
      expect(result).toEqual(expected);
    }
  });

  it("getTailwindColor returns empty string for invalid color", () => {
    const invalidColor: unknown = "invalid-color";
    const result = getTailwindColor(invalidColor as Colors);
    expect(result).toEqual("");
  });
});

describe("getBackgroundColor", () => {
  it("getBackgroundColor returns correct color", () => {
    for (const color in colorToBg) {
      const expected = colorToBg[color as unknown as Colors];
      const result = getBackgroundColor(color as unknown as Colors);
      expect(result).toEqual(expected);
    }
  });

  it("getBackgroundColor returns empty string for invalid color", () => {
    const invalidColor: unknown = "invalid-color";
    const result = getBackgroundColor(invalidColor as Colors);
    expect(result).toEqual("");
  });
});

describe("getBadgeColor", () => {
  it("getBadgeColor returns correct color when strong is false", () => {
    for (const color in badgeBgColor) {
      const expected = badgeBgColor[color as unknown as Colors];
      const result = getBadgeColor(color as unknown as Colors, false);
      expect(result).toEqual(expected);
    }
  });

  it("getBadgeColor returns correct color when strong is true", () => {
    for (const color in badgeBgColorStrong) {
      const expected = badgeBgColor[color as unknown as Colors] + " " + badgeBgColorStrong[color as unknown as Colors];
      const result = getBadgeColor(color as unknown as Colors, true);
      expect(result).toEqual(expected);
    }
  });

  it("getBadgeColor returns empty string for invalid color", () => {
    const invalidColor: unknown = "invalid-color";
    const result = getBadgeColor(invalidColor as Colors);
    expect(result).toEqual("");
  });
});
