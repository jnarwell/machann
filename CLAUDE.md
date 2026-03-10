# CLAUDE.md — Machann Enfòmasyon

This file provides guidance to Claude Code when working with this codebase.

## Project Overview

**Machann Enfòmasyon** is a market information platform for Haiti's madan sara traders. It provides:
- Real-time commodity prices across Haitian markets
- Sòl (rotating savings group) management
- Trade logging and profit tracking
- Loan readiness scoring
- Macro economic indicators

**Purpose:** Dual academic digital narrative (HIS 275, Stanford) + functional product prototype.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (custom warm market palette)
- **Database:** Prisma + SQLite (migrate to PostgreSQL for production)
- **Charts:** Recharts
- **i18n:** Custom LanguageContext (Kreyòl ↔ English)

## Running the Project

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev

# Run tests
npm test

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## Project Structure

```
machann-app/
├── app/
│   ├── api/           # 13 API routes
│   ├── page.tsx       # Main SPA entry (needs routing refactor)
│   └── layout.tsx     # Root layout with providers
├── components/
│   ├── layout/        # Header, TabNavigation, LanguageToggle
│   ├── tabs/          # 5 main tabs (PriMache, Kominote, Finans, etc.)
│   ├── ui/            # Badge, Button, Card, StarRating
│   └── settings/      # ConsentSettingsPanel
├── contexts/
│   ├── LanguageContext.tsx   # i18n provider
│   └── UserContext.tsx       # User state management
├── data/              # Mock data and translations
├── hooks/             # usePrices, useExchange
├── lib/
│   ├── api/           # External API clients (FEWS NET, WFP, BRH)
│   └── cache/         # In-memory cache layer
├── prisma/
│   └── schema.prisma  # Database schema (14 models)
├── agents/            # Specialized subagents
├── skills/            # Workflow definitions
├── rules/             # Coding guidelines
└── AGENTS.md          # Agent orchestration guide
```

## Key Conventions

### i18n — All strings bilingual
```typescript
// ALWAYS use the translation function
const { t, language } = useLanguage();

// Access translations
<h1>{t('priMache.title')}</h1>

// All strings defined in /data/i18n.ts
```

### Immutability — Never mutate
```typescript
// WRONG
user.name = 'New Name';

// CORRECT
const updatedUser = { ...user, name: 'New Name' };
```

### API Routes — Consistent format
```typescript
// Success response
return NextResponse.json({
  success: true,
  data: result,
});

// Error response
return NextResponse.json(
  { success: false, error: 'Message', code: 'ERROR_CODE' },
  { status: 400 }
);
```

### Validation — Zod schemas required
```typescript
import { z } from 'zod';

const Schema = z.object({
  field: z.string().min(1).max(100),
});

const validated = Schema.parse(input);
```

## Critical Rules

### DO:
- Use TypeScript strict mode
- Validate all inputs with Zod
- Use Prisma for all database queries
- Handle errors with try-catch
- Translate all user-facing strings
- Test before committing (80%+ coverage)
- Use immutable patterns (spread operator)

### DON'T:
- Hardcode secrets (use environment variables)
- Use `any` type (define proper types)
- Mutate objects (create new copies)
- Skip input validation
- Leave console.log in production code
- Commit without running tests
- Use raw SQL (use Prisma ORM)

## Database Models

Key models in `prisma/schema.prisma`:
- `User` — Trader profile
- `Trade` — Transaction log
- `Supplier` — Vendor directory
- `SolGroup` / `SolMember` — Rotating savings
- `PriceReport` — User-submitted prices
- `Message` — Group communication
- `UserConsent` — Privacy settings

## External APIs

| Source | Endpoint | Purpose |
|--------|----------|---------|
| FEWS NET | `dataviz.vam.wfp.org` | Commodity prices |
| WFP HDX | `data.humdata.org` | Backup price data |
| BRH | Web scrape | Exchange rates |

## Color Palette

```css
--terracotta: #C1440E      /* Primary */
--indigo: #1E2A4A          /* Nav, headers */
--parchment: #F5EDD8       /* Background */
--cream: #FDF6E8           /* Surface */
--amber: #D4872A           /* Accent, current sòl recipient */
--sage: #6B7C5E            /* Secondary */
--alert-red: #B83232       /* Price spike */
--alert-green: #4A7A4A     /* Price drop */
```

## Typography

- **Display:** Playfair Display (serif, headings)
- **Body:** Source Serif 4
- **Monospace:** Space Mono (prices, codes)

## Agent Usage

See `AGENTS.md` for detailed agent orchestration. Quick reference:

```
/plan     → Complex features
/tdd      → Test-driven development
/review   → Code quality check
/security → Security audit
/fix      → Build error resolution
```

## Priority Fixes

From the multi-agent audit:

| Priority | Issue | Location |
|----------|-------|----------|
| CRITICAL | No authentication | All API routes |
| CRITICAL | No rate limiting | All endpoints |
| CRITICAL | No input validation | POST/PUT routes |
| HIGH | Single-page routing | app/page.tsx |
| HIGH | Missing error boundaries | Tab components |
| MEDIUM | console.log statements | 24 files |
| MEDIUM | Large TradeForm | 577 lines |

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- TradeForm.test.tsx

# E2E tests (Playwright)
npx playwright test
```

## Environment Variables

See `.env.example`:
```
DATABASE_URL=file:./dev.db
ADMIN_API_KEY=<generate-secure-key>
FEWSNET_API_KEY=<optional>
REDIS_URL=<for-production-cache>
```

## Deployment Notes

Before production:
1. Migrate SQLite → PostgreSQL
2. Set up Redis for caching
3. Configure authentication (NextAuth.js)
4. Add rate limiting (@upstash/ratelimit)
5. Set security headers in next.config.mjs
6. Run security-reviewer agent
7. Verify 80%+ test coverage
