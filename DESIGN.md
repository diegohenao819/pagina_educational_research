---
name: Educational Research UNAD
description: Página del curso 518024 donde cada estudiante consulta su carpeta, su avance por fases y qué documento va en cada subcarpeta.
colors:
  canvas: "#f0f2f5"
  surface: "#ffffff"
  surface-muted: "#f7f8fa"
  surface-sunken: "#f0f2f5"
  border: "#e4e6eb"
  border-strong: "#ced0d4"
  border-hover: "#bcc0c4"
  text: "#1c1e21"
  text-secondary: "#65676b"
  text-placeholder: "#6f737a"
  accent: "#b5450c"
  accent-hover: "#9c3b0a"
  accent-active: "#823108"
  accent-soft: "#fff4ec"
  accent-soft-strong: "#fde6d5"
  accent-border: "#f5d0b8"
  accent-text: "#a13d0a"
  accent-muted-text: "#6e4b36"
  success: "#1d6b42"
  success-solid: "#2c8a55"
  success-soft: "#edf7f0"
  success-badge: "#dcefe3"
  success-border: "#c3e4cf"
  notice: "#7a4b00"
  notice-solid: "#c98a0e"
  notice-soft: "#fff8e8"
  notice-border: "#f3dca6"
  danger: "#b42318"
  danger-soft: "#fef3f2"
  danger-border: "#f9cdc8"
  folder-back: "#d99a28"
  folder-front: "#f2c056"
  folder-back-root: "#9c3b0a"
  folder-front-root: "#cf5a1c"
  ink: "#2f55a4"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.022em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  subtitle:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  badge:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  small: "8px"
  control: "10px"
  card: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  3xl: "32px"
  rail: "360px"
  page-max: "1080px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-primary-active:
    backgroundColor: "{colors.accent-active}"
  button-primary-large:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "40px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-muted}"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "40px"
  button-tertiary-hover:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "24px"
  input-document:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "0 16px 0 44px"
    height: "48px"
  badge:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
    typography: "{typography.badge}"
  badge-rule:
    backgroundColor: "{colors.accent-soft-strong}"
    textColor: "{colors.accent-text}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  badge-tip:
    backgroundColor: "{colors.success-badge}"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  notice:
    backgroundColor: "{colors.accent-soft}"
    rounded: "{rounded.card}"
    padding: "16px 20px"
  alert-notice:
    backgroundColor: "{colors.notice-soft}"
    textColor: "{colors.notice}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  alert-error:
    backgroundColor: "{colors.danger-soft}"
    textColor: "{colors.danger}"
    rounded: "{rounded.control}"
    padding: "14px 16px"
  found-panel:
    backgroundColor: "{colors.success-soft}"
    rounded: "{rounded.card}"
    padding: "20px"
  progress-bar:
    backgroundColor: "{colors.border}"
    rounded: "{rounded.pill}"
    height: "8px"
  example-frame:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.control}"
    padding: "8px"
    width: "148px"
---

# Design System: Educational Research UNAD

## Overview

**Creative North Star: "El tablero del curso"**

A course tool, not a landing page. The world borrows the canon the tutor chose, Facebook and Google Classroom: a cool gray canvas, quiet white cards with 12px corners and a hairline border, Inter throughout, and near-black and slate text. The folder lookup is the obvious task. The form notice, the announcements feed and the folder guide sit around it in cards that do not compete with it.

The institutional UNAD orange is the only voice with volume. It marks the primary action, active and focus states, and the small "Requisito" badges, and nothing else. Status comes in pale fields: green for a found folder and completed items, amber for observations and the not-found state, red for errors. Density is comfortable and practical, sized for phones from 360 to 430px first.

The signature is the folder map: an inline SVG of the student's folder whose subfolders assemble once when it scrolls into view and open slightly when pointed at. Small inline illustrations (a signed attendance sheet, an hours chart, a blurred photo, a public link, an active ARL pill) explain each document rule beside the rule. The world is light only: `color-scheme: light`, with no dark theme.

