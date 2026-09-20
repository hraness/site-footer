# Localized signup and account controls

The shared footer localizes its email-signup controls, interaction states and account link. Other navigation, product names and social labels keep their existing language. The canonical `FOOTER_LOCALES` catalog contains 61 locale/region/script records and two localized paired copy styles, `direct` and `inviting`. English has six distinct v3 hypotheses (`direct`, `inviting`, `goblin`, `cosmic`, `chaos`, `secret`), each pairing a short CTA with a famous example address such as `sjobs@apple.com` or `billg@microsoft.com`. The extra English styles are never silently substituted into another language. Each pair changes the button; the placeholder is always a recognizable example address and never a question or instruction. The accessible email label and all verification/error states stay stable between styles.

These are translation and transcreation drafts reviewed as code. They are **not native-speaker validated**. Primary sources below support particular terminology or constructions, not conversion performance or every generated sentence. No measured claim that a phrase is preferred by a whole locality is made. Regional siblings may deliberately share wording; dialect is not invented simply to make every key different.

## Meaning and consent

The action is an email-update request for the consumer's explicitly configured audience. Copy does not promise an account, payment, token purchase, upload, early access or membership. “Upload me” and equivalents are excluded because this form does not upload anything. “Get started” and bare “Join” are excluded because they obscure what happens next. The stable presentation uses explicit email-update copy, a visible email label, neutral `you@example.com`, and a plain subscribe action. Historical playful hypotheses remain in the legacy catalog only.

Accepted means the server accepted a request. It does not claim a completed subscription or an account was created. English asks the visitor to check email to confirm; other packs ask them to check email for the next step. Verification and request failures have separate messages. Do not expose server errors or interpolate email addresses into analytics properties.

## Locale selection and locality

`resolveFooterLocale()` defaults deterministically to `en`; it never reads `navigator`, cookies, geolocation or account state. Pass an explicit locale for deterministic server rendering. After hydration, a client may pass the ordered `navigator.languages` list when no explicit choice exists. Keep a user's explicit preference ahead of the browser list. Language is not proof of nationality, residence, ethnicity or any other personal attribute.

The resolver canonicalizes valid BCP 47 tags, ignores Unicode/private-use extensions for matching, checks exact region/script records first, then resolves supported language fallbacks. Invalid tags and unsupported languages are skipped so a later preference can match. Bare `es` uses Spain; `es-419` uses the broad Mexican copy; bare `pt` uses Brazil. Supported regional matches remain exact. Unknown English regions use `en`.

Chinese preserves explicit script before region: `zh-Hans-TW` still gets Simplified Chinese; `zh-Hant-CN` still gets Traditional Chinese. Unscripted `zh-TW` maps to Taiwan, `zh-HK`/`zh-MO` to Hong Kong, and `zh`/`zh-CN`/`zh-SG` to Simplified Chinese. Serbian preserves Latin versus Cyrillic; bare `sr` uses Cyrillic. An explicitly unsupported script is skipped rather than silently changed. Ukrainian never falls back to Russian; Catalan never falls back to Spanish. Region is used only within a requested language, never to infer a language from the visitor's location.

Region-specific choices are deliberately bounded: Argentina uses voseo; Canadian French uses *courriel*; Portugal uses *subscrever* and *ficar a par*; Brazilian Portuguese uses *inscreva-se* and *quero novidades*; Taiwan uses *電子報* and *信箱*; Hong Kong uses *電郵*. Swiss German uses Standard German with no `ß`. Egyptian and Saudi records use understandable standard Arabic alternatives; unverified dialect slang remains outside the shipped catalog. Malay and Indonesian stay separate. Filipino is not used as a fallback for every Philippine language.

## Rendering and accessibility

Set `lang` and `dir` on the signup surface or account link only. Arabic, Hebrew, Persian and Urdu packs are RTL; keep the email input's typed value `dir="ltr"` and isolate any interpolated Latin text. Use logical spacing/insets and direction-aware flow. Do not reverse the entire network footer or social links. Placeholders supplement a programmatic label and never replace it. Preserve `type="email"`, `inputmode="email"`, `autocomplete="email"`, `autocapitalize="none"`, spellcheck off, and a required input. Associate localized error/status text through `aria-describedby`; use an appropriate live region and move focus only for an interaction outcome.

Let button width and footer height grow: German, Finnish, Tamil and Thai are useful overflow cases. Do not truncate the action. Avoid forced uppercase, which changes Turkish and other language casing. Verification, focus, color and reduced-motion behavior must not depend on language. Browser-native email validity messages may use the browser's language; use `invalidEmail` for a localized custom error when the component handles validation itself. Never implement an ASCII-only email restriction as a side effect of localization.

## Evidence and review

Research date: 2026-09-12. The sources were inspected for native-language wording. A source-supported base word does not validate the inviting sentence or regional preference. In particular, a Taiwan source does not validate Cantonese; a general Arabic source does not validate Egyptian or Saudi dialect. No local dialect copy is represented as native reviewed.

