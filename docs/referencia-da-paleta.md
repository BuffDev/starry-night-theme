# Referência da paleta Starry Night

Cada âncora do YAML e onde aparece — para o mantendor saber o que pisca quando mexe em uma cor.

| Âncora | Hex | Onde é usada (resumo) |
|---|---|---|
| `*BG` | `#131E33` | editor, terminal, minimap, hovers, welcome page |
| `*FG` | `#E8EEF5` | foreground global, editor, listas, botões secundários |
| `*SELECTION` | `#2F4B6E` | seleção, tab ativa, item focado/selecionado, peek |
| `*COMMENT` | `#8B99A8` | comentários, texto mudo (inlay, placeholders não-usados) |
| `*CYAN` | `#7DD3FC` | cursor, tags, constantes, números, unicode escapes |
| `*BLUE` | `#93C5FD` | links, tipos, built-ins, chaves YAML/TOML |
| `*GREEN` | `#4ADE80` | funções, atributos, additions, diffs, botão de extensão |
| `*ORANGE` | `#FB923C` | parâmetros, warnings, modified, find match |
| `*ACCENT` | `#60A5FA` | keywords, focus ring, indicadores, progress bar |
| `*RED` | `#F87171` | erros, deletions, debugging status bar |
| `*YELLOW` | `#FCD34D` | strings, regex, destaque de busca em listas |
| `*STAR` | `#FACC15` | badges, indicador de activity bar, top border da tab ativa |
| `*PRIMARY` | `#2C78C6` | botões primários |
| `*PRIMARY_HOVER` | `#23589A` | hover de botão primário |
| `*SKY` | `#3584CE` | fundo da status bar (texto `*INK` passa AA) |
| `*INK` | `#0B1730` | texto sobre acentos claros (status bar, badges) |
| `*LineHighlight` | `#1A2A45` | highlight da linha do cursor, range do find |
| `*NonText` | `#2A3D54` | whitespace, indent guides, ruler, grid de tabela |
| `*WHITE` | `#F8FAFC` | wash de match de busca, lint guides ativos |
| `*TAB_DROP_BG` | `#24384F` |
| `*BGLighter` | `#24384F` | hover de listas |
| `*BGLight` | `#0F1D31` | activity bar, title bar, listFilter |
| `*BGDark` | `#15253B` | sidebar, tab strip, widgets, dropdowns, inputs |
| `*BGDarker` | `#111D32` | separadores (agora SEMPRE com alfa `00`), tab inativo unfocused, peek title |

## Regras vivas da paleta

1. **Borda demais**: `!alpha [ *BGDarker, '00' ]` = "linha apagada, chave documentada". Nunca apague a chave nem deixe blank (blank herda cinza do `vs-dark`).
2. **Alfa é string de 2 chars**: `'00'` a `'F5'`. Número sem aspas com 1 dígito (ex.: `0`) gera hex de 7 chars rejeitado pelo VS Code. `45`, `80` não precisam de aspas — só `00`.
3. **Texto sobre acento claro** usa `*INK`; sobre fundo escuro usa `*FG`.
4. `contrastBorder` permanece blank de propósito — blindar: qualquer valor opaco desenha tracejado glitch no hover de ícones.

## Customizações por `workbench.colorCustomizations`

| Chave | Efeito |
|---|---|
| `tab.activeBorderTop` | cor da linha de destaque no topo da aba ativa |
| `activityBar.activeBorder` | indicador do ícone ativo da activity bar |
| `statusBarItem.prominentBackground` | badge/prominent da status bar |
| `list.highlightForeground` | matching de busca em listas |
| `editor.lineHighlightBackground` | linha do cursor |
