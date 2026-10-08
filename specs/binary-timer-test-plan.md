# Binary Timer Test Plan

## Application Overview

Review against live browser behavior. Test the app at /binarytimer/ (including the trailing slash in all direct URLs). Preserve functional, accessibility, responsive, and theme coverage. Fresh browser context and cleared local storage for independent scenarios except persistence tests. Emulate prefers-color-scheme for themes; there is no in-app theme toggle.

## Test Scenarios

### 1. Setup and Binary Selection

**Seed:** `tests/seed.spec.ts`

#### 1.1. Initial state and bit toggles

**File:** `tests/timer-setup/bit-selection.spec.ts`

**Steps:**
  1. Open /binarytimer/ in a fresh context.
    - expect: Setup displays binary bits, duration, Start, presets, and header controls; Start is disabled at zero.
  2. Toggle bits of different place values on and off.
    - expect: Duration equals the selected powers-of-two sum; Start enables with a selected bit and disables after clearing all bits.
  3. Select a bit and press Start.
    - expect: Countdown shows the corresponding duration and navigates to /binarytimer/?time=<seconds>.

#### 1.2. All presets and bit-group boundary

**File:** `tests/timer-setup/presets.spec.ts`

**Steps:**
  1. Select each preset: 1m, 2m, 3m, 5m, 10m, 15m, 30m, 60m.
    - expect: Each displays its exact duration and equivalent binary value; Start is enabled.
  2. Exercise values around a four-bit boundary, such as 15 and 16 seconds.
    - expect: Binary values remain accurate and groups expand without overlap or lost controls.

#### 1.3. Direct query duration and invalid values

**File:** `tests/timer-setup/query-parameter.spec.ts`

**Steps:**
  1. Open /binarytimer/?time=65, then separately test ?time=0, ?time=abc, and ?time=68719476735.
    - expect: Valid duration is displayed correctly; zero and invalid input do not crash or show NaN; maximum 36-bit input uses at most nine groups.

### 2. Countdown and Audio

**Seed:** `tests/seed.spec.ts`

#### 2.1. Countdown progresses and stops

**File:** `tests/countdown/progression-stop.spec.ts`

**Steps:**
  1. Start a 1m countdown from /binarytimer/ and wait two seconds.
    - expect: Time decreases once per second, bits match, and Stop is available.
  2. Press Stop.
    - expect: App returns to setup and timer ceases.

#### 2.2. Add each duration

**File:** `tests/countdown/add-time.spec.ts`

**Steps:**
  1. During a countdown, activate each Add time option: 1m, 2m, 3m, 5m, 10m, 15m, 30m, 60m.
    - expect: Remaining time increases by exactly the labeled duration and continues counting down.

#### 2.3. Completion audio, mute, and zero state

**File:** `tests/countdown/completion.spec.ts`

**Steps:**
  1. Open /binarytimer/?time=3 with audio permitted; repeat with mute enabled.
    - expect: Countdown reaches zero without going negative; sound plays when unmuted and is silent when muted; completion navigation still occurs.
  2. Open /binarytimer/?time=1 and observe the zero state.
    - expect: Completion is reported and Add time is unavailable or disabled at zero.

### 3. Stopwatch and Preferences

**Seed:** `tests/seed.spec.ts`

#### 3.1. Stopwatch counts up and stops

**File:** `tests/stopwatch/counting.spec.ts`

**Steps:**
  1. Open /binarytimer/, switch to stopwatch, start, wait three seconds, then stop.
    - expect: Presets and countdown add-time controls are absent; elapsed duration and bits count up; Stop returns to setup.

#### 3.2. Mode, hide, and mute persistence

**File:** `tests/preferences/persistence.spec.ts`

**Steps:**
  1. Switch modes, toggle Hide optional controls and Mute, then reload each state.
    - expect: Each preference persists after reload; hidden controls return after Show optional controls; muted audio stays silent.

#### 3.3. Edit countdown title

**File:** `tests/preferences/edit-title.spec.ts`

**Steps:**
  1. Start a countdown, hover to reveal Edit title, accept a custom title, reload, then discard edits, press Escape, and reset.
    - expect: Accepted title persists; Discard and Escape do not apply edits; reset restores Please stand by. Keyboard-only access to Edit title must also be tested and is expected to fail in the current build because the control is hover-revealed.
  2. Try an empty title and a long title.
    - expect: No crash, clipping, or overlap.

### 4. Accessibility, Themes, and Responsive Layout

**Seed:** `tests/seed.spec.ts`

#### 4.1. Keyboard access and focus

**File:** `tests/accessibility/keyboard-focus.spec.ts`

**Steps:**
  1. On /binarytimer/, navigate all controls using only Tab, Shift+Tab, Enter, and Space.
    - expect: Every intended action, including Edit title, is keyboard reachable with visible focus and logical order.

#### 4.2. Accessible names, states, and landmarks

**File:** `tests/accessibility/semantics.spec.ts`

**Steps:**
  1. Inspect setup, countdown, title-edit, and stopwatch accessibility trees.
    - expect: A main landmark is present; icon-only controls have useful names; each bit has a distinguishable name and programmatic 0/1 state; title textbox has a programmatic label.

#### 4.3. Dark and light system themes

**File:** `tests/accessibility/color-schemes.spec.ts`

**Steps:**
  1. Emulate dark and light prefers-color-scheme separately at /binarytimer/ and during countdown; then change the emulated scheme while open.
    - expect: Colors follow each system scheme and text/controls remain distinguishable without losing timer state. Live checks confirmed the root background/text change correctly in both schemes.

#### 4.4. Responsive, zoom, and reduced motion

**File:** `tests/accessibility/responsive.spec.ts`

**Steps:**
  1. Check setup and countdown at mobile, tablet, and desktop widths, at 200% zoom, and with prefers-reduced-motion.
    - expect: Content stays readable and controls usable without overlap, clipping, or animation-dependent information.

#### 4.5. Footer links

**File:** `tests/accessibility/footer-links.spec.ts`

**Steps:**
  1. Inspect footer links by keyboard and accessibility tools.
    - expect: Both links have descriptive text, correct destinations, and keyboard access.
