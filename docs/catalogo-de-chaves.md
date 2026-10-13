# Catálogo do tema — cada chave `colors` e o que ela pinta

Fonte única: `src/starry-night-theme.yml` (build gera `theme/starry-night-theme.json`).
Formato: `#RRGGBB` opaco · `#RRGGBBAA` com alfa · alfa `00` = transparente (borda removida).
Chaves marcadas `(blank)` não são emitidas: o VS Code herda o valor do base theme `vs-dark`.

## Integrated Terminal Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `terminal.background` | `*BG` |  |
| `terminal.foreground` | `*FG` |  |
| `terminal.ansiBrightBlack` | `*COLOR8` |  |
| `terminal.ansiBrightRed` | `*COLOR9` |  |
| `terminal.ansiBrightGreen` | `*COLOR10` |  |
| `terminal.ansiBrightYellow` | `*COLOR11` |  |
| `terminal.ansiBrightBlue` | `*COLOR12` |  |
| `terminal.ansiBrightMagenta` | `*COLOR13` |  |
| `terminal.ansiBrightCyan` | `*COLOR14` |  |
| `terminal.ansiBrightWhite` | `*COLOR15` |  |
| `terminal.ansiBlack` | `*COLOR0` |  |
| `terminal.ansiRed` | `*COLOR1` |  |
| `terminal.ansiGreen` | `*COLOR2` |  |
| `terminal.ansiYellow` | `*COLOR3` |  |
| `terminal.ansiBlue` | `*COLOR4` |  |
| `terminal.ansiMagenta` | `*COLOR5` |  |
| `terminal.ansiCyan` | `*COLOR6` |  |
| `terminal.ansiWhite` | `*COLOR7` |  |

## Contrast Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `contrastBorder` | `` | An extra border around elements to separate them from others for greater contrast |
| `contrastActiveBorder` | `!alpha [ *ACCENT, '00' ]` | An extra border around active elements to separate them from others for greater contrast (kept transparent: VS Code renders it dashed) |

## Base Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `focusBorder` | `*ACCENT` | Overall border color for focused elements. This color is only used if not overridden by a component |
| `foreground` | `*FG` | Overall foreground color. This color is only used if not overridden by a component |
| `widget.shadow` | `*BGDarker` | Shadow color of widgets such as Find/Replace inside the editor |
| `selection.background` | `!alpha [ *ACCENT, '45' ]` | Background color of text selections in the workbench (for input fields or text areas, does not apply to selections within the editor and the terminal) |
| `errorForeground` | `*RED` | Overall foreground color for error messages (this color is only used if not overridden by a component) |

