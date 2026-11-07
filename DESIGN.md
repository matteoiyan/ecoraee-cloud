---
name: EcoRAEE Cloud
description: A compact Spanish-language interface for local RAEE operations and traceability.
colors:
  paper: "#f3f1f5"
  surface: "#ffffff"
  ink: "#131216"
  steel: "#77757f"
  line: "#ebe9ef"
  brand-blue: "#315dea"
  brand-blue-deep: "#2448b7"
  brand-blue-tint: "#e8edff"
  success: "#23a36b"
  danger: "#d44350"
  navigation-surface: "#ffffff"
  navigation-active: "#121216"
  muted-blue: "#8eabff"
  status-neutral: "#f0eff2"
  status-complete: "#e6f6ed"
  status-danger: "#fde9eb"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.45
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.45
  code:
    fontFamily: "JetBrains Mono, ui-monospace, Consolas, monospace"
    fontSize: "0.86em"
    fontWeight: 500
    letterSpacing: "-0.01em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  dialog: "18px"
  pill: "99px"
spacing:
  xxs: "2px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "18px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.brand-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
    height: "40px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "17px 19px"
  status-text:
    textColor: "#55545c"
    typography: "Inter, 12px, 500"
---

# Design System: EcoRAEE Cloud

## Overview

**Creative North Star: “Ciclo a la vista”**

EcoRAEE Cloud is a compact operations interface for academic teams and administrators tracking electrical and electronic waste. Its visual language follows the supplied dashboard references: Inter labels, rounded white panels on a pale lilac-gray surface, royal-blue actions, and near-black emphasis. JetBrains Mono distinguishes traceability codes and measured values.

Cool neutral work surfaces and fine outlines organize dense records. A compact horizontal pill navigation sits above a white side rail; bright blue marks active tabs, bars, and primary actions, while black anchors selected sidebar items and featured metrics. Keep the interface in Spanish and use its local-data context as product information, not decoration.

**Key Characteristics:**

- Compact, calm operational density
- Royal blue, black, and white on cool neutral surfaces
- Rounded panels, pill controls, and restrained shadows
- Lifecycle and traceability details remain legible at narrow widths

## Colors

The palette pairs royal blue and near-black with white and pale lilac-gray; green and red remain limited to semantic success and error states.

### Primary

- **Royal Blue** (`#315dea`): Selected top tabs, primary actions, active lifecycle stages, bars, and links.
- **Blue Deep** (`#2448b7`): High-emphasis blue text and hover state for primary buttons.

### Secondary

- **Blue Tint** (`#e8edff`): Active workflow text and focus states.

### Neutral

- **Cool Paper** (`#f3f1f5`): Application work area.
- **White Surface** (`#ffffff`): Cards, fields, and dialogs.
- **Near Black** (`#131216`): Primary text and selected side navigation.
- **Steel** (`#77757f`): Supporting text and secondary labels.
- **Fine Line** (`#ebe9ef`): Borders, dividers, and inactive lifecycle rail.
- **Navigation White** (`#ffffff`): Header and sidebar surfaces.

### Named Rules

**The Focus Rule.** Keep vivid blue for actionable focus and progress, black for selected side navigation and featured totals, and semantic green/red for outcome states.

## Typography

**Display Font:** Inter (with ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif fallbacks)
**Body Font:** Inter (same fallback stack)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Consolas, monospace fallbacks)

**Character:** Inter keeps the compact dashboard labels and data legible. JetBrains Mono is reserved for traceability codes and measured values, where its distinct rhythm helps separate identifiers from prose.

### Hierarchy

- **Display** (700, 27px, 1.15 line-height, -0.015em): Page heading.
- **Title** (700, 15px): Card and section headings.
- **Body** (400, 15px, 1.45 line-height): Default interface copy.
- **Label** (600, 12–13px): Table headings, field labels, and compact supporting labels.
- **Code** (500, 0.86em, -0.01em): Device codes and traceability identifiers.

### Named Rules

