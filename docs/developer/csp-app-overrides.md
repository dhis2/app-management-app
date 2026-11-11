# CSP overrides and violation reports

UI for per-app Content Security Policy (CSP) overrides. It uses the
`/api/security/csp` API added in dhis2/dhis2-core#23753. On servers without
that API the app works as before: no CSP badges, and the CSP tab says the
settings are not available.

## What it adds

-   **App lists** (core and custom apps): badges for CSP violations in the last
    24 hours, "Unsafe CSP override" (unsafe `script-src` tokens saved), "CSP
    Exempt (Report-Only)" (an entrypoint runs report-only) and "Unsafe CSP
    shipped by core" (`baseUnsafeTokens`), plus a filter "Only apps with blocked
    CSP violations" (`?csp=blocked`).
-   **CSP violations page** (sidebar, shows how many apps have blocked reports):
    apps with blocked reports, worst first, each with the fixes the reports call
    for. "Review fix" opens the app's CSP tab with those fixes staged
    (`?tab=csp&fix=<entrypoint> <directive> <value>`); a second list shows apps
    with a relaxed policy.
-   **Content Security Policy tab** on installed app details:
    -   entrypoint switcher: all entrypoints (`*`), app (`index.html`),
        plugin (`plugin.html`), service worker, as the app has them;
    -   apps with a service worker (core lists `entrypoints.worker` only when the
        app ships `service-worker.js`): "Apply changes for App and Service worker
        to both", on by default. With it on, an origin or token added to or
        removed from `app` or `worker` in the editor, the paste helper, a
        suggestion or a violation fix ("+ Allow origin (App + Service worker)",
        "Review fix") is written to both entrypoints as two explicit entries; the
        server model has no inheritance between them;
    -   recent violations, polled every 5 seconds. Each row offers the fix the
        report calls for: "+ Allow origin" for external origins, "+ Allow
        'unsafe-eval'" (eval), "'unsafe-inline'" (inline script) or
        "'wasm-unsafe-eval'" (WebAssembly) in `script-src`, staged for the row's
        entrypoint; "Stage fixes for all blocked" stages them all. Locked
        directives and values the server rejects are never proposed (`src/csp/fixes.js`),
        and unsafe values still need the confirmation on save. "Clear log" empties it;
    -   suggested origins from the server (Maps: external map layers, Bing);
    -   per-directive editors (`connect-src`, `img-src`, `frame-src`, `font-src`,
        `style-src`, `media-src`, `script-src`) with client-side hints that mirror
        the server locks; the server dry run (`POST .../validate`) shows its errors
        per row and a header preview;
    -   base (read-only) and default sources (checkboxes, unchecking sends
        `disabledBaseSources`), and the locked hardening directives;
    -   unsafe sources shipped by core (`baseUnsafeTokens`, e.g. Maps
        `'wasm-unsafe-eval'` on `app` and `plugin`) as switches per entrypoint;
        switching one off sends it in `disabledBaseSources`;
    -   "View / paste effective CSP header" with a paste helper that stages missing
        sources;
    -   danger zone: per-entrypoint `REPORT_ONLY_EXEMPT` behind a confirmation
        dialog with a required reason;
    -   actions: Test Draft (15 min), Run Report-Only Audit, Apply & Save,
        Reset to Default. Unsafe `script-src` tokens need an explicit confirmation.

Code: `src/csp/` (API constants, validation hints, draft model, fixes, header
parser), `src/components/CspPolicy/`, `src/components/CspBadges/` and
`src/pages/CspViolations/`.

## Draft model

The editor shows the stored enforced policy plus any running draft as unsaved
changes. Test Draft and the audit send only the difference (new sources, newly
removed defaults) as `reportOnlyDraft`; Test Draft sets `expiresAt` 15 minutes
ahead so the server also enforces the draft. Apply & Save writes the editor as
the enforced policy and clears the draft.

## Tests

`yarn test` covers the validation hints, the draft model, the fix mapping, the
header parser, the badges, the violations page and the main editor flows
(allow origin, unsafe confirmation, exemption dialog, fixes from reports and
from the URL, shipped tokens, service worker pairing).
