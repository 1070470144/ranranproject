# Tarot Mystic Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the tarot card page with a mysterious tarot animation style without changing business flow, AI behavior, storage, or login/config logic.

**Architecture:** Keep the change scoped to the existing `pages/tarot/tarot.vue` single-file component. Add decorative view layers in the template and CSS-only animations for ambient stars, deck aura, shuffle motion, card-back ornamentation, reveal flash, and answer entrance.

**Tech Stack:** uni-app Vue single-file component, rpx CSS, CSS keyframe animations, PowerShell static verification.

---

### Task 1: Static Animation Contract

**Files:**
- Create: `scripts/check-tarot-animations.ps1`
- Read: `pages/tarot/tarot.vue`

- [ ] **Step 1: Write the failing static check**

Create `scripts/check-tarot-animations.ps1` that reads `pages/tarot/tarot.vue` and verifies all new animation hooks:

```powershell
$path = Join-Path $PSScriptRoot '..\pages\tarot\tarot.vue'
$content = Get-Content -Raw -Path $path

$required = @(
  'mystic-sky',
  'mystic-orbit',
  'deck-aura',
  'back-rune',
  'card-glimmer',
  '@keyframes star-drift',
  '@keyframes orbit-spin',
  '@keyframes aura-pulse',
  '@keyframes card-reveal',
  '@keyframes glimmer-sweep'
)

$missing = $required | Where-Object { $content -notlike "*$_*" }

if ($missing.Count -gt 0) {
  Write-Error ("Missing tarot animation hooks: " + ($missing -join ', '))
  exit 1
}

Write-Output 'Tarot animation hooks verified.'
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `powershell -ExecutionPolicy Bypass -File scripts\check-tarot-animations.ps1`

Expected: FAIL, listing the missing animation hooks.

### Task 2: Mystic Tarot Animation CSS

**Files:**
- Modify: `pages/tarot/tarot.vue`

- [ ] **Step 1: Add ambient decorative layers**

Add a non-interactive `mystic-sky` layer as the first child inside `.page`, plus orbit rings around the deck and card-back rune/glimmer elements. These layers must not change text, steps, AI calls, cards, or data flow.

- [ ] **Step 2: Add CSS animations**

Add keyframes and class rules for:
- `star-drift`: slow background star drift
- `orbit-spin`: rotating tarot ring effect
- `aura-pulse`: pulsing deck glow during the ritual area
- `card-reveal`: subtle 3D reveal entrance for revealed cards
- `glimmer-sweep`: short light sweep over revealed cards

- [ ] **Step 3: Preserve existing flow**

Confirm no methods, cloud function calls, storage keys, or data structures are changed in this task.

### Task 3: Verification

**Files:**
- Read: `scripts/check-tarot-animations.ps1`
- Read: `pages/tarot/tarot.vue`

- [ ] **Step 1: Run the static check**

Run: `powershell -ExecutionPolicy Bypass -File scripts\check-tarot-animations.ps1`

Expected: PASS with `Tarot animation hooks verified.`

- [ ] **Step 2: Inspect git diff**

Run: `git diff -- pages/tarot/tarot.vue scripts/check-tarot-animations.ps1 docs/superpowers/plans/2026-06-16-tarot-mystic-animations.md`

Expected: Only tarot animation template/CSS, verification script, and plan doc changed.
