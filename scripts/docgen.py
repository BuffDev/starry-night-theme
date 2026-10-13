#!/usr/bin/env python3
"""Gera docs/catalogo-de-chaves.md a partir do YAML fonte (diferenca mecanica)."""
import re

src = open('src/starry-night-theme.yml').read()
yamlsec = src.split('\ncolors:')[1].split('tokenColors:')[0]

groups = []
for line in yamlsec.split('\n'):
    g = re.match(r'^  # (.+)$', line)
    if g and not re.match(r'^  # *$', line):
        groups.append({'name': g.group(1).strip(), 'keys': []})
        continue
    m = re.match(r'^  ([\w.]+): (.+)$', line)
    k = re.match(r'^  ([\w.]+): *$', line)
    if m:
        val = re.split(r'\s+#', m.group(2))[0].strip()
        desc = re.search(r'#\s?(.*)$', m.group(2))
        if not groups:
            groups.append({'name': 'Geral', 'keys': []})
        groups[-1]['keys'].append((m.group(1), val, desc.group(1).strip() if desc else ''))
    elif k:
        if not groups:
            groups.append({'name': 'Geral', 'keys': []})
        groups[-1]['keys'].append((k.group(1), '(blank)', ''))

out = [
    '# Catálogo do tema — cada chave `colors` e o que ela pinta',
    '',
    'Fonte única: `src/starry-night-theme.yml` (build gera `theme/starry-night-theme.json`).',
    'Formato: `#RRGGBB` opaco · `#RRGGBBAA` com alfa · alfa `00` = transparente (borda removida).',
    'Chaves marcadas `(blank)` não são emitidas: o VS Code herda o valor do base theme `vs-dark`.',
    '',
]
for g in groups:
    if not g['keys']:
        continue
    out.append(f"## {g['name']}\n")
    out.append('| Chave | Valor no YAML | O que muda |')
    out.append('|---|---|---|')
    for k, v, desc in g['keys']:
        out.append(f"| `{k}` | `{v}` | {desc} |")
    out.append('')

open('docs/catalogo-de-chaves.md', 'w').write('\n'.join(out))
print('OK: docs/catalogo-de-chaves.md —', len(groups), 'grupos,', sum(len(g['keys']) for g in groups), 'chaves')