## Button Control

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `button.background` | `*PRIMARY` | Button background color |
| `button.foreground` | `'#FFFFFF'` | FFFFFF'                                                 # Button foreground color |
| `button.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `button.hoverBackground` | `*PRIMARY_HOVER` | Button background color when hovering |
| `button.secondaryBackground` | `*BGDark` | Secondary button background color. |
| `button.secondaryForeground` | `*FG` | Secondary button foreground color. |
| `button.secondaryHoverBackground` | `*BGLighter` | Secondary button background color when hovering. |

## Dropdown Control

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `dropdown.background` | `*BG` | Dropdown background |
| `dropdown.border` | `!alpha [ *BGDarker, '00' ]` | Dropdown border |
| `dropdown.foreground` | `*FG` | Dropdown foreground |

## Input Control

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `input.background` | `*BGDark` | Input box background |
| `input.foreground` | `*FG` | Input box foreground |
| `input.border` | `!alpha [ *BGDarker, '00' ]` | Input box border |
| `input.placeholderForeground` | `*COMMENT` | Input box foreground color for placeholder text |
| `inputOption.activeBorder` | `*ACCENT` | Border color of activated options in input fields |
| `inputValidation.infoForeground` | `!alpha [ *BGDarker, '00' ]` |  |
| `inputValidation.infoBackground` | `!alpha [ *BGDarker, '00' ]` |  |
| `inputValidation.infoBorder` | `*ACCENT` | Input validation border color for information severity |
| `inputValidation.warningForeground` | `!alpha [ *BGDarker, '00' ]` |  |
| `inputValidation.warningBackground` | `!alpha [ *BGDarker, '00' ]` |  |
| `inputValidation.warningBorder` | `*ORANGE` | Input validation border color for warning severity |
| `inputValidation.errorForeground` | `!alpha [ *BGDarker, '00' ]` |  |
| `inputValidation.errorBackground` | `!alpha [ *BGDarker, '00' ]` |  |
| `inputValidation.errorBorder` | `*RED` | Input validation border color for error severity |

## Scroll Bar Control

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `scrollbar.shadow` | `!alpha [ *BGDarker, '00' ]` |  |
| `scrollbarSlider.activeBackground` | `!alpha [ *BGLighter, 'F0' ]` |  |
| `scrollbarSlider.background` | `!alpha [ *BGLighter, 'A0' ]` |  |
| `scrollbarSlider.hoverBackground` | `!alpha [ *BGLighter, 'D0' ]` |  |

## Badge

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `badge.foreground` | `*INK` | Badge foreground color |
| `badge.background` | `*STAR` | Badge background color |

## Progress Bar

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `progressBar.background` | `*ACCENT` | Background color of the progress bar shown for long running operations |

## List & Trees

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `list.activeSelectionBackground` | `*SELECTION` | List/Tree background color for the selected item when the list/tree is active |
| `list.activeSelectionForeground` | `*FG` | List/Tree foreground color for the selected item when the list/tree is active |
| `list.dropBackground` | `*SELECTION` | List/Tree drag and drop background when moving items around using the mouse |
| `list.focusBackground` | `*SELECTION` | List/Tree background color for the focused item when the list/tree is active |
| `list.highlightForeground` | `*YELLOW` | List/Tree foreground color of the match highlights when searching inside the list/tree |
| `list.hoverBackground` | `*BGLighter` | List/Tree background when hovering over items using the mouse |
| `list.inactiveSelectionBackground` | `!alpha [ *SELECTION, '55' ]` | List/Tree background color for the selected item when the list/tree is inactive |
| `list.inactiveSelectionForeground` | `*FG` |  |
| `list.warningForeground` | `*ORANGE` | Color of warning decorations in the explorer |
| `list.errorForeground` | `*RED` | Color of error decorations in the explorer |
| `list.hoverForeground` | `*FG` |  |
| `list.focusForeground` | `*FG` |  |

## Activity Bar

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `activityBar.background` | `*BG` | Activity Bar background color |
| `activityBar.inactiveForeground` | `*COMMENT` | Activity bar item foreground color when it is inactive |
| `activityBar.foreground` | `*FG` | Activity bar foreground color (for example used for the icons) |
| `activityBar.border` | `!alpha [ *BGDarker, '00' ]` | Activity Bar border color with the Side Bar (legacy key; blank herda de modernActivityBar.border) |
| `activityBar.activeBorder` | `*ACCENT` | Activity Bar deprecated; blank herda border bg e fica invisível |
| `activityBar.activeBackground` | `!alpha [ *ACCENT, '15' ]` | Activity Bar indicator background color |
| `activityBarBadge.background` | `*STAR` | Activity notification badge background color |
| `activityBarBadge.foreground` | `*INK` | Activity notification badge foreground color |

## Side Bar

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `sideBar.background` | `*BG` | Side Bar background color |
| `sideBar.foreground` | `*FG` |  |
| `sideBar.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `sideBarTitle.foreground` | `*FG` | Side Bar title foreground color |
| `sideBarSectionHeader.background` | `*BG` | Side Bar section header background color |
| `sideBarSectionHeader.foreground` | `*FG` |  |
| `sideBarSectionHeader.border` | `!alpha [ *BGDarker, '00' ]` | Side bar section header border color |

