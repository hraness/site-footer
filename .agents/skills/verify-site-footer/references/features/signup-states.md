# Signup states

## Sub-features

- Idle email form whose submit control stays disabled until the interaction-only
  Turnstile adapter supplies a valid proof.
- Pending disabled submit state and polite live status.
- Accepted confirmation replacing the form.
- Retryable Accounts error retaining the email and returning focus.
- Turnstile verification error with no Accounts request, focus recovery, and a
  package-owned retry control.

## How to get to it (user POV)

Open the synthetic fixture, enter `footer-fixture@example.test`, and activate Subscribe. The fixture URL selects the external outcome; it does not set component state.

## Driving it with agent-browser

Use the repository verifier. It fills by `input[name="email"]`, activates `button[type="submit"]`, waits on the package-owned `data-state`, and reads a separate fixture boundary snapshot for Turnstile options and request fields.

## Gotchas

- Pending intentionally leaves the synthetic response unsettled until the context is disposed.
- A still-pending proof is not a verification failure. Verification failure is
  raised only by the synthetic Turnstile error callback before any request.
- Accepted has no input or submit control, so its layout contract measures the confirmation surface as the mailing box.
- Provider and delivery behavior remain outside this fixture's proof boundary.
