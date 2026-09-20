import { expect, test } from "bun:test";
import { ENGLISH_FOOTER_COPY, FOOTER_LOCALES, resolveFooterLocale } from "../src/locales.js";

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


test("English hypotheses pair distinct short CTAs with explicit email placeholders and stable labels", () => {
  const copies = Object.values(ENGLISH_FOOTER_COPY);
  expect(new Set(copies.map(copy => copy.button)).size).toBe(6);
  expect(new Set(copies.map(copy => copy.placeholder)).size).toBe(6);
  expect(ENGLISH_FOOTER_COPY.direct.placeholder).toBe("sjobs@apple.com");
  for (const copy of copies) {
    expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(copy.placeholder)).toBeTrue();
  }
  for (const locale of Object.values(FOOTER_LOCALES).filter(locale => locale.locale.startsWith("en"))) {
    for (const key of Object.keys(ENGLISH_FOOTER_COPY) as Array<keyof typeof ENGLISH_FOOTER_COPY>) {
      expect(locale.styles[key]?.emailLabel).toBe("Email address");
      expect(locale.styles[key]?.button.length).toBeLessThanOrEqual(16);
      expect(locale.styles[key]?.placeholder.length).toBeLessThanOrEqual(30);
    }
  }
  expect(FOOTER_LOCALES["es-AR"]?.styles.goblin).toBeUndefined();
});

test("stable signup copy separates presubmission benefit from accepted confirmation", async () => {
  const { FOOTER_LOCALES, stableFooterMessages } = await import("../src/locales.js");
  for (const locale of Object.values(FOOTER_LOCALES)) {
    const copy = stableFooterMessages(locale, "hraness");
    expect(copy.description).not.toBe(copy.accepted);
    expect(copy.description.length).toBeGreaterThan(20);
    expect(copy.placeholder).toBe("you@example.com");
    expect(copy.button).not.toMatch(/goblin|Beam me|Push the button|Let me in/u);
  }
  const copy = stableFooterMessages(FOOTER_LOCALES.en!, "hraness");
  expect(copy.description).toBe("Get new writing and updates on Hraness projects. Confirm your email to subscribe.");
  expect(copy.submit).toBe("Subscribe");
});
