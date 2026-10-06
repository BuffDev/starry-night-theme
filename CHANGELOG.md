# Changelog

## [2.0.4] - 2026-10-06

- JetBrains editor scheme: the `<colors>` block is written as flat
  `<option name="KEY" value="HASH"/>` entries again — the nested `<value>` shape
  smuggled the `<attributes>` grammar into it and made the IDE reject the whole
  scheme, so the editor silently kept its previous colours. `TEXT` is now an
  attribute carrying foreground *and* background, and the invented key names
  (`LINE_NUMBER`, `LINE_NUMBER_ON_CARET_LINE`, `GUTTER_BACKGROUND`) were replaced
  by the real ones (`LINE_NUMBERS_COLOR`, `LINE_NUMBER_ON_CARET_ROW_COLOR`,
  `EDITOR_GUTTER_BACKGROUND`); gutter/console backgrounds follow the editor. The
  build fails if the shape regresses.
- JetBrains UI theme reaches the New UI chrome: `MainWindow.*`/`MainToolbar.*`
  (window header and toolbar were still the default gray), `EditorTabs.*` (tab
  strip plus the starry-yellow accent underline instead of the default blue,
  selected/unfocused tab surfaces), tool window headers and stripes,
  `StatusBar.Widget.*`/`StatusBar.Breadcrumbs.*` (status bar text was low-contrast
  gray on the blue bar), plus `Table`/`TableHeader`, `ToolBar`, `MemoryIndicator`,
  `ProgressBar`, `Popup.*`, `Menu`, `ToolTip`, `Link`, `IconBadge` and friends. A
  `*` block carries the shared defaults (background, foreground, selection, hover,
  disabled, focus).
- `#RRGGBB00` values — the source convention for a removed border — stay
  transparent in both JetBrains outputs instead of being sliced into opaque lines.

## [2.0.3] - 2026-10-06

- JetBrains plugin descriptor: registers the theme through the themeProvider
  extension point, declares the platform dependency, a since-build of 201, and
  ships META-INF/pluginIcon.png plus description/change-notes taken from
  README/CHANGELOG — the Marketplace accepts the archive and tags it as a theme.
- JetBrains archive is packaged as plugin-name/lib/*.jar; the build fails fast if
  that layout, the theme EP, the icon or the descriptor fields go missing.

## [2.0.2] - 2026-10-05

- Removed the internal 1px borders/separators (editor group, panel, tab strip,
  title bar, sidebar section headers, inputs, dropdowns, settings and welcome
  widgets, overview ruler) — they are transparent now; separation comes from the
  surface contrast only. Focus rings (`focusBorder`) and validation borders stay.
- More starry yellow: yellow active-tab top border and dirty-tab marker, yellow
  activity-bar indicator, yellow list/search match highlights, yellow for modified
  files in SCM decorations, and yellow badges.

## [2.0.0] - 2026-10-04

Visual redesign based on the "shadcn x Starry Night" mockup (rounded, Musea/OpenAI
dots vibe) plus hover-state fixes.

- New palette sampled from the mockup: editor `#131E33`, sidebar/tabs `#15253B`,
  activity & title bar `#0F1D31`, separators `#111D32`, hover surface `#24384F`,
  selection/active tab `#2F4B6E`, primary button `#2C78C6`, status bar
  `#3584CE`, starry yellow `#FACC15`.
- Syntax refreshed to a shadcn/Tailwind set: keywords `#60A5FA`, tags/components
  `#7DD3FC`, attributes/links `#93C5FD`, strings `#FCD34D`, functions `#4ADE80`,
  parameters `#FB923C`, comments `#8B99A8` (was an unreadable dark blue).
- Status bar now carries the accent blue with dark foreground; badges and
  prominent items use the starry yellow instead of red/magenta.
- Fixed: dashed ("pontilhado") outline on hover of icon buttons, status bar items
  and toolbar actions — `toolbar.hoverOutline` / `contrastActiveBorder` are now
  transparent; hover feedback comes from `toolbar.hoverBackground` only.
- Fixed: bright cyan panel/editor-group/hover borders replaced with the subtle
  `#111D32` separator; warnings are orange instead of blue; terminal ANSI palette
  corrected (blue was purple, bright variants were off-by-one hue).
- Cleaner list/tree states: hover `#24384F`, focus/selection `#2F4B6E`, match
  highlights in accent blue; line numbers dimmed to 55% of the comment color.
- Removed the solid border around the current line (`editor.lineHighlightBorder`).

## [1.0.0] - 2026-09-20

- First major release.
- VS Code: updated for modern versions (`engines.vscode` ^1.80.0), added current
  theme keys (inlay hints, minimap, welcome page, toolbar, trees, text links,
  inlay-hint palette, active line number, editor cursor).
- New: JetBrains theme (`.icls` scheme, `.theme.json` UI theme, Marketplace
  plugin zip) — `npm run build:intellij`.
- New: publish automation for Visual Studio Marketplace, Open VSX (VSCodium,
  Cursor and forks) and JetBrains Marketplace, driven by git tags
  (`Actions → Bump Version`).
- Cursor: installs the same `.vsix` / theme JSON natively.

## [0.0.18] - previous

- Regular maintenance release.