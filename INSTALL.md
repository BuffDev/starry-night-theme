# Installing Starry Night Theme

## Visual Studio Code

#### Via Command Palette / Marketplace

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Run `Extensions: Install Extensions`
3. Search for `Starry Night Theme` and install

#### Via VSIX

1. Download `starry-night-theme.vsix` from the [latest release](https://github.com/buffDev/starry-night-theme/releases)
2. Command Palette → `Extensions: Install from VSIX...` → select the file

#### From source (git)

    git clone https://github.com/buffDev/starry-night-theme.git ~/.vscode/extensions/starry-night-theme
    cd ~/.vscode/extensions/starry-night-theme
    npm install
    npm run build

Then activate: File -> Preferences -> Color Theme -> `Starry Night Theme`.

## Cursor

Cursor supports VS Code color themes natively:

- **Marketplace**: Cursor's built-in extensions panel searches the same VS Code Marketplace / Open VSX indexes — search for `Starry Night Theme`.
- **VSIX**: download `starry-night-theme.vsix` from the [latest release](https://github.com/buffDev/starry-night-theme/releases), then Extensions (⌘⇧X) → `...` → `Install from VSIX...`.
- **Manual**: copy `theme/starry-night-theme.json` into `~/.cursor/extensions/starry-night-theme/theme/`, activate via `Cmd+K Cmd+T`.

Applies equally to VSCodium, Windsurf and other VS Code-compatible editors (their extensions panels consume the VS Code Marketplace / Open VSX).

## JetBrains IDEs (IntelliJ IDEA, PyCharm, WebStorm, GoLand, ...)

#### Via JetBrains Marketplace (full theme: UI + editor scheme)

1. `Settings/Preferences` → `Plugins` → `Marketplace` tab
2. Search for `Starry Night Theme` and install, or download `starry-night-theme-jetbrains.zip` from the [latest release](https://github.com/buffDev/starry-night-theme/releases) and use `Install Plugin from Disk...`
3. `Settings/Preferences` → `Appearance & Behavior` → `Appearance` → Theme → `Starry Night Theme`
4. Editor colors load automatically with the theme.

#### Standalone editor scheme (just colors)

1. Copy `starry-night-theme.icls` (from `bin/jetbrains/` in a release or `npm run build:intellij` locally) to:
   - macOS: `~/Library/Application Support/JetBrains/<IDE><version>/colors/`
   - Linux: `~/.config/JetBrains/<IDE><version>/colors/`
   - Windows: `%APPDATA%\JetBrains\<IDE><version>\colors\`
2. Restart the IDE, then `Settings` → `Editor` → `Color Scheme` → select `Starry Night Theme`.