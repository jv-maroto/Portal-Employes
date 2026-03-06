---
name: react-best-practices
description: React performance optimization guidelines. Use when writing, reviewing, or refactoring React code.
---

# React Best Practices

## Priority 1: Eliminating Waterfalls (CRITICAL)
- Move await into branches where actually used
- Use Promise.all() for independent operations
- Use Suspense to stream content

## Priority 2: Bundle Size (CRITICAL)
- Import directly, avoid barrel files
- Use dynamic imports for heavy components
- Load analytics/logging after hydration
- Preload on hover/focus for perceived speed

## Priority 3: Re-render Optimization (MEDIUM)
- Don't subscribe to state only used in callbacks
- Extract expensive work into memoized components
- Hoist default non-primitive props
- Use primitive dependencies in effects
- Derive state during render, not in effects
- Use functional setState for stable callbacks
- Pass function to useState for expensive initial values
- Use refs for transient frequent values
- Use startTransition for non-urgent updates

## Priority 4: Rendering Performance (MEDIUM)
- Use content-visibility for long lists
- Extract static JSX outside components
- Use ternary, not && for conditional rendering
- Prefer useTransition for loading state

## Priority 5: JavaScript Performance
- Group CSS changes via classes or cssText
- Build Map for repeated lookups
- Cache object properties in loops
- Combine multiple filter/map into one loop
- Check array length before expensive comparison
- Return early from functions
- Use Set/Map for O(1) lookups
