---
description: Fix build and type errors
---

# /fix Command

Use the **build-error-resolver** agent to fix build and TypeScript errors.

## Usage

```
/fix                          # Fix all build errors
/fix typecheck                # Fix TypeScript errors only
/fix --file path/to/file.tsx  # Fix specific file
```

## Common Errors in This Project

### TypeScript Errors

#### Type mismatch in priceHistory
```typescript
// Error: Type 'number[]' is not assignable to type '{ date: string; price: number }[]'

// Fix: Normalize to consistent type
type PricePoint = { date: string; price: number };
priceHistory: PricePoint[]
```

#### Missing translations
```typescript
// Error: Property 'newKey' does not exist on type 'Translations'

// Fix: Add to /data/i18n.ts for both 'kr' and 'en'
```

### Build Errors

#### Prisma client not generated
```bash
npx prisma generate
```

#### Missing environment variable
```bash
# Add to .env.local
DATABASE_URL=file:./dev.db
```

### Runtime Errors

#### Hydration mismatch
- Ensure server and client render same content
- Use `useEffect` for client-only logic
- Check for `typeof window !== 'undefined'`

## Fix Process

1. **Analyze** — Read error message and stack trace
2. **Locate** — Find exact file and line number
3. **Understand** — Determine root cause
4. **Fix** — Apply minimal change
5. **Verify** — Run `npm run build` again
6. **Test** — Ensure no regression

## Verification Commands

```bash
# TypeScript check
npx tsc --noEmit

# Build check
npm run build

# Lint check
npm run lint

# Full verification
npm run build && npm test
```

## When to Use

- Build fails
- TypeScript errors
- Lint errors
- Pre-commit failures
