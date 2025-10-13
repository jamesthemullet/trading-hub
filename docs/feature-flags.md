# Feature Flags Management

## Implementation

### Location

Feature flags are defined in `src/libs/components/feature-flag.tsx`

### Structure

```typescript
export type FeatureFlags = {
  existingFlag1: boolean;
  existingFlag2: boolean;
  // add your new flags here, flags can have complex types if needed
};

export const defaultFeatureFlags: FeatureFlags = {
  existingFlag1: false,
  existingFlag2: true,
  // add your new flags here
};
```

## Managing Flags

### Local Development

1. Access flag management at `http://localhost:3000/flags`
2. Toggle flags using the UI
3. Flags persist in cookies

### Example Implementation

```typescript
// feature flag hook in src/libs/components/feature-flag.tsx
export const useExampleFeatureFlag = () => {
  const featureFlags = useContext(FeatureFlagContext);
  const [exampleFeatureEnabled, setExampleFeatureEnabled] = useState(false);

  useEffect(() => {
    setExampleFeatureEnabled(featureFlags.flagExample);
  }, [featureFlags.flagExample]);

  return exampleFeatureEnabled;
};

// context provider in src/pages/_app.page.tsx
<FeatureFlagContext.Provider
   value={{
     exampleFlag: cookies.flagExample === 'true',
     //  other flags
   }}
 >
   {children}
 </FeatureFlagContext.Provider>

// Usage in components
const MyComponent = () => {
  // a hook that is implemented in src/libs/components/feature-flag.ts ex is useAuthorizationRoleOverride
  const isNewUI = useExampleFeatureFlag();

  return isNewUI ? <NewUI /> : <OldUI />;
};
```
