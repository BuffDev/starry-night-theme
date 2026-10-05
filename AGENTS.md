# AGENTS.md

Tema dark de VS Code (e forks/JetBrains) inspirado em "Starry Night" — o fonte é um YAML, todo o resto é gerado.

<!-- omh:agent-instructions:begin -->

## Stack / Arquitetura

- Fonte único: `src/starry-night-theme.yml` → geradores em `scripts/` (Node puro, deps: js-yaml, tinycolor2, prettier).
- Saídas geradas: `theme/starry-night-theme.json` (VS Code/Cursor), `bin/*` (.vsix e plugin JetBrains).

## Mapa de pastas

- `src/` — YAML fonte (único lugar para editar cores).
- `theme/`, `bin/` — gerados; **nunca editar à mão**.
- `scripts/` — build, build:intellij, lint, package.
- `constants/` — mapeamentos compartilhados dos geradores.
- `INSTALL.md`, `CHANGELOG.md` — docs de instalação/release.

## Padrões / regras da casa

- Mudança de cor = editar `src/starry-night-theme.yml` e rodar build; o JSON gerado não é fonte.
- Release é tag-driven via GitHub Actions (workflow "Bump Version"); publicação usa secrets `VSCE_PUBLISHER_TOKEN`, `OVSX_TOKEN`, `JETBRAINS_TOKEN` (nunca copiar valores para docs).

## Comandos (verificados em 2026-10-04, v2.0.0)

- `npm install --include=dev` — sem `--include=dev`, shell com `NODE_ENV=production` não instala `js-yaml` e o build falha.
- `npm run build` → `theme/starry-night-theme.json` ✔.
- `npm run build:intellij` → esquemas/plugin JetBrains em `bin/` ✔ (versão vem do `package.json`).
- `npm run lint` — confere chaves do tema contra a documentação do VS Code ✔ (0 chaves inválidas; ~735 "Missing key" são esperados — o tema não cobre todo o catálogo).
- `npm run package` → `bin/starry-night-theme.vsix` ✔.

## Armadilhas conhecidas

- Editar `theme/*.json` direto é perdido no próximo build.
- `npm run lint` depende da docs atual do VS Code: chave nova válida pode falhar até o script de lint acompanhar.
- `bin/*.vsix` e `bin/*jetbrains.zip` são artefatos versionados do release — regenerar, não editar.
- `!alpha [ *COR, 0 ]` gera hex de 7 dígitos (inválido): use `!alpha [ *COR, '00' ]` (alpha sempre 2 caracteres).
- VS Code desenha borda **pontilhada** no hover de botões de ícone/status via `toolbar.hoverOutline` e `contrastActiveBorder` — ambos estão `#RRGGBB00` (transparente) de propósito; hover usa só `toolbar.hoverBackground`.

<!-- omh:agent-instructions:end -->
