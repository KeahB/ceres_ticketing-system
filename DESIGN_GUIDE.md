# Ceres Liner UI/UX Design Guide

## Brand Overview
Ceres Liner is a professional bus ticketing system with a modern, clean interface designed for conductors and administrators. The visual language emphasizes efficiency, trust, and clarity.

---

## Color Palette

### Primary Colors
- **Bright Yellow (#FFEB3B)**: Primary brand color used for logos, buttons, and CTAs (Dominant)
- **Dark Yellow (#FDD835)**: Darker shade for hover states and depth
- **Light Yellow (#FFFF8D)**: Lighter shade for highlights and accents

### Neutral Colors
- **Dark Background (#121212)**: Main background color for dark theme
- **Surface (#1E1E1E)**: Cards and component backgrounds
- **Light Surface (#2A2A2A)**: Slightly elevated surfaces
- **White Text (#FFFFFF)**: Primary text color
- **Gray Text (#B0B0B0)**: Secondary text
- **Dark Gray Text (#808080)**: Tertiary text

### Accent & Status Colors
- **Black (#000000)**: Secondary accent for contrast and depth
- **Success (#4CAF50)**: Positive actions and statuses
- **Warning (#FFC107)**: Caution and pending states
- **Error (#F44336)**: Errors and destructive actions
- **Info (#2196F3)**: Informational messages

---

## Typography

### Font Hierarchy
- **Header Large** (28px, Bold): Page titles
- **Header Medium** (24px, Bold): Section headers
- **Header Small** (18px, Semi-bold): Subsection titles
- **Body Large** (16px, Medium): Primary content
- **Body Medium** (14px, Regular): Secondary content
- **Body Small** (12px, Regular): Tertiary content
- **Label** (13px, Semi-bold): Form labels and buttons
- **Caption** (11px, Regular): Help text and metadata

---

## Spacing System

- **XS**: 4px - Minimal spacing
- **SM**: 8px - Small gaps
- **MD**: 16px - Standard spacing
- **LG**: 24px - Large sections
- **XL**: 32px - Extra large spacing
- **XXL**: 48px - Page margins

---

## Component Styles

### Buttons
All buttons use the system's spacing and radius values:
- **Primary Button**: Yellow background with black text
- **Secondary Button**: Bordered with yellow outline
- **Tertiary Button**: Text-only with yellow color
- **Disabled State**: Reduced opacity

### Input Fields
- Light surface background with borders
- Icon prefix for context
- Focused state with yellow accent border
- Placeholder text in gray

### Cards
- Surface background color
- Border-left accent in yellow color
- Rounded corners (12px)
- Shadow elevation for depth

### Status Badges
- Green for active
- Orange for pending
- Red for inactive/errors
- Inline padding with rounded backgrounds

---

## Screen Layouts

### Login & Signup Screens
- Centered logo at top
- Form fields with consistent spacing
- Call-to-action buttons below
- Footer with version and branding

### Admin Dashboard
- Header with title and logout button
- Statistics cards in grid layout
- Conductor list with search
- Edit/Delete actions per row
- Modal for editing details

### Conductor Signup
- Multi-step form with validation
- Form sections clearly labeled
- Visual feedback on input
- Terms agreement checkbox
- Clear error messaging

---

## Interactive Elements

### Transitions
- Smooth animations for state changes
- Fade effects for modal appearances
- Button press feedback with opacity

### Feedback
- Success alerts for completed actions
- Error alerts with clear messages
- Loading states with indicators
- Toast notifications for quick feedback

---

## Accessibility Considerations

- High contrast text on backgrounds
- Clear visual hierarchy
- Large touch targets (minimum 48px)
- Clear labeling for all inputs
- Descriptive button text
- Semantic icon usage with complementary text

---

## Dark Theme Benefits

- Reduced eye strain during extended use
- Professional appearance for business applications
- Best practices for mobile conductor app usage
- Consistent night mode experience across platform

---

## Implementation Notes

The design system is implemented through:
- `theme/ceresTheme.js`: Centralized color and typography constants
- Component styling files: Consistent spacing using system values
- Lucide React Native icons: Professional icon library
- React Navigation: Consistent navigation patterns

All new components should use the theme constants for consistency and easy future updates.
