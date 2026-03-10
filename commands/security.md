---
description: Run a security audit on the codebase
---

# /security Command

Use the **security-reviewer** agent to audit the codebase for vulnerabilities.

## Usage

```
/security                     # Full audit
/security app/api/            # Audit API routes only
/security --focus auth        # Focus on authentication
```

## What It Checks

### OWASP Top 10
1. **Injection** — SQL, command, LDAP injection
2. **Broken Auth** — Session management, credential storage
3. **Sensitive Data** — Encryption, data exposure
4. **XXE** — XML processing vulnerabilities
5. **Broken Access** — Authorization checks, CORS
6. **Misconfiguration** — Default settings, security headers
7. **XSS** — Cross-site scripting
8. **Insecure Deserialization** — Object injection
9. **Known Vulnerabilities** — Outdated dependencies
10. **Insufficient Logging** — Security event tracking

### Project-Specific Checks
- [ ] No hardcoded DEMO_USER_ID in production paths
- [ ] Zod validation on all API inputs
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Security headers in next.config.mjs
- [ ] No sensitive data in error messages

## Output Format

```
[CRITICAL] Hardcoded API key
File: src/api/client.ts:42
Issue: API key exposed in source
Fix: Move to environment variable

## Summary
| Severity | Count | Status |
|----------|-------|--------|
| CRITICAL | 0     | pass   |
| HIGH     | 2     | warn   |

Verdict: WARNING — Fix HIGH issues before merge
```

## When to Use

- Before ANY commit
- After adding auth/API/data handling code
- Before production deployment
- After dependency updates
