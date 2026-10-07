# Invitation-only access — implementation handoff

## Decision recorded

Placedon will use a custom sign-in and account-setup experience, hosted on Cloudflare. Access is by invitation only. A shared passcode is a prototype gate, not a production authentication method, and must not be extended into production.

## Recommended first release

Use an invitation-bound, passwordless email link. It has the fewest steps for a legal team, avoids holding passwords, and keeps the invitation as the admission decision.

1. An administrator creates an invitation for one email address, tenant and initial role.
2. The recipient opens the single-use invitation link and confirms their name.
3. The service emails a short-lived sign-in link to that same address.
4. The callback creates a server-side session and returns the person to `/app`.
5. Every application request resolves a member, tenant and role from that session before it reaches the Placedon gateway.

The user never chooses a tenant in the browser. A browser must never hold a gateway API key, an invitation secret, or a tenant identifier that is trusted merely because it came from the browser.

## Required boundaries

```
Browser
  → Cloudflare-hosted sign-in / invitation screens
  → identity and invitation service
  → signed, httpOnly application session
  → Next.js server gateway
  → Placedon backend, scoped by the server-resolved tenant and member
```

Cloudflare hosts and protects the entry surface. It does not by itself provide the member, role, tenant membership, invitation lifecycle or backend authorisation contract. Those must be verified on the server for every sensitive request.

## Contract to implement

These are proposed application endpoints, not existing backend routes:

| Endpoint | Purpose | Must verify |
| --- | --- | --- |
| `POST /auth/invitations/accept` | Consume a supplied invite and begin account setup | opaque invite token, expiry, one-time use, intended email |
| `POST /auth/session/request` | Request a sign-in link for an invited member | email membership, rate limit, no account enumeration |
| `GET /auth/callback` | Exchange the emailed proof for a session | callback state, proof expiry, verified email |
| `GET /auth/session` | Read only the current server-resolved membership | session signature, revocation, tenant, role |
| `POST /auth/logout` | End the current session | session ownership, cookie scope |

The session should carry an opaque identifier only. The server-side session record must resolve at least: `member_id`, verified email, `tenant_id`, role, invitation state, issued time, expiry and revocation state. The Next.js BFF then maps that membership to the permitted backend tenant. Do not use the current `APP_PASSCODE` cookie for this.

## Screens to build after the service exists

- **Sign in:** email field, “Continue”, one short line: “Access is by invitation.”
- **Invitation acceptance:** invited email (read-only), name, firm or team name only if the invitation does not already provide it, “Accept invitation”.
- **Email sent:** confirm the masked address, resend with rate-limit feedback, “Use a different email”.
- **Expired or revoked invitation:** plain explanation and a contact path; never reveal whether another email is a member.
- **No access:** “This email does not have an active invitation.” One contact path, no self-sign-up.
- **Session ended:** sign in again. No confusing generic technical-error wording.

All authentication screens use the adopted black-and-white console language: Placedon mark, restrained type, one primary action, visible focus states and no product data before a session is established.

## Still OPEN before implementation

1. Which service will send the sign-in email and retain invitation/session records.
2. Whether the Cloudflare layer is a Worker/Pages application or fronts the existing Next.js deployment.
3. The initial roles and what each may do in the gateway.
4. Administrator workflow for creating, revoking and reissuing invitations.
5. Session lifetime, inactivity timeout, concurrent-session and audit requirements.

Until those are decided and server verification exists, `/app/login` remains a development-only prototype gate and no screen may imply real account access.