## Editor Group & Tabs

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `editorGroup.border` | `!alpha [ *BGDarker, '00' ]` | Color to separate multiple editor groups from each other |
| `editorGroup.dropBackground` | `*TAB_DROP_BG` | Background color when dragging editors around |
| `editorGroupHeader.noTabsBackground` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorGroupHeader.tabsBackground` | `*BG` | Background color of the Tabs container |
| `editorGroupHeader.tabsBorder` | `!alpha [ *BGDarker, '00' ]` | Border color of the editor group title header when tabs are enabled (blank would fall back to the base theme's grey #303031) |
| `tab.activeBackground` | `*BGDark` | Active Tab background color |
| `tab.activeForeground` | `*FG` | Active Tab foreground color in an active group |
| `tab.border` | `!alpha [ *BGDarker, '00' ]` | Border to separate Tabs from each other |
| `tab.activeBorderTop` | `*ACCENT` | A border drawn to the top of the active tab |
| `tab.activeBorder` | `!alpha [ *BGDarker, '00' ]` |  |
| `tab.activeModifiedBorder` | `*ACCENT` | A border drawn to the top of the active tab when it is modified (dirty dot) |
| `tab.unfocusedActiveModifiedBorder` | `*ACCENT` | Same, when the editor group is not focused |
| `tab.unfocusedActiveBorder` | `!alpha [ *BGDarker, '00' ]` |  |
| `tab.inactiveBackground` | `*BG` | Inactive Tab background color |
| `tab.inactiveForeground` | `*COMMENT` | Inactive Tab foreground color in an active group |
| `tab.unfocusedActiveForeground` | `!alpha [ *BGDarker, '00' ]` |  |
| `tab.unfocusedInactiveForeground` | `!alpha [ *BGDarker, '00' ]` |  |

## Editor Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `editor.foreground` | `*FG` |  |
| `editor.background` | `*BG` |  |
| `editorLineNumber.foreground` | `!alpha [ *COMMENT, '55' ]` | Color of the line numbers |
| `editorLineNumber.activeForeground` | `*FG` | Color of the active line number |
| `editorCursor.foreground` | `*CYAN` | Color of the editor cursor |
| `editorCursor.background` | `*BG` | Background color of the editor cursor |
| `editor.selectionBackground` | `*SELECTION` | Color of the editor selection |
| `editor.selectionHighlightBackground` | `*BGLighter` | Color for regions with the same content as the selection |
| `editor.inactiveSelectionBackground` | `!alpha [ *SELECTION, '55' ]` | Color of the selection in an inactive editor (blank would fall back to the base theme's grey #3A3D41) |
| `editor.foldBackground` | `*BGDark` | Background color for folded ranges |
| `editor.wordHighlightBackground` | `!alpha [ *BLUE, '50' ]` | Background color of a symbol during read-access, for example when reading a variable |
| `editor.wordHighlightStrongBackground` | `!alpha [ *GREEN, '50' ]` | Background color of a symbol during write-access, for example when writing to a variable |
| `editor.findMatchBackground` | `!alpha [ *ORANGE, '80' ]` |  |
| `editor.findMatchHighlightBackground` | `!alpha [ *WHITE, '40' ]` | Color of the other search matches |
| `editor.findRangeHighlightBackground` | `*LineHighlight` | Color the range limiting the search |
| `editor.hoverHighlightBackground` | `!alpha [ *BLUE, '50' ]` | Highlight below the word for which a hover is shown |
| `editor.lineHighlightBackground` | `*LineHighlight` | Background color for the highlight of line at the cursor position |
| `editor.lineHighlightBorder` | `!alpha [ *BGDarker, '00' ]` | Background color for the border around the line at the cursor position (kept transparent: the theme draws no separators) |
| `editorLink.activeForeground` | `*BLUE` | Color of active links |
| `editor.rangeHighlightBackground` | `!alpha [ *CYAN, '15' ]` | Background color of highlighted ranges, like by Quick Open and Find features |
| `editor.snippetTabstopHighlightBackground` | `*BG` | Highlight background color of a snippet tabstop |
| `editor.snippetTabstopHighlightBorder` | `*COMMENT` | Highlight border color of a snippet tabstop |
| `editor.snippetFinalTabstopHighlightBackground` | `*BG` | Highlight background color of the final tabstop of a snippet |
| `editor.snippetFinalTabstopHighlightBorder` | `*GREEN` | Highlight border color of the final tabstop of a snippet |
| `editorWhitespace.foreground` | `*NonText` | Color of whitespace characters in the editor |
| `editorIndentGuide.background` | `*NonText` | Color of the editor indentation guides |
| `editorIndentGuide.activeBackground` | `!alpha [ *WHITE, 45]` | Color of the active indentation guide |
| `editorRuler.foreground` | `*NonText` | Color of the editor rulers |
| `editorCodeLens.foreground` | `*COMMENT` | Foreground color of an editor CodeLens |

## for workbench.colorCustomizations in User Settings

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `editorBracketMatch.background` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorBracketMatch.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorBracketHighlight.foreground1` | `*FG` | Color of first pair of brackets |
| `editorBracketHighlight.foreground2` | `*ACCENT` | Color of second pair of brackets |
| `editorBracketHighlight.foreground3` | `*BLUE` | Color of third pair of brackets |
| `editorBracketHighlight.foreground4` | `*GREEN` | Color of fourth pair of brackets |
| `editorBracketHighlight.foreground5` | `*CYAN` | Color of fifth pair of brackets |
| `editorBracketHighlight.foreground6` | `*ORANGE` | Color of sixth pair of brackets |
| `editorBracketHighlight.unexpectedBracket.foreground` | `*RED` | Color of bracket matching error |
| `editorOverviewRuler.border` | `!alpha [ *BGDarker, '00' ]` | Color of the overview ruler border |
| `editorOverviewRuler.findMatchForeground` | `!alpha [ *BGDarker, '00' ]` | transparent: era blank (herdaria valor opaco do base dark_vs / default) |
| `editorOverviewRuler.rangeHighlightForeground` | `!alpha [ *BGDarker, '00' ]` | transparent: era blank (herdaria valor opaco do base dark_vs / default) |
| `editorOverviewRuler.selectionHighlightForeground` | `*ORANGE` |  |
| `editorOverviewRuler.wordHighlightForeground` | `*BLUE` |  |
| `editorOverviewRuler.wordHighlightStrongForeground` | `*GREEN` |  |
| `editorOverviewRuler.modifiedForeground` | `!alpha [ *BLUE, '80' ]` |  |
| `editorOverviewRuler.addedForeground` | `!alpha [ *GREEN,  80 ]` |  |
| `editorOverviewRuler.deletedForeground` | `!alpha [ *RED,    80 ]` |  |
| `editorOverviewRuler.errorForeground` | `!alpha [ *RED,    80 ]` |  |
| `editorOverviewRuler.warningForeground` | `!alpha [ *ORANGE, '80' ]` |  |
| `editorOverviewRuler.infoForeground` | `!alpha [ *BLUE,   80 ]` |  |
| `editorError.foreground` | `*RED` | Foreground color of error squigglies in the editor |
| `editorError.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorWarning.foreground` | `*ORANGE` | Border color of warning squigglies in the editor |
| `editorWarning.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorGutter.background` | `*BG` |  |
| `editorGutter.modifiedBackground` | `!alpha [ *BLUE, '80' ]` | Editor gutter background color for lines that are modified |
| `editorGutter.addedBackground` | `!alpha [ *GREEN,  80 ]` | Editor gutter background color for lines that are added |
| `editorGutter.deletedBackground` | `!alpha [ *RED,    80 ]` | Editor gutter background color for lines that are deleted |

