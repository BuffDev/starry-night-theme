/**
 * Builds JetBrains (IntelliJ IDEA, PyCharm, WebStorm, etc.) artifacts from the
 * VS Code theme source:
 *
 *   bin/jetbrains/starry-night-theme.icls   - editor color scheme (standalone-installable)
 *   bin/jetbrains/starry-night.theme.json   - UI theme (new JSON format, 2020.1+)
 *   bin/jetbrains/starry-night-theme/lib/starry-night-theme.jar - plugin jar (META-INF/plugin.xml, pluginIcon.png, icls, theme.json)
 *   bin/starry-night-theme-jetbrains.zip    - Marketplace archive (<plugin-name>/lib/*.jar)
 *
 * Conversion rules (mirrored from dracula/jetbrains, the reference theme that
 * ships for both editors — colours always come from OUR palette, never theirs):
 *
 * - Attribute names must be REAL JetBrains keys. The invented bare names
 *   (KEYWORD, STRING, NUMBER, LINE_COMMENT, ...) do not exist in any scheme the
 *   platform reads: languages register their keys with a fallback to the
 *   "Language Defaults" pair (JAVA_KEYWORD -> DEFAULT_KEYWORD), so setting
 *   DEFAULT_* themes every language at once and an invented name themes nothing
 *   — silently, with the editor returning to Darcula. BANNED_ATTRIBUTES guards it.
 * - `<colors>` is a FLAT list of one-colour options. The nested <value> shape is
 *   the <attributes> grammar and belongs only there.
 * - The scheme has no alpha channel: a '#RRGGBBAA' source colour is composited
 *   over the editor background (solid()), and fully transparent ('#RRGGBB00',
 *   the source convention for "no border") becomes an empty value = inherit.
 * - The UI theme JSON DOES take '#RRGGBBAA', so it keeps the source alpha.
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
// the scheme has no alpha, so a transparent colour must become "inherit" (''),
// never an opaque line the VS Code theme deliberately removed.
const isClear = c => /^#?[0-9a-f]{6}00$/i.test(String(c || ''));

/** '#RRGGBB[AA]' -> { rgb, a }. */
function rgba(c) {
    const s = String(c || '').replace('#', '').toUpperCase();
    if (/^[0-9A-F]{8}$/.test(s)) return { rgb: s.slice(0, 6), a: parseInt(s.slice(6), 16) / 255 };
    if (/^[0-9A-F]{6}$/.test(s)) return { rgb: s, a: 1 };
    return null;
}

/**
 * Solid colour for the editor scheme (which has no alpha): `c` composited over
 * `over`. Without this the generator would paint the raw palette colour at full
 * strength where VS Code shows a 30%-alpha wash.
 */
function solid(c, over) {
    const x = rgba(c);
    if (!x) return '';
    const b = rgba(over) || { rgb: '131E33', a: 1 };
    const ch = i => {
        const f = parseInt(x.rgb.substr(i, 2), 16);
        const t = parseInt(b.rgb.substr(i, 2), 16);
        return Math.round(f * x.a + t * (1 - x.a))
            .toString(16)
            .padStart(2, '0');
    };
    return (ch(0) + ch(2) + ch(4)).toUpperCase();
}

// scheme value: '' = inherit, otherwise a solid hex.
const schemeColor = (c, fallback, bg) => (!c ? fallback : isClear(c) ? '' : solid(c, bg));
// theme.json value: alpha is meaningful here, so only 'transparent' is special-cased.
const uiColor = (c, fallback) => `#${!c ? fallback : isClear(c) ? '00000000' : String(c).replace('#', '').toUpperCase()}`;
// How a selector atom relates to one path of a scope: exactly, or as an
// ancestor (the atom is a dot-path prefix of the path). A selector deeper than
// the token's own scope does NOT apply — TextMate requires a prefix match.
function relation(atom, path) {
    if (atom === path) return 'exact';
    if (path.startsWith(atom + '.')) return 'ancestor';
    return null;
}

/**
 * TextMate selector vs. queried scope. A selector applies when all of its atoms
 * match query paths in order with the LAST atom landing on the innermost path —
 * so `meta.scope.for-loop.shell string` does not match a plain string token.
 * A deeper exact selector outranks a shallower one.
 */
function matchScore(selectors, scope) {
    const paths = scope.split(' ').filter(Boolean);
    let best = 0;
    for (const m of selectors) {
        const atoms = m.split(' ').filter(Boolean);
        let next = 0;
        let kind = null;
        let ok = true;
        for (let i = 0; i < atoms.length; i++) {
            const isLast = i === atoms.length - 1;
            let found = -1;
            for (let p = next; p < paths.length; p++) {
                const rel = relation(atoms[i], paths[p]);
                if (!rel) continue;
                if (isLast && p !== paths.length - 1) break; // must land on the innermost path
                found = p;
                kind = rel;
                break;
            }
            if (found < 0) {
                ok = false;
                break;
            }
            next = found + 1;
        }
        if (!ok) continue;
        best = Math.max(best, kind === 'exact' ? 1e6 + atoms.length : atoms[atoms.length - 1].length);
    }
    return best;
}
const scopeList = rule => (Array.isArray(rule.scope) ? rule.scope : rule.scope ? [rule.scope] : []);

/**
 * Colour + font style VS Code would render for `scope`. Later rules win ties
 * (TextMate semantics), which is what the trailing "Edge cases (foreground
 * color resets)" block in the source relies on.
 */
function tokStyle(tokenColors, scope, fbFg, fbFont) {
    let fgScore = -1;
    let fontScore = -1;
    let fg = null;
    let font = null;
    for (const rule of tokenColors) {
        const s = rule.settings || {};
        const score = matchScore(scopeList(rule), scope);
        if (!score) continue;
        if (s.foreground && score >= fgScore) {
            fgScore = score;
            fg = hex(s.foreground);
        }
        if (s.fontStyle && score >= fontScore) {
            fontScore = score;
            font = s.fontStyle;
        }
    }
    return { fg: fg || fbFg, font: font || fbFont || 'normal' };
}

// IntelliJ FontType: 0 PLAIN, 1 BOLD, 2 ITALIC, 3 BOLD_ITALIC.
const FONT_TYPE = { normal: '', regular: '', bold: '1', italic: '2', 'bold italic': '3', 'italic bold': '3' };

