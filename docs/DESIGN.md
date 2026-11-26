# ALH design system

The design comes from the ALH Sketch file. All tokens live at the top of `src/app/globals.css`. Use the variables
in new CSS rather than raw values.

## Product rules (why it looks like this)

1. **Notes, not tickets.** A note has a title, a few lines and pictures. It has no story points, priority matrix or sub-tasks.
2. **Honest stages.** Up next → Cooking → Testing → Shipped. Moving a note to another stage means posting an update that says what changed.
3. **People first.** The feed opens on the faces of the team and what each person is working on right now.
4. **Show, don't fill in.** Screenshots stack on the card and you can swipe through them. Updates beat fields.
5. **Short and warm.** Comments are one line and end with an emoji. Dates read like a person would say them:
   "Today", "Yesterday", "Monday", then "01.11".
6. **Quiet chrome.** The UI uses greys and hairlines. Colour appears only for status and for the brand orange, which marks
   attention (follow-up arrow, badges).

## Colour

| Token | Value | Use |
| ----- | ----- | --- |
| `--base-1` | `#fcfcfd` | Page background |
| `--base-japan` | `#f6f5f4` | Warm inset surfaces |
| `--brand-orange` | `#ec662b` | Brand, attention, the hand-drawn follow-up arrow |
| `--brand-yellow` | `#ffaa4d` | Secondary brand |
| `--t1` … `--t4` | `#2b2c30` `#5a5b61` `#888a90` `#aaacb0` | Text: primary, secondary, meta, disabled |
| `--p00` … `--p90` | white → `#171719` | Neutral ramp for fills and borders |
| `--p10a` … `--p50a` | `rgba(43,44,48,.04…​.42)` | Translucent neutrals for overlays, hairlines and shadows |
| `--chip` | `rgba(244,244,244,.84)` | Chip and bubble glass |

**Status colours.** Each status sets `--pill`. The pill tints its background to 12% of that colour with `color-mix`.

| Status | Token |
| ------ | ----- |
| Up next | `--t3` (grey) |
| Cooking | `--status-orange` `#f88435` |
| Testing | `--status-blue` `#2e84ff` |
| Shipped | `--status-green` `#2ac670` |

`--status-red` and `--status-yellow` are reserved for overdue and warning states. `--away` marks someone who is away.

## Type

- **Family:** system first (`-apple-system`, SF Pro), falling back to **Inter** (loaded with `next/font`), then `system-ui`.
- **Scale:** **13px / 15px** body, **11px** meta and labels, **12px** chips, **15px** card titles, **21px** page titles.
- Weights: regular for text, 500–600 for titles and names. Don't use all-caps.

## Space, shape, lines

- **Column:** feed `--col: 560px`. The note page is centred at **max-width 600px**. The timeline uses the full width.
- **Radii:** 9px (small controls), 12–15px (thumbs, inner cards), 18–19px (cards, pill buttons), 26px (dialogs), 50% avatars.
- **Hairlines:** `--hairline: 0.5px` in `--p20a`/`--p30a`. Prefer hairlines and soft shadows over borders.
- **Paired buttons** (search + new note) read as one capsule: `19px 10px 10px 19px` and `10px 19px 19px 10px`.

## Icons

Nucleo UI, 18px outline, **stroke 1.2**, `currentColor`, drawn inline in `src/components/Icon.tsx`. Add new
icons there from the same family, and keep the stroke at 1.2.

## Components

| Component | File | Notes |
| --------- | ---- | ----- |
| Top bar | `TopBar.tsx` | Sticky. Solid for 62px, then fades to transparent so content slides under it. Unread badge on Inbox. |
| People row | `People.tsx` | Avatars with glass speech bubbles (`backdrop-filter: blur(9px) saturate(1.12) brightness(1.23)`). They cycle one by one from left to right and pause on hover. |
| Note card | `bits.tsx` → `NoteCard` | **Full card** for a note nobody has touched yet. **Compact card** once it has updates: a grey inset header for the note, then the latest update with a hand-drawn orange arrow between them, the update's shots, the two newest comments, and "N more comments". |
| Image stack | `Stack.tsx` | A pile of screenshots you can drag or swipe, with pager dots and arrow keys. Clicking opens the note. |
| Pill | `bits.tsx` → `Pill` | Status label in status colour. |
| Editor | `Editor.tsx` | WYSIWYG update composer with bold, italic, link, list and image. Images can be pasted or dropped. |
| Dialogs | `dialogs.tsx` | Native `<dialog>`: Search, New note (same rich area as the editor), Filter menu, Comment box. |
| Timeline | `timeline/page.tsx` | 44px per day, scrolls sideways, today marked. Bars run from start to due and take their status colour. |

## Motion

Keep motion short and physical. Nothing should move just to decorate.

- Hover and colour: `0.15s`.
- Cards and stack: `0.2–0.4s` with `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Bubbles pop in with a little overshoot: `cubic-bezier(0.2, 1.5, 0.4, 1)` over `0.42s`.
- On `(hover: none)` devices, hover-only affordances are shown statically.

## Responsive

Below **860px** the top bar compacts, columns go full width with 16px gutters, and the note meta stacks.

## Copy voice

Write like a teammate, not a tool: "What changed?", "Keep it short, end with an emoji", "Use ALH as Jim".
Use sentence case and avoid jargon.