## Explorer Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `gitDecoration.modifiedResourceForeground` | `*YELLOW` |  |
| `gitDecoration.deletedResourceForeground` | `*RED` |  |
| `gitDecoration.untrackedResourceForeground` | `*GREEN` |  |
| `gitDecoration.ignoredResourceForeground` | `*COMMENT` |  |
| `gitDecoration.conflictingResourceForeground` | `*ORANGE` |  |

## Diff Editor Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `diffEditor.insertedTextBackground` | `!alpha [ *GREEN, '20' ]` | Background color for inserted text |
| `diffEditor.insertedTextBorder` | `!alpha [ *BGDarker, '00' ]` |  |
| `diffEditor.removedTextBackground` | `!alpha [ *RED, '50' ]` | Background color for removed text |
| `diffEditor.removedTextBorder` | `!alpha [ *BGDarker, '00' ]` |  |

## Editor Widget Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `editorWidget.background` | `*BG` | Background color of editor widgets, such as Find/Replace |
| `editorSuggestWidget.background` | `*BG` | Background color of the suggestion widget |
| `editorSuggestWidget.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorSuggestWidget.foreground` | `*FG` | Foreground color of the suggestion widget |
| `editorSuggestWidget.highlightForeground` | `*SELECTION` |  |
| `editorSuggestWidget.selectedBackground` | `*SELECTION` | Background color of the selected entry in the suggestion widget |
| `editorHoverWidget.background` | `*BG` | Background color of the editor hover |
| `editorHoverWidget.border` | `!alpha [ *BGDarker, '00' ]` | Border color of the editor hover |
| `debugExceptionWidget.background` | `*BGDarker` |  |
| `debugExceptionWidget.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorMarkerNavigation.background` | `*BG` | Editor marker navigation widget background |
| `editorMarkerNavigationError.background` | `*SELECTION` |  |
| `editorMarkerNavigationWarning.background` | `*SELECTION` |  |