// JetBrains editor scheme <colors> entries: flat `<option name="KEY" value="HASH"/>`
// with one colour each. [key, vscode colors key, fallback hex]
const SCHEME_COLORS = [
    ['CARET_COLOR', 'editorCursor.foreground', '7DD3FC'],
    ['CARET_ROW_COLOR', 'editor.lineHighlightBackground', '1A2A45'],
    ['SELECTION_BACKGROUND', 'editor.selectionBackground', '2F4B6E'],
    ['SELECTION_FOREGROUND', 'editor.selectionForeground', 'E8EEF5'],
    ['LINE_NUMBERS_COLOR', 'editorLineNumber.foreground', '8B99A8'],
    ['LINE_NUMBER_ON_CARET_ROW_COLOR', 'editorLineNumber.activeForeground', 'E8EEF5'],
    ['WHITESPACES', 'editorWhitespace.foreground', '2A3D54'],
    ['WHITESPACES_MODIFIED_LINES_COLOR', 'editorGutter.modifiedBackground', '93C5FD'],
    ['INDENT_GUIDE', 'editorIndentGuide.background', '2A3D54'],
    ['SELECTED_INDENT_GUIDE', 'editorIndentGuide.activeBackground', 'F8FAFC'],
    ['VISUAL_INDENT_GUIDE', 'editorIndentGuide.activeBackground', 'F8FAFC'],
    ['RIGHT_MARGIN_COLOR', 'editorRuler.foreground', '2A3D54'],
    // Both spellings ship in the wild (EDITOR_GUTTER_BACKGROUND is the modern one).
    ['EDITOR_GUTTER_BACKGROUND', 'editorGutter.background', '131E33'],
    ['GUTTER_BACKGROUND', 'editorGutter.background', '131E33'],
    ['CONSOLE_BACKGROUND_KEY', 'terminal.background', '131E33'],
    ['TEARLINE_COLOR', 'editorIndentGuide.background', '2A3D54'],
    ['SELECTED_TEARLINE_COLOR', 'editorIndentGuide.activeBackground', 'F8FAFC'],
    ['SEPARATOR_ABOVE_COLOR', 'editorGroupHeader.tabsBackground', '15253B'],
    ['SEPARATOR_BELOW_COLOR', 'tab.inactiveBackground', '15253B'],
    ['ADDED_LINES_COLOR', 'editorGutter.addedBackground', '4ADE80'],
    ['MODIFIED_LINES_COLOR', 'editorGutter.modifiedBackground', '93C5FD'],
    ['DELETED_LINES_COLOR', 'editorGutter.deletedBackground', 'F87171'],
    ['ERROR_HINT', 'minimap.errorHighlight', 'F87171'],
    ['INFORMATION_HINT', 'minimap.selectionHighlight', '2F4B6E'],
    ['DOCUMENTATION_COLOR', 'editorWidget.background', '15253B'],
    ['LOOKUP_COLOR', 'editorSuggestWidget.background', '15253B'],
    ['ANNOTATIONS_COLOR', 'editorCodeLens.foreground', '8B99A8'],
    ['DOC_COMMENT_LINK', 'textLink.foreground', '93C5FD'],
    ['BLOCK_TERMINAL_DEFAULT_BACKGROUND', 'terminal.background', '131E33'],
    ['BLOCK_TERMINAL_DEFAULT_FOREGROUND', 'terminal.foreground', 'E8EEF5'],
    // Blame annotations: no VS Code counterpart, so they ride the ANSI palette.
    ['VCS_ANNOTATIONS_COLOR_1', 'terminal.ansiMagenta', 'F472B6'],
    ['VCS_ANNOTATIONS_COLOR_2', 'terminal.ansiGreen', '4ADE80'],
    ['VCS_ANNOTATIONS_COLOR_3', 'terminal.ansiYellow', 'FCD34D'],
    ['VCS_ANNOTATIONS_COLOR_4', 'terminal.ansiCyan', '7DD3FC'],
    ['VCS_ANNOTATIONS_COLOR_5', 'terminal.ansiBlue', '60A5FA'],
    ['FILESTATUS_MODIFIED', 'gitDecoration.modifiedResourceForeground', 'FCD34D'],
    ['FILESTATUS_ADDED', 'gitDecoration.untrackedResourceForeground', '4ADE80'],
    ['FILESTATUS_DELETED', 'gitDecoration.deletedResourceForeground', 'F87171'],
    ['FILESTATUS_UNKNOWN', 'editorCodeLens.foreground', '8B99A8'],
    ['FILESTATUS_COPIED', 'terminal.ansiGreen', '4ADE80'],
    ['FILESTATUS_MERGED', 'terminal.ansiMagenta', 'F472B6'],
    ['FILESTATUS_RENAMED', 'terminal.ansiCyan', '7DD3FC'],
    ['FILESTATUS_IDEA_FILESTATUS_IGNORED', 'gitDecoration.ignoredResourceForeground', '8B99A8'],
    ['FILESTATUS_IDEA_FILESTATUS_DELETED_FROM_FILE_SYSTEM', 'gitDecoration.deletedResourceForeground', 'F87171'],
    ['FILESTATUS_IDEA_FILESTATUS_MERGED_WITH_CONFLICTS', 'gitDecoration.conflictingResourceForeground', 'FB923C'],
    ['FILESTATUS_IDEA_FILESTATUS_MERGED_WITH_BOTH_CONFLICTS', 'gitDecoration.conflictingResourceForeground', 'FB923C'],
    ['FILESTATUS_IDEA_FILESTATUS_MERGED_WITH_PROPERTY_CONFLICTS', 'gitDecoration.conflictingResourceForeground', 'FB923C'],
    ['FILESTATUS_addedOutside', 'gitDecoration.untrackedResourceForeground', '4ADE80'],
    ['FILESTATUS_modifiedOutside', 'gitDecoration.modifiedResourceForeground', 'FCD34D'],
    ['FILESTATUS_changelistConflict', 'gitDecoration.conflictingResourceForeground', 'FB923C'],
    ['FILESTATUS_NOT_CHANGED_IMMEDIATE', 'editorCodeLens.foreground', '8B99A8'],
    ['FILESTATUS_NOT_CHANGED_RECURSIVE', 'editorCodeLens.foreground', '8B99A8'],
];

// Bare, language-specific-looking names that don't exist in the platform scheme.
// Emitting one means "this token is unthemed in the IDE, silently".
const BANNED_ATTRIBUTES = new Set([
    'KEYWORD', 'STRING', 'NUMBER', 'LINE_COMMENT', 'BLOCK_COMMENT', 'DOC_COMMENT', 'IDENTIFIER',
    'LOCAL_VARIABLE', 'INSTANCE_FIELD', 'STATIC_FIELD', 'GLOBAL_VARIABLE', 'PARAMETER', 'CONSTANT',
    'FUNCTION_CALL', 'METHOD_CALL', 'METHOD_DECLARATION', 'CLASS_NAME', 'INTERFACE_NAME', 'ENUM_NAME',
    'TYPE_PARAMETER_NAME', 'OPERATOR_SIGN', 'PARENTHESES', 'BRACKETS', 'BRACES', 'SEMICOLON', 'COMMA',
    'DOT', 'ASSIGNMENT', 'LABEL', 'TAG', 'ANNOTATION_NAME', 'PREPROCESSOR', 'ERROR', 'WARNING',
]);

