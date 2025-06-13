# Design System Documentation

This document outlines the implementation of our comprehensive design system, which provides a consistent visual language across our application.

## Table of Contents

- [Design Tokens](#design-tokens)
- [Typography](#typography)
- [Colors](#colors)
- [Spacing & Layout](#spacing--layout)
- [Components](#components)
- [Accessibility](#accessibility)
- [Usage Guidelines](#usage-guidelines)

## Design Tokens

Design tokens are the foundation of our design system. They are stored in two places:

1. **CSS Variables**: Defined in `app/globals.css`
2. **JSON Format**: Available in `design-tokens.json` for export to other platforms
3. **Tailwind Config**: Mapped in `tailwind.config.js` for use with Tailwind classes

### Using Design Tokens

```jsx
// Using CSS variables directly
<div style={{ color: 'var(--color-primary-500)' }}>Text</div>

// Using Tailwind classes (preferred)
<div className="text-primary-500">Text</div>
```

## Typography

Our typography system uses Inter as the primary font with a consistent type scale.

### Font Settings

- **Font Family**: Inter (system‑fallback: sans-serif)
- **Weights**: 300 Light, 400 Regular, 600 SemiBold, 700 Bold
- **Line Height**: 1.4–1.5× font size

### Type Scale

| Token | Size | Line Height | Weight | Tailwind Class |
|-------|------|-------------|--------|---------------|
| `font-h1` | 32px | 1.3 | 600 | `text-h1` |
| `font-h2` | 24px | 1.3 | 600 | `text-h2` |
| `font-body` | 16px | 1.5 | 400 | `text-body` |
| `font-caption` | 14px | 1.4 | 400 | `text-caption` |

### Usage

```jsx
// Using Tailwind classes
<h1 className="text-h1">Heading 1</h1>
<h2 className="text-h2">Heading 2</h2>
<p className="text-body">Body text</p>
<span className="text-caption">Caption text</span>

// Using CSS variables
<h1 style={{ 
  fontSize: 'var(--font-size-h1)',
  lineHeight: 'var(--line-height-h1)',
  fontWeight: 'var(--font-weight-h1)'
}}>Heading 1</h1>
```

## Colors

### Brand Colors

| Token | Value | Usage | Tailwind Class |
|-------|-------|-------|---------------|
| `color-primary-500` | #3366CC | Primary buttons, links, icons | `text-primary-500`, `bg-primary-500` |
| `color-primary-600` | #2B55A1 | Hover/focus state | `text-primary-600`, `bg-primary-600` |
| `color-accent-500` | #6A1B9A | Highlights, badges | `text-accent-500`, `bg-accent-500` |

### Semantic Colors

| Token | Value | Tailwind Class |
|-------|-------|---------------|
| `color-success-500` | #28A745 | `text-success-500`, `bg-success-500` |
| `color-warning-500` | #FFC107 | `text-warning-500`, `bg-warning-500` |
| `color-error-500` | #DC3545 | `text-error-500`, `bg-error-500` |

### Neutral Scale

| Token | Value | Tailwind Class |
|-------|-------|---------------|
| `color-neutral-100` | #F5F5F5 | `text-neutral-100`, `bg-neutral-100` |
| `color-neutral-500` | #9E9E9E | `text-neutral-500`, `bg-neutral-500` |
| `color-neutral-900` | #212121 | `text-neutral-900`, `bg-neutral-900` |

## Spacing & Layout

### Spacing System

- **Base unit**: 8px
- **Tokens**: `spacing-1` → 8px, `spacing-2` → 16px, … up to `spacing-10` → 80px

### Usage

```jsx
// Using Tailwind classes
<div className="p-4 m-2">
  {/* Padding of 32px, margin of 16px */}
</div>

// Using CSS variables
<div style={{ 
  padding: 'var(--spacing-4)',
  margin: 'var(--spacing-2)'
}}>
  {/* Padding of 32px, margin of 16px */}
</div>
```

## Components

Our design system includes pre-styled components that adhere to our design guidelines.

### Buttons

```jsx
<button className="btn btn-primary">Primary Button</button>
<button className="btn btn-secondary">Secondary Button</button>
<button className="btn btn-destructive">Destructive Button</button>
<button className="btn btn-primary btn-disabled">Disabled Button</button>
```

### Inputs

```jsx
<input className="input" placeholder="Regular input" />
<input className="input input-error" placeholder="Error input" />
```

### Cards

```jsx
<div className="card">
  <h2 className="text-h2">Card Title</h2>
  <p className="text-body">Card content goes here.</p>
</div>
```

### Alerts

```jsx
<div className="alert alert-success">
  <span>Success message</span>
</div>

<div className="alert alert-warning">
  <span>Warning message</span>
</div>

<div className="alert alert-error">
  <span>Error message</span>
</div>
```

## Accessibility

Our design system follows WCAG 2.1 AA guidelines:

- **Tap targets**: ≥ 44×44px
- **Text contrast**: ≥ 4.5:1
- Color is never the only indicator (always paired with text or icons)
- Keyboard navigation support
- Proper ARIA attributes

## Usage Guidelines

### Best Practices

1. **Use Tailwind classes when possible** for consistency and maintainability
2. **Avoid hardcoding values** that are available as design tokens
3. **Follow the component patterns** for consistent user experience
4. **Maintain accessibility** by following the guidelines

### Dark Mode Support

Our design system supports both light and dark modes. Dark mode is activated with the `.dark` class on the `html` element.

```jsx
// Toggle dark mode example
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
}
```

### Theming

For custom themes, modify the CSS variables in a scoped context:

```css
.custom-theme {
  --color-primary-500: #FF5722;
  --color-primary-600: #E64A19;
}
```

## Contributing to the Design System

When adding new components or modifying existing ones:

1. Update the design tokens if necessary
2. Ensure accessibility compliance
3. Test in both light and dark modes
4. Document the changes in this guide