**Key Characteristics:**
- Cool gray canvas (#f0f2f5) under white cards with 1px borders and near-invisible shadows.
- One accent, UNAD orange, reserved for actions, active and focus states, and rule badges.
- Inter only, bold titles with slight negative tracking, tabular numbers for every count, percentage and ID.
- A two-column workspace on desktop (content plus a 360px rail) that collapses to one column.
- Inline SVG illustration in the same palette, with motion that plays once and never loops.
- Light theme only.

## Colors

A neutral Facebook-style gray system with one warm institutional accent and three pale status families.

### Primary
- **UNAD Burnt Orange** (accent): primary buttons, the progress bar fill, links, focus outlines and the focus ring, the input caret, active map labels. Darkens to **Pressed Ember** on hover and **Deep Ember** on press.
- **Orange Wash** (accent-soft) and **Orange Blush** (accent-soft-strong): the form notice background, the course-code segment, the feed avatar, rule badges, text selection, and the brief highlight on a phase card reached from the map.
- **Orange Ink** (accent-text) and **Clay Brown** (accent-muted-text): accent-colored text on the orange washes, where the full accent would be too loud.

### Secondary
- **Field Green** (success, success-solid, success-soft, success-badge, success-border): the found-folder panel, completed checklist marks, the complete progress bar, "Recomendación" badges and positive illustration details.
- **Harvest Amber** (notice, notice-solid, notice-soft, notice-border): the not-found alert, checklist items with an observation, and the hours carry-over annotation.
- **Alert Red** (danger, danger-soft, danger-border): the error alert only.

### Tertiary
- **Manila Folder** (folder-back, folder-front) and **Root Folder Orange** (folder-back-root, folder-front-root): the folder glyphs in the map and on phase cards. The root folder takes the orange pair; subfolders take manila.
- **Signature Blue** (ink): pen strokes in the attendance illustration only.

### Neutral
- **Classroom Gray** (canvas, surface-sunken): the page background, count pills, neutral badges, the map shell.
- **Card White** (surface) and **Mist** (surface-muted): card faces; Mist frames illustrations and is the secondary button hover.
- **Hairline** (border), **Rule Gray** (border-strong), **Hover Gray** (border-hover): card borders and dividers, control borders, hovered control borders.
- **Ink Black** (text), **Slate** (text-secondary), **Placeholder Slate** (text-placeholder): primary text, supporting text and icons, input placeholder.

### Named Rules
**The One Voice Rule.** Orange appears only on actions, active or focused states, and rule badges. A heading, a card surface or a decorative stroke is never orange, apart from the root folder glyph.

**The Pale Status Rule.** A state is a pale field with a matching 1px border and a dark text tone of the same hue. Solid status color is only for small marks (check discs, the progress fill, dots).

**The Not By Color Alone Rule.** Every state carries a shape too: a tick, a dash, an exclamation mark, an icon or a text label.

## Typography

**Display Font:** Inter (via next/font, with system-ui fallback)
**Body Font:** Inter
**Label/Mono Font:** Inter with `font-variant-numeric: tabular-nums` for numbers

**Character:** One sans family doing everything, as in the reference products. Hierarchy comes from weight (400, 600, 700) and size, not from a second face.

### Hierarchy
- **Display** (700, 26px on mobile and 32px from 720px, 1.15, -0.022em): the page title in the header only.
- **Headline** (700, 22px, 1.25, -0.015em): section titles; the lookup title grows to 24px from 640px. Balanced wrapping.
- **Title** (700, 18px, 1.3, -0.01em): card and phase-card titles.
- **Subtitle** (600, 16px, 1.35): notice, alert, found, feed-item and document titles.
- **Body** (400, 15px, 1.55): ledes, notes, feed text, checklist items (1.4 there). The page base is 16px at 1.5. Pretty wrapping on paragraphs.
- **Label** (600, 14px): field labels, phase names, buttons (15px, 600; 16px on large, 14px on small).
- **Caption** (400, 13px): hints, dates, counts, the footer, the map caption.
- **Badge** (600, 12px): pill badges. 12px is also the floor for any text inside an SVG (12.5px in practice).

### Named Rules
**The Tabular Count Rule.** Every number that can change or be compared (percentages, counts, document IDs, hours, dates) uses tabular figures.

**The Sentence Case Rule.** Labels and badges stay in sentence case at normal tracking. No uppercase tracked labels.

**The Plain Punctuation Rule.** Page text uses no em dashes (—) and no middle dots (·). Use commas, colons, periods or separate lines.

## Layout

A centered page up to 1080px wide, padded 16px on phones and 24px from 768px, with a 48 to 64px bottom margin. Sections stack in a grid with 16px gaps, widening to 32px from 960px.

From 960px the workspace splits into a flexible content column and a 360px rail (the announcements), with a 24px gap and a sticky rail 24px from the top. The folder guide mirrors it: the 360px rail on the left holds the intro and map (sticky when the viewport is at least 780px tall), and phase cards fill the right. Between 640 and 959px the guide intro puts the map beside its text. Below that, everything is one column.

The header is a card: the logo (76px, 92px from 720px), a title block set off by a left hairline, and the course-code pill on the right. The lookup puts the input and button in one row from 560px. Document rows put the action button on the right from 560px, and notes with an illustration get a 148px side column.

Spacing works on a 4px base, mostly in steps of 8, 12, 16, 20, 24 and 32. Card padding is 20px on phones and 24px from 640px. Touch targets are at least 40px on coarse pointers.

## Elevation & Depth

The world is nearly flat. Cards separate from the gray canvas through their white face and 1px hairline, with a shadow barely there. One surface gets a slightly deeper shadow: the lookup card, because it is the main task. Focus is a 3px orange halo, not a shadow.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 2px rgb(16 24 40 / 0.04), 0 1px 3px rgb(16 24 40 / 0.03)`): every card.
- **Raised task** (`box-shadow: 0 1px 2px rgb(16 24 40 / 0.05), 0 6px 16px -4px rgb(16 24 40 / 0.07)`): the lookup card only.
- **Focus ring** (`box-shadow: 0 0 0 3px rgb(181 69 12 / 0.26)`): the focused input. Other controls use a 2px orange outline offset 2px.

### Named Rules
**The One Raised Card Rule.** Only the primary task surface gets the raised shadow. Everything else sits at card rest.

## Shapes

Soft, consistent rounding in three steps: cards and large panels at 12px, controls, alerts, illustration frames and inner notes at 10px, and an 8px step for small pieces. Badges, count pills, the course-code pill, the progress bar and avatars are fully round. Dividers are 1px hairlines inside cards (between documents, phases and feed items) instead of nested boxes. Checklist marks are 20px circles with a 2px border.

Icons sit on one 20 by 20 grid with a single 1.7 round stroke in `currentColor`, always decorative next to a text label. The folder glyph is a two-part shape (back and front flap) that the map animates.

## Components

### Buttons
Clear and practical, with three levels of emphasis.
- **Shape:** gently rounded (10px), 40px tall by default, 48px large, 36px small (40px on touch).
- **Primary:** orange with white text. It darkens on hover and press. Disabled is a gray fill. While a search runs, it stays orange at 88% opacity with a spinner and a progress cursor.
- **Secondary:** white with a Rule Gray border; hover turns it Mist with a Hover Gray border. Used for document downloads and external links, with a 16px icon after the label. In the form notice it takes the orange border and orange text.
- **Tertiary:** transparent with slate text; hover gives a gray fill.
- **Focus:** 2px orange outline, offset 2px.
- **Transitions:** 0.15s on color, border and shadow.

### Chips
- **Badges:** pill, 12px semibold. The rule badge (Requisito) is orange blush; the tip badge (Recomendación) is pale green; the neutral badge is gray. The legend in the guide explains each one.
- **Count pill:** gray pill, 13px semibold, tabular, right-aligned in phase-card heads.
- **Course-code pill:** a bordered pill split in two segments, with the course number on an orange wash.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** white on the gray canvas.
- **Shadow Strategy:** card rest; raised for the lookup only.
- **Border:** 1px Hairline.
- **Internal Padding:** 20px, 24px from 640px. Phase cards have no padding and use 16px by 20 or 24px head and row bands split by hairlines.

### Inputs / Fields
- **Style:** 48px tall, white, 1px Rule Gray border, 10px radius, a 44px left inset for the search icon, 17px text with slight tracking and tabular figures, orange caret.
- **Focus:** the border turns orange and gets the 3px orange halo.
- **Hint:** 13px slate text below. Label above in 14px semibold.

### Navigation
There is no nav bar. The folder map is the navigation for the guide: each subfolder row links to its phase card, highlighting its name in orange and opening the folder on hover or focus. The target card briefly takes an orange border and halo (2.6s) on arrival.

### Lookup Results
- **Alerts:** pale amber (not found) or pale red (error) panels with a 1px border, a 10px radius, an icon and a 16px semibold title. They arrive with a 6px rise and fade.
- **Found panel:** pale green with a 12px radius, a green check icon, the title in green, the name in bold, the actions in a wrapping row (primary full-width on phones), and a white tutor note inside.
- **Progress:** a large tabular percentage, an 8px pill bar that grows from the left in 0.8s (green when complete), and phase checklists in two columns from 600px. Checklist marks: green disc with a tick (done), empty circle with a dash (not applicable), amber circle with an exclamation (observation, with an amber note below).

### Form Notice
A pale orange panel with an info icon, a title, muted brown text and a secondary action. The action sits below on phones and on the right from 640px.

### Announcements Feed
Items split by hairlines: an orange-wash avatar with a megaphone, the author and a tabular date, then a 16px title, 15px body and an optional arrow link.

### Folder Map and Guide Illustrations (signature)
Inline SVG in the system palette, framed in Mist (10px radius, 148px wide, 320px when wide). Text inside an SVG never drops below 12px. Motion follows one grammar: nothing animates by default, and the HTML arrives in its final state. A script arms off-screen illustrations (paused on the first frame) and plays them once when they enter the viewport. The map shell opens, rows emerge in sequence, sheets drop in, hour bars rise, the signature draws itself, and faces blur. The ARL pulse repeats twice at most. The easing is `cubic-bezier(0.16, 1, 0.3, 1)`. With reduced motion, everything becomes an opacity fade in the same order, and the pulse and scale effects are removed.

## Do's and Don'ts

### Do:
- **Do** keep the canvas gray (#f0f2f5) and put content on white 12px cards with a 1px #e4e6eb border.
- **Do** reserve orange (#b5450c) for primary actions, active and focus states, links and rule badges.
- **Do** show states as pale fields with a matching border, plus a shape or icon, never by color alone.
- **Do** use tabular figures for every count, percentage, ID, hour and date.
- **Do** keep controls at least 40px tall on touch and the lookup input at 48px.
- **Do** make illustrations inline SVG in the system palette, with text at 12px or larger.
- **Do** run illustration motion once, on scroll entry, from a final-state HTML, with an opacity-only fallback for reduced motion.
- **Do** write page text without em dashes (—) or middle dots (·).
- **Do** use only the 20 by 20 stroke icon set (1.7 stroke, `currentColor`), always next to a text label.

### Don't:
- **Don't** add a dark theme or dark sections. The world is light only (`color-scheme: light`).
- **Don't** raise any card other than the main task above card-rest depth.
- **Don't** use orange for headings, card surfaces or large decorative areas.
- **Don't** add a second typeface. Inter carries every role.
- **Don't** put uppercase tracked labels or eyebrows above titles.
- **Don't** loop animations or animate content that is already on screen at load.
- **Don't** put real student data (ID numbers, names, emails, folder links) in examples, illustrations, captures or documentation.
