# Landing Page Design Guide

This document outlines the design principles and patterns used in the landing page redesign. Follow these guidelines when creating or refactoring pages to maintain visual consistency.

---

## Core Philosophy

**Understated elegance over visual noise.**

The design prioritizes:
- **Clarity** — Every element serves a purpose
- **Restraint** — Whitespace is a feature, not a gap to fill
- **Subtlety** — Effects should be felt, not seen

---

## Color & Opacity System

### Background Hierarchy

Use low-opacity whites to create depth without harsh contrasts:

```
Background layers (darkest to lightest):
├── Base:        transparent (inherits from layout)
├── Surface:     bg-white/[0.02]  — barely visible lift
├── Elevated:    bg-white/[0.05]  — cards, containers
└── Highlighted: bg-white/[0.08]  — hover states, badges
```

### Border Opacity

Borders should be nearly invisible at rest, more visible on interaction:

```
Border states:
├── Default:     border-white/[0.06] or border-white/[0.08]
├── Hover:       border-white/[0.10] to border-white/[0.15]
└── Focus:       Use ring utilities instead
```

### Text Opacity

Create visual hierarchy through opacity, not font weight alone:

```
Text hierarchy:
├── Primary:     text-white           — headlines, key info
├── Secondary:   text-white/80        — subheadings
├── Tertiary:    text-white/50        — descriptions, body
├── Muted:       text-white/40        — supporting text
└── Subtle:      text-white/30        — labels, captions
```

### Accent Colors

Use sparingly for interactive elements and highlights:

```
Accents:
├── Primary:     text-sky-400         — links, icons, CTAs
├── Hover:       text-sky-400/70      — subtle hover states
└── Glow:        from-sky-500/[0.05]  — gradient overlays
```

---

## Spacing Patterns

### Section Spacing

```jsx
// Hero sections
<section className="pb-16 pt-8">

// Content sections
<section className="mb-16">

// Footer/closing sections
<footer className="py-8">
```

### Component Internal Spacing

```jsx
// Cards
<div className="p-8">           // Large cards (feature cards)
<div className="p-5">           // Small cards (bento cards)

// Between icon and content
<div className="mb-6">          // Icon to title (large cards)
<div className="gap-4">         // Icon beside content (small cards)
```

---

## Component Patterns

### Cards

**Large Feature Cards** — Use for primary CTAs and main features:

```jsx
<div className={cn(
  // Base styles
  'rounded-2xl border border-white/[0.08] p-8',
  'bg-gradient-to-b from-white/[0.05] to-transparent',

  // Transitions
  'transition-all duration-500 ease-out',

  // Hover state
  'hover:border-white/[0.15]',
  'hover:from-white/[0.08]',
  'hover:shadow-[0_0_40px_-12px_rgba(255,255,255,0.1)]'
)}>
```

**Small Bento Cards** — Use for grids, lists, metadata:

```jsx
<div className={cn(
  'rounded-xl border border-white/[0.06] p-5',
  'bg-white/[0.02]',
  'transition-all duration-300',
  'hover:border-white/[0.1] hover:bg-white/[0.04]'
)}>
```

### Icons

Wrap icons in subtle containers:

```jsx
// Large card icons
<div className="rounded-xl bg-white/[0.05] p-3 ring-1 ring-white/[0.08]">
  <Icon className="h-6 w-6 text-sky-400" />
</div>

// Small card icons
<div className="rounded-lg bg-white/[0.05] p-2.5">
  <Icon className="h-5 w-5 text-white/40 group-hover:text-sky-400/70" />
</div>
```

### Badges

```jsx
<span className="rounded-full bg-white/[0.08] px-3 py-1 text-xs font-medium text-white/60">
  Coming soon
</span>
```

---

## Typography

### Headlines

```jsx
// Page title — bold, large, with contrast trick
<h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
  Primary text, <span className="text-white/40">secondary text.</span>
</h1>

// Section headers — understated, uppercase, tracked
<p className="text-xs font-medium uppercase tracking-widest text-white/30">
  Section label
</p>
```

### Body Text

```jsx
// Descriptions
<p className="text-sm leading-relaxed text-white/50">

// Card titles
<h3 className="text-xl font-semibold tracking-tight text-white">

// Small card titles
<h4 className="text-sm font-medium text-white/80">
```

---

## Animation Guidelines

### Transition Durations

```
Fast (micro-interactions):     duration-300
Standard (cards, buttons):     duration-500
Slow (page transitions):       duration-700
```

### Easing

Always use `ease-out` for hover states — feels responsive entering, smooth exiting.

### What to Animate

**Do animate:**
- Border opacity
- Background opacity/color
- Shadow spread
- Transform (translate, scale)
- Opacity

**Don't animate:**
- Text color (use opacity instead)
- Layout properties (width, height, padding)
- Font size

### Hover State Pattern

```jsx
// The group pattern for child animations
<div className="group">
  {/* This fades in on hover */}
  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">

  {/* This translates on hover */}
  <svg className="transition-transform duration-300 group-hover:translate-x-1">
</div>
```

---

## Layout Patterns

### Centered Container

```jsx
<div className="mx-auto max-w-5xl px-4">
```

### Responsive Grids

```jsx
// Two-column feature grid
<div className="grid gap-6 sm:grid-cols-2">

// Four-column bento grid
<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
```

### Section Dividers

Use borders, not `<hr>` elements:

```jsx
<footer className="border-t border-white/[0.06] py-8">
```

---

## Copywriting Style

### Headlines
- Short, punchy, memorable
- Use periods for finality: "Weather, simplified."
- Contrast important/less-important with opacity

### Descriptions
- One to two sentences max
- Focus on user benefit, not technical details
- Use active voice

### Labels
- Uppercase for section labels
- Sentence case for everything else
- Avoid exclamation marks

**Examples:**
```
Good: "Track conditions across cities you care about."
Bad:  "This app lets you track weather conditions for multiple cities!"

Good: "Built with"
Bad:  "Technologies Used"

Good: "Crafted for clarity. Designed for focus."
Bad:  "Made with love ❤️"
```

---

## Checklist for New Pages

When creating a new page, verify:

- [ ] Container is centered with `max-w-5xl mx-auto px-4`
- [ ] Text uses the opacity hierarchy (not multiple gray colors)
- [ ] Cards use the standard border/background opacity patterns
- [ ] Hover states use `duration-500 ease-out`
- [ ] Icons are wrapped in subtle containers
- [ ] Section spacing follows the pattern (pt/pb for sections)
- [ ] No unnecessary visual elements (decorations, dividers)
- [ ] Copy is concise and benefit-focused

---

## File Structure

```
src/components/landing/
├── feature-card.jsx    — Large clickable cards
├── bento-card.jsx      — Small grid cards + BentoGrid wrapper
├── index.js            — Exports
└── DESIGN_GUIDE.md     — This file
```

When adding new landing components, export them from `index.js`.
