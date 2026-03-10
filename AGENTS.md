# Machann Enfòmasyon — Agent Instructions

This is a **Next.js 14 market information platform** for Haiti's madan sara traders. The project uses specialized agents for development tasks.

## Core Principles

1. **Agent-First** — Delegate to specialized agents for domain tasks
2. **Security-First** — This app handles financial data; never compromise security
3. **Test-Driven** — Write tests before implementation, 80%+ coverage
4. **Bilingual** — All UI strings must exist in Kreyòl (kr) and English (en)
5. **Mobile-First** — Primary users access via feature phones

## Available Agents

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| planner | Implementation planning | Complex features, refactoring |
| architect | System design and scalability | Architectural decisions |
| tdd-guide | Test-driven development | New features, bug fixes |
| code-reviewer | Code quality and maintainability | After writing/modifying code |
| security-reviewer | Vulnerability detection | Before commits, API changes |
| build-error-resolver | Fix build/type errors | When build fails |
| refactor-cleaner | Dead code cleanup | Code maintenance |
| doc-updater | Documentation updates | After major changes |

## Agent Orchestration

Use agents proactively without user prompt:
- Complex feature requests → **planner**
- Code just written/modified → **code-reviewer**
- Bug fix or new feature → **tdd-guide**
- Architectural decision → **architect**
- Security-sensitive code (auth, API, data) → **security-reviewer**
- Build failures → **build-error-resolver**

Use parallel execution for independent operations.

## Security Guidelines (CRITICAL)

This app handles sensitive financial data for Haitian traders. Before ANY commit:

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated with Zod schemas
- [ ] SQL injection prevention (use Prisma parameterized queries)
- [ ] XSS prevention (sanitize HTML with DOMPurify)
- [ ] CSRF protection on all state-changing endpoints
- [ ] Authentication checks on protected routes
- [ ] Rate limiting on all API endpoints
- [ ] Error messages don't leak sensitive data

**If security issue found:** STOP → use security-reviewer agent → fix CRITICAL issues → review similar code patterns.

## Coding Style

**Immutability (CRITICAL):** Always use spread operator, never mutate objects.

**File organization:**
- 200-400 lines typical, 800 max
- Organize by feature: `/components/tabs/{PriMache,Kominote,Finans}/`
- High cohesion, low coupling

**Error handling:**
- Handle errors at every level
- User-friendly messages in Kreyòl for UI errors
- Log detailed context server-side
- Never silently swallow errors

**Input validation:**
- Validate ALL user input with Zod schemas
- Fail fast with clear messages
- Never trust external data

## Testing Requirements

**Minimum coverage: 80%**

Test types (all required):
1. **Unit tests** — Components, utilities, hooks
2. **Integration tests** — API routes, database operations
3. **E2E tests** — Critical user flows (price viewing, trade logging, sòl tracking)

**TDD workflow (mandatory):**
1. Write test first (RED)
2. Write minimal implementation (GREEN)
3. Refactor (IMPROVE)
4. Verify coverage 80%+

## Project-Specific Patterns

### Data Sources
```
External APIs → Cache (60min) → Fallback (24hr) → Mock data
FEWS NET → Redis/Memory → Stale cache → /data/commodities.ts
```

### i18n Pattern
```typescript
// ALWAYS use the t() function, never hardcode strings
const { t } = useLanguage();
return <h1>{t('priMache.title')}</h1>;
```

### API Response Format
```typescript
// Success
{ success: true, data: T, meta?: { count, page } }

// Error
{ success: false, error: string, code: string }
```

### Validation Pattern
```typescript
import { z } from 'zod';

const TradeSchema = z.object({
  commodityId: z.string().min(1),
  qty: z.number().positive(),
  pricePaid: z.number().positive().max(1000000),
  priceReceived: z.number().positive().max(1000000),
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = TradeSchema.parse(body);
  // ... proceed with validated data
}
```

## Priority Fixes (from audit)

### Critical (Must Fix)
1. **Add authentication** — NextAuth.js with session management
2. **Add rate limiting** — @upstash/ratelimit on all endpoints
3. **Add Zod validation** — All API route inputs
4. **Replace DEMO_USER_ID** — Session-based user identification
5. **Migrate SQLite → PostgreSQL** — Production database

### High Priority
6. **Implement Next.js routing** — `/app/[tab]/page.tsx` structure
7. **Add error boundaries** — Per-tab error handling
8. **Remove console.log** — Replace with proper logging
9. **Add security headers** — CSP, X-Frame-Options

### Medium Priority
10. **Code splitting** — Lazy load inactive tabs
11. **Refactor TradeForm** — Split 577-line component
12. **Add DOMPurify** — Sanitize Bibliography HTML

## Success Metrics

- All tests pass with 80%+ coverage
- No security vulnerabilities (security-reviewer passes)
- Build succeeds without errors
- All strings translated (kr + en)
- Mobile responsive (<768px viewport)
- Lighthouse performance > 80
