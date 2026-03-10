---
description: Implement priority fixes from the audit
---

# /implement Command

Execute priority fixes identified in the multi-agent audit.

## Usage

```
/implement critical           # All critical fixes
/implement auth               # Authentication system
/implement validation         # Zod validation
/implement routing            # Next.js routing
/implement security-headers   # Add security headers
```

## Priority Fix Queue

### Critical (Week 1)

#### 1. Authentication System
```
Agent: planner → tdd-guide → security-reviewer
Files:
  - app/api/auth/[...nextauth]/route.ts (new)
  - lib/auth.ts (new)
  - middleware.ts (new)
  - All API routes (update)
```

#### 2. Zod Validation
```
Agent: tdd-guide → code-reviewer
Files:
  - lib/validation/schemas.ts (new)
  - app/api/trades/route.ts (update)
  - app/api/suppliers/route.ts (update)
  - app/api/messages/route.ts (update)
  - app/api/price-reports/route.ts (update)
```

#### 3. Rate Limiting
```
Agent: security-reviewer
Files:
  - middleware.ts (create/update)
  - lib/ratelimit.ts (new)
```

#### 4. Replace DEMO_USER_ID
```
Agent: architect → code-reviewer
Files:
  - contexts/UserContext.tsx (update)
  - All API routes using DEMO_USER_ID (update)
```

#### 5. PostgreSQL Migration
```
Agent: architect → tdd-guide
Files:
  - prisma/schema.prisma (update provider)
  - .env.example (update)
  - scripts/migrate.ts (new)
```

### High Priority (Week 2)

#### 6. Next.js Routing
```
Agent: architect → code-reviewer
Files:
  - app/page.tsx (refactor)
  - app/pri-mache/page.tsx (new)
  - app/kominote/page.tsx (new)
  - app/finans/page.tsx (new)
  - app/akte-ekonomik/page.tsx (new)
  - app/rechech/page.tsx (new)
```

#### 7. Error Boundaries
```
Agent: tdd-guide
Files:
  - components/ErrorBoundary.tsx (new)
  - All tab components (wrap)
```

#### 8. Remove console.log
```
Agent: refactor-cleaner
Files: 24 files with console statements
```

#### 9. Security Headers
```
Agent: security-reviewer
Files:
  - next.config.mjs (update)
```

### Medium Priority (Week 3)

#### 10. Code Splitting
```
Agent: architect → code-reviewer
Files:
  - app/page.tsx (lazy imports)
```

#### 11. Refactor TradeForm
```
Agent: architect → tdd-guide
Files:
  - components/tabs/Kominote/TradeForm.tsx (split into 3)
  - components/tabs/Kominote/TradeFormFields.tsx (new)
  - components/tabs/Kominote/TransportSection.tsx (new)
```

#### 12. Sanitize HTML
```
Agent: security-reviewer
Files:
  - components/tabs/Rechech/Bibliography.tsx (update)
  - package.json (add isomorphic-dompurify)
```

## Implementation Workflow

For each fix:

1. **Plan** — `/plan [fix description]`
2. **Test First** — `/tdd [fix description]`
3. **Implement** — Write code to pass tests
4. **Review** — `/review [changed files]`
5. **Security Check** — `/security [if applicable]`
6. **Verify** — `npm run build && npm test`

## Verification Checklist

After each critical fix:
- [ ] Tests pass (80%+ coverage)
- [ ] Build succeeds
- [ ] No TypeScript errors
- [ ] Security review passes
- [ ] Documentation updated

## When to Use

- Starting implementation sprint
- After completing audit
- Working through fix backlog
