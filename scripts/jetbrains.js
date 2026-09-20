/**
 * Builds JetBrains (IntelliJ IDEA, PyCharm, WebStorm, etc.) artifacts from the
 * VS Code theme source:
 *
 *   bin/jetbrains/starry-night-theme.icls   - editor color scheme (standalone-installable)
 *   bin/jetbrains/starry-night.theme.json   - UI theme (new JSON format, 2020.1+)
 *   bin/jetbrains/META-INF/plugin.xml       - plugin descriptor for Marketplace upload
 *   bin/starry-night-theme-jetbrains.zip    - installable plugin package
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
const { version, name, publisher } = require(path.join(ROOT, 'package.json'));

const hex = c => String(c || '').replace('#', '').toUpperCase().slice(0, 6);
const hexOr = (c, f) => (c ? hex(c) : f);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// JetBrains scheme colors: <key, vscode colors key, fallback hex>
const SCHEME_COLORS = [
    ['TEXT', 'editor.foreground', 'F6F6F6'],
    ['BACKGROUND', 'editor.background', '011627'],
    ['CARET_COLOR', 'editorCursor.foreground', '87D8F6'],
    ['CARET_ROW_COLOR', 'editor.lineHighlightBackground', '002137'],
    ['SELECTION_BACKGROUND', 'editor.selectionBackground', '5A839D'],
    ['SELECTION_FOREGROUND', 'editor.selectionForeground', 'F6F6F6'],
    ['LINE_NUMBER', 'editorLineNumber.foreground', '024D75'],
    ['LINE_NUMBER_ON_CARET_LINE', 'editorLineNumber.activeForeground', 'F6F6F6'],
    ['WHITESPACES', 'editorWhitespace.foreground', '394249'],
    ['INDENT_GUIDE', 'editorIndentGuide.background', '394249'],
    ['INACTIVE_INDENT_GUIDE', 'editorIndentGuide.background', '394249'],
    ['RIGHT_MARGIN_COLOR', 'editorRuler.foreground', '394249'],
    ['GUTTER_BACKGROUND', 'editorGutter.background', '011627'],
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
const UI = {
    Editor: { background: ['editor.background', '011627'], foreground: ['editor.foreground', 'F6F6F6'], caretRowBackground: ['editor.lineHighlightBackground', '002137'] },
    Viewer: { background: ['sideBar.background', '011627'], foreground: ['sideBar.foreground', 'F6F6F6'] },
    'Viewer.Transparent': { background: ['sideBar.background', '011627'] },
    ToolWindow: { background: ['sideBar.background', '011627'], foreground: ['sideBar.foreground', 'F6F6F6'] },
    'ToolWindow.Header': { background: ['sideBarSectionHeader.background', '011627'], foreground: ['sideBarTitle.foreground', 'F6F6F6'] },
    'ToolWindow.HeaderBorder': { background: ['sideBarSectionHeader.border', '000A14'] },
    StatusBar: { background: ['statusBar.background', '000A14'], foreground: ['statusBar.foreground', 'F6F6F6'] },
    'StatusBar.Border': { background: ['statusBar.border', '000A14'] },
    Menu: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'] },
    Popup: { background: ['editorWidget.background', '011627'], foreground: ['editorSuggestWidget.foreground', 'F6F6F6'] },
    'Popup.MenuSeparator': { background: ['menu.separatorBackground', '1F2937'] },
    TabbedPane: { background: ['editorGroupHeader.tabsBackground', '000A14'], foreground: ['tab.inactiveForeground', 'B0B0B0'] },
    'TabbedPane.selected': { background: ['tab.activeBackground', '011627'], foreground: ['tab.activeForeground', 'F6F6F6'] },
    'TabbedPane.selectedTopBorder': { background: ['tab.activeBorderTop', '002137'] },
    Component: { background: ['editor.background', '011627'], foreground: ['foreground', 'F6F6F6'] },
    'Component.border': { background: ['widget.border', '000A14'] },
    Label: { foreground: ['foreground', 'F6F6F6'] },
    Button: { background: ['button.background', '5A839D'], foreground: ['button.foreground', 'F6F6F6'] },
    'Button.default': { background: ['button.background', '5A839D'], foreground: ['button.foreground', 'F6F6F6'] },
    CheckBox: { background: ['checkbox.background', '011627'], foreground: ['checkbox.foreground', 'F6F6F6'] },
    ComboBox: { background: ['dropdown.background', '002137'], foreground: ['dropdown.foreground', 'F6F6F6'] },
    TextField: { background: ['input.background', '011627'], foreground: ['input.foreground', 'F6F6F6'] },
    'TextField.border': { background: ['input.border', '000A14'] },
    List: { background: ['sideBar.background', '011627'], foreground: ['foreground', 'F6F6F6'], selectionBackground: ['list.activeSelectionBackground', '5A839D'], selectionForeground: ['list.activeSelectionForeground', 'F6F6F6'], hoverBackground: ['list.hoverBackground', '002137'] },
    Tree: { background: ['sideBar.background', '011627'], foreground: ['foreground', 'F6F6F6'], selectionBackground: ['list.activeSelectionBackground', '5A839D'], selectionForeground: ['list.activeSelectionForeground', 'F6F6F6'], hoverBackground: ['list.hoverBackground', '002137'] },
    ProgressBar: { background: ['progressBar.background', 'FF00FF'] },
    SidePanel: { background: ['sideBar.background', '011627'] },
    TitlePane: { background: ['titleBar.activeBackground', '011627'], foreground: ['titleBar.activeForeground', 'F6F6F6'] },
    Notification: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'] },
    OptionPane: { background: ['editorWidget.background', '011627'], foreground: ['foreground', 'F6F6F6'] },
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
    const colorXml = SCHEME_COLORS.map(([key, vscodeKey, fb]) => {
        const v = hexOr(colors[vscodeKey], fb);
        return `    <option name="${key}">\n      <value>\n        <option name="FOREGROUND" value="${v}"/>\n        <option name="BACKGROUND" value="${v}"/>\n      </value>\n    </option>`;
    }).join('\n');

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
            ui[component][prop] = '#' + hexOr(colors[key], fb);
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

function buildPluginXml() {
    return `<?xml version="1.0" encoding="UTF-8"?>
<idea-plugin>
  <id>com.buffdev.starry-night-theme</id>
  <name>Starry Night Theme</name>
  <version>${esc(version)}</version>
  <vendor email="mydanilows@gmail.com" url="https://github.com/buffDev/starry-night-theme">BuffDev</vendor>
  <description><![CDATA[
Dark theme inspired by Van Gogh's Starry Night for JetBrains IDEs (IntelliJ IDEA, PyCharm, WebStorm, GoLand, etc.).
  ]]></description>
  <extensions defaultExtensionNs="com.intellij">
    <theme id="com.buffdev.starry-night-theme" path="/starry-night.theme.json"/>
  </extensions>
</idea-plugin>
`;
}

async function main() {
    const { base } = await generate();
    const colors = base.colors;

    fs.mkdirSync(path.join(OUT, 'META-INF'), { recursive: true });
    fs.writeFileSync(path.join(OUT, 'starry-night-theme.icls'), buildIcls(colors, base.tokenColors));
    fs.writeFileSync(path.join(OUT, 'starry-night.theme.json'), buildThemeJson(colors));
    fs.writeFileSync(path.join(OUT, 'META-INF', 'plugin.xml'), buildPluginXml());

    const zipPath = path.join(ROOT, 'bin', 'starry-night-theme-jetbrains.zip');
    fs.rmSync(zipPath, { force: true });
    execFileSync('zip', ['-qr', zipPath, '.'], { cwd: OUT });

    console.log(
        `[jetbrains] wrote ${OUT}/starry-night-theme.icls, starry-night.theme.json, META-INF/plugin.xml -> ${zipPath}`
    );
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});