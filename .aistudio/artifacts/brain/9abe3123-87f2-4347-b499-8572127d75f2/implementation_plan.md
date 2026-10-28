# Layout Correction Implementation Plan: One-Screen Fit & Single Narration

## Status: COMPLETE

### Requirements Verified & Implemented:
1. **One-Screen 100vh Fit**:
   - `App.tsx` has `h-screen max-h-screen overflow-hidden` with fixed header and sub-header.
   - On desktop (`>= 1100px`), the page never scrolls vertically.
   - Each column scrolls internally only when needed.

2. **Left Column Fixed Order**:
   - a. Compact module controls in at most 2 tight rows.
   - b. Visualization canvas taking all flexible remaining height (`flex-1 min-h-0`).
   - c. Single-row Playback Bar directly under the canvas (Reset, Prev, Play/Pause, Next, Scrubber with "Step N / TOTAL", Speed 0.25x/0.5x/1x/2x, Auto-pause toggle). Always visible without scrolling.
   - d. Step Caption Card directly under the playback bar with fixed ~110px height (`h-[110px] min-h-[110px] max-h-[110px]`).

3. **Right Column & Single Narration**:
   - Removed duplicate "Step Narration" card from `InsightPanel.tsx` completely.
   - Exactly ONE step narration on the entire page (the Step Caption card).
   - High-contrast pseudocode text (`text-slate-800 dark:text-slate-200`) with auto-scrolling active line and clickable lines.
   - Collapsed "Telemetry & Complexity" row at the bottom with expand toggle.

4. **"About to happen" & Completion Cards**:
   - Dismissible "About to happen" intro card shown before Step 1 in the exact 110px slot.
   - Transition to active step narration without moving playback bar by even 1px.
   - Completion summary card displayed in the exact same 110px slot on the final step.

5. **Responsiveness (< 1100px)**:
   - Columns stack cleanly, and the Playback Bar stays sticky at the bottom for easy playback access.

6. **All 35 Unit Tests & TypeScript Check**:
   - 35/35 tests passing (`npm test`).
   - `tsc --noEmit` clean with 0 errors.
   - Verified across all 6 modules with visual browser inspection via Playwright.
