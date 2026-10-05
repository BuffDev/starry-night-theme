# Changelog

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