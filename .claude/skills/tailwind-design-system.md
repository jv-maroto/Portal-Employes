---
name: tailwind-design-system
description: Tailwind CSS design system guidelines for consistent, professional UI components.
---

# Tailwind Design System

## Color System
- Use a consistent color palette with semantic naming
- Define primary, secondary, accent, success, warning, error colors
- Use shades (50-950) for depth and hierarchy
- Dark mode: use `dark:` variants consistently

## Typography Scale
- Use consistent font sizes: text-xs through text-6xl
- Establish heading hierarchy with font-weight and size
- Use `tracking-` and `leading-` for optimal readability
- Limit font families to 2 max (display + body)

## Spacing System
- Use consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Prefer gap over margin for flex/grid layouts
- Use padding consistently within component types

## Component Patterns
- Cards: rounded-xl shadow-sm border with hover:shadow-md transition
- Buttons: clear hierarchy (primary solid, secondary outline, ghost)
- Inputs: consistent border, focus:ring-2 focus:ring-primary
- Badges: rounded-full px-2.5 py-0.5 text-xs font-medium

## Layout Principles
- Mobile-first responsive: sm: md: lg: xl: breakpoints
- Use grid for page layouts, flex for component internals
- Max-width containers: max-w-7xl mx-auto px-4
- Consistent section spacing: py-12 md:py-16 lg:py-24

## Animation & Transitions
- Default transition: transition-all duration-200 ease-in-out
- Hover states: scale, shadow, color shifts
- Page transitions: fade-in with staggered delays
- Loading states: animate-pulse for skeletons

## Best Practices
- Extract repeated patterns into @apply or component classes
- Use group and peer for parent/sibling-based styling
- Prefer utility classes over custom CSS
- Use ring utilities for focus indicators (accessibility)
