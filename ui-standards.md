# Frontend UI/UX Review Checklist & Standards Guide

## Purpose

This document defines the mandatory UI/UX, responsiveness, styling, and component architecture standards for the frontend application.

The goal is to ensure:
- Proper mobile/tablet responsiveness
- Consistent usage of MUI components
- Clean component structure
- Standardized styling architecture
- Better accessibility
- Production-ready UI behavior across all devices

---

# 1. Responsive Design Standards

## Mandatory Device Support

Every screen/component must be properly tested and supported for:

| Device Type | Width Range |
|---|---|
| Mobile Small | 320px - 375px |
| Mobile Large | 376px - 480px |
| Tablet | 481px - 1024px |
| Laptop | 1025px - 1440px |
| Large Screens | 1441px+ |

---

## Responsive Verification Checklist

### Components Must:
- Never overflow horizontally
- Never break layout alignment
- Never create unwanted scrollbars
- Never hide important content
- Maintain proper spacing on all devices
- Adapt layout using responsive breakpoints
- Keep buttons/input fields tappable on mobile
- Maintain readable typography on smaller screens

---

## Required MUI Breakpoints

Use MUI breakpoints only:

\`\`\`ts
theme.breakpoints.up('xs')
theme.breakpoints.up('sm')
theme.breakpoints.up('md')
theme.breakpoints.up('lg')
theme.breakpoints.up('xl')

Avoid hardcoded media queries unless absolutely necessary.

2. MUI Component Usage Rules
Mandatory Rules
Use MUI components wherever possible
Avoid raw HTML when equivalent MUI components exist
Use MUI layout system (Box, Grid, Stack, Container)
Use MUI Typography instead of plain <p>, <h1>, etc.
Use MUI Buttons instead of custom button implementations
Use MUI Dialog instead of custom modal implementations
Use MUI Table/DataGrid for tabular data
Use MUI Form components for all forms
Approved Components
Layout
Box
Stack
Grid
Container
Paper
Inputs
TextField
Select
Checkbox
Radio
Switch
Autocomplete
Navigation
Tabs
Drawer
Breadcrumbs
Pagination
Feedback
Snackbar
Alert
Skeleton
CircularProgress
LinearProgress
Data Display
Table
DataGrid
Card
Accordion
Tooltip
3. Styling Architecture Rules
Mandatory File Structure

Every component must follow:

ComponentName/
├── ComponentName.tsx
├── ComponentName.styles.ts
├── ComponentName.types.ts
├── index.ts
Styling Rules
MUST:
Keep all styles inside ComponentName.styles.ts
Use styled() from MUI or theme-based styling
Use theme spacing system
Use centralized colors from theme
Use reusable style constants
Use responsive values from theme breakpoints
MUST NOT:
Inline styles unless dynamic and unavoidable
Random hardcoded spacing
Hardcoded colors
CSS files
Tailwind mixed with MUI
Massive sx props everywhere
Example
export const Wrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
}));
4. Border Radius Standards
Mandatory Border Radius Rules
Allowed Radius:
borderRadius: 2
Rules:
Do NOT exceed MUI radius value 2
Avoid random values like 12px, 18px, 24px
Maintain design consistency across application
Cards, dialogs, buttons, tables should follow same radius system
5. Dialog / Modal Standards
Mandatory Dialog Rules
Dialog Must:
Be fully mobile responsive
Never overflow screen height
Never overflow screen width
Have proper padding on mobile devices
Support scrolling when content is large
Have accessible close action
Maintain proper spacing between actions
Be centered properly
Support keyboard accessibility
Mobile Dialog Rules
Required:
Full width on mobile
Proper responsive maxWidth
Padding adjustments for smaller screens

Example:

fullWidth
maxWidth="sm"
Dialog UX Standards
MUST:
Use clear title
Use proper action buttons
Have loading states
Prevent accidental closing during submit
Use consistent spacing
Keep action buttons visible
6. Table Standards
Table Responsiveness Rules

Tables must work properly across:

Mobile
Tablet
Desktop
Mandatory Table Requirements
Tables Must:
Support horizontal scrolling when required
Maintain readable column widths
Avoid breaking layouts
Keep actions accessible
Have sticky headers when needed
Use proper pagination
Handle empty states
Handle loading states
Handle large datasets efficiently
Mobile Table Behavior
Recommended:
Convert complex tables into cards on mobile
Hide non-essential columns on smaller screens
Use expandable rows if needed
7. Header/Navbar Standards
Header Must:
Be fully responsive
Never overflow
Never break alignment
Support mobile menu
Handle long titles properly
Keep actions visible
Maintain proper spacing
Mobile Header Rules
Required:
Hamburger menu for smaller screens
Proper collapsing behavior
Responsive typography
Avoid crowded action buttons
8. Form Standards
Forms Must:
Be fully responsive
Have proper label alignment
Support keyboard navigation
Show validation messages properly
Have accessible labels
Maintain consistent spacing
Validation Rules
Required:
Required field indicators
Error messages
Disabled states
Loading states
Proper input focus behavior
9. Typography Standards
Typography Rules
MUST:
Use MUI Typography component
Follow theme typography system
Maintain readable line heights
Use responsive typography
MUST NOT:
Random font sizes
Inconsistent font weights
Hardcoded typography styling
10. Spacing Standards
Use Theme Spacing Only
Correct:
theme.spacing(1)
theme.spacing(2)
theme.spacing(3)
Incorrect:
padding: '13px'
margin: '27px'
11. Accessibility Standards
Mandatory Accessibility Rules
Components Must:
Support keyboard navigation
Have proper focus states
Have aria labels where needed
Maintain color contrast
Support screen readers
Use semantic HTML structure
Accessibility Checklist
Verify:
Tab navigation works
Inputs are accessible
Buttons are accessible
Dialogs trap focus correctly
Tables are screen-reader friendly
12. Performance Standards
UI Performance Rules
MUST:
Avoid unnecessary re-renders
Use memoization where required
Lazy load heavy components
Optimize large tables/lists
Avoid unnecessary DOM nesting
13. Loading & Empty States
Every Screen Must Handle:
Loading state
Empty state
Error state
Success state
Recommended Components
Use:
Skeleton
CircularProgress
Alert
Snackbar
14. Code Quality Standards
Component Rules
Components Must:
Be reusable
Be modular
Have proper typings
Avoid large monolithic files
Follow single responsibility principle
TypeScript Rules
MUST:
Use strict typing
Avoid any
Use interfaces/types properly
Type all props
15. Responsive Testing Checklist
Before PR Approval Verify:
Mobile
iPhone SE
iPhone 14/15
Android small screen
Android large screen
Tablet
iPad
Android tablet
Desktop
1366px
1440px
1920px
16. UI Consistency Standards
Maintain Consistency For:
Button heights
Input heights
Card spacing
Typography
Icon sizes
Dialog widths
Table spacing
17. Error Handling UI Standards
Errors Must:
Be user-friendly
Be visible
Not break layout
Have retry options where needed
18. Animation Standards
Animation Rules
MUST:
Keep animations subtle
Use consistent durations
Avoid excessive animations
MUST NOT:
Distract users
Block interactions
Reduce performance
19. Dark Mode Compatibility (If Applicable)
Verify:
Colors remain accessible
Borders are visible
Typography remains readable
Shadows do not break UI
20. Final Review Checklist
Mandatory Final Verification
Verify:
 Fully responsive on all devices
 MUI components used properly
 styles.ts structure followed
 No inline random styling
 Border radius <= 2
 Tables responsive
 Dialog responsive
 Header responsive
 Accessibility implemented
 Proper loading states
 Proper empty states
 Proper error states
 No horizontal overflow
 Proper spacing consistency
 Typography consistency maintained
 Code reusable and modular
 TypeScript typing properly implemented
 No UI breaking on smaller screens
 All forms responsive
 Buttons accessible on mobile
 Scroll behavior works correctly
Review Decision Criteria
Approve ONLY IF:
All responsive checks pass
UI consistency is maintained
No layout breaking exists
Accessibility standards are followed
MUI standards are followed
Styling architecture rules are followed
Strict Violations
Immediate Rejection Conditions

Reject implementation if:

Inline styling abuse exists
Component breaks on mobile
Dialog overflows
Header breaks
Tables unusable on mobile
Hardcoded random styles exist
Border radius exceeds allowed values
Accessibility ignored
Responsive behavior missing
Massive unstructured component files exist