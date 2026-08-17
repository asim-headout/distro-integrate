# Planning Questionnaire

Use this after inspecting the partner repo and before proposing implementation steps. Do not ask
questions that the repo already answers. For each unanswered item, state the repo evidence found,
the default assumption, and the impact of the decision.

## Required planning questions

1. **Experience URL prefix**
   - What should the new Headout-powered experiences URL prefix be?
   - Examples: `/experiences`, `/things-to-do`, `/activities`, `/tours`.
   - Confirm whether existing routes under that prefix are owned by this integration or must be left
     untouched.
2. **DB migration ownership**
   - Should this repo add database migrations for Headout booking/payment/webhook state?
   - Choices: add migrations here, produce a schema handoff for another service/repo, or avoid DB
     changes for this phase.
   - If existing order/payment tables exist, ask whether to extend them or add Headout-specific
     tables only when the repo does not make ownership clear.
3. **UI setup confirmation**
   - Summarize the UI system found: framework, component library, styling/tokens, form primitives,
     icons, layout patterns, and test/storybook setup if present.
   - Ask for confirmation before continuing if the integration would need new shared UI components,
     a new route shell, or a fallback style because no design system is obvious.
4. **Checkout and payment routing**
   - Should checkout and payment be separate routes or one combined route?
   - Examples: `/book/:id/select` -> `/book/:id/checkout` -> `/book/:id/payment`, or a combined
     `/checkout` flow.
   - Confirm whether the partner wants common booking routes across all experiences or
     experience/product-specific routes.
5. **Execution strategy**
   - Should the integration run one journey step at a time, as a bounded batch, or through a
     workflow/subagent split?
   - Default recommendation: one step at a time for code changes; use subagents/workflows for
     separable read-only work such as repo discovery, API-doc lookup, test inventory, and review.
   - Do not run broad parallel code edits across dependent flow steps unless the user explicitly
     chooses that mode.
## Additional questions when not obvious from the repo

6. **Integration scope**
   - Which journey steps are in scope now: discovery, product selection, checkout inputs, seatmap,
     payment/booking, booking management/webhooks?
7. **Partner mode**
   - Is the app acting as an API partner, affiliate/referral surface, or mixed mode?
   - This decides whether the plugin should wire booking/payment or stop at outbound links.
8. **Headout environment, credentials, and local env setup**
   - Which environment should be used for development: sandbox, staging, or production-like?
   - What is the repo's local secret convention: `.env.local`, `.env`, framework-specific env file,
     platform env, secret manager, or something else?
   - Confirm the expected server-side env var names for `Headout-Auth` and base URL if the repo does
     not already define them. Suggested names are `HEADOUT_AUTH` and `HEADOUT_BASE_URL` only when
     they fit the repo's naming style.
   - Ask the user to add the real `Headout-Auth` value themselves in the approved server-side env
     location. Never write, paste, log, or commit the real secret.
   - Ask whether the agent may add placeholder documentation such as `.env.example` entries or README
     setup notes when the repo already uses that pattern.

9. **Currency, language, and market defaults**
   - What are the default `currencyCode`, `languageCode`, and starting city/market?
   - Confirm whether these come from URL, locale middleware, user profile, config, or hardcoded
     launch defaults.

10. **Payment service boundary**
   - Which partner PSP/payment service owns payment authorization, 3DS/redirects, refunds, and saved
     methods?
   - Confirm allowed redirect/callback origins, server-side callback verification, and the durable
     void/refund path when PSP funds settle but Headout capture fails.

11. **Booking identity and reconciliation**
    - What local identifier should map to Headout `partnerReferenceId`?
   - Confirm where Headout `bookingId`, capture status, idempotency key, and webhook event ids
     should be stored.
   - Confirm how the unsigned webhook receiver is protected and reconciled with booking GET.

12. **Auth and account dependency**
   - Does booking require a signed-in user, guest checkout, or both?
   - Confirm session ownership/CSRF conventions and signed guest access for confirmation/vouchers.

13. **Testing and sandbox smoke policy**
    - What commands should be used for focused tests, lint/typecheck, and build?
    - Confirm whether sandbox booking smoke tests are allowed, and only run them with credentials and
      explicit approval.

14. **Rollout boundary**
    - Should the integration be hidden behind a feature flag, route allowlist, environment flag, or
      internal-only preview route first?

## Output format

After asking the questionnaire, produce:

- **Repo overview:** detected stack, route/data boundaries, persistence, UI system, env/secret
  convention, test workflow.
- **Decisions needed:** unanswered planning questions, grouped by blocking vs non-blocking.
- **Assumptions:** defaults the agent will use if the user asks it to proceed.
- **Observed existing issues:** bugs, dummy/stub content, rough patterns, or refactor opportunities
  that should be left untouched unless explicitly requested.
- **Proposed journey plan:** ordered Headout skills, recommended execution strategy
  (one-by-one/batched/subagents), and acceptance criteria for each step.
