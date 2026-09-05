# Design Document - CareConnect Maharashtra

## 1. Design Philosophy
The visual identity of CareConnect is **Clinical, Trustworthy, and Accessible**. It is a tool for healthcare professionals in high-stress rural environments. It must prioritize legibility and utility over aesthetic flourishes.

**Core Principle**: Information Hierarchy. The most critical information (Patient Priority, Referral Status) must be visible at a glance.

## 2. Visual Identity
- **Atmosphere**: Clean, professional, medical.
- **Avoiding "AI-Generic"**: No overly rounded "bento boxes" or neon gradients. Use a structured, grid-based layout that feels like a medical record.

## 3. Color Palette
- **Primary (Trust/Health)**: 
  - Deep Teal: `#0D9488` (Primary actions, headers)
  - Soft Mint: `#F0FDF4` (Backgrounds, success states)
- **Secondary (Neutral)**:
  - Slate Gray: `#64748B` (Secondary text, borders)
  - Off-White: `#F8FAFC` (Main background)
- **Semantic Colors**:
  - **Danger/High Priority**: `#DC2626` (Red) - Use sparingly for critical alerts.
  - **Warning/Medium Priority**: `#D97706` (Amber).
  - **Info/Low Priority**: `#2563EB` (Blue).
  - **Success/Closed**: `#16A34A` (Green).

## 4. Typography
- **Primary Font**: Inter or System Sans-Serif.
- **Hierarchy**:
  - **Headings**: Bold, Slate-900, clear contrast.
  - **Body**: Regular, Slate-700, optimized for readability.
  - **Mono**: For Referral IDs and clinical codes.
- **Sizing**: 
  - Base: `16px`.
  - Small: `14px` (for labels/meta).
  - Large: `20px+` (for headings).

## 5. Component Design

### 5.1 Cards
- **Style**: White background, thin Slate-200 border, subtle shadow (`shadow-sm`).
- **Usage**: Patient summaries, Facility details.

### 5.2 Buttons
- **Primary**: Teal background, white text, rounded-md.
- **Secondary**: Slate-100 background, Slate-700 text.
- **Danger**: Red background, white text.

### 5.3 Status Badges
- Small, pill-shaped, high-contrast background with matching text.
- Example: `[ ACCEPTED ]` (Green bg, Green-900 text).

### 5.4 Inputs & Forms
- **Style**: Bordered, focused state with teal ring.
- **Validation**: Red border for errors, clear error text below.

## 6. Key Page Layouts

### 6.1 Patient Triage Page
- **Left Column**: Symptom input and patient details.
- **Right Column**: AI recommendation card with a "Confirm" button and a "Manual Override" option.

### 6.2 Referral Timeline
- **Vertical Stepper**: A visual path showing the journey from `SENT` $\rightarrow$ `ACCEPTED` $\rightarrow$ `CLOSED`.
- **State Indicators**: Completed steps are Green; current step is Teal; pending steps are Gray.

### 6.3 Facility Map
- **Full-screen map** with markers colored by care level.
- **Side Panel**: List of ranked facilities with "Match Score" and "Recommendation Explanation".

### 6.4 Dashboard
- **Top Row**: KPI tiles (Total, Closed, Leakage Rate).
- **Middle**: Bar chart of priority distribution.
- **Bottom**: Table of "Overdue" or "Lost-to-follow-up" referrals requiring action.

## 7. Responsive & Accessibility
- **Mobile First**: All forms and tables must be usable on a 6-inch screen.
- **Contrast**: All text must meet WCAG AA standards.
- **Touch Targets**: Buttons minimum `44x44px`.

## 8. Interaction States
- **Loading**: Skeleton screens for data-heavy tables.
- **Empty States**: Helpful illustrations and "Create First Patient" CTAs.
- **Error States**: Clear, non-technical messages with "Retry" options.
