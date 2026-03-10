---
description: Run a code quality review
---

# /review Command

Use the **code-reviewer** agent to check code quality and maintainability.

## Usage

```
/review                       # Review recent changes
/review components/tabs/      # Review specific directory
/review --focus react         # Focus on React patterns
```

## What It Checks

### React/Next.js Patterns
- Missing dependency arrays in useEffect/useMemo/useCallback
- State updates causing infinite loops
- Missing or incorrect keys in lists
- Prop drilling through 3+ levels
- Missing loading/error states
- Client/server boundary issues

### TypeScript
- Any `any` types that should be typed
- Missing type definitions
- Inconsistent interfaces

### Code Quality
- Large functions (>50 lines)
- Deep nesting (>4 levels)
- Missing error handling
- console.log statements
- Dead code / unused imports

### Project-Specific
- All strings use `t()` function
- Immutable patterns (no mutation)
- Consistent API response format
- Proper error handling with user-friendly messages

## Output Format

```
[HIGH] Missing error boundary
File: components/tabs/PriMache/index.tsx
Issue: No error boundary wrapping data fetching
Fix: Add ErrorBoundary component

## Summary
| Severity | Count |
|----------|-------|
| HIGH     | 2     |
| MEDIUM   | 3     |
| LOW      | 1     |

Grade: B+ (Very Good)
```

## When to Use

- After writing or modifying code
- Before creating a PR
- During code review
