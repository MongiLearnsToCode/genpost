"use client";

import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  Card,
  Alert,
  Heading1,
  Heading2,
  BodyText,
  Caption,
  Badge,
  Skeleton,
  Icon,
  Grid,
  Container
} from '../../components/ui/design-system';
import { ThemeToggle } from '../../components/ui/theme-toggle';

// Client-side only theme toggle button with hydration safety
function ThemeToggleButton() {
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration errors by only showing the button after mounting
  useEffect(() => setMounted(true), []);
  
  if (!mounted) {
    return <div className="h-9 w-24" />; // Placeholder with same dimensions
  }
  
  return <ThemeToggle />;
}

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Container>
        <div className="py-8">
          <Heading1 className="mb-2">Design System</Heading1>
          <BodyText className="text-neutral-600 mb-8">
            A comprehensive showcase of our design system components and tokens.
          </BodyText>

          {/* Color Palette Section */}
          <section className="mb-12">
            <Heading2 className="mb-4">Color Palette</Heading2>
            
            <div className="mb-6">
              <Caption className="block mb-2 font-semibold">Brand Colors</Caption>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Primary 500" color="#3366CC" token="color-primary-500" />
                <ColorSwatch name="Primary 600" color="#2B55A1" token="color-primary-600" />
                <ColorSwatch name="Accent 500" color="#6A1B9A" token="color-accent-500" />
              </div>
            </div>
            
            <div className="mb-6">
              <Caption className="block mb-2 font-semibold">Semantic Colors</Caption>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch name="Success 500" color="#28A745" token="color-success-500" />
                <ColorSwatch name="Warning 500" color="#FFC107" token="color-warning-500" />
                <ColorSwatch name="Error 500" color="#DC3545" token="color-error-500" />
              </div>
            </div>
            
            <div>
              <Caption className="block mb-2 font-semibold">Neutral Scale</Caption>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ColorSwatch name="Neutral 100" color="#F5F5F5" token="color-neutral-100" />
                <ColorSwatch name="Neutral 300" color="#D4D4D4" token="color-neutral-300" />
                <ColorSwatch name="Neutral 500" color="#9E9E9E" token="color-neutral-500" />
                <ColorSwatch name="Neutral 700" color="#616161" token="color-neutral-700" />
                <ColorSwatch name="Neutral 900" color="#212121" token="color-neutral-900" />
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section className="mb-12">
            <Heading2 className="mb-4">Typography</Heading2>
            
            <Card className="mb-6 p-6">
              <div className="mb-6">
                <Caption className="block mb-2 font-semibold">Font Family: Inter</Caption>
                <div className="flex flex-wrap gap-4">
                  <div className="p-2 bg-neutral-100 rounded">
                    <span className="font-light">Light 300</span>
                  </div>
                  <div className="p-2 bg-neutral-100 rounded">
                    <span className="font-regular">Regular 400</span>
                  </div>
                  <div className="p-2 bg-neutral-100 rounded">
                    <span className="font-semibold">SemiBold 600</span>
                  </div>
                  <div className="p-2 bg-neutral-100 rounded">
                    <span className="font-bold">Bold 700</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Caption className="block mb-2 font-semibold">Type Scale</Caption>
                <div className="space-y-4">
                  <div className="p-2 bg-neutral-100 rounded">
                    <Heading1>Heading 1 (32px)</Heading1>
                    <Caption className="text-neutral-500">font-size: var(--font-size-h1); line-height: var(--line-height-h1); font-weight: var(--font-weight-h1);</Caption>
                  </div>
                  <div className="p-2 bg-neutral-100 rounded">
                    <Heading2>Heading 2 (24px)</Heading2>
                    <Caption className="text-neutral-500">font-size: var(--font-size-h2); line-height: var(--line-height-h2); font-weight: var(--font-weight-h2);</Caption>
                  </div>
                  <div className="p-2 bg-neutral-100 rounded">
                    <BodyText>Body Text (16px)</BodyText>
                    <Caption className="text-neutral-500">font-size: var(--font-size-body); line-height: var(--line-height-body); font-weight: var(--font-weight-body);</Caption>
                  </div>
                  <div className="p-2 bg-neutral-100 rounded">
                    <Caption>Caption Text (14px)</Caption>
                    <Caption className="text-neutral-500">font-size: var(--font-size-caption); line-height: var(--line-height-caption); font-weight: var(--font-weight-caption);</Caption>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Spacing Section */}
          <section className="mb-12">
            <Heading2 className="mb-4">Spacing System</Heading2>
            
            <Card className="mb-6 p-6">
              <Caption className="block mb-4 font-semibold">Base unit: 8px</Caption>
              <div className="flex flex-wrap items-end gap-4">
                {[1, 2, 3, 4, 5].map((size) => (
                  <div key={size} className="flex flex-col items-center">
                    <div 
                      className="bg-primary-500" 
                      style={{ 
                        width: `${size * 8}px`, 
                        height: `${size * 8}px` 
                      }}
                    />
                    <Caption className="mt-2">{`spacing-${size}`}</Caption>
                    <Caption className="text-neutral-500">{`${size * 8}px`}</Caption>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          {/* Components Section */}
          <section className="mb-12">
            <Heading2 className="mb-4">Components</Heading2>
            
            {/* Buttons */}
            <Card className="mb-6 p-6">
              <Caption className="block mb-4 font-semibold">Buttons</Caption>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="destructive">Destructive Button</Button>
                <Button variant="primary" disabled>Disabled Button</Button>
              </div>
            </Card>
            
            {/* Inputs */}
            <Card className="mb-6 p-6">
              <Caption className="block mb-4 font-semibold">Inputs</Caption>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Regular input" />
                <Input placeholder="Disabled input" disabled />
                <Input placeholder="With error" error="This field is required" />
              </div>
            </Card>
            
            {/* Alerts */}
            <Card className="mb-6 p-6">
              <Caption className="block mb-4 font-semibold">Alerts</Caption>
              <div className="space-y-4">
                <Alert variant="success">
                  <div>
                    <strong>Success!</strong> Your changes have been saved.
                  </div>
                </Alert>
                <Alert variant="warning">
                  <div>
                    <strong>Warning!</strong> Your session is about to expire.
                  </div>
                </Alert>
                <Alert variant="error">
                  <div>
                    <strong>Error!</strong> There was a problem processing your request.
                  </div>
                </Alert>
              </div>
            </Card>
            
            {/* Badges */}
            <Card className="mb-6 p-6">
              <Caption className="block mb-4 font-semibold">Badges</Caption>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="error">Error</Badge>
              </div>
            </Card>
            
            {/* Skeleton Loading */}
            <Card className="mb-6 p-6">
              <Caption className="block mb-4 font-semibold">Skeleton Loading</Caption>
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          </section>

          {/* Accessibility Section */}
          <section className="mb-12">
            <Heading2 className="mb-4">Accessibility</Heading2>
            <Card className="p-6">
              <ul className="list-disc pl-5 space-y-2">
                <li>All interactive elements have minimum size of 44×44px</li>
                <li>Text contrast meets WCAG 2.1 AA standard (4.5:1)</li>
                <li>Color is never the only indicator (paired with text/icons)</li>
                <li>All components support keyboard navigation</li>
                <li>Proper ARIA attributes are included</li>
              </ul>
            </Card>
          </section>

          {/* Dark Mode Toggle */}
          <section className="mb-12">
            <Heading2 className="mb-4">Theme Toggle</Heading2>
            <Card className="p-6">
              <ThemeToggleButton />
              <Caption className="block mt-4 text-neutral-500">
                Click the button above to toggle between light and dark mode.
              </Caption>
            </Card>
          </section>
        </div>
      </Container>
    </div>
  );
}

// Helper component for color swatches
function ColorSwatch({ name, color, token }: { name: string; color: string; token: string }) {
  return (
    <div className="flex flex-col">
      <div 
        className="h-16 rounded-t-md" 
        style={{ backgroundColor: color }}
      />
      <div className="bg-white p-2 rounded-b-md border border-t-0 border-neutral-200">
        <Caption className="font-semibold">{name}</Caption>
        <Caption className="text-neutral-500 block">{color}</Caption>
        <Caption className="text-neutral-500 block text-xs">{`var(--${token})`}</Caption>
      </div>
    </div>
  );
}
