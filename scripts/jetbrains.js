/**
 * Builds JetBrains (IntelliJ IDEA, PyCharm, WebStorm, etc.) artifacts from the
 * VS Code theme source:
 *
 *   bin/jetbrains/starry-night-theme.icls   - editor color scheme (standalone-installable)
 *   bin/jetbrains/starry-night.theme.json   - UI theme (new JSON format, 2020.1+)
 *   bin/jetbrains/starry-night-theme/lib/starry-night-theme.jar - plugin jar (META-INF/plugin.xml, pluginIcon.png, icls, theme.json)
 *   bin/starry-night-theme-jetbrains.zip    - Marketplace archive (<plugin-name>/lib/*.jar)
 *
 * Dev note: this is a working approximation of the JetBrains theme grammar, not
 * a 1:1 mapping of every VS Code key. Unknown attribute/scheme color names are
 * silently ignored by JetBrains, so an imperfect entry degrades gracefully.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const generate = require('./generate');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'bin', 'jetbrains');
// Marketplace requires <plugin-name>/lib/*.jar inside the archive.
const PLUGIN_NAME = 'starry-night-theme';
const { version, name, publisher } = require(path.join(ROOT, 'package.json'));

const hex = c => String(c || '').replace('#', '').toUpperCase().slice(0, 6);
// '#RRGGBB00' is the source convention for "no border/separator" (AGENTS.md):
// slicing the alpha off would paint the opaque lines the VS Code theme removed.
const isClear = c => /^#?[0-9a-f]{6}00$/i.test(String(c || ''));
const hexOr = (c, f) => (c ? (isClear(c) ? '' : hex(c)) : f); // scheme: '' = inherit
const uiColor = (c, f) => '#' + (c ? (isClear(c) ? '00000000' : hex(c)) : f);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// JetBrains editor scheme <colors> entries: flat `<option name="KEY" value="HASH"/>`
// with one colour each — the nested <value> shape belongs to <attributes> only.
// <key, vscode colors key, fallback hex>
const SCHEME_COLORS = [
    ['CARET_COLOR', 'editorCursor.foreground', '87D8F6'],
    ['CARET_ROW_COLOR', 'editor.lineHighlightBackground', '002137'],
    ['SELECTION_BACKGROUND', 'editor.selectionBackground', '5A839D'],
    ['SELECTION_FOREGROUND', 'editor.selectionForeground', 'F6F6F6'],
    ['LINE_NUMBERS_COLOR', 'editorLineNumber.foreground', '4B5059'],
    ['LINE_NUMBER_ON_CARET_ROW_COLOR', 'editorLineNumber.activeForeground', 'A1A3AB'],
    ['WHITESPACES', 'editorWhitespace.foreground', '394249'],
    ['INDENT_GUIDE', 'editorIndentGuide.background', '394249'],
    ['RIGHT_MARGIN_COLOR', 'editorRuler.foreground', '394249'],
    ['EDITOR_GUTTER_BACKGROUND', 'editorGutter.background', '131E33'],
    ['CONSOLE_BACKGROUND_KEY', 'terminal.background', '011627'],
    ['ADDED_LINES_COLOR', 'editorGutter.addedBackground', '549159'],
    ['MODIFIED_LINES_COLOR', 'editorGutter.modifiedBackground', '375FAD'],
    ['DELETED_LINES_COLOR', 'editorGutter.deletedBackground', '868A91'],
    ['FILESTATUS_MODIFIED', 'gitDecoration.modifiedResourceForeground', '70AEFF'],
    ['FILESTATUS_ADDED', 'editorGutter.addedBackground', '73BD79'],
    ['FILESTATUS_DELETED', 'gitDecoration.deletedResourceForeground', '6F737A'],
    ['FILESTATUS_UNKNOWN', 'gitDecoration.untrackedResourceForeground', 'E88F89'],
    ['FILESTATUS_IDEA_FILESTATUS_IGNORED', 'gitDecoration.ignoredResourceForeground', 'D69A6B'],
    ['FILESTATUS_changelistConflict', 'gitDecoration.conflictingResourceForeground', 'DE6A66'],
    ['ERROR_HINT', 'editorError.background', '402929'],
];

// JetBrains text attributes: <attribute, textmate scope, fallback hex, fontStyle>
// fontStyle: 'normal' | 'italic' | 'bold' | 'bold italic'
const ATTRIBUTES = [
    ['KEYWORD', 'keyword', 'FF00FF', 'normal'],
    ['STRING', 'string', 'F7DD3E', 'normal'],
    ['LINE_COMMENT', 'comment', '024D75', 'italic'],
    ['BLOCK_COMMENT', 'comment', '024D75', 'italic'],
    ['DOC_COMMENT', 'comment', '024D75', 'italic'],
    ['NUMBER', 'constant.numeric', 'FAB426', 'normal'],
    ['CONSTANT', 'constant', '87D8F6', 'normal'],
    ['FUNCTION_CALL', 'entity.name.function', '83DD59', 'normal'],
    ['METHOD_CALL', 'entity.name.function', '83DD59', 'normal'],
    ['METHOD_DECLARATION', 'entity.name.function', '83DD59', 'normal'],
    ['CLASS_NAME', 'entity.name.type', '459BC9', 'italic'],
    ['INTERFACE_NAME', 'entity.name.type', '459BC9', 'italic'],
    ['ENUM_NAME', 'entity.name.type', '459BC9', 'italic'],
    ['TYPE_PARAMETER_NAME', 'entity.name.type.type-parameter', 'FAB426', 'normal'],
    ['ANNOTATION_NAME', 'meta.decorator', '83DD59', 'italic'],
    ['IDENTIFIER', 'variable', 'F6F6F6', 'normal'],
    ['LOCAL_VARIABLE', 'variable', 'F6F6F6', 'normal'],
    ['INSTANCE_FIELD', 'variable.other', 'F6F6F6', 'normal'],
    ['STATIC_FIELD', 'variable.other', 'F6F6F6', 'normal'],
    ['GLOBAL_VARIABLE', 'variable.other', 'F6F6F6', 'normal'],
    ['PARAMETER', 'variable.parameter', 'FAB426', 'italic'],
    ['OPERATOR_SIGN', 'punctuation', 'FF00FF', 'normal'],
    ['PARENTHESES', 'meta.brace.round', 'F6F6F6', 'normal'],
    ['BRACKETS', 'meta.brace.round', 'F6F6F6', 'normal'],
    ['BRACES', 'meta.brace.round', 'F6F6F6', 'normal'],
    ['SEMICOLON', '', 'F6F6F6', 'normal'],
    ['COMMA', '', 'F6F6F6', 'normal'],
    ['DOT', '', 'F6F6F6', 'normal'],
    ['ASSIGNMENT', '', 'FF00FF', 'normal'],
    ['LABEL', '', '87D8F6', 'normal'],
    ['TAG', 'entity.name.tag', 'FF00FF', 'normal'],
    ['XML_TAG', 'entity.name.tag', 'FF00FF', 'normal'],
    ['XML_TAG_NAME', 'entity.name.tag', 'FF00FF', 'normal'],
    ['XML_ATTRIBUTE_NAME', 'entity.other.attribute-name', '83DD59', 'italic'],
    ['XML_ATTRIBUTE_VALUE', 'string', 'F7DD3E', 'normal'],
    ['XML_ENTITY_REFERENCE', 'constant.character.escape', 'FF00FF', 'normal'],
    ['MARKUP_TAG', 'entity.name.tag', 'FF00FF', 'normal'],
    ['MARKUP_ATTRIBUTE', 'entity.other.attribute-name', '83DD59', 'italic'],
    ['VALID_STRING_ESCAPE', 'constant.character.escape', 'FF00FF', 'normal'],
    ['INVALID_STRING_ESCAPE', '', 'FF6F60', 'normal'],
    ['PREPROCESSOR', 'keyword', 'FF00FF', 'normal'],
    ['ERROR', 'invalid', 'FF6F60', 'normal'],
    ['WARNING', 'markup.changed', 'FAB426', 'normal'],
    ['TODO', '', 'F7DD3E', 'normal'],
];

// UI theme mapping: JetBrains component key -> [vscode colors key(s), fallback]
// Only well-known JBUI keys are used; invalid ones are ignored by the IDE.
// New UI (2023.3+) reads MainToolbar.*/MainWindow.*/EditorTabs.*/StatusBar.*/
// ToolWindow.HeaderTab.*; TabbedPane.*/TitlePane.* only matter to the classic UI.
const UI = {
    // Defaults every component that is not overridden below inherits.
    '*': {
        background: ['sideBar.background', '011627'],
        foreground: ['foreground', 'F6F6F6'],
        borderColor: ['sideBarSectionHeader.border', '00000000'],
        separatorColor: ['sideBarSectionHeader.border', '00000000'],
        separatorForeground: ['tab.inactiveForeground', 'B0B0B0'],
        disabledText: ['tab.inactiveForeground', 'B0B0B0'],
        disabledForeground: ['tab.inactiveForeground', 'B0B0B0'],
        disabledBackground: ['input.background', '011627'],
        inactiveForeground: ['tab.inactiveForeground', 'B0B0B0'],
        infoForeground: ['tab.inactiveForeground', 'B0B0B0'],
        acceleratorForeground: ['tab.inactiveForeground', 'B0B0B0'],
        shortcutForeground: ['tab.inactiveForeground', 'B0B0B0'],
        selectionBackground: ['list.activeSelectionBackground', '5A839D'],
        lightSelectionBackground: ['list.inactiveSelectionBackground', '002137'],
        selectionForeground: ['list.activeSelectionForeground', 'F6F6F6'],
        selectionInactiveBackground: ['list.inactiveSelectionBackground', '002137'],
        selectionInactiveForeground: ['list.activeSelectionForeground', 'F6F6F6'],
        hoverBackground: ['list.hoverBackground', '002137'],
        underlineColor: ['tab.activeBorderTop', '002137'],
        inactiveUnderlineColor: ['titleBar.inactiveBackground', '000A14'],
        focusColor: ['focusBorder', '5A839D'],
        focusedBorderColor: ['focusBorder', '5A839D'],
        modifiedItemForeground: ['gitDecoration.modifiedResourceForeground', '70AEFF'],
    },

    // Window chrome: the header strip above the tool windows and editor tabs.
    MainWindow: { background: ['titleBar.activeBackground', '011627'] },
    MainToolbar: {
        background: ['titleBar.activeBackground', '011627'],
        inactiveBackground: ['titleBar.inactiveBackground', '011627'],
        borderColor: ['titleBar.border', '00000000'],
        separatorColor: ['titleBar.border', '00000000'],
    },
    'MainToolbar.Icon': { background: ['titleBar.activeBackground', '011627'], pressedBackground: ['list.hoverBackground', '002137'] },
    'MainToolbar.Dropdown': { pressedBackground: ['list.hoverBackground', '002137'], transparentHoverBackground: ['list.hoverBackground', '002137'] },
    'MainWindow.Tab': {
        background: ['titleBar.activeBackground', '011627'],
        foreground: ['tab.inactiveForeground', 'B0B0B0'],
        selectedBackground: ['sideBar.background', '011627'],
        selectedForeground: ['titleBar.activeForeground', 'F6F6F6'],
        hoverBackground: ['list.hoverBackground', '002137'],
        separatorColor: ['titleBar.border', '00000000'],
    },
    // Vertical stripe holding the tool window buttons.
    'ToolWindow.Stripe': {
        background: ['activityBar.background', '011627'],
        borderColor: ['activityBar.border', '00000000'],
        separatorColor: ['activityBar.border', '00000000'],
    },

    // Editor tabs; New UI underlines the selected tab with the accent.
    EditorTabs: {
        background: ['editorGroupHeader.tabsBackground', '000A14'],
        borderColor: ['tab.border', '00000000'],
        underTabsBorderColor: ['tab.border', '00000000'],
        hoverBackground: ['list.hoverBackground', '002137'],
        hoverInactiveBackground: ['list.hoverBackground', '002137'],
        inactiveColoredFileBackground: ['tab.inactiveBackground', '000A14'],
        underlineColor: ['tab.activeBorderTop', '002137'],
        inactiveUnderlineColor: ['titleBar.inactiveBackground', '000A14'],
        underlinedBorderColor: ['tab.activeBorderTop', '002137'],
        inactiveUnderlinedTabBorderColor: ['titleBar.inactiveBackground', '000A14'],
        underlinedTabBackground: ['tab.activeBackground', '011627'],
        underlinedTabForeground: ['tab.activeForeground', 'F6F6F6'],
        inactiveUnderlinedTabBackground: ['tab.inactiveBackground', '000A14'],
    },

    Editor: { background: ['editor.background', '011627'], foreground: ['editor.foreground', 'F6F6F6'], caretRowBackground: ['editor.lineHighlightBackground', '002137'] },
    'Editor.SearchField': { background: ['input.background', '011627'], borderColor: ['input.border', '00000000'] },
    'Editor.Toolbar': { borderColor: ['editorGroup.border', '00000000'] },
    EditorPane: { background: ['editor.background', '011627'], inactiveBackground: ['editor.background', '011627'], splitBorder: ['editorGroup.border', '00000000'] },
    Viewer: { background: ['sideBar.background', '011627'], foreground: ['foreground', 'F6F6F6'] },
    'Viewer.Transparent': { background: ['sideBar.background', '011627'] },
    ToolWindow: { background: ['sideBar.background', '011627'], foreground: ['foreground', 'F6F6F6'], borderColor: ['sideBar.border', '00000000'] },
    'ToolWindow.Header': {
        background: ['sideBarSectionHeader.background', '011627'],
        foreground: ['foreground', 'F6F6F6'],
        inactiveBackground: ['sideBar.background', '011627'],
        inactiveForeground: ['tab.inactiveForeground', 'B0B0B0'],
        borderColor: ['sideBarSectionHeader.border', '00000000'],
    },
    'ToolWindow.HeaderTab': {
        underlineColor: ['tab.activeBorderTop', '002137'],
        inactiveUnderlineColor: ['titleBar.inactiveBackground', '000A14'],
        underlinedTabBackground: ['sideBar.background', '011627'],
        underlinedTabInactiveBackground: ['sideBarSectionHeader.background', '011627'],
        selectedInactiveBackground: ['sideBarSectionHeader.background', '011627'],
        hoverBackground: ['list.hoverBackground', '002137'],
        hoverInactiveBackground: ['list.hoverBackground', '002137'],
    },
    'ToolWindow.HeaderCloseButton': { background: ['list.hoverBackground', '002137'] },
    'ToolWindow.Button': {
        foreground: ['tab.inactiveForeground', 'B0B0B0'],
        selectedForeground: ['list.activeSelectionForeground', 'F6F6F6'],
        selectedBackground: ['list.activeSelectionBackground', '5A839D'],
        hoverBackground: ['list.hoverBackground', '002137'],
    },
    'ToolWindow.HeaderBorder': { background: ['sideBarSectionHeader.border', '00000000'] },
    // Swing toolbars (editor consoles and friends).
    ToolBar: { background: ['editorGroupHeader.tabsBackground', '000A14'], foreground: ['foreground', 'F6F6F6'], borderColor: ['editorGroup.border', '00000000'], separatorColor: ['editorGroup.border', '00000000'] },
    'Toolbar.Floating': { background: ['editorWidget.background', '011627'], borderColor: ['editorWidget.border', '00000000'] },

    StatusBar: { background: ['statusBar.background', '000A14'], foreground: ['statusBar.foreground', 'F6F6F6'], borderColor: ['statusBar.border', '00000000'] },
    'StatusBar.Border': { background: ['statusBar.border', '00000000'] },
    'StatusBar.Widget': {
        foreground: ['statusBar.foreground', 'F6F6F6'],
        hoverForeground: ['statusBar.foreground', 'F6F6F6'],
        hoverBackground: ['statusBarItem.hoverBackground', '000A14'],
        pressedBackground: ['statusBarItem.activeBackground', '000A14'],
    },
    'StatusBar.Breadcrumbs': {
        foreground: ['statusBar.foreground', 'F6F6F6'],
        hoverForeground: ['statusBar.foreground', 'F6F6F6'],
        hoverBackground: ['statusBarItem.hoverBackground', '000A14'],
        pressedBackground: ['statusBarItem.activeBackground', '000A14'],
        selectionBackground: ['statusBarItem.activeBackground', '000A14'],
        selectionInactiveBackground: ['statusBarItem.activeBackground', '000A14'],
    },
    MemoryIndicator: {
        usedBackground: ['badge.background', 'FF00FF'],
        usedForeground: ['badge.foreground', 'F6F6F6'],
        allocatedBackground: ['statusBarItem.activeBackground', '002137'],
        allocatedForeground: ['statusBar.foreground', 'F6F6F6'],
    },
    ProgressBar: { background: ['progressBar.background', 'FF00FF'], trackColor: ['input.background', '011627'], progressColor: ['progressBar.background', 'FF00FF'], failedColor: ['editorError.foreground', 'FF6F60'] },

    // Data grid (Database tool windows, result sets).
    Table: {
        background: ['editor.background', '011627'],
        foreground: ['foreground', 'F6F6F6'],
        gridColor: ['editorWhitespace.foreground', '394249'],
        stripeColor: ['sideBarSectionHeader.background', '011627'],
        alternativeRowBackground: ['sideBarSectionHeader.background', '011627'],
        hoverBackground: ['list.hoverBackground', '002137'],
        hoverInactiveBackground: ['list.hoverBackground', '002137'],
        selectionBackground: ['list.activeSelectionBackground', '5A839D'],
        selectionForeground: ['list.activeSelectionForeground', 'F6F6F6'],
        sortIconColor: ['focusBorder', '5A839D'],
    },
    TableHeader: {
        background: ['sideBarSectionHeader.background', '011627'],
        foreground: ['tab.inactiveForeground', 'B0B0B0'],
        inactiveBackground: ['sideBar.background', '011627'],
        inactiveForeground: ['tab.inactiveForeground', 'B0B0B0'],
        separatorColor: ['editorWhitespace.foreground', '394249'],
        bottomSeparatorColor: ['editorWhitespace.foreground', '394249'],
    },
    List: {
        background: ['sideBar.background', '011627'],
        foreground: ['foreground', 'F6F6F6'],
        selectionBackground: ['list.activeSelectionBackground', '5A839D'],
        selectionForeground: ['list.activeSelectionForeground', 'F6F6F6'],
        selectionInactiveBackground: ['list.inactiveSelectionBackground', '002137'],
        hoverBackground: ['list.hoverBackground', '002137'],
        hoverInactiveBackground: ['list.hoverBackground', '002137'],
    },
    Tree: {
        background: ['sideBar.background', '011627'],
        foreground: ['foreground', 'F6F6F6'],
        selectionBackground: ['list.activeSelectionBackground', '5A839D'],
        selectionForeground: ['list.activeSelectionForeground', 'F6F6F6'],
        selectionInactiveBackground: ['list.inactiveSelectionBackground', '002137'],
        hoverBackground: ['list.hoverBackground', '002137'],
        hoverInactiveBackground: ['list.hoverBackground', '002137'],
        hash: ['tree.indentGuidesStroke', '394249'],
    },

    // Popups, menus, notifications.
    Popup: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'], borderColor: ['editorWidget.border', '00000000'], inactiveBorderColor: ['editorWidget.border', '00000000'], innerBorderColor: ['editorWidget.border', '00000000'] },
    'Popup.Header': { activeBackground: ['sideBarSectionHeader.background', '011627'], activeForeground: ['foreground', 'F6F6F6'] },
    'Popup.Toolbar': { background: ['sideBarSectionHeader.background', '011627'], borderColor: ['editorWidget.border', '00000000'] },
    'Popup.Advertiser': { background: ['sideBarSectionHeader.background', '011627'], foreground: ['tab.inactiveForeground', 'B0B0B0'], borderColor: ['editorWidget.border', '00000000'] },
    'Popup.MenuSeparator': { background: ['menu.separatorBackground', '1F2937'] },
    PopupMenu: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'] },
    Menu: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'], borderColor: ['editorWidget.border', '00000000'], disabledForeground: ['tab.inactiveForeground', 'B0B0B0'], acceleratorForeground: ['tab.inactiveForeground', 'B0B0B0'] },
    Notification: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'], borderColor: ['editorWidget.border', '00000000'] },
    ToolTip: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'], borderColor: ['editorWidget.border', '00000000'] },
    SearchMatch: { startBackground: ['editor.findMatchBackground', '5A839D'], endBackground: ['editor.findMatchHighlightBackground', '5A839D'] },
    OptionPane: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'] },
    TabbedPane: { background: ['editorGroupHeader.tabsBackground', '000A14'], foreground: ['tab.inactiveForeground', 'B0B0B0'], underlineColor: ['tab.activeBorderTop', '002137'], hoverColor: ['list.hoverBackground', '002137'] },
    'TabbedPane.selected': { background: ['tab.activeBackground', '011627'], foreground: ['tab.activeForeground', 'F6F6F6'] },
    'TabbedPane.selectedTopBorder': { background: ['tab.activeBorderTop', '002137'] },
    'TabbedPane.contentAreaColor': { background: ['editorGroup.border', '00000000'] },
    Component: { background: ['editor.background', '011627'], foreground: ['foreground', 'F6F6F6'], borderColor: ['input.border', '00000000'], focusedBorderColor: ['focusBorder', '5A839D'], focusColor: ['focusBorder', '5A839D'] },
    'Component.border': { background: ['input.border', '00000000'] },
    Borders: { color: ['input.border', '00000000'], ContrastBorderColor: ['input.border', '00000000'] },
    Separator: { separatorColor: ['sideBarSectionHeader.border', '00000000'], separatorForeground: ['tab.inactiveForeground', 'B0B0B0'] },
    OnePixelDivider: { background: ['sideBarSectionHeader.border', '00000000'] },
    Label: { foreground: ['foreground', 'F6F6F6'], disabledForeground: ['tab.inactiveForeground', 'B0B0B0'] },
    Link: { activeForeground: ['textLink.foreground', '5A839D'], hoverForeground: ['textLink.activeForeground', '93C5FD'], pressedForeground: ['textLink.activeForeground', '93C5FD'], visitedForeground: ['textLink.foreground', '5A839D'], secondaryForeground: ['textLink.foreground', '5A839D'] },
    Button: { background: ['button.background', '5A839D'], foreground: ['button.foreground', 'F6F6F6'], borderColor: ['button.border', '00000000'], disabledBorderColor: ['button.border', '00000000'], startBackground: ['button.secondaryBackground', '002137'], endBackground: ['button.secondaryBackground', '002137'], shadowColor: ['button.secondaryBackground', '002137'], focusedBorderColor: ['focusBorder', '5A839D'] },
    'Button.default': { background: ['button.background', '5A839D'], foreground: ['button.foreground', 'F6F6F6'], startBackground: ['button.background', '5A839D'], endBackground: ['button.background', '5A839D'], startBorderColor: ['button.background', '5A839D'], endBorderColor: ['button.background', '5A839D'] },
    CheckBox: { background: ['checkbox.background', '011627'], foreground: ['checkbox.foreground', 'F6F6F6'], select: ['focusBorder', '5A839D'] },
    RadioButton: { background: ['checkbox.background', '011627'], foreground: ['checkbox.foreground', 'F6F6F6'] },
    ComboBox: { background: ['dropdown.background', '002137'], foreground: ['dropdown.foreground', 'F6F6F6'], nonEditableBackground: ['dropdown.background', '002137'], borderColor: ['dropdown.border', '00000000'], arrowColor: ['tab.inactiveForeground', 'B0B0B0'], selectionBackground: ['list.activeSelectionBackground', '5A839D'], selectionForeground: ['list.activeSelectionForeground', 'F6F6F6'] },
    TextField: { background: ['input.background', '011627'], foreground: ['input.foreground', 'F6F6F6'], borderColor: ['input.border', '00000000'], inactiveBorderColor: ['input.border', '00000000'], disabledBackground: ['input.background', '011627'], placeholderForeground: ['input.placeholderForeground', 'B0B0B0'], selectionBackground: ['editor.selectionBackground', '5A839D'] },
    'TextField.border': { background: ['input.border', '00000000'] },
    SidePanel: { background: ['sideBar.background', '011627'] },
    TitlePane: { background: ['titleBar.activeBackground', '011627'], foreground: ['titleBar.activeForeground', 'F6F6F6'] },
    IconBadge: { errorBackground: ['editorError.foreground', 'FF6F60'], warningBackground: ['editorWarning.foreground', 'FAB426'], successBackground: ['gitDecoration.addedResourceForeground', '83DD59'], infoBackground: ['focusBorder', '5A839D'] },
};