## Peek View Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `peekView.border` | `*ACCENT` | Color of the peek view borders and arrow |
| `peekViewEditor.background` | `*BG` | Background color of the peek view editor |
| `peekViewEditorGutter.background` | `!alpha [ *BGDarker, '00' ]` |  |
| `peekViewEditor.matchHighlightBackground` | `!alpha [ *YELLOW, '80' ]` | Match highlight color in the peek view editor |
| `peekViewResult.background` | `*BGDark` | Background color of the peek view result list |
| `peekViewResult.fileForeground` | `*FG` | Foreground color for file nodes in the peek view result list |
| `peekViewResult.lineForeground` | `*FG` | Foreground color for line nodes in the peek view result list |
| `peekViewResult.matchHighlightBackground` | `!alpha [ *YELLOW, '80' ]` | Match highlight color in the peek view result list |
| `peekViewResult.selectionBackground` | `*SELECTION` | Background color of the selected entry in the peek view result list |
| `peekViewResult.selectionForeground` | `*FG` | Foreground color of the selected entry in the peek view result list |
| `peekViewTitle.background` | `*BGDarker` | Background color of the peek view title area |
| `peekViewTitleDescription.foreground` | `*COMMENT` | Color of the peek view title info |
| `peekViewTitleLabel.foreground` | `*FG` | Color of the peek view title |

## Merge Conflicts

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `merge.currentHeaderBackground` | `!alpha [ *GREEN, '90' ]` | Current header background in inline merge conflicts |
| `merge.currentContentBackground` | `!alpha [ *BGDarker, '00' ]` |  |
| `merge.incomingHeaderBackground` | `!alpha [ *CYAN, '90' ]` | Incoming header background in inline merge conflicts |
| `merge.incomingContentBackground` | `!alpha [ *BGDarker, '00' ]` |  |
| `merge.border` | `!alpha [ *BGDarker, '00' ]` |  |
| `editorOverviewRuler.currentContentForeground` | `*GREEN` | Current overview ruler foreground for inline merge conflicts |
| `editorOverviewRuler.incomingContentForeground` | `*CYAN` | Incoming overview ruler foreground for inline merge conflicts |

## Panel Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `panel.background` | `*BG` | Panel background color |
| `panel.border` | `!alpha [ *BGDarker, '00' ]` | Panel border color on the top separating to the editor |
| `panelTitle.activeBorder` | `*ACCENT` | Border color for the active panel title |
| `panelTitle.activeForeground` | `*FG` | Title color for the active panel |
| `panelTitle.inactiveForeground` | `*COMMENT` | Title color for the inactive panel |

## Status Bar Colors

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `statusBar.background` | `*BGLight` | Standard Status Bar background color |
| `statusBar.foreground` | `*FG` | Status Bar foreground color |
| `statusBar.debuggingBackground` | `*RED` | Status Bar background color when a program is being debugged |
| `statusBar.debuggingForeground` | `*INK` | Status Bar foreground color when a program is being debugged |
| `statusBar.noFolderBackground` | `*BGLight` | Status Bar foreground color when no folder is opened |
| `statusBar.noFolderForeground` | `*INK` | Status Bar background color when no folder is opened |
| `statusBarItem.activeBackground` | `!alpha [ *INK, '35' ]` | Status Bar item background color when clicking |
| `statusBarItem.hoverBackground` | `!alpha [ *INK, '20' ]` | Status Bar item background color when hovering |
| `statusBarItem.prominentBackground` | `*PRIMARY` | Status Bar prominent items background color. Prominent items stand out from other Status Bar entries to indicate importance |
| `statusBarItem.prominentForeground` | `'#FFFFFF'` | FFFFFF'                                      # Status Bar prominent items foreground color |
| `statusBarItem.prominentHoverBackground` | `*PRIMARY_HOVER` | Status Bar prominent items background color when hovering. Prominent items stand out from other Status Bar entries to indicate importance |
| `statusBarItem.remoteForeground` | `*FG` | Remote indicator text on the status bar (flat: fundo igual ao resto) |
| `statusBarItem.remoteBackground` | `!alpha [ *ACCENT, '30' ]` | Remote indicator: wash sutil (ODP-flat: transparente; aqui wash leve) |
| `statusBar.border` | `!alpha [ *BGDarker, '00' ]` | transparent: era blank (herdaria valor opaco do base dark_vs / default) |

