---
description: Start test-driven development workflow
---

# /tdd Command

Use the **tdd-guide** agent to enforce test-driven development.

## Usage

```
/tdd Add price alert notification feature
/tdd Fix trade form validation bug
/tdd Refactor CommodityCard component
```

## TDD Workflow

### Step 1: Write Tests First (RED)
```typescript
describe('PriceAlertNotification', () => {
  it('shows alert when price exceeds threshold', () => {
    // Test implementation - should FAIL
  });

  it('hides alert when price is normal', () => {
    // Test implementation - should FAIL
  });
});
```

### Step 2: Run Tests (They Should Fail)
```bash
npm test
# Expected: FAIL
```

### Step 3: Implement Code (GREEN)
Write minimal code to make tests pass.

### Step 4: Run Tests Again
```bash
npm test
# Expected: PASS
```

### Step 5: Refactor (IMPROVE)
Improve code while keeping tests green.

### Step 6: Verify Coverage
```bash
npm run test:coverage
# Expected: 80%+
```

## Test Types Required

### Unit Tests
- Individual components
- Utility functions
- Custom hooks

### Integration Tests
- API routes
- Database operations
- Context providers

### E2E Tests (Critical Flows)
- Viewing prices by region
- Logging a trade
- Sòl payment tracking
- Language switching

## Project-Specific Test Patterns

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CommodityCard } from './CommodityCard';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <LanguageProvider>{ui}</LanguageProvider>
  );
};

test('displays price in HTG', () => {
  renderWithProviders(<CommodityCard commodity={mockCommodity} />);
  expect(screen.getByText('68 HTG')).toBeInTheDocument();
});
```

### API Route Test
```typescript
import { POST } from './route';
import { NextRequest } from 'next/server';

test('validates trade input with Zod', async () => {
  const request = new NextRequest('http://localhost/api/trades', {
    method: 'POST',
    body: JSON.stringify({ qty: -1 }), // Invalid
  });

  const response = await POST(request);
  expect(response.status).toBe(400);
});
```

## When to Use

- Starting any new feature
- Fixing bugs
- Refactoring code
- Adding API endpoints
