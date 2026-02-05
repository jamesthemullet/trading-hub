# Testing Strategy

## Test Types

### Unit Tests

- **Location**: `src/**/*.spec.ts(x)`
- **Runner**: Jest
- **Coverage Requirements**: 100%
- **Command**: `pnpm run test`

#### Example

```typescript
describe('RulesetEditor', () => {
  it('should update attribute weight', () => {
    // Arrange
    const initialWeight = 50;

    // Act
    const result = updateWeight(initialWeight, 75);

    // Assert
    expect(result).toBe(75);
  });
});
```

### E2E Tests

- **Location**: `e2e/**/*.spec.ts`
- **Runner**: Playwright
- **Command**: `pnpm run test:e2e:ui`

#### Test Categories

1. **Smoke Tests**
   - Run every 15 minutes
   - Basic functionality verification
   - Critical path testing

2. **Mock Tests**
   - Test complex interactions
   - Verify error handling

3. **Production Tests**
   - Verify authentication
   - Test data loading
   - Check critical business flows

## Test Environment Setup

### Local Testing

```bash
# Unit and E2E Tests
NEXT_PUBLIC_AUTO_LOGIN=false pnpm run test

# E2E Tests with UI
pnpm run test:e2e:ui

# E2E Tests headless
pnpm run test:e2e
```

### CI/CD Testing

- PR validation runs all tests
- Smoke tests run automatically
- Production tests require credentials

## Test Data Management

### Mock Data

- Located in `src/test/data`
- Use factories for consistent data (we don't do that now, so would be good to add)

### API Mocking

- MSW or just mocks for unit tests

## Debugging Tests

### Unit Tests

```bash
# Debug specific test
pnpm run test -- -t "test name"

# Watch mode
pnpm run test -- --watch
```