/**
 * Text attributes. `attr` is a real JetBrains key, `scope` the TextMate scope it
 * mirrors, `fg`/`font` fallbacks used when the scope resolves to nothing.
 * `bgKey` is a VS Code colours key (its alpha is composited over the editor bg).
 */
const ATTR = (attr, scope, fg, font, bgKey) => ({ attr, scope, fg, font, bgKey });
const ATTRIBUTES = [
    // --- Language Defaults: every language falls back here ---
    ATTR('DEFAULT_KEYWORD', 'keyword', '60A5FA', 'normal'),
    ATTR('DEFAULT_STRING', 'string', 'FCD34D', 'normal'),
    ATTR('DEFAULT_NUMBER', 'constant.numeric', '7DD3FC', 'normal'),
    ATTR('DEFAULT_CONSTANT', 'constant', '7DD3FC', 'normal'),
    ATTR('DEFAULT_LINE_COMMENT', 'comment.line', '8B99A8', 'normal'),
    ATTR('DEFAULT_BLOCK_COMMENT', 'comment.block', '8B99A8', 'normal'),
    ATTR('DEFAULT_DOC_COMMENT', 'comment', '8B99A8', 'normal'),
    ATTR('DEFAULT_DOC_COMMENT_TAG', 'comment.block.documentation keyword', '60A5FA', 'normal'),
    ATTR('DEFAULT_DOC_COMMENT_TAG_VALUE', 'comment.block.documentation variable', 'FB923C', 'italic'),
    ATTR('DEFAULT_DOC_MARKUP', 'comment.block.documentation entity.name.type', '93C5FD', 'italic'),
    ATTR('DEFAULT_IDENTIFIER', 'variable', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_INSTANCE_FIELD', 'variable', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_STATIC_FIELD', 'variable.other.constant', '7DD3FC', 'normal'),
    ATTR('DEFAULT_GLOBAL_VARIABLE', 'variable', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_REASSIGNED_LOCAL_VARIABLE', 'variable', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_REASSIGNED_PARAMETER', 'variable.parameter', 'FB923C', 'italic'),
    ATTR('DEFAULT_PARAMETER', 'variable.parameter', 'FB923C', 'italic'),
    ATTR('DEFAULT_FUNCTION_DECLARATION', 'entity.name.function', '4ADE80', 'normal'),
    ATTR('DEFAULT_FUNCTION_CALL', 'entity.name.function', '4ADE80', 'normal'),
    ATTR('DEFAULT_INSTANCE_METHOD', 'entity.name.function', '4ADE80', 'normal'),
    ATTR('DEFAULT_STATIC_METHOD', 'entity.name.function', '4ADE80', 'normal'),
    ATTR('DEFAULT_CLASS_NAME', 'entity.name.type', '93C5FD', 'italic'),
    ATTR('DEFAULT_INTERFACE_NAME', 'entity.name.type', '93C5FD', 'italic'),
    ATTR('DEFAULT_CLASS_REFERENCE', 'entity.name.type', '93C5FD', 'italic'),
    ATTR('DEFAULT_ENTITY', 'entity.name.tag', '60A5FA', 'normal'),
    ATTR('DEFAULT_TAG', 'entity.name.tag', '60A5FA', 'normal'),
    ATTR('DEFAULT_ATTRIBUTE', 'entity.other.attribute-name', '4ADE80', 'italic'),
    ATTR('DEFAULT_METADATA', 'meta.decorator', '4ADE80', 'italic'),
    ATTR('DEFAULT_PREDEFINED_SYMBOL', 'support', '93C5FD', 'italic'),
    ATTR('DEFAULT_OPERATION_SIGN', 'keyword.operator.assignment', '60A5FA', 'normal'),
    ATTR('DEFAULT_PARENTHS', 'meta.brace.round', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_BRACES', 'meta.brace.round', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_BRACKETS', 'meta.brace.round', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_COMMA', 'punctuation.separator.comma', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_SEMICOLON', 'punctuation.terminator.statement', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_DOT', 'punctuation.accessor', 'E8EEF5', 'normal'),
    ATTR('DEFAULT_LABEL', 'label', '8B99A8', 'normal'),
    ATTR('DEFAULT_VALID_STRING_ESCAPE', 'constant.character.string.escape', '60A5FA', 'normal'),
    ATTR('DEFAULT_INVALID_STRING_ESCAPE', 'invalid.illegal', 'F87171', 'normal'),

    // --- Editor affordances ---
    ATTR('DEFAULT_HIGHLIGHTED_REFERENCE', 'variable', '', 'normal', 'editor.wordHighlightBackground'),
    ATTR('DEFAULT_TEMPLATE_LANGUAGE_COLOR', 'embedded', '', 'normal', 'editor.background'),
    ATTR('IDENTIFIER_UNDER_CARET_ATTRIBUTES', 'variable', '', 'bold', 'editor.wordHighlightStrongBackground'),
    ATTR('SEARCH_RESULT_ATTRIBUTES', 'string', '', 'normal', 'editor.findMatchBackground'),
    ATTR('TEXT_SEARCH_RESULT_ATTRIBUTES', 'string', '', 'normal', 'editor.findMatchHighlightBackground'),
    ATTR('MATCHED_BRACE_ATTRIBUTES', 'punctuation.definition.arguments.begin', 'E8EEF5', 'bold', '2F4B6E55'),
    ATTR('UNMATCHED_BRACE_ATTRIBUTES', 'invalid', 'F87171', 'normal'),
    ATTR('FOLDED_TEXT_ATTRIBUTES', 'comment', '8B99A8', 'normal', 'editor.background'),
    ATTR('TODO_DEFAULT_ATTRIBUTES', 'todo', 'FACC15', 'bold italic'),
    ATTR('ERRORS_ATTRIBUTES', 'invalid', 'F87171', 'normal'),
    ATTR('WARNING_ATTRIBUTES', 'markup.changed', 'FB923C', 'normal'),
    ATTR('BAD_CHARACTER', 'invalid.illegal', 'F87171', 'normal', 'minimap.errorHighlight'),
    ATTR('DEPRECATED_ATTRIBUTES', 'invalid.deprecated', '8B99A8', 'normal'),
    ATTR('INLINE_PARAMETER_HINT', 'comment', '8B99A8', 'normal', 'editorHoverWidget.background'),
    ATTR('CTRL_CLICKABLE', 'textLink', '93C5FD', 'normal'),
    ATTR('HYPERLINK_ATTRIBUTES', 'textLink', '93C5FD', 'normal'),
    ATTR('FOLLOWED_HYPERLINK_ATTRIBUTES', 'textLink', '7DD3FC', 'normal'),

    // --- Prose ---
    ATTR('MARKDOWN_HEADER_LEVEL_1', 'markup.heading', '93C5FD', 'bold'),
    ATTR('MARKDOWN_LINK_TEXT', 'string.other.link.title', '60A5FA', 'normal'),
    ATTR('MARKDOWN_LINK_DESTINATION', 'markup.underline.link', '93C5FD', 'normal'),
    ATTR('MARKDOWN_AUTO_LINK', 'markup.underline.link', '93C5FD', 'normal'),
    ATTR('MARKUP_TAG', 'entity.name.tag', '60A5FA', 'normal'),
    ATTR('XML_TAG', 'entity.name.tag', '60A5FA', 'normal'),
    ATTR('XML_TAG_NAME', 'entity.name.tag', '60A5FA', 'normal'),
    ATTR('XML_ATTRIBUTE_NAME', 'entity.other.attribute-name', '4ADE80', 'italic'),
    ATTR('XML_ATTRIBUTE_VALUE', 'string', 'FCD34D', 'normal'),
    ATTR('HTML_TAG', 'entity.name.tag', '60A5FA', 'normal'),
    ATTR('HTML_TAG_NAME', 'entity.name.tag', '60A5FA', 'normal'),
    ATTR('HTML_ATTRIBUTE_NAME', 'entity.other.attribute-name', '4ADE80', 'italic'),
    ATTR('HTML_ENTITY_REFERENCE', 'constant.character.escape', '60A5FA', 'normal'),

    // --- Diffs / merge ---
    ATTR('DIFF_INSERTED', 'markup.inserted', '', 'normal', 'editorGutter.addedBackground'),
    ATTR('DIFF_MODIFIED', 'markup.changed', '', 'normal', 'editorGutter.modifiedBackground'),
    ATTR('DIFF_CONFLICT', 'invalid', '', 'normal', 'gitDecoration.conflictingResourceForeground'),

    // --- Breadcrumbs ---
    ATTR('BREADCRUMBS_DEFAULT', 'comment', '8B99A8', 'normal'),
    ATTR('BREADCRUMBS_CURRENT', 'entity.name.type', '93C5FD', 'normal'),
    ATTR('BREADCRUMBS_HOVERED', 'entity.name.function', '4ADE80', 'normal'),
    ATTR('BREADCRUMBS_INACTIVE', 'comment', '8B99A8', 'normal'),
];

// Console / terminal / log output: one entry per ANSI slot of OUR palette.
const ANSI = [
    ['Black', 'terminal.ansiBlack', 'terminal.ansiBrightBlack', '0B1730', '64748B'],
    ['Red', 'terminal.ansiRed', 'terminal.ansiBrightRed', 'F87171', 'FCA5A5'],
    ['Green', 'terminal.ansiGreen', 'terminal.ansiBrightGreen', '4ADE80', '86EFAC'],
    ['Yellow', 'terminal.ansiYellow', 'terminal.ansiBrightYellow', 'FCD34D', 'FDE68A'],
    ['Blue', 'terminal.ansiBlue', 'terminal.ansiBrightBlue', '60A5FA', '93C5FD'],
    ['Magenta', 'terminal.ansiMagenta', 'terminal.ansiBrightMagenta', 'F472B6', 'F9A8D4'],
    ['Cyan', 'terminal.ansiCyan', 'terminal.ansiBrightCyan', '7DD3FC', 'BAE6FD'],
    ['White', 'terminal.ansiWhite', 'terminal.ansiBrightWhite', 'CBD5E1', 'F8FAFC'],
];

// Log levels (IntelliJ console / Logcat). [level, ansi slot]
const LOG_LEVELS = [
    ['ASSERT', 'Magenta'],
    ['DEBUG', 'Cyan'],
    ['ERROR', 'Red'],
    ['INFO', 'Green'],
    ['VERBOSE', 'White'],
    ['WARNING', 'Yellow'],
];

// UI theme mapping: JetBrains component key -> [vscode colors key, fallback].
// New UI (2023.3+) reads MainWindow.*/MainToolbar.*/EditorTabs.*/StatusBar.*/
// ToolWindow.Header*; TabbedPane.*/TitlePane.* only matter to the classic UI.
const UI = {
    // Defaults every component that is not overridden below inherits.
    // Property list mirrors JetBrains' own New UI dark theme (`*` block).
    '*': {
        background: ['sideBar.background', '15253B'],
        foreground: ['foreground', 'E8EEF5'],
        textForeground: ['editor.foreground', 'E8EEF5'],
        caretForeground: ['editorCursor.foreground', '7DD3FC'],
        borderColor: ['sideBarSectionHeader.border', '00000000'],
        disabledBorderColor: ['input.border', '00000000'],
        separatorColor: ['sideBarSectionHeader.border', '00000000'],
        separatorForeground: ['tab.inactiveForeground', '8B99A8'],
        disabledText: ['tab.inactiveForeground', '8B99A8'],
        disabledForeground: ['tab.inactiveForeground', '8B99A8'],
        disabledBackground: ['input.background', '15253B'],
        inactiveForeground: ['tab.inactiveForeground', '8B99A8'],
        inactiveBackground: ['titleBar.inactiveBackground', '111D32'],
        infoForeground: ['tab.inactiveForeground', '8B99A8'],
        acceleratorForeground: ['tab.inactiveForeground', '8B99A8'],
        shortcutForeground: ['tab.inactiveForeground', '8B99A8'],
        selectionBackground: ['list.activeSelectionBackground', '2F4B6E'],
        selectionBackgroundInactive: ['list.inactiveSelectionBackground', '2F4B6E'],
        lightSelectionBackground: ['list.inactiveSelectionBackground', '2F4B6E'],
        selectionForeground: ['list.activeSelectionForeground', 'E8EEF5'],
        selectionForegroundInactive: ['list.activeSelectionForeground', 'E8EEF5'],
        selectionInactiveBackground: ['list.inactiveSelectionBackground', '2F4B6E'],
        selectionInactiveForeground: ['list.activeSelectionForeground', 'E8EEF5'],
        hoverBackground: ['list.hoverBackground', '24384F'],
        underlineColor: ['tab.activeBorderTop', 'FACC15'],
        inactiveUnderlineColor: ['titleBar.inactiveBackground', '111D32'],
        focusColor: ['focusBorder', '60A5FA'],
        focusedBorderColor: ['focusBorder', '60A5FA'],
        modifiedItemForeground: ['gitDecoration.modifiedResourceForeground', 'FCD34D'],
    },

    // Window chrome: the header strip above the tool windows and editor tabs.
    MainWindow: { background: ['titleBar.activeBackground', '0F1D31'] },
    MainToolbar: {
        background: ['titleBar.activeBackground', '0F1D31'],
        inactiveBackground: ['titleBar.activeBackground', '0F1D31'],
        borderColor: ['titleBar.border', '00000000'],
        separatorColor: ['titleBar.border', '00000000'],
    },
    'MainToolbar.Icon': { background: ['titleBar.activeBackground', '0F1D31'], pressedBackground: ['list.hoverBackground', '24384F'] },
    'MainToolbar.Dropdown': { pressedBackground: ['list.hoverBackground', '24384F'], transparentHoverBackground: ['list.hoverBackground', '24384F'] },
    'MainWindow.Tab': {
        background: ['titleBar.activeBackground', '0F1D31'],
        foreground: ['titleBar.inactiveForeground', '8B99A8'],
        hoverForeground: ['titleBar.activeForeground', 'E8EEF5'],
        selectedBackground: ['sideBar.background', '15253B'],
        selectedForeground: ['titleBar.activeForeground', 'E8EEF5'],
        selectedInactiveBackground: ['sideBar.background', '15253B'],
        hoverBackground: ['list.hoverBackground', '24384F'],
        separatorColor: ['titleBar.border', '00000000'],
    },
    // Vertical stripe holding the tool window buttons.
    'ToolWindow.Stripe': {
        background: ['activityBar.background', '0F1D31'],
        borderColor: ['activityBar.border', '00000000'],
        separatorColor: ['activityBar.border', '00000000'],
    },

    // Editor tabs; New UI underlines the selected tab with the accent.
    EditorTabs: {
        background: ['editorGroupHeader.tabsBackground', '15253B'],
        borderColor: ['tab.border', '00000000'],
        underTabsBorderColor: ['tab.border', '00000000'],
        hoverBackground: ['list.hoverBackground', '24384F'],
        hoverInactiveBackground: ['list.hoverBackground', '24384F'],
        inactiveColoredFileBackground: ['tab.inactiveBackground', '15253B'],
        underlineColor: ['tab.activeBorderTop', 'FACC15'],
        inactiveUnderlineColor: ['titleBar.inactiveBackground', '111D32'],
        underlinedBorderColor: ['tab.activeBorderTop', 'FACC15'],
        inactiveUnderlinedTabBorderColor: ['titleBar.inactiveBackground', '111D32'],
        underlinedTabBackground: ['tab.activeBackground', '2F4B6E'],
        underlinedTabForeground: ['tab.activeForeground', 'E8EEF5'],
        inactiveUnderlinedTabBackground: ['tab.inactiveBackground', '15253B'],
    },

    Editor: {
        background: ['editor.background', '131E33'],
        foreground: ['editor.foreground', 'E8EEF5'],
        caretRowBackground: ['editor.lineHighlightBackground', '1A2A45'],
        shortcutForeground: ['tab.inactiveForeground', '8B99A8'],
    },
    'Editor.SearchField': { background: ['input.background', '15253B'], borderColor: ['input.border', '00000000'] },
    'Editor.Toolbar': { borderColor: ['editorGroup.border', '00000000'] },
    EditorPane: { background: ['editor.background', '131E33'], inactiveBackground: ['editor.background', '131E33'], splitBorder: ['editorGroup.border', '00000000'] },
    Viewer: { background: ['sideBar.background', '15253B'], foreground: ['foreground', 'E8EEF5'] },
    'Viewer.Transparent': { background: ['sideBar.background', '15253B'] },
    ToolWindow: { background: ['sideBar.background', '15253B'], foreground: ['foreground', 'E8EEF5'], borderColor: ['sideBar.border', '00000000'] },
    'ToolWindow.Header': {
        background: ['sideBarSectionHeader.background', '131E33'],
        foreground: ['foreground', 'E8EEF5'],
        inactiveBackground: ['sideBar.background', '15253B'],
        inactiveForeground: ['tab.inactiveForeground', '8B99A8'],
        borderColor: ['sideBarSectionHeader.border', '00000000'],
    },
    'ToolWindow.HeaderTab': {
        underlineColor: ['tab.activeBorderTop', 'FACC15'],
        inactiveUnderlineColor: ['titleBar.inactiveBackground', '111D32'],
        underlinedTabBackground: ['sideBar.background', '15253B'],
        underlinedTabInactiveBackground: ['sideBarSectionHeader.background', '131E33'],
        selectedInactiveBackground: ['sideBarSectionHeader.background', '131E33'],
        hoverBackground: ['list.hoverBackground', '24384F'],
        hoverInactiveBackground: ['list.hoverBackground', '24384F'],
    },
    'ToolWindow.HeaderCloseButton': { background: ['list.hoverBackground', '24384F'] },
    'ToolWindow.Button': {
        foreground: ['tab.inactiveForeground', '8B99A8'],
        selectedForeground: ['list.activeSelectionForeground', 'E8EEF5'],
        selectedBackground: ['list.activeSelectionBackground', '2F4B6E'],
        hoverBackground: ['list.hoverBackground', '24384F'],
    },
    'ToolWindow.HeaderBorder': { background: ['sideBarSectionHeader.border', '00000000'] },
    // Swing toolbars (editor consoles and friends).
    ToolBar: { background: ['editorGroupHeader.tabsBackground', '15253B'], foreground: ['foreground', 'E8EEF5'], borderColor: ['editorGroup.border', '00000000'], separatorColor: ['editorGroup.border', '00000000'] },
    'Toolbar.Floating': { background: ['editorWidget.background', '15253B'], borderColor: ['editorWidget.border', '00000000'] },

    StatusBar: { background: ['statusBar.background', '3584CE'], foreground: ['statusBar.foreground', '0B1730'], borderColor: ['statusBar.border', '00000000'] },
    'StatusBar.Border': { background: ['statusBar.border', '00000000'] },
    'StatusBar.Widget': {
        foreground: ['statusBar.foreground', '0B1730'],
        hoverForeground: ['statusBar.foreground', '0B1730'],
        hoverBackground: ['statusBarItem.hoverBackground', '0B173020'],
        pressedBackground: ['statusBarItem.activeBackground', '0B173035'],
    },
    'StatusBar.Breadcrumbs': {
        foreground: ['statusBar.foreground', '0B1730'],
        hoverForeground: ['statusBar.foreground', '0B1730'],
        hoverBackground: ['statusBarItem.hoverBackground', '0B173020'],
        pressedBackground: ['statusBarItem.activeBackground', '0B173035'],
        selectionBackground: ['statusBarItem.activeBackground', '0B173035'],
        selectionInactiveBackground: ['statusBarItem.activeBackground', '0B173035'],
    },
    MemoryIndicator: {
        usedBackground: ['badge.background', 'FACC15'],
        usedForeground: ['badge.foreground', '0B1730'],
        allocatedBackground: ['statusBarItem.activeBackground', '0B173035'],
        allocatedForeground: ['statusBar.foreground', '0B1730'],
    },
    ProgressBar: {
        background: ['progressBar.background', '60A5FA'],
        trackColor: ['input.background', '15253B'],
        progressColor: ['progressBar.background', '60A5FA'],
        indeterminateStartColor: ['progressBar.background', '60A5FA'],
        indeterminateEndColor: ['progressBar.background', '60A5FA'],
        passedColor: ['gitDecoration.untrackedResourceForeground', '4ADE80'],
        passedEndColor: ['gitDecoration.untrackedResourceForeground', '4ADE80'],
        failedColor: ['editorError.foreground', 'F87171'],
        failedEndColor: ['editorError.foreground', 'F87171'],
    },

    // Data grid (Database tool windows, result sets).
    Table: {
        background: ['editor.background', '131E33'],
        foreground: ['foreground', 'E8EEF5'],
        gridColor: ['editorWhitespace.foreground', '2A3D54'],
        stripeColor: ['sideBarSectionHeader.background', '131E33'],
        alternativeRowBackground: ['sideBarSectionHeader.background', '131E33'],
        hoverBackground: ['list.hoverBackground', '24384F'],
        hoverInactiveBackground: ['list.hoverBackground', '24384F'],
        lightSelectionBackground: ['list.inactiveSelectionBackground', '2F4B6E'],
        selectionBackground: ['list.activeSelectionBackground', '2F4B6E'],
        selectionForeground: ['list.activeSelectionForeground', 'E8EEF5'],
        sortIconColor: ['focusBorder', '60A5FA'],
    },
    TableHeader: {
        background: ['sideBarSectionHeader.background', '131E33'],
        foreground: ['tab.inactiveForeground', '8B99A8'],
        inactiveBackground: ['sideBar.background', '15253B'],
        inactiveForeground: ['tab.inactiveForeground', '8B99A8'],
        separatorColor: ['editorWhitespace.foreground', '2A3D54'],
        bottomSeparatorColor: ['editorWhitespace.foreground', '2A3D54'],
    },
    List: {
        background: ['sideBar.background', '15253B'],
        foreground: ['foreground', 'E8EEF5'],
        selectionBackground: ['list.activeSelectionBackground', '2F4B6E'],
        selectionForeground: ['list.activeSelectionForeground', 'E8EEF5'],
        selectionInactiveBackground: ['list.inactiveSelectionBackground', '2F4B6E'],
        hoverBackground: ['list.hoverBackground', '24384F'],
        hoverInactiveBackground: ['list.hoverBackground', '24384F'],
    },
    Tree: {
        background: ['sideBar.background', '15253B'],
        foreground: ['foreground', 'E8EEF5'],
        selectionBackground: ['list.activeSelectionBackground', '2F4B6E'],
        selectionForeground: ['list.activeSelectionForeground', 'E8EEF5'],
        selectionInactiveBackground: ['list.inactiveSelectionBackground', '2F4B6E'],
        hoverBackground: ['list.hoverBackground', '24384F'],
        hoverInactiveBackground: ['list.hoverBackground', '24384F'],
        modifiedItemForeground: ['gitDecoration.modifiedResourceForeground', 'FCD34D'],
        hash: ['tree.indentGuidesStroke', '2A3D54'],
    },

    // Popups, menus, notifications.
    Popup: { background: ['editorWidget.background', '15253B'], foreground: ['foreground', 'E8EEF5'], borderColor: ['editorWidget.border', '00000000'], inactiveBorderColor: ['editorWidget.border', '00000000'], innerBorderColor: ['editorWidget.border', '00000000'] },
    'Popup.Header': { activeBackground: ['sideBarSectionHeader.background', '131E33'], activeForeground: ['foreground', 'E8EEF5'] },
    'Popup.Toolbar': { background: ['sideBarSectionHeader.background', '131E33'], borderColor: ['editorWidget.border', '00000000'] },
    'Popup.Advertiser': { background: ['sideBarSectionHeader.background', '131E33'], foreground: ['tab.inactiveForeground', '8B99A8'], borderColor: ['editorWidget.border', '00000000'] },
    'Popup.MenuSeparator': { background: ['input.border', '00000000'] },
    PopupMenu: { background: ['editorWidget.background', '15253B'], foreground: ['foreground', 'E8EEF5'] },
    Menu: { background: ['editorWidget.background', '15253B'], foreground: ['foreground', 'E8EEF5'], borderColor: ['editorWidget.border', '00000000'], disabledForeground: ['tab.inactiveForeground', '8B99A8'], acceleratorForeground: ['tab.inactiveForeground', '8B99A8'] },
    Notification: {
        background: ['editorWidget.background', '15253B'],
        foreground: ['foreground', 'E8EEF5'],
        borderColor: ['editorWidget.border', '00000000'],
        errorBackground: ['input.background', '15253B'],
        errorBorderColor: ['errorForeground', 'F87171'],
        errorForeground: ['errorForeground', 'F87171'],
    },
    'Notification.ToolWindow': { background: ['editorWidget.background', '15253B'] },
    NotificationsToolwindow: { Notification: ['editorWidget.background', '15253B'], newNotification: ['sideBarSectionHeader.background', '131E33'] },
    ValidationTooltip: { errorBackground: ['input.background', '15253B'], warningBackground: ['input.background', '15253B'] },
    ToolTip: { background: ['editorWidget.background', '15253B'], foreground: ['foreground', 'E8EEF5'], borderColor: ['editorWidget.border', '00000000'] },
    CompletionPopup: {
        matchForeground: ['list.highlightForeground', 'FCD34D'],
        selectionBackground: ['list.activeSelectionBackground', '2F4B6E'],
        selectionInactiveBackground: ['list.inactiveSelectionBackground', '2F4B6E'],
    },
    SearchMatch: { startBackground: ['editor.findMatchBackground', 'FB923C'], endBackground: ['editor.findMatchHighlightBackground', 'F8FAFC'] },
    OptionPane: { background: ['editorWidget.background', '15253B'], foreground: ['foreground', 'E8EEF5'] },
    TabbedPane: { background: ['editorGroupHeader.tabsBackground', '15253B'], foreground: ['tab.inactiveForeground', '8B99A8'], underlineColor: ['tab.activeBorderTop', 'FACC15'], hoverColor: ['list.hoverBackground', '24384F'], focusColor: ['focusBorder', '60A5FA'], contentAreaColor: ['editorGroup.border', '00000000'] },
    'TabbedPane.selected': { background: ['tab.activeBackground', '2F4B6E'], foreground: ['tab.activeForeground', 'E8EEF5'] },
    'TabbedPane.selectedTopBorder': { background: ['tab.activeBorderTop', 'FACC15'] },
    Component: {
        background: ['editor.background', '131E33'],
        foreground: ['foreground', 'E8EEF5'],
        borderColor: ['input.border', '00000000'],
        disabledBorderColor: ['input.border', '00000000'],
        focusedBorderColor: ['focusBorder', '60A5FA'],
        focusColor: ['focusBorder', '60A5FA'],
        errorFocusColor: ['editorError.foreground', 'F87171'],
        inactiveErrorFocusColor: ['editorError.foreground', 'F87171'],
        warningFocusColor: ['editorWarning.foreground', 'FB923C'],
        inactiveWarningFocusColor: ['editorWarning.foreground', 'FB923C'],
    },
    Borders: { color: ['input.border', '00000000'], ContrastBorderColor: ['input.border', '00000000'] },
    Separator: { separatorColor: ['sideBarSectionHeader.border', '00000000'], separatorForeground: ['tab.inactiveForeground', '8B99A8'] },
    OnePixelDivider: { background: ['sideBarSectionHeader.border', '00000000'] },
    Label: { foreground: ['foreground', 'E8EEF5'], disabledForeground: ['tab.inactiveForeground', '8B99A8'], errorForeground: ['errorForeground', 'F87171'] },
    Link: { activeForeground: ['textLink.foreground', '93C5FD'], hoverForeground: ['textLink.activeForeground', '7DD3FC'], pressedForeground: ['textLink.activeForeground', '7DD3FC'], visitedForeground: ['textLink.foreground', '93C5FD'], secondaryForeground: ['textLink.foreground', '93C5FD'] },
    Button: { background: ['button.background', '2C78C6'], foreground: ['button.foreground', 'FFFFFF'], borderColor: ['button.border', '00000000'], disabledBorderColor: ['button.border', '00000000'], startBorderColor: ['button.border', '00000000'], endBorderColor: ['button.border', '00000000'], startBackground: ['button.secondaryBackground', '15253B'], endBackground: ['button.secondaryBackground', '15253B'], shadowColor: ['button.secondaryBackground', '15253B'], focusedBorderColor: ['focusBorder', '60A5FA'] },
    'Button.default': { background: ['button.background', '2C78C6'], foreground: ['button.foreground', 'FFFFFF'], startBackground: ['button.background', '2C78C6'], endBackground: ['button.background', '2C78C6'], startBorderColor: ['button.background', '2C78C6'], endBorderColor: ['button.background', '2C78C6'] },
    ActionButton: {
        hoverBackground: ['toolbar.hoverBackground', '60A5FA22'],
        hoverBorderColor: ['toolbar.hoverOutline', '00000000'],
        pressedBackground: ['toolbar.activeBackground', '60A5FA35'],
        pressedBorderColor: ['toolbar.hoverOutline', '00000000'],
    },
    ToggleButton: {
        onBackground: ['button.background', '2C78C6'],
        onForeground: ['button.foreground', 'FFFFFF'],
        offBackground: ['button.secondaryBackground', '15253B'],
        offForeground: ['foreground', 'E8EEF5'],
        buttonColor: ['foreground', 'E8EEF5'],
    },
    Counter: { background: ['badge.background', 'FACC15'], foreground: ['badge.foreground', '0B1730'] },
    CheckBox: { background: ['checkbox.background', '15253B'], foreground: ['checkbox.foreground', 'E8EEF5'], select: ['focusBorder', '60A5FA'] },
    RadioButton: { background: ['checkbox.background', '15253B'], foreground: ['checkbox.foreground', 'E8EEF5'] },
    CheckBoxMenuItem: { acceleratorSelectionForeground: ['list.activeSelectionForeground', 'E8EEF5'] },
    ComboBox: { background: ['dropdown.background', '15253B'], foreground: ['dropdown.foreground', 'E8EEF5'], nonEditableBackground: ['dropdown.background', '15253B'], borderColor: ['dropdown.border', '00000000'], arrowColor: ['tab.inactiveForeground', '8B99A8'], modifiedItemForeground: ['gitDecoration.modifiedResourceForeground', 'FCD34D'], selectionBackground: ['list.activeSelectionBackground', '2F4B6E'], selectionForeground: ['list.activeSelectionForeground', 'E8EEF5'] },
    'ComboBox.ArrowButton': { background: ['dropdown.background', '15253B'], foreground: ['tab.inactiveForeground', '8B99A8'] },
    TextField: { background: ['input.background', '15253B'], foreground: ['input.foreground', 'E8EEF5'], borderColor: ['input.border', '00000000'], inactiveBorderColor: ['input.border', '00000000'], disabledBackground: ['input.background', '15253B'], placeholderForeground: ['input.placeholderForeground', '8B99A8'], selectionBackground: ['editor.selectionBackground', '2F4B6E'] },
    PasswordField: { background: ['input.background', '15253B'] },
    SidePanel: { background: ['sideBar.background', '15253B'] },
    TitlePane: { background: ['titleBar.activeBackground', '0F1D31'], foreground: ['titleBar.activeForeground', 'E8EEF5'] },
    IconBadge: { errorBackground: ['editorError.foreground', 'F87171'], warningBackground: ['editorWarning.foreground', 'FB923C'], successBackground: ['gitDecoration.untrackedResourceForeground', '4ADE80'], infoBackground: ['focusBorder', '60A5FA'] },
    DragAndDrop: { borderColor: ['focusBorder', '60A5FA'] },
    Bookmark: { iconBackground: ['badge.background', 'FACC15'], Mnemonic: ['tab.inactiveForeground', '8B99A8'], MnemonicAssigned: ['badge.background', 'FACC15'], MnemonicCurrent: ['foreground', 'E8EEF5'] },
    FileColor: {
        Blue: ['terminal.ansiBlue', '60A5FA'],
        Green: ['terminal.ansiGreen', '4ADE80'],
        Orange: ['terminal.ansiYellow', 'FCD34D'],
        Rose: ['terminal.ansiMagenta', 'F472B6'],
        Violet: ['terminal.ansiBrightMagenta', 'F9A8D4'],
        Yellow: ['terminal.ansiBrightYellow', 'FDE68A'],
    },
    VersionControl: {
        RefLabel: ['gitDecoration.modifiedResourceForeground', 'FCD34D'],
        Log: ['editor.background', '131E33'],
        FileHistory: ['editor.background', '131E33'],
        GitLog: ['editor.background', '131E33'],
    },
    WelcomeScreen: {
        Details: ['editorWidget.background', '15253B'],
        Projects: ['editor.background', '131E33'],
        SidePanel: ['sideBar.background', '15253B'],
        separatorColor: ['sideBarSectionHeader.border', '00000000'],
    },
};

function buildIcls(colors, tokenColors) {
    const bg = colors['editor.background'] || '#131E33';

    // <colors> is a flat list of one-colour options; a nested <value> in here makes
    // the IDE reject the whole scheme and silently keep its default editor colours.
    const colorXml = SCHEME_COLORS.map(
        ([key, vscodeKey, fb]) => `    <option name="${key}" value="${schemeColor(colors[vscodeKey], fb, bg)}"/>`
    ).join('\n');

    const attrXml = attributes(tokenColors, colors, bg)
        .map(({ attr, fg, bg: attrBg, font }) => {
            const opts = [];
            if (attrBg) opts.push(`<option name="BACKGROUND" value="${attrBg}"/>`);
            if (FONT_TYPE[font]) opts.push(`<option name="FONT_TYPE" value="${FONT_TYPE[font]}"/>`);
            if (fg) opts.push(`<option name="FOREGROUND" value="${fg}"/>`);
            return `    <option name="${attr}">\n      <value>\n        ${opts.join('\n        ')}\n      </value>\n    </option>`;
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<scheme name="Starry Night Theme" version="142" parent_scheme="Darcula">
  <colors>
${colorXml}
  </colors>
  <attributes>
${attrXml}
  </attributes>
</scheme>
`;
}

/** [{ attr, fg, bg, font }] — resolved from the VS Code source. */
function attributes(tokenColors, colors, bg) {
    const list = ATTRIBUTES.map(({ attr, scope, fg, font, bgKey }) => {
        const resolved = tokStyle(tokenColors, scope, fg, font);
        // An empty fallback means "background only": the token keeps its own colour.
        const bgValue = bgKey ? (/^[0-9a-f]{6,8}$/i.test(bgKey) ? bgKey : colors[bgKey]) : null;
        return {
            attr,
            fg: fg === '' ? '' : resolved.fg,
            font: resolved.font,
            bg: bgValue ? solid(bgValue, bg) : '',
        };
    });

    // Console/terminal output colours.
    for (const [name, normal, bright, fbNormal, fbBright] of ANSI) {
        list.push({ attr: `CONSOLE_${name.toUpperCase()}_OUTPUT`, fg: hex(colors[normal] || fbNormal) });
        list.push({ attr: `CONSOLE_${name.toUpperCase()}_BRIGHT_OUTPUT`, fg: hex(colors[bright] || fbBright) });
        list.push({ attr: `BLOCK_TERMINAL_${name.toUpperCase()}`, fg: hex(colors[normal] || fbNormal) });
        list.push({ attr: `BLOCK_TERMINAL_${name.toUpperCase()}_BRIGHT`, fg: hex(colors[bright] || fbBright) });
    }
    const ansi = name => ANSI.find(a => a[0] === name);
    for (const [level, slot] of LOG_LEVELS) {
        const [, normal, , fbNormal] = ansi(slot);
        const fg = hex(colors[normal] || fbNormal);
        list.push({ attr: `LOGCAT_${level}_OUTPUT`, fg });
        list.push({ attr: `LOG_${level}_OUTPUT`, fg });
    }
    list.push({ attr: 'CONSOLE_NORMAL_OUTPUT', fg: hex(colors['terminal.foreground'] || 'E8EEF5') });
    list.push({ attr: 'CONSOLE_SYSTEM_OUTPUT', fg: hex(colors['foreground'] || 'E8EEF5') });
    list.push({ attr: 'CONSOLE_GRAY_OUTPUT', fg: hex(colors['terminal.ansiWhite'] || 'CBD5E1') });
    list.push({ attr: 'CONSOLE_DARKGRAY_OUTPUT', fg: hex(colors['terminal.ansiBrightBlack'] || '64748B') });
    list.push({ attr: 'CONSOLE_USER_INPUT', fg: hex(colors['terminal.ansiGreen'] || '4ADE80') });
    list.push({ attr: 'CONSOLE_ERROR_OUTPUT', fg: hex(colors['terminal.ansiRed'] || 'F87171') });
    list.push({ attr: 'CONSOLE_RANGE_TO_EXECUTE', bg: solid(colors['editor.selectionBackground'] || '2F4B6E', bg) });
    list.push({ attr: 'CONSOLE_SELECTED_PARAMETER', bg: solid(colors['editor.selectionBackground'] || '2F4B6E', bg) });

    // Editor base: background + foreground together, or the editor keeps the old surface.
    list.push({ attr: 'TEXT', fg: hex(colors['editor.foreground'] || 'E8EEF5'), bg: hex(colors['editor.background'] || '131E33') });
    list.push({ attr: 'DEFAULT', fg: hex(colors['editor.foreground'] || 'E8EEF5') });

    return list;
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

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function main() {
    const { base } = await generate();
    const colors = base.colors;

    // An invented attribute name is silently ignored by the IDE: the editor keeps
    // Darcula token colours while the chrome looks themed. Fail the build instead.
    const banned = attributes(base.tokenColors, colors, colors['editor.background'])
        .map(a => a.attr)
        .filter(a => BANNED_ATTRIBUTES.has(a));
    if (banned.length) {
        throw new Error(
            `invented JetBrains attribute name(s): ${banned.join(', ')} — languages fall back to DEFAULT_* keys`
        );
    }

    // The selector matcher is the one piece that fails silently: getting it wrong
    // hands whole token classes someone else's colour and nothing errors. These
    // invariants hold for any palette, so they need no maintenance when colours change.
    const probe = {};
    for (const a of attributes(base.tokenColors, colors, colors['editor.background'])) probe[a.attr] = a.fg;
    const invariants = [
        ['comments use the comment colour, not the keyword one', probe.DEFAULT_BLOCK_COMMENT === probe.DEFAULT_DOC_COMMENT],
        ['the three token classes differ', new Set([probe.DEFAULT_KEYWORD, probe.DEFAULT_STRING, probe.DEFAULT_LINE_COMMENT]).size === 3],
        ['strings are not the plain foreground', probe.DEFAULT_STRING !== probe.TEXT],
        ['parameters differ from identifiers (the multi-atom selector wins)', probe.DEFAULT_PARAMETER !== probe.DEFAULT_IDENTIFIER],
        ['numbers and constants share the numeric colour', probe.DEFAULT_NUMBER === probe.DEFAULT_CONSTANT],
    ];
    for (const [what, ok] of invariants) {
        if (!ok) throw new Error(`token colour resolution is wrong: ${what}`);
    }

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
