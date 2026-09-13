# Signup states

## Sub-features

- Idle email form whose submit control is immediately usable; a hidden
  `website` honeypot ships with every post.
- Pending disabled submit state and polite live status.
- Accepted confirmation replacing the form.
- Retryable Accounts error retaining the email and returning focus.

## How to get to it (user POV)

Open the synthetic fixture, enter `footer-fixture@example.test`, and activate Subscribe for submitted request states. The fixture URL selects the external outcome; it does not set component state.

## Driving it with agent-browser

Use the repository verifier. It fills by `input[name="email"]`, activates `button[type="submit"]`, waits on the package-owned `data-state`, and reads a separate fixture boundary snapshot for exact request fields.

## Gotchas

- Pending intentionally leaves the synthetic response unsettled until the context is disposed.
- The honeypot must stay empty in the recorded request; a filled `website` field is an Accounts-discarded bot signal, not a visible control.
- Accepted has no input or submit control, so its layout contract measures the confirmation surface as the mailing box.
- Provider and delivery behavior remain outside this fixture's proof boundary.