function scopeList(rule) {
    return Array.isArray(rule.scope) ? rule.scope : rule.scope ? [rule.scope] : [];
}

/** First token rule targeting `scope` that actually sets a foreground. */
function tokColor(tokenColors, scope, fallback) {
    for (const rule of tokenColors) {
        const s = rule.settings || {};
        if (
            s.foreground &&
            scopeList(rule).some(m => m === scope || m.startsWith(scope + '.') || m.startsWith(scope + ' '))
        ) {
            return hex(s.foreground);
        }
    }
    return fallback;
}

const FONT_TYPE = { normal: '', italic: '1', bold: '2', 'bold italic': '3', 'italic bold': '3' };

function buildIcls(colors, tokenColors) {
    // <colors> is a flat list of one-colour options; a nested <value> in here makes
    // the IDE reject the whole scheme and silently keep its default editor colours.
    const colorXml = SCHEME_COLORS.map(
        ([key, vscodeKey, fb]) => `    <option name="${key}" value="${hexOr(colors[vscodeKey], fb)}"/>`
    ).join('\n');

    const attrXml = ATTRIBUTES.map(([key, scope, fb, font]) => {
        const fg = scope ? tokColor(tokenColors, scope, fb) : fb;
        const es = [];
        if (font) es.push(`<option name="FONT_TYPE" value="${FONT_TYPE[font]}"/>`);
        es.push(`<option name="FOREGROUND" value="${fg}"/>`);
        return `    <option name="${key}">\n      <value>\n        ${es.join('\n        ')}\n      </value>\n    </option>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<scheme name="Starry Night Theme" version="142" parent_scheme="Darcula">
  <colors>
${colorXml}
  </colors>
  <attributes>
    <option name="TEXT">
      <value>
        <option name="FOREGROUND" value="${hexOr(colors['editor.foreground'], 'F6F6F6')}"/>
        <option name="BACKGROUND" value="${hexOr(colors['editor.background'], '011627')}"/>
      </value>
    </option>
    <option name="DEFAULT">
      <value>
        <option name="FOREGROUND" value="${hexOr(colors['editor.foreground'], 'F6F6F6')}"/>
      </value>
    </option>
${attrXml}
  </attributes>
</scheme>
`;
}

function buildThemeJson(colors) {
    const ui = {};
    for (const [component, props] of Object.entries(UI)) {
        ui[component] = {};
        for (const [prop, [key, fb]] of Object.entries(props)) {
            ui[component][prop] = uiColor(colors[key], fb);
        }
    }
    return JSON.stringify(
        {
            name: 'Starry Night Theme',
            dark: true,
            author: 'BuffDev',
            editorScheme: '/starry-night-theme.icls',
            ui,
        },
        null,
        2
    );
}

// README/CHANGELOG are markdown, the descriptor wants HTML. Keeps it minimal:
// drops headings/images, one <p> per paragraph, bold and links only.
function mdToHtml(md) {
    return md
        .split(/\n{2,}/)
        .map(p =>
            p
                .split('\n')
                .map(l => l.replace(/^\s*(#|>|-|\|)+\s*/, '').trim())
                .filter(l => l && !l.startsWith('![') && !l.startsWith('<'))
                .join(' ')
        )
        .filter(Boolean)
        .map(p =>
            `<p>${p
                .replace(/`/g, '')
                .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
                .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')}</p>`
        )
        .join('\n');
}

// Intro of the README (everything before the first "## " section).
function readmeIntro() {
    const md = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
    return md.replace(/^#\s.*\n/, '').split(/^##\s/m)[0];
}

// Latest CHANGELOG section, without its "## [x.y.z] - date" heading.
function changelogLatest() {
    const md = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
    const sections = md.split(/^##\s/m).slice(1);
    return sections[0] ? sections[0].replace(/^.*\n/, '') : '';
}

function buildPluginXml() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<idea-plugin>
  <id>com.buffdev.starry-night-theme</id>
  <name>Starry Night Theme</name>
  <version>${esc(version)}</version>
  <idea-version since-build="201"/>
  <vendor email="mydanilows@gmail.com" url="https://github.com/buffDev/starry-night-theme">BuffDev</vendor>
  <description><![CDATA[
${mdToHtml(readmeIntro())}
  ]]></description>
  <change-notes><![CDATA[
${mdToHtml(changelogLatest())}
  ]]></change-notes>
  <depends>com.intellij.modules.platform</depends>
  <extensions defaultExtensionNs="com.intellij">
    <themeProvider id="com.buffdev.starry-night-theme" path="/starry-night.theme.json"/>
  </extensions>
</idea-plugin>
`;
}

async function main() {
    const { base } = await generate();
    const colors = base.colors;

    const icls = buildIcls(colors, base.tokenColors);
    const themeJson = buildThemeJson(colors);
    const pluginXml = buildPluginXml();

    // A nested <value> inside <colors> (the <attributes> shape) makes the IDE
    // refuse the scheme file and silently keep its own editor colours.
    const colorsBlock = icls.slice(icls.indexOf('<colors>'), icls.indexOf('</colors>'));
    if (colorsBlock.includes('<value>') || !/name="TEXT">\s*<value>/.test(icls)) {
        throw new Error('icls <colors> must be flat value= options and TEXT must live in <attributes>');
    }

    // bin/ is gitignored; create it on fresh checkouts (CI).
    fs.mkdirSync(OUT, { recursive: true });

    // Standalone artifacts (manual install into <IDE>/colors, see INSTALL.md).
    fs.writeFileSync(path.join(OUT, 'starry-night-theme.icls'), icls);
    fs.writeFileSync(path.join(OUT, 'starry-night.theme.json'), themeJson);

    // Marketplace only accepts archives shaped <plugin-name>/lib/*.jar
    // (UnexpectedPluginZipStructure otherwise). The jar itself carries
    // META-INF/plugin.xml + icls + theme.json; the plugin root must not.
    const pluginRoot = path.join(OUT, PLUGIN_NAME);
    fs.rmSync(pluginRoot, { recursive: true, force: true });
    const jarPath = path.join(pluginRoot, 'lib', `${PLUGIN_NAME}.jar`);
    fs.mkdirSync(path.join(pluginRoot, 'lib'), { recursive: true });
    const stage = fs.mkdtempSync(path.join(OUT, '.jar-stage-'));
    try {
        fs.mkdirSync(path.join(stage, 'META-INF'), { recursive: true });
        fs.writeFileSync(path.join(stage, 'META-INF', 'plugin.xml'), pluginXml);
        // Marketplace plugin icon (128x128 PNG, repo root).
        fs.copyFileSync(path.join(ROOT, 'icon.png'), path.join(stage, 'META-INF', 'pluginIcon.png'));
        fs.writeFileSync(path.join(stage, 'starry-night-theme.icls'), icls);
        fs.writeFileSync(path.join(stage, 'starry-night.theme.json'), themeJson);
        execFileSync('zip', ['-qr', jarPath, '.'], { cwd: stage });
    } finally {
        fs.rmSync(stage, { recursive: true, force: true });
    }

    const zipPath = path.join(ROOT, 'bin', 'starry-night-theme-jetbrains.zip');
    fs.rmSync(zipPath, { force: true });
    execFileSync('zip', ['-qr', zipPath, PLUGIN_NAME], { cwd: OUT });

    const listing = execFileSync('unzip', ['-l', zipPath], { encoding: 'utf8' });
    if (!listing.includes(`${PLUGIN_NAME}/lib/${PLUGIN_NAME}.jar`)) {
        throw new Error(`unexpected archive layout, Marketplace would reject it:\n${listing}`);
    }
    if (!/<idea-version since-build="\d+/.test(pluginXml)) {
        throw new Error('plugin.xml without <idea-version since-build> — Marketplace rejects the upload');
    }
    if (!pluginXml.includes('<themeProvider ')) {
        throw new Error('plugin.xml without <themeProvider> — Marketplace will not tag the plugin as a theme');
    }
    if (!/META-INF\/pluginIcon\.png/.test(execFileSync('unzip', ['-l', jarPath], { encoding: 'utf8' }))) {
        throw new Error('jar without META-INF/pluginIcon.png — Marketplace shows no plugin icon');
    }
    if (!pluginXml.includes('<change-notes>')) {
        throw new Error('plugin.xml without <change-notes> — Marketplace shows no "What\'s new"');
    }
    if (!pluginXml.includes('<depends>com.intellij.modules.platform</depends>')) {
        throw new Error('plugin.xml without platform dependency — Marketplace treats it as legacy IDEA-only');
    }

    console.log(
        `[jetbrains] wrote ${jarPath} (META-INF/plugin.xml, icls, theme.json) + standalone files -> ${zipPath}`
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});