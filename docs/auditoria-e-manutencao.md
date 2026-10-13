# Manutenção / auditoria do tema — o que quebra silenciosamente

Esta lista nasceu de uma varredura completa (2026-10-13) e é a referência quando algo no tema "não era pra ser assim". Cada item é uma pegadinha real verificada neste repo.

## 1. Chave blank não é "borda apagada"

No YAML, uma chave sem valor (ex.: `sideBar.border:`) é considerada `null` pelo build e **não é emitida no JSON**. O VS Code então herda o valor do base theme `vs-dark` — que define cinzas opacos para várias delas:

- `editorGroupHeader.tabsBorder` → `#303031`
- `menu.separatorBackground` → `#454545`
- `editor.inactiveSelectionBackground` → `#3A3D41`
- `sideBarSectionHeader.border` → `#ccc3`
- `tab.lastPinnedBorder` → `#ccc3`
- `widget.border` → `#303031`
- `editorGroupHeader.connectedTabsBackground` → `#303031`
- `surface.border` / `modernActivityBar.border` / `agentsPanel.border` → `#252526`
- `checkbox.border` → `#6B6B6B`
- `titleBar.inactiveBackground` → `#323233`
- `statusBar.inactiveBackground` → `#1476B8`
- `list.dropBackground` → `#383B3D`

**Regra**: para remover uma borda de verdade, use `!alpha [ *BGDarker, '00' ]` (argumento do alpha SEMPRE em string de 2 chars). Deixar blank só nas chaves cujo base value é inócuo.

## 2. Alfa numérico sem aspas

`!alpha [ *ACCENT, 0 ]` (zero sem aspas) → hex de 7 caracteres `#RRGGBB0`, rejeitado. Zero(es) sempre entre aspas: `'00'`. Alfas dois dígitos (`45`, `80`) funcionam sem aspas porque o construtor concatena como string, mas para consistência use sempre string.

## 3. Hover tracejado (dotted outline glitche)

`toolbar.hoverOutline` e `contrastActiveBorder` desenhados com valor opaco aparecem como **borda pontilhada** no hover de botões de ícone e da status bar. Ambos ficam `!alpha [ …, '00' ]` de propósito; o feedback de hover vem só de `toolbar.hoverBackground`/`statusBarItem.hoverBackground`.

## 4. Contraste de botões

`transparent: [ *BGDarker, '00' ]` para bordas de controles (input, dropdown, settings.*) só funciona porque o fundo do controle é `*BGDark` — se um customização muda o fundo pra um valor próximo do `*BG`, o controle perde a definição. Aliás, prefira mudar `button.border`/`input.border` pra um `#RRGGBB33` do que apagar tudo.

## 5. Chaves deprecadas (limpas nesta varredura)

Removidas por não existirem mais no catálogo atual do VS Code (listou-se `Unsupported key` no lint):

- `activityBarBadge.border`
- `editorGroup.background`
- `editorWidgetBorder` (deprecado; use `widget.border`)
- `welcomePage.buttonBackground` / `welcomePage.buttonHoverBackground`
- `settings.inactiveSelectedItemBorder`

O lint (`npm run lint`) reporta `"Unsupported key"` para cada uma — **essa é a única linha que é falha real**; "Missing key" é informativo (o tema não cobre todo o catálogo, ~680 esperados).

## 6. JetBrains: o silêncio é o perigo

Dois defeitos do lado IntelliJ não dão erro nenhum:

- `<value>` aninhado dentro de `<colors>` → o IDE descarta o scheme inteiro e volta ao esquema padrão. O build falha (`npm run build:intellij`) se esse shape regressar.
- Nome de atributo inventado (ex.: `KEYWORD` em vez de `DEFAULT_KEYWORD`) → o idioma ignora o nome e a cor não aplica. Mesmo guard.

Verificação:

```sh
xmllint --noout bin/jetbrains/starry-night-theme.icls
python3 -c "icls=open('bin/jetbrains/starry-night-theme.icls').read(); c=icls[icls.index('<colors>'):icls.index('</colors>')]; assert '<value>' not in c"
test -f bin/starry-night-theme-jetbrains.zip && unzip -t bin/starry-night-theme-jetbrains.zip > /dev/null && echo zip-ok
```

## 7. New UI JetBrains x UI clássica

O plugin inclui os dois conjuntos de chaves: New UI (`MainWindow.*`, `MainToolbar.*`, `EditorTabs.*`, `ToolWindow.Header*`, `StatusBar.Widget.*`, `StatusBar.Breadcrumbs.*`) e a clássica (`TabbedPane.*`, `TitlePane.*`). Um ataque de "limpar chaves não usadas" numa dessas famílias faz metade da UI voltar ao cinza do tema base da IDE.

## 8. VS Code moderno / UI moderna

O catálogo atual (971 chaves) inclui a família "modern UI" (`surface.*`, `modernPanel.border`, `modernTab.*`, `modernEditorTab.*`, `modernActivityBar.*`) que o tema não seta. Se a sua build do VS Code habilita a UI moderna, alguns painéis podem usar chaves não cobertas — nesse caso elas herdam o base theme. Se um dia o tema apresentar "borda moderna" fantasme, adicione `surface.border: !alpha [ *BGDarker, '00' ]`.

## 9. O que o tema não controla

- Chrome da janela do OS (não é tematável).
- Painéis de extensão webview (Copilot Chat, etc): cores externas ao tema.
- Icon theme (arquivos/pastas) — é outro tipo de extensão.
- Linha da régua (`editor.rulers`) se o usuário define posições nas settings — o tema só controla a cor.

## 10. Após qualquer mudança de cor

```sh
npm run build && npm run build:intellij && npm run lint
# lint: só "Unsupported key" é erro; "Missing key" é esperado.
npm run package   # gera bin/starry-night-theme.vsix (instale pra ver)
```

O JSON gerado NÃO é fonte: editar `theme/*.json` direto é perdido no próximo build.
