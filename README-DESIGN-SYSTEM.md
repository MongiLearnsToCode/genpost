# Design System Implementation

This document provides an overview of the design system implementation for the GenPost project.

## Overview

The design system has been implemented based on the comprehensive style guide specifications. It provides a consistent visual language across the application with carefully defined tokens for colors, typography, spacing, and components.

## Files Structure

- **`/app/globals.css`**: Contains all CSS variables and base styles
- **`/tailwind.config.js`**: Tailwind configuration with design tokens
- **`/design-tokens.json`**: Source of truth for design tokens in JSON format
- **`/DESIGN-SYSTEM.md`**: Detailed documentation of the design system
- **`/components/ui/design-system.tsx`**: Reusable UI components
- **`/components/theme-provider.tsx`**: Theme provider for light/dark mode
- **`/components/ui/theme-toggle.tsx`**: Theme toggle component
- **`/lib/theme-utils.ts`**: Utility functions for theme management
- **`/app/design-system/page.tsx`**: Design system showcase page

## Getting Started

1. Visit the design system showcase page at `/design-system` to see all components and tokens in action
2. Use the components from `/components/ui/design-system.tsx` in your application
3. Reference the design tokens using Tailwind classes or CSS variables

## Design Tokens

The design system is built around a set of design tokens that define the visual properties:

- **Colors**: Brand colors, semantic colors, and neutral scale
- **Typography**: Font family, weights, sizes, and line heights
- **Spacing**: 8px base unit with increments
- **Elevation**: Shadow levels for depth
- **Border Radius**: Consistent rounding

## Usage Examples

### Using Components

```jsx
import { Button, Card, Heading1 } from '../components/ui/design-system';

export default function MyPage() {
  return (
    <Card>
      <Heading1>Hello World</Heading1>
      <Button variant="primary">Click Me</Button>
    </Card>
  );
}
```

### Using Tailwind Classes

```jsx
<div className="bg-primary-500 text-white p-4 rounded">
  <h2 className="text-h2">Using Tailwind Classes</h2>
  <p className="text-body">This uses the design system tokens via Tailwind.</p>
</div>
```

### Using CSS Variables

```jsx
<div style={{ 
  backgroundColor: 'var(--color-primary-500)',
  color: 'white',
  padding: 'var(--spacing-4)',
  borderRadius: 'var(--radius)'
}}>
  <h2 style={{ 
    fontSize: 'var(--font-size-h2)',
    lineHeight: 'var(--line-height-h2)',
    fontWeight: 'var(--font-weight-h2)'
  }}>Using CSS Variables</h2>
</div>
```

## Theme Support

The design system supports both light and dark modes. The theme can be toggled using the `ThemeToggle` component:

```jsx
import { ThemeToggle } from '../components/ui/theme-toggle';

export default function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

## Accessibility

All components are designed with accessibility in mind:

- Minimum tap target size of 44×44px
- WCAG 2.1 AA compliant color contrast
- Keyboard navigation support
- Proper ARIA attributes

## Customization

To customize the design system for specific needs:

1. Modify the CSS variables in `globals.css`
2. Update the design tokens in `design-tokens.json`
3. Adjust the Tailwind configuration in `tailwind.config.js`

## Further Documentation

For more detailed information, refer to the [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) file.