## Title Bar Colors (MacOS Only)

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `titleBar.activeBackground` | `*BG` | Title Bar background when the window is active |
| `titleBar.activeForeground` | `*FG` | Title Bar foreground when the window is active |
| `titleBar.inactiveBackground` | `*BGDark` | Title Bar background when the window is inactive |
| `titleBar.inactiveForeground` | `*COMMENT` | Title Bar foreground when the window is inactive |

## Extensions

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `extensionButton.prominentForeground` | `*FG` | Extension view button foreground color (for example Install button) |
| `extensionButton.prominentBackground` | `!alpha [ *GREEN, '90' ]` | Extension view button background color |
| `extensionButton.prominentHoverBackground` | `!alpha [ *GREEN, '60' ]` | Extension view button background hover color |

## Quick Input (command palette / quick open)

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `quickInput.background` | `*BG` | Command palette background (flat) |
| `quickInput.foreground` | `*FG` |  |

## Quick Picker

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `pickerGroup.border` | `!alpha [ *BGDarker, '00' ]` | Quick picker (Quick Open) color for grouping borders |
| `pickerGroup.foreground` | `*BLUE` | Quick picker (Quick Open) color for grouping labels |

## Debug

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `debugToolBar.background` | `*BG` | Debug toolbar background color |

## Welcome Page

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `walkThrough.embeddedEditorBackground` | `*BG` | Background color for the embedded editors on the Interactive Playground |

## Setting Editor

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `settings.headerForeground` | `*FG` | The foreground color for a section header or active title |
| `settings.modifiedItemIndicator` | `*ORANGE` | The color of the line that indicates a modified setting |
| `settings.dropdownBackground` | `*BG` | Dropdown background |
| `settings.dropdownForeground` | `*FG` | Dropdown foreground |
| `settings.dropdownBorder` | `!alpha [ *BGDarker, '00' ]` | Dropdown border |
| `settings.checkboxBackground` | `*BG` | Checkbox background |
| `settings.checkboxForeground` | `*FG` | Checkbox foreground |
| `settings.checkboxBorder` | `!alpha [ *BGDarker, '00' ]` | Checkbox border |
| `settings.textInputBackground` | `*BGDark` | Text input box background |
| `settings.textInputForeground` | `*FG` | Text input box foreground |
| `settings.textInputBorder` | `!alpha [ *BGDarker, '00' ]` | Text input box border |
| `settings.numberInputBackground` | `*BGDark` | Number input box background |
| `settings.numberInputForeground` | `*FG` | Number input box foreground |
| `settings.numberInputBorder` | `!alpha [ *BGDarker, '00' ]` | Number input box border |

## Breadcrumbs

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `breadcrumb.foreground` | `*COMMENT` | Color of breadcrumb items |
| `breadcrumb.background` | `*BG` |  |
| `breadcrumb.focusForeground` | `*FG` | Color of focused breadcrumb items |
| `breadcrumb.activeSelectionForeground` | `*FG` | Color of selected breadcrumb items |
| `breadcrumbPicker.background` | `*BGDarker` | Background color of breadcrumb item picker |