| Locale / language | Primary source | What it supports |
| --- | --- | --- |
| en | [Source](https://www.mozilla.org/en-US/newsletter/) | email terminology and signup CTA |
| es-ES | [Source](https://www.mozilla.org/es-ES/newsletter/) | Suscríbete and correo electrónico terminology |
| es-AR | [Source](https://www.thunderbird.net/es-AR/newsletter/) | voseo forms Suscribite, Conocé and Revisá |
| fr-FR | [Source](https://www.mozilla.org/fr/newsletter/) | Je m’inscris first-person CTA |
| fr-CA | [Source](https://sante.quebec/en/news/articles/sante-quebec-lance-une-nouvelle-infolettre-pour-la-population/) | M’abonner, infolettre, courriel |
| pt-BR | [Source](https://www.mozilla.org/pt-BR/newsletter/mozilla/) | Inscreva-se and email terminology |
| pt-PT | [Source](https://www.infopedia.pt/newsletter/subscrever) | Subscreva, subscrição and ficar a par |
| de | [Source](https://www.mozilla.org/de/newsletter/) | Abonnieren and E-Mail-Adresse |
| nl | [Source](https://www.mozilla.org/nl/newsletter/) | Inschrijven and e-mailadres; source uses formal register |
| cs | [Source](https://www.mozilla.org/cs/newsletter/) | newsletter vocabulary; proposed informal copy remains a draft |
| el | [Source](https://www.mozilla.org/el/newsletter/) | Εγγραφή and email terminology; source uses formal register |
| ar | [Source](https://www.mozilla.org/ar/newsletter/security-and-privacy/) | اشترك and البريد الإلكتروني in MSA; does not validate regional dialects |
| hi | [Source](https://www.mozilla.org/hi-IN/newsletter/security-and-privacy/) | अपडेट and ईमेल पता terminology |
| id | [Source](https://www.mozilla.org/id/newsletter/security-and-privacy/) | Berlangganan and alamat email; warm voice is an original draft |
| ms | [Source](https://www.mozilla.org/ms/newsletter/mozilla/) | e-mel and langgan; casual nak wording is an original draft |
| vi | [Source](https://www.mozilla.org/vi/newsletter/firefox/) | Đăng ký and email terminology |
| ja | [Source](https://www.mozilla.org/ja/newsletter/) | ニュースを受け取る and メールアドレス |
| ko | [Source](https://moji.or.kr/) | 구독하기 and conversational Korean newsletter register |
| th | [Source](https://www.mozilla.org/th/contribute/) | รับข่าวสาร and อีเมล vocabulary |
| zh-Hans-CN | [Source](https://www.mozilla.org/zh-CN/newsletter/) | Simplified Chinese newsletter and email terminology |
| zh-Hant-TW | [Source](https://www.mozilla.org/zh-TW/newsletter/) | 訂閱 and 電子報; does not validate Hong Kong Cantonese |

Other language packs are explicitly unreviewed drafts: Italian, Catalan, Swedish, Danish, Norwegian Bokmål, Finnish, Polish, Slovak, Hungarian, Romanian, Bulgarian, Croatian, Slovenian, Serbian in both scripts, Ukrainian, Russian, Turkish, Hebrew, Persian, Bengali, Tamil, Urdu, Filipino, Swahili and Afrikaans. Their inclusion is language coverage, not evidence of native validation. The same caveat applies to region-specific variations not independently sourced.

For editorial review, compare each pair for action clarity, idiomatic register, placeholder fit, regional vocabulary, script and gender assumptions. Review acceptance and verification messages with the same care as the CTA. Any copy change should carry a new experiment/copy version so historical results are not attributed to different wording. Pool sparse localities rather than claiming a separate winner from a handful of visits. Optimization should compare conversion for the same audience and locale context; it must not infer sensitive traits or invent local affiliation.

## Stable modal presentation

`stable-modal-v1` is the current default. It uses one button and a native modal at
every width, with the same details/form as its no-JavaScript fallback. The English
CTA is “Get email updates”; the form action is “Subscribe”. Hraness audience copy
promises new writing and project updates without inventing cadence. Other
supported locales use their explicit email-update title plus separate localized
presubmission instructions. Acceptance copy is never used to describe an idle
form. New descriptions remain reviewed-as-code drafts, not native-speaker proof.

Fixed attribution is opt-in and cannot alter copy, layout, visibility or input.
The stable envelope includes an expiry time and exact locale/viewport scope.
Legacy v1–v3 schemas and wording remain historical; they are not selected by the
new React presentation. Locale and direction still come from the canonical
catalog. The deprecated experiment prop has no presentation effects.

## Account link

The independent account label is localized through the same deterministic locale
resolver. It is never drawn from an experiment copy style: English always says
“My account.” Regional packs share an ordinary account-navigation label where
appropriate. This is a native link, not a subscription confirmation or claim that
a signup created an account. The host supplies confirmed authentication state.
