import { cleanFullResponse } from "@/ipc/utils/cleanFullResponse";
import { describe, it, expect } from "vitest";

describe("cleanFullResponse", () => {
  it("should replace < characters in mitsu-write attributes", () => {
    const input = `<mitsu-write path="src/file.tsx" description="Testing <a> tags.">content</mitsu-write>`;
    const expected = `<mitsu-write path="src/file.tsx" description="Testing ＜a＞ tags.">content</mitsu-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should replace < characters in multiple attributes", () => {
    const input = `<mitsu-write path="src/<component>.tsx" description="Testing <div> tags.">content</mitsu-write>`;
    const expected = `<mitsu-write path="src/＜component＞.tsx" description="Testing ＜div＞ tags.">content</mitsu-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle multiple nested HTML tags in a single attribute", () => {
    const input = `<mitsu-write path="src/file.tsx" description="Testing <div> and <span> and <a> tags.">content</mitsu-write>`;
    const expected = `<mitsu-write path="src/file.tsx" description="Testing ＜div＞ and ＜span＞ and ＜a＞ tags.">content</mitsu-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle complex example with mixed content", () => {
    const input = `
      BEFORE TAG
  <mitsu-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use <a> tags.">
import React from 'react';
</mitsu-write>
AFTER TAG
    `;

    const expected = `
      BEFORE TAG
  <mitsu-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use ＜a＞ tags.">
import React from 'react';
</mitsu-write>
AFTER TAG
    `;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle other dyad tag types", () => {
    const input = `<mitsu-rename from="src/<old>.tsx" to="src/<new>.tsx"></mitsu-rename>`;
    const expected = `<mitsu-rename from="src/＜old＞.tsx" to="src/＜new＞.tsx"></mitsu-rename>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle mitsu-delete tags", () => {
    const input = `<mitsu-delete path="src/<component>.tsx"></mitsu-delete>`;
    const expected = `<mitsu-delete path="src/＜component＞.tsx"></mitsu-delete>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should not affect content outside dyad tags", () => {
    const input = `Some text with <regular> HTML tags. <mitsu-write path="test.tsx" description="With <nested> tags.">content</mitsu-write> More <html> here.`;
    const expected = `Some text with <regular> HTML tags. <mitsu-write path="test.tsx" description="With ＜nested＞ tags.">content</mitsu-write> More <html> here.`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle empty attributes", () => {
    const input = `<mitsu-write path="src/file.tsx">content</mitsu-write>`;
    const expected = `<mitsu-write path="src/file.tsx">content</mitsu-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle attributes without < characters", () => {
    const input = `<mitsu-write path="src/file.tsx" description="Normal description">content</mitsu-write>`;
    const expected = `<mitsu-write path="src/file.tsx" description="Normal description">content</mitsu-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });
});