**The Identifier Rule.** Use JetBrains Mono for codes and measured values; keep surrounding labels and explanations in Inter.

## Layout

The interface uses a 66px full-width top bar and a 280px sticky white side rail at desktop widths. The main workspace uses a pale neutral background and 28px insets. At 860px and below, the section tabs collapse, detailed navigation becomes a horizontal scroll row, and the main padding tightens to 16px. At 640px, multi-column content collapses to one column, KPI blocks become two columns, and long lifecycle or trace rails scroll within their own region.

## Elevation & Depth

White panels sit on cool paper with thin borders and very soft shadows, matching the supplied reference. Dark feature cards use a restrained blue glow. Reserve the strongest shadows for dialogs and confirmation toasts.

Motion is brief and functional: controls settle quickly, progress bars animate to their measured values, and page entry is subtle. Respect reduced-motion preferences by disabling entrance and shimmer animations and bar transitions.

### Shadow Vocabulary

- **Dialog Scrim Elevation** (`0 22px 70px #101c2440`): Separates modal form and trace dialogs from the page.
- **Toast Elevation** (`0 8px 28px #10251f26`): Lifts transient confirmation feedback above the work surface.

## Shapes

Use pill silhouettes for navigation, buttons, and search fields. Dashboard and table panels use 16px corners; dialogs use 18px. Record states remain plain colored text without badge backgrounds. Borders stay thin and pale, and shadows stay soft. The compact blue mark and circular lifecycle markers carry the recurring geometry.

## Components

### Buttons

Buttons are compact, tactile controls with a restrained active press.

- **Shape:** Pill radius; default padding is 8px 14px.
- **Primary:** Royal blue background with white text; hover deepens to `#2448b7`.
- **Ghost:** Light gray surface with no visible border; hover darkens the surface.
- **Danger:** Danger red background with white text.
- **Active / Focus:** Press scales to 0.98; keyboard focus uses a 2px blue outline with 2px offset.
- **Small:** 4px 9px padding and 13.5px type.

### Chips

Record states are plain inline text: neutral for early stages, blue for active work, green for completion, and red for errors. Do not wrap states in badges or pills.

### Cards / Containers

- **Corner Style:** 16px on dashboard cards and data tables; 10px on compact loading surfaces.
- **Background:** White against the cool paper work area.
- **Shadow Strategy:** Soft, shallow shadows on white cards; see Elevation & Depth for dialogs and toasts.
- **Border:** 1px Fine Line.
- **Internal Padding:** Dashboard cards use 17px 19px; lifecycle cards use 18px 22px 20px.

### Inputs / Fields

Fields use a white background, 1px Fine Line border, pill radius for search, and 8px 10px padding with a 40px minimum height. Focus is indicated by the shared 2px blue outline. Invalid fields use the Danger border and visible error text.

### Navigation

Navigation follows the reference composition: a compact top bar pairs the brand with royal-blue section pills; a white side rail groups only the detailed resource links. The selected side item uses a black fill. On narrow screens, section tabs collapse while the detailed navigation becomes a horizontal scroll row with Panel available first.

### Lifecycle Rail

The lifecycle is a six-stage horizontal rail connected by a thin line. Counts and compact circular markers expose progress; blue marks active stages and green marks completed outcomes. On narrow screens, the rail scrolls independently and a visible hint signals that additional stages are available.

## Do's and Don'ts

### Do:

- **Do** keep vivid blue, black, and white consistent with the supplied visual references.
- **Do** use thin borders and white-on-paper tonal layering to organize operational data.
- **Do** keep Spanish labels concise and legible at compact sizes.
- **Do** use tabular numerals for counts and measurements and JetBrains Mono for traceability codes.
- **Do** make horizontal overflow local to long rails or tables on mobile.

### Don't:

- **Don't** introduce unrelated accent colors or reuse semantic green/red as decoration.
- **Don't** add broad shadows to cards that are flat in the implemented system.
- **Don't** replace reference-derived styling with a different dashboard aesthetic.
- **Don't** shrink controls or labels below the compact sizes already used to fit dense data.
