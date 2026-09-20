# Changelog

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