## Misc

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `menu.separatorBackground` | `!alpha [ *BGDarker, '00' ]` | Color of a separator menu item in menus (blank would fall back to the base theme's grey #454545) |
| `listFilterWidget.background` | `*BGLight` | Background color of the type filter widget in lists and trees. |
| `listFilterWidget.outline` | `*BGLighter` | Outline color of the type filter widget in lists and trees. |
| `listFilterWidget.noMatchesOutline` | `*RED` | Outline color of the type filter widget in lists and trees, when there are no matches. |

## Inlay Hints

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `editorInlayHint.foreground` | `*COMMENT` | Foreground color of inlay hints |
| `editorInlayHint.background` | `*BG` | Background color of inlay hints |
| `editorInlayHint.typeForeground` | `*BLUE` | Foreground color for type inlay hints |
| `editorInlayHint.typeBackground` | `*BG` | Background color for type inlay hints |
| `editorInlayHint.parameterForeground` | `*ORANGE` | Foreground color for parameter inlay hints |
| `editorInlayHint.parameterBackground` | `*BG` | Background color for parameter inlay hints |

## Inline chat (Copilot / inline assistants)

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `inlineChat.foreground` | `*FG` | Foreground color of the inline chat |
| `inlineChat.background` | `*BG` | Background color of the inline chat |
| `inlineChat.border` | `!alpha [ *BGDarker, '00' ]` | Border color of the inline chat |
| `inlineChat.shadow` | `*BGDarker` | Shadow color of the inline chat |
| `inlineChatDiff.inserted` | `!alpha [ *GREEN, '20' ]` | Background color of inserted text in the inline chat |
| `inlineChatDiff.removed` | `!alpha [ *RED, '20' ]` | Background color of removed text in the inline chat |

## Sticky scroll

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `editorStickyScroll.background` | `*BG` |  |
| `editorStickyScroll.border` | `!alpha [ *BGDarker, '00' ]` | sem linha no sticky |

## Minimap

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `minimap.background` | `*BG` | Minimap background color |
| `minimap.findMatchHighlight` | `!alpha [ *ORANGE, '80' ]` | Minimap highlight color for matches from Find |
| `minimap.selectionHighlight` | `!alpha [ *SELECTION, '80' ]` | Minimap highlight color for the editor selection |
| `minimap.errorHighlight` | `!alpha [ *RED, '80' ]` | Minimap highlight color for errors |
| `minimap.warningHighlight` | `!alpha [ *ORANGE, '80' ]` | Minimap highlight color for warnings |

## Chat / Copilot panel (o painel "Agent" do VS Code)

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `chat.requestBackground` | `*BG` |  |
| `chat.requestBorder` | `!alpha [ *BGDarker, '00' ]` |  |
| `chat.slashCommandBackground` | `!alpha [ *BGLighter, '60' ]` |  |
| `chat.avatarBackground` | `*BGDark` |  |

## Trees

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `tree.indentGuidesStroke` | `*NonText` | Tree indent guides stroke color |
| `tree.inactiveIndentGuidesStroke` | `*NonText` | Tree indent guides stroke color when the tree is not focused |

## Text (markdown preview, etc.)

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `textLink.foreground` | `*BLUE` | Foreground color for links in text |
| `textLink.activeForeground` | `*CYAN` | Foreground color for links in text when clicked on / hovered |
| `textPreformat.foreground` | `*GREEN` | Foreground color for preformatted text segments |
| `textPreformat.background` | `*BGDark` | Background color for preformatted text segments |
| `textPreformat.border` | `!alpha [ *BGDarker, '00' ]` | Border color for preformatted text segments |
| `textBlockQuote.background` | `*BGDark` | Background color for block quotes in text |
| `textBlockQuote.border` | `!alpha [ *BGDarker, '00' ]` | Border color for block quotes in text |
| `textSeparator.foreground` | `*COMMENT` | Color for the text separators |

## Widgets

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `widget.border` | `!alpha [ *BGDarker, '00' ]` | Border color of widgets such as Find/Replace inside the editor |

## Toolbar

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `toolbar.hoverBackground` | `!alpha [ *ACCENT, '22' ]` | Toolbar background when hovering over actions |
| `toolbar.activeBackground` | `!alpha [ *ACCENT, '35' ]` | Toolbar background when holding the mouse over actions |

## on icon buttons / status items, which read as a dotted outline glitch.

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `toolbar.hoverOutline` | `!alpha [ *ACCENT, '00' ]` | Toolbar outline when hovering over actions |

## Title Bar / Window

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `titleBar.border` | `!alpha [ *BGDarker, '00' ]` | Title Bar border color |
| `window.activeBorder` | `!alpha [ *BGDarker, '00' ]` | Window border color when the window is active |
| `window.inactiveBorder` | `!alpha [ *BGDarker, '00' ]` | Window border color when the window is inactive |

## Welcome Page

| Chave | Valor no YAML | O que muda |
|---|---|---|
| `welcomePage.background` | `*BG` | Background color for the Welcome page |
| `welcomePage.progress.background` | `*BGDarker` | Background color for the Welcome page progress bars |
| `welcomePage.progress.foreground` | `*CYAN` | Foreground color for the Welcome page progress bars |
| `welcomePage.tileBackground` | `*BGDark` | Background color for the tiles on the Welcome page |
| `welcomePage.tileHoverBackground` | `!alpha [ *ACCENT, '18' ]` | Hover background color for the tiles on the Welcome page |
| `welcomePage.tileBorder` | `!alpha [ *BGDarker, '00' ]` | Border color for the tiles on the Welcome page |
