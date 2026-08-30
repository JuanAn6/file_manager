# Modernist design system

Modernist is flat, architectural and set entirely in Archivo: a near-mono red on white,
a visible modular grid, zero corner radius and strong 2px rules. Nothing floats and
nothing is decorated — alignment and the strength of the dividers do all the organising,
labels sit flush left (even inside buttons), and photography prints in pure black and white.

## How to use this

`styles.css` is the only stylesheet. It is imported once, in `src/main.jsx`:

```js
import './design-system/styles.css';
```

Take every color, font, spacing, radius and shadow from its variables
(`var(--color-*)`, `var(--font-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--shadow-*)`).
Never hard-code a hex, a font name or a px value the tokens already carry — there are no
per-component CSS files in this project any more, and adding one would reopen the drift
the system exists to close.

Build with the classes below rather than inventing parallel ones.

The whole system was derived from `theme.json`. To change the look, edit the tokens at the
top of `styles.css` and keep `theme.json` in step so it does not drift from what the CSS does.

## Direction

Modular grid layouts — content in equal-width cells, strong horizontal and vertical rhythm,
visible structure. Use strong 2px dividers (`var(--color-divider)`) between major sections.
Button labels are flush left: a button wider than its label starts the text at the left
padding edge, never centered. Wrap content photographs in `.grayscale`.

## Color

A light ground (`--color-bg` `#f3f2f2`) with `--color-text` `#201e1d` and a single accent
`#ec3013`. This is a mono scheme: the `--color-accent-2-*` variables carry a machine-derived
stand-in kept only so both sets resolve — treat them as one role.

Each role carries a 100–900 tonal ramp generated in OKLCH on a shared perceptual lightness
scale, so the same step of any ramp has the same visual weight. Use 100–300 for tinted fills,
hovers and subtle borders, 500 as the role's base, 700–900 for text on tinted fills and for
pressed states. Prefer ramp steps over ad-hoc `color-mix()`. For elevation use
`--shadow-sm/md/lg` rather than ad-hoc box-shadows.

The accent-to-ground pair is tuned to at least 3:1 — enough for icons, large text and
interface chrome, not for body copy. For paragraph-size text in the accent use
`--color-accent-700`.

## Type

Archivo for headings over Archivo for body text, loaded as `--font-heading` / `--font-body`
from Google Fonts in `index.html`. Density 1.00x and radius 0px are already baked into the
`--space-*` / `--radius-*` scales — use the variables, not raw numbers.

## Icons

Lucide icons (https://lucide.dev), vendored as path data in
`src/components/custom/Icon.jsx` so the set travels with the app and no runtime dependency
is added. Use `<Icon name='folder' size={16} />`; stroke color follows `currentColor`.

## Interaction states

States are built in — do not restyle them per page. Hovers and pressed states come from the
accent ramp, keyboard focus is the 2px accent `:focus-visible` ring, `::selection` is an
accent tint, and disabled controls drop to 45% opacity.

## Components

| Class | What it is |
| --- | --- |
| `.btn` with `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`, `.btn-icon`, `.btn-block`, `.btn-sm` | Actions — the primary is a solid accent fill |
| `.tag` with `.tag-accent`, `.tag-accent-2`, `.tag-neutral`, `.tag-outline` | Small labels tinted from the ramps |
| `.field` + `label`, `.input`, `.radio`, `.seg` + `.seg-opt` | Form fields and choices on native elements — no script |
| `.card` with `.card-kicker`, `.card-title`, `.card-body`, `.card-meta`; `.elev-sm/md/lg` | Surface-filled content cards; elevation utilities |
| `.nav` + `.nav-brand` + `.nav-link` | The header bar |
| `.table` | Data tables with themed header and row rules |
| `.dialog-backdrop` + `.dialog` (+ `.dialog-title`/`-body`/`-actions`) | A modal at the top elevation |
| `.menu` + `.menu-item` | Popover menus |
| `.hr` | A strong 2px horizontal rule |
| `.grayscale` | The image wrapper — every content photograph goes through it |
| `.poster` | The statement field, the one place red runs as a ground |
| `.meter` + `.meter-fill` | A proportion drawn as a framed bar |
| `.tree` + `.tree-row`, `.tree-toggle`, `.tree-item` | A collapsible folder tree, used by the move picker |
| `.upload-overlay`, `.toast`, `.is-drop-target`, `.is-dragging` | Drag and drop affordances |
| `.spinner`, `.spinner-block` | Loading |
| `.shell` (+ `-brand`, `-topbar`, `-side`, `-main`), `.crumbs`, `.dropzone`, `.pagination`, `.login` | This product's layout, composed from the tokens |

## Do

- Let the grid show: equal-width cells, strong horizontal rules between sections.
- Keep everything flush left — headings, copy, and the labels inside wide buttons.
- Use the accent sparingly, for the primary action and small emphasis. The one place red
  runs as a field is the poster statement — here, the login.
- Print photographs in black and white with `.grayscale`.

## Don't

- Do not round a corner anywhere — `--radius-md` is 0 on purpose.
- Do not center button labels or hero copy.
- Do not soften the rules into hairlines or drop them for whitespace.
- Do not tint or colorize imagery.
