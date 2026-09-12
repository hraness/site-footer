import { expect, test } from "bun:test";
import { FOOTER_LOCALES, resolveFooterLocale } from "../src/locales.js";

test("ships a broad bounded locale catalog with paired copy styles", () => {
  expect(Object.keys(FOOTER_LOCALES).length).toBeGreaterThanOrEqual(60);
  for (const locale of Object.values(FOOTER_LOCALES)) {
    expect(locale.styles.direct.button).not.toBe(locale.styles.inviting.button);
    expect(locale.styles.direct.placeholder).not.toBe(locale.styles.inviting.placeholder);
    expect(locale.styles.direct.formLabel.length).toBeGreaterThan(0);
    expect(locale.styles.inviting.openLabel.length).toBeGreaterThan(0);
    expect(locale.styles.direct.invalidEmail.length).toBeGreaterThan(0);
  }
});

test("preserves regional and script choices and falls back by language", () => {
  expect(resolveFooterLocale("es-AR").locale).toBe("es-AR");
  expect(resolveFooterLocale("pt-PT").locale).toBe("pt-PT");
  expect(resolveFooterLocale("zh-Hant-CN").locale).toBe("zh-Hant-TW");
  expect(resolveFooterLocale("zh-Hans-TW").locale).toBe("zh-Hans-CN");
  expect(resolveFooterLocale("sr-Latn").locale).toBe("sr-Latn-RS");
  expect(resolveFooterLocale("ar").dir).toBe("rtl");
  expect(resolveFooterLocale(["xx", "fr-CA"]).locale).toBe("fr-CA");
  expect(resolveFooterLocale("invalid").locale).toBe("en");
});
