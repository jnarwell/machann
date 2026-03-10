---
description: Create an implementation plan for a complex feature
---

# /plan Command

Use the **planner** agent to create a comprehensive implementation plan.

## Usage

```
/plan Add user authentication with NextAuth.js
/plan Implement proper Next.js routing with tabs
/plan Add rate limiting to all API endpoints
```

## What It Does

1. Analyzes the request and identifies dependencies
2. Reviews existing codebase patterns
3. Creates phased implementation plan
4. Identifies risks and mitigations
5. Outputs actionable steps with file paths

## Output Format

```markdown
## Overview
[2-3 sentence summary]

## Requirements
- [Bulleted list]

## Implementation Steps
### Phase 1: [Name]
- Step 1.1: [Action] — File: `path/to/file.ts`
- Step 1.2: [Action]

## Testing Strategy
- Unit tests for...
- Integration tests for...
- E2E tests for...

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| ... | ... |
```

## When to Use

- Complex features requiring multiple files
- Architectural changes
- Refactoring large components
- Adding new systems (auth, caching, etc.)
