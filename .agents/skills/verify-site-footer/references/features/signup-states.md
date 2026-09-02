# Signup states

## Sub-features

- Idle email form with a ready interaction-only Turnstile adapter.
- Pending disabled submit state and polite live status.
- Accepted confirmation replacing the form.
- Retryable Accounts error retaining the email and returning focus.
- Turnstile verification error with no Accounts request and focus recovery.

## How to get to it (user POV)

Open the synthetic fixture, enter `footer-fixture@example.test`, and activate Subscribe. The fixture URL selects the external outcome; it does not set component state.

## Driving it with agent-browser

Use the repository verifier. It fills by `input[name="email"]`, activates `button[type="submit"]`, waits on the package-owned `data-state`, and reads a separate fixture boundary snapshot for Turnstile options and request fields.

## Gotchas

- Pending intentionally leaves the synthetic response unsettled until the context is disposed.
- Verification failure is raised by the synthetic Turnstile callback before any request.
- Accepted has no input or submit control, so its layout contract measures the confirmation surface as the mailing box.
- Provider and delivery behavior remain outside this fixture's proof boundary.
