# Frontend Penetration Testing Guide and Checklist

The frontend of a decentralized application (dApp) acts as the gateway between the user, their Stacks wallet, and the underlying smart contracts. Client-side security is paramount; a compromised frontend can be used to inject phishing overlays, manipulate transaction parameters, or leak private user data.

Use this penetration testing checklist to audit the React/Vite application client-side codebase and deployment environments.

---

## 1. Web3 Wallet Integration and Transaction Protection

### Post-Condition Enforcement
* [ ] **Enforce rigorous post-conditions**: In Stacks, post-conditions guarantee that specific tokens/STX cannot leave a user's wallet unless predefined criteria are met. Ensure that every contract call initiated by the frontend implements strict post-conditions instead of allowing `PostConditionMode.Allow` (which lets the contract spend whatever it wants).
* [ ] **Verify recipient and amounts**: Audit the contract-call options in the frontend hooks to ensure amounts and recipients are derived dynamically from state variables, rather than statically or unchecked.

### Phishing and Signature Manipulation
* [ ] **Address Hijacking**: Test if a user-supplied address can be replaced in state by an attacker. Verify that input fields for addresses validate formatting and checksums.
* [ ] **Connect Overlay Security**: Confirm that Stacks connection state (`@stacks/connect`) is managed securely and is protected against clickjacking or overlay injection.

---

## 2. Storage Security and Sensitive Data Leaks

### LocalStorage & SessionStorage Auditing
* [ ] **Zero sensitive key storage**: Verify that private keys, mnemonic phrases, or raw seed phrases are **never** stored in browser `localStorage`, `sessionStorage`, or standard cookies.
* [ ] **PII Scanning**: Run scans to ensure no personally identifiable information (PII) is written to cleartext browser storage.
* [ ] **Encryption of cached states**: Verify that if any transaction history or balance state is cached locally, it is purged upon wallet disconnect.

### Source Maps and Environment Variables
* [ ] **Production source maps disabled**: Check that production builds do not ship `.js.map` files, which leak the original source code structure to attackers.
* [ ] **Client-safe environment variables**: Ensure that only variables prefixed with `VITE_` (for Vite) are exposed to the client bundle. Audit files to make sure no database credentials, private keys, or internal API secret keys are included in `.env` files exposed during compilation.

---

## 3. Client-Side Injection (XSS) and Safe Rendering

### React Sanitization
* [ ] **Render protection**: Audit the codebase for the usage of `dangerouslySetInnerHTML`. Where dynamic HTML rendering is required, ensure input is sanitized using established libraries (e.g., `dompurify`).
* [ ] **Unsanitized inputs**: Ensure inputs like market descriptions, outcome names, and user profiles are escaped properly by the React engine by default.
* [ ] **`javascript:` URIs**: Check that link components (e.g. `<a>` tags with `href`) sanitize input and do not allow `javascript:` schemas.

---

## 4. API Security, CSRF, and Network Hardening

### Content Security Policy (CSP)
* [ ] **Strict CSP header config**: Confirm the deployment environment (Vercel, Netlify, Cloudflare, or Nginx) enforces a strict Content Security Policy. It must allow scripts, styles, and connect requests only from trusted sources (like Hiro APIs, Stacks API endpoints, and specific RPC nodes).
* [ ] **Clickjacking prevention**: Verify the `X-Frame-Options` header is set to `DENY` or `SAMEORIGIN` to prevent framing attacks.

### Transport Layer Security
* [ ] **HSTS (HTTP Strict Transport Security)**: Verify that the dApp enforces HTTPS and includes standard security headers (`Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`).

---

## 5. Automated Scanning Rules

Incorporate these regular steps in the release pipeline:

1. **Dependency Audit**: Run `npm audit` to identify vulnerable third-party dependencies.
2. **Static Code Analysis**: Enforce strict ESLint checks to prevent deprecated React code patterns.
3. **Secret Scan**: Run automated tools (like `trufflehog` or custom regex scripts) to verify that no mnemonic words or Stacks private keys are accidentally committed.
