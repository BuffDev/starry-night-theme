# Changelog

## [2.0.5] - 2026-10-07

- JetBrains editor scheme: every text attribute is now a **real** platform key.
  The previous names (`KEYWORD`, `STRING`, `NUMBER`, `LINE_COMMENT`,
  `FUNCTION_CALL`, `CLASS_NAME`, …) do not exist in any scheme the IDE reads —
  languages register their own keys with a fallback to the "Language Defaults"
  pair (`JAVA_KEYWORD` → `DEFAULT_KEYWORD`), so those entries themed nothing and
  the editor silently kept Darcula's token colours while the chrome looked right.
  The scheme now sets the `DEFAULT_*` family plus the platform attributes
  (breadcrumbs, hyperlinks, search results, matched braces, diffs, folded text,
  inlay hints, console/Logcat/log output), and the build fails if a known-invented
  name comes back. 46 → 130 attributes, 21 → 52 `<colors>` keys.
- JetBrains token colours now resolve exactly like TextMate/VS Code: the deepest
  matching selector wins, later rules break ties. Before, the "first selector that
  matches" heuristic fed the wrong colour to whole classes of tokens — comments
  came out accent-blue instead of the comment grey, strings fell back to the plain
  foreground instead of the yellow, class names were orange instead of blue and
  keywords picked up `this`/`self`. Bold/italic were also inverted (IntelliJ's
  `FONT_TYPE` is 1 = BOLD, 2 = ITALIC) and are now derived from the source's
  `fontStyle`.
- JetBrains editor scheme has no alpha channel: a `#RRGGBBAA` colour is now
  composited over the editor background instead of being painted at full strength
  (search results, diffs, identifier-under-caret, gutter marks), and a fully
  transparent `#RRGGBB00` becomes an empty value = inherit, so the separators
  VS Code deliberately removed do not grow back in the IDE.
- JetBrains UI theme: `ActionButton`, `ToggleButton`, `Counter`, `CheckBoxMenuItem`,
  `ComboBox.ArrowButton`, `PasswordField`, `CompletionPopup`, `DragAndDrop`,
  `Bookmark`, `FileColor`, `VersionControl`, `WelcomeScreen`,
  `ValidationTooltip`, `Notification.ToolWindow`/error colours,
  `NotificationsToolwindow` and the `ProgressBar` passed/failed/indeterminate
  states; the `*` block now carries the same property list as JetBrains' own New
  UI dark theme (`inactiveBackground`, `caretForeground`, `textForeground`,
  `disabledBorderColor`, `selection*Inactive`). Fixed: `TabbedPane.contentAreaColor`
  was emitted as a component instead of a colour, and `Component.border` /
  `TextField.border` were not real keys (both removed). 64 → 76 components,
  243 → 312 colour properties.
- VS Code: four keys that were left blank were **not** actually "no border" — a
  blank theme key falls back to the base theme's own value, and `dark_vs`/
  `dark_plus` do define them: `editorGroupHeader.tabsBorder` (`#303031`, the tab
  strip separator 2.0.2 meant to remove), `menu.separatorBackground` (`#454545`),
  `editor.lineHighlightBorder` and `editor.inactiveSelectionBackground`
  (`#3A3D41`, the base theme's grey for a selection in an unfocused editor). All
  four now use the palette explicitly, and the remaining blank keys resolve to
  *nothing* in the base theme, so they stay blank.
- VS Code: added the missing inline-chat colours (`inlineChat.*`,
  `inlineChatDiff.*`) — the theme painted none of them, so Copilot's inline chat
  fell back to the editor defaults.

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