# Signup states

## Sub-features

- Stable email-update trigger opening the same native modal form; a hidden
  `website` honeypot ships with every post.
- Pending disabled submit state and polite live status.
- Generic request acceptance hiding the form inside the modal while retaining the trigger.
- Retryable Accounts error retaining the email and returning focus.

## How to get to it (user POV)

Open the synthetic fixture, activate Get email updates, enter `footer-fixture@example.test`, and activate Subscribe for submitted request states. The fixture URL selects the external outcome; it does not set component state.

## Driving it with agent-browser

Use the repository verifier. It fills by `input[name="email"]`, activates `button[type="submit"]`, waits on the package-owned `data-state`, and reads a separate fixture boundary snapshot for exact request fields.

## Gotchas

- Pending intentionally leaves the synthetic response unsettled until the context is disposed.
- The honeypot must stay empty in the recorded request; a filled `website` field is an Accounts-discarded bot signal, not a visible control.
- Accepted retains hidden input/submit nodes to preserve form identity; the modal announces “Check your email to confirm”. This is anti-enumeration acceptance, not confirmed subscription.
- Provider and delivery behavior remain outside this fixture's proof boundary.
