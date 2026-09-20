# Starry Night Theme

> A dark theme inspired by Van Gogh's Starry Night for Visual Studio Code, Cursor, JetBrains IDEs (IntelliJ IDEA, PyCharm, WebStorm, GoLand, ...) and every VS Code-compatible editor (VSCodium, Windsurf, ...).

Immerse yourself in the beauty and mystery of Van Gogh's Starry Night with this theme. The vibrant colors and expressive swirls of the painting bring your development environment to life, inspiring creativity and focus.

![Screenshot](https://raw.githubusercontent.com/buffDev/starry-night-theme/master/screenshot.png)

## IDEs supported

| IDE | How it's distributed |
|---|---|
| Visual Studio Code | Visual Studio Marketplace + Open VSX (`.vsix`) |
| Cursor | Same `.vsix` / color-theme JSON — Cursor installs VS Code themes natively |
| JetBrains (IntelliJ IDEA, PyCharm, WebStorm, GoLand, ...) | JetBrains Marketplace plugin (`bin/starry-night-theme-jetbrains.zip`) or standalone `.icls` scheme |
| VSCodium / Windsurf and other VS Code forks | Open VSX |

## Install

All instructions can be found at [INSTALL.md](./INSTALL.md).

## Development

The theme source is a single YAML file (`src/starry-night-theme.yml`). Everything else is generated:

```sh
npm install
npm run build          # -> theme/starry-night-theme.json (VS Code / Cursor)
npm run build:intellij # -> bin/jetbrains/* (IntelliJ .icls + .theme.json + plugin zip)
npm run lint           # checks theme keys against the current VS Code docs
npm run package        # -> bin/starry-night-theme.vsix
```

## Releasing

Releases are tag-driven. From the repo's **Actions → Bump Version** workflow pick
`patch` / `minor` / `major`, and CI bumps `package.json`, tags `vX.Y.Z` and
automatically publishes to every platform:

- Visual Studio Marketplace (with a tag, after the version exists check)
- Open VSX
- JetBrains Marketplace
- GitHub Release with the `.vsix` and JetBrains plugin zip attached

Required repository secrets: `VSCE_PUBLISHER_TOKEN`, `OVSX_TOKEN` (both needed for
marketplace publishing), `JETBRAINS_TOKEN` (optional — JetBrains upload is skipped
when unset).

## Team

This theme is maintained by the following person(s) and a bunch of [awesome contributors](https://github.com/buffDev/starry-night-theme/graphs/contributors).

[![Danil0Ws](https://avatars.githubusercontent.com/u/26333326?v=4&s=70)](https://github.com/danilo0ws) |
:---: |
[Danil0Ws](https://github.com/Danil0Ws) |

## Contributing

If you'd like to contribute to this theme, please read the [contributing guidelines](./.github/CONTRIBUTING.md).

## License

[MIT License](./LICENSE)