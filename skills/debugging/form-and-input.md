# Debugging Form and Input Issues with Replay

When tests fail interacting with forms, inputs, dropdowns, or other interactive elements,
Replay reveals exactly what happened at the DOM level — whether clicks registered, what
values were set, and whether browser-native behavior interfered.

## Tool Sequence

1. **`PlaywrightSteps`** — See whether the click/fill/select action was executed and what
   it returned. A click that "succeeded" but produced no visible change means the event
   was handled but the expected behavior didn't follow.

2. **`Screenshot`** — See the page state at the moment of interaction. Check:
   - Is the target element visible and in the viewport?
   - Is a modal or overlay blocking it?
   - Did a previous step leave the page in an unexpected state?

3. **`InspectElement`** — Inspect the DOM element's attributes, including `type`, `required`,
   `noValidate`, `disabled`, `aria-*` attributes. This reveals browser-native behavior that
   may interfere with test expectations.

4. **`ConsoleMessages`** — Check for form validation errors or event handler exceptions.

5. **`Evaluate`** — Evaluate the element's properties at runtime (e.g.,
   `element.validity.valid`, `element.value`, `form.noValidate`).

## Common Root Causes (from observed failures)

### Browser-native validation blocking custom validation
An `<input type="email">` has built-in browser validation that fires before the form's
`onSubmit` handler. When a test fills an intentionally invalid email to test app-level
validation, the browser blocks submission entirely.

**Diagnosis with Replay**: PlaywrightSteps shows the click happened. Screenshot shows no
app-level error message appeared. InspectElement reveals `type="email"` on the input.

**Fix**: Add `noValidate` to the `<form>` element to disable browser-native validation,
allowing the app's custom validation to handle all cases.

*Example*: Forgot-password "Submit with Invalid Email Format" test. PlaywrightSteps
confirmed click, but form handler never fired.

### Native `<select>` vs. custom dropdown
Playwright's `.selectOption()` only works on native `<select>` elements. If the component
renders a custom dropdown (buttons + divs styled to look like a select), `selectOption()`
will fail or do nothing.

**Diagnosis with Replay**: PlaywrightSteps shows selectOption step with no effect.
InspectElement shows the element is a `<button>` or `<div>`, not a `<select>`.

**Fix**: Use click-based interactions for custom dropdowns: click the trigger, wait for the
options panel, click the desired option.

### CSS hover interactions not triggering in Replay Chromium
CSS `group-hover:opacity-100` may not reliably trigger from Playwright's programmatic hover
in the Replay Chromium browser. The element stays at `opacity-0` even after hover.

**Diagnosis with Replay**: PlaywrightSteps shows hover action completed. Screenshot shows
the element is still invisible (opacity 0).

**Fix**: Don't assert CSS opacity state. Use `force: true` on the click, and verify the
functional outcome (e.g., row disappears after delete) instead of the visual hover state.

*Example*: "Delete on Hover" test. Hover didn't trigger opacity change. Fixed with
`force:true` click + functional assertion.

### `toBeChecked` targeting label instead of input
`toBeChecked()` only works on `<input>` elements. If the test targets the `<label>` wrapping
a checkbox, the assertion fails even though the checkbox is checked.

**Diagnosis with Replay**: PlaywrightSteps shows the toggle click succeeded. InspectElement
on the asserted element shows it's a `<label>`, not an `<input>`.

**Fix**: Target the `<input>` element inside the label for `toBeChecked` assertions.

*Example*: STP-WH-07 webhook toggle. Replay showed `toBeChecked` was called on a
`<label>`, not the underlying `<input>`.

### `data-testid` on sr-only/hidden input
When a `data-testid` is placed on a hidden `sr-only` input (e.g., inside an accessible
checkbox/toggle), Playwright's click action times out because the element has zero dimensions.

**Diagnosis with Replay**: PlaywrightSteps shows the click step timing out. Logpoint on the
event handler confirms 0 hits (the click never reached the handler).

**Fix**: Move the `data-testid` to the visible label or wrapper element that the user would
actually click.

*Example*: STP-WH-07 webhook toggle. The testid was on the hidden `sr-only` input.
Moving it to the visible label fixed the timeout.

### Form populate overwrites user edits
When a form field shows old/stale values after user input (e.g., editing a price but the old
price reappears), the root cause is usually a React `useEffect` that re-runs when Redux state
or props update, overwriting user edits with fetched data.

**Diagnosis with Replay**: `PlaywrightSteps` shows the fill action succeeded. `NetworkRequest`
reveals the timing of API responses vs. user input — a GET response arriving after the user
edited the field triggers a state update that re-fires the populate effect. `Screenshot` at
the assertion point confirms the field reverted to the old value.

**Tool sequence**: `PlaywrightSteps → NetworkRequest → Screenshot`

**Fix**: Add a `formPopulated` or `editInitialized` ref guard in the component. Set it to
`true` after the first populate, and skip the effect body on subsequent runs:
```ts
const formPopulated = useRef(false);
useEffect(() => {
  if (formPopulated.current) return;
  if (data) {
    form.reset(data);
    formPopulated.current = true;
  }
}, [data]);
```

*Example*: Contract form edit test — PUT body contained old price because useEffect re-ran
when Redux state reference changed after the GET response, overwriting the user's edit.
