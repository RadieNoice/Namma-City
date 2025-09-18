Namma City - Urban Issue Reporter
A modern web application that enables citizens to report local urban issues like potholes, broken streetlights, or sanitation problems directly to city officials. Built with a professional design system and responsive user interface.
Features
Core Functionality

Issue Reporting: Citizens can quickly report urban problems with photos, descriptions, and location data
Admin Dashboard: City officials can track, manage, and resolve issues efficiently
Automated Routing: Issues are automatically sent to the appropriate department
Status Tracking: Real-time updates from initial report to resolution
Mobile Support: Optimized for both mobile and desktop usage

User Experience

Intuitive Interface: Clean, professional design with clear navigation
Responsive Design: Works seamlessly across all device sizes
Accessibility: Built with WCAG guidelines in mind
Fast Loading: Optimized performance with efficient CSS and animations

Design System
Typography

Primary Font: Inter (headings and UI elements)
Secondary Font: Merriweather (body text and readable content)
Font Weights: 300, 400, 500, 600, 700, 800

Color Palette
css/* Primary Colors */
--nc-primary: #7c83ff     /* Dynamic indigo accent */
--nc-secondary: #39c6c6   /* Aqua accent */
--nc-accent: #ff86a3      /* Coral/pink accent */

/* Neutral Colors */
--nc-bg: #f7fafc          /* Soft gray background */
--nc-surface: #ffffff     /* Card backgrounds */
--nc-text: #0f172a        /* Primary text */
--nc-text-muted: #475569  /* Secondary text */

/* Status Colors */
--nc-success: #22c55e     /* Success states */
--nc-warning: #f59e0b     /* Warning states */
--nc-danger: #ef4444      /* Error states */
Spacing System

Base Unit: 4px
Scale: 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
Usage: Consistent spacing throughout all components

File Structure
/styles
├── global.css          # Global theme and base styles
├── dashboard.css       # Dashboard-specific styling
├── navbar.css          # Navigation component styles
├── login.css           # Login page styles
├── signup.css          # Signup page styles
└── home.css            # Homepage styles
CSS Architecture
Design Principles

Mobile-First: Responsive design starting from mobile breakpoints
Component-Based: Modular CSS following BEM-like conventions
Performance: Optimized selectors and minimal repaints
Accessibility: Focus management and screen reader support
Consistency: Unified design tokens across all components

Key Components
Dashboard Container
css.dashboard-container {
  width: min(1200px, 92%);
  margin: 0 auto;
  padding: clamp(24px, 4vw, 48px) 0;
  display: grid;
  gap: var(--nc-space-6);
}
Issue Cards

Hover animations with subtle lift effects
Status indicators with color-coded badges
Responsive grid layout
Professional gradient accents

Loading States

Smooth spinner animations
Skeleton loading for better perceived performance
Accessible loading messages

Responsive Breakpoints
BreakpointWidthLayoutMobile< 720pxSingle columnTablet721px - 1024pxTwo columnsDesktop> 1025pxThree columns
Animation Guidelines
Transitions

Fast: 160ms for micro-interactions
Standard: 240ms for most transitions
Slow: 360ms for complex animations

Easing Functions

Standard: ease for most transitions
Bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55) for playful effects
Smooth: cubic-bezier(0.4, 0, 0.2, 1) for material-like motion

Browser Support

Modern Browsers: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
Features Used: CSS Grid, Custom Properties, Backdrop Filter
Fallbacks: Graceful degradation for older browsers

Performance Considerations
CSS Optimization

Uses CSS custom properties for consistent theming
Hardware-accelerated transforms for animations
Efficient selectors to minimize repaints
Print-friendly styles included

Loading Strategy

Critical CSS inlined for above-the-fold content
Progressive enhancement for advanced features
Reduced motion support for accessibility

Usage Instructions
Basic Setup

Include the global CSS file in your HTML head
Add component-specific CSS files as needed
Ensure proper HTML structure for components

Dashboard Implementation
html<div class="dashboard-container">
  <h1 id="dashboard-welcome">Welcome to Urban Issue Reporter</h1>
  <div class="issues-grid">
    <!-- Issue cards go here -->
  </div>
</div>
Issue Card Structure
html<div class="issue-card">
  <div class="issue-header">
    <h3 class="issue-title">Issue Title</h3>
    <span class="status-indicator status-pending">Pending</span>
  </div>
  <p class="issue-description">Issue description...</p>
  <div class="issue-meta">
    <span class="issue-location">Location</span>
    <span class="issue-date">Date</span>
  </div>
</div>
Customization
Color Themes
To customize colors, modify the CSS custom properties in global.css:
css:root {
  --nc-primary: #your-color;
  --nc-secondary: #your-color;
  /* Update other variables as needed */
}
Typography
Update font families in the CSS custom properties:
css:root {
  --nc-font-sans: "YourFont", system-ui, sans-serif;
  --nc-font-serif: "YourSerifFont", Georgia, serif;
}
Accessibility Features

Keyboard Navigation: All interactive elements are keyboard accessible
Focus Management: Clear focus indicators throughout
Screen Reader Support: Proper ARIA labels and semantic HTML
Reduced Motion: Respects user preferences for reduced motion
Color Contrast: All text meets WCAG AA standards

Contributing
When adding new styles:

Follow the existing naming conventions
Use CSS custom properties for consistent values
Ensure responsive design across all breakpoints
Test with screen readers and keyboard navigation
Include appropriate fallbacks for older browsers

License
This project is licensed under the MIT License - see the LICENSE file for details.
Support
For technical support or questions about the design system, please contact the development team or create an issue in the project repository.
