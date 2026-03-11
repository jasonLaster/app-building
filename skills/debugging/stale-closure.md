# Stale Closure Debugging Guide

## Symptoms

- User performs an action (click save, submit form) but nothing happens — no navigation, no
  state update, no error.
- A checkbox or toggle updates one field but silently reverts another field that was just changed.
- Form submissions send stale/old values despite the user having typed new ones.
- State appears "stuck" at a previous value after an interaction.

## Root Cause

React event handlers and effects capture variables from the render cycle in which they were
created. When a handler is defined inside a component and references state variables, it
"closes over" the values at definition time. If the handler is not recreated when state
changes (e.g., because of missing useEffect dependencies or because the handler is passed to
a child component that doesn't re-render), it uses stale values.

Common patterns:
- **Double `updateField` calls**: An onChange handler calls `updateField` twice in sequence.
  The second call uses the same base state as the first (not the result of the first update),
  so the second call overwrites the first.
- **Callback defined in useEffect without deps**: A save handler is created inside a
  useEffect and attached to a button, but the effect doesn't re-run when form data changes.
- **Memoized callback with stale deps**: `useCallback` or `useMemo` captures state but the
  dependency array is incomplete.

## Diagnosis

### Without Replay
- Error output typically shows the wrong value was sent or the action had no visible effect.
- Read the component source and look for:
  1. Event handlers that reference state variables directly (not via a ref or functional update).
  2. Multiple sequential state updates using the same base state object.
  3. `useCallback`/`useMemo` with incomplete dependency arrays.

### With Replay
1. `PlaywrightSteps` — Identify which user action had no effect.
2. `Logpoint` on the event handler — Check the captured state values at call time.
3. `Evaluate` — Compare the handler's closure state with the actual current state.

## Canonical Fix

Extract a function that reads current state at call time instead of using closure values:

```tsx
// BAD: stale closure — formData captured at handler creation time
const handleSave = () => {
  updateField('name', formData.name);
  updateField('controlled', formData.controlled); // overwrites name update
};

// GOOD: extract doSave that reads current state
const doSave = () => {
  const currentData = { ...formData };
  saveToAPI(currentData);
};
```

For sequential state updates, use functional updater form:

```tsx
// BAD: second update overwrites first
setFormData({ ...formData, name: newName });
setFormData({ ...formData, controlled: true }); // loses name change

// GOOD: functional updater reads latest state
setFormData(prev => ({ ...prev, name: newName }));
setFormData(prev => ({ ...prev, controlled: true }));
```

## Difficulty

Stale closures are among the hardest React bugs to diagnose from error output alone. They
typically require 3-4 fix iterations. Code inspection of the component source is usually
more effective than Replay for these bugs — look for the patterns above.
