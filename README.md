# MarkLeft Research: VS Code Editor Limitations

Why the "rendered-in-place Markdown with Copilot + native editor superpowers" isn't achievable with today's public VS Code Application Programming Interfaces. I'm citing only authoritative sources (VS Code docs / repo issues) so it's clear which constraints are hard limits vs. workarounds.

## What we tried to achieve

- A single-pane Markdown editor where the source is editable and parts of the document are rendered inline (tables/images/LaTeX, etc.).
- Keep native VS Code editor behavior: Copilot inline suggestions, multi-cursor across the whole file, in-editor find/replace, breadcrumbs/minimap, diagnostics, code actions, etc.
- Avoid the "two tabs preview" pattern and avoid losing editor features.

## All editor surfaces VS Code exposes—and what goes wrong

### Native Text Editor (the built-in editor for `TextDocument`)

**What it gives you**: Copilot, multi-cursor, search/replace, diagnostics, code actions, etc.

**What you can add**: Language features (hover, code lens, inlay hints, folding), and decorations (inline badges/icons, dimming, borders). [Visual Studio Code](https://code.visualstudio.com/api/references/vscode-api)

**Hard stops for our goal**:

- No Application Programming Interface to inject arbitrary HyperText Transfer Protocol Markup Language blocks in the text flow, no DOM overlays, and decorations cannot become multi-line replacements. (Requests to allow multi-line/virtual lines and richer overlays are long-standing/backlog.) [GitHub](https://github.com/microsoft/vscode/issues/63600)
- You cannot "hide" text and make a rendered block take its place; selection/hit-testing still targets the original text. (Decorations add small before/after text and styling only.) [GitHub](https://github.com/microsoft/vscode/issues/63600)

**Result**: Keeps Copilot & multi-cursor but cannot do true in-place WYSIWYG blocks.

### Custom Editor / Custom Text Editor (the "custom editor" family)

Both render their User Interface in a Webview (HyperText Transfer Protocol Markup Language/CSS/JS). The difference is just the model:

- CustomTextEditorProvider uses a normal `TextDocument` as backing data (so VS Code can save, index, etc.).
- CustomEditorProvider uses your own document model (binary/readonly).
- Either way, the view is a Webview. [Visual Studio Code](https://code.visualstudio.com/api/extension-guides/custom-editors)

**What breaks**:

- Webviews are sandboxed iframes controlled by your extension; they are not a `TextEditor`. They cannot call VS Code Application Programming Interfaces directly (message passing only), and embedding the native editor inside a Webview is an explicit non-goal. [Visual Studio Code+1](https://code.visualstudio.com/api/extension-guides/webview)
- Because the surface is not a VS Code editor, providers that target editors—Copilot (Inline Completions), Code Actions User Interface, lightbulbs, breadcrumbs/minimap stripes—don't attach. You would have to build your own completions/ghost text, code action User Interface, diagnostics, etc. (Copilot itself won't run there.) [GitHub](https://github.com/microsoft/vscode-discussions/discussions/26)

**Result**: You get perfect rendering freedom, but you lose Copilot + editor-native User Experience.

### Notebook Application Programming Interface (cells with native editors + webview-rendered outputs)

- Notebook cell inputs are native editors managed by VS Code (that's why editor extensions—Copilot, Rainbow Indent, etc.—work inside cells). Outputs render in an isolated iframe/webview. Notebooks are not just a big webview; they integrate with VS Code core. [Visual Studio Code+1](https://code.visualstudio.com/blogs/2021/11/08/custom-notebooks)

**Where it helps**: You get Copilot inline suggestions in cell inputs (they're real editors). [Visual Studio Code](https://code.visualstudio.com/blogs/2021/11/08/custom-notebooks)

**Where it fails our User Experience**:

- The document becomes cells. Editing is per-cell; multi-cursor is scoped to the active cell, not fluid across cell boundaries like one text buffer. (Users repeatedly ask for cross-cell multi-cursor; it's not standard behavior today.) [Reddit+1](https://www.reddit.com/r/vscode/comments/1d0oedn/selecting_all_instances_in_multiple_cells_of_code/)
- Notebook find/replace exists (with filters for Markdown/code inputs and outputs), but the ergonomics differ from a single buffer. [Visual Studio Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks)

**Result**: Keeps Copilot but imposes a cell model (the exact friction you called out).

## Monaco itself vs. "VS Code's editor"

- Monaco is the editor component VS Code uses. You can embed Monaco in a Webview and get multi-cursor, its own find widget, etc. But that Monaco instance is not a VS Code `TextEditor`. VS Code extensions (like Copilot) won't target it; VS Code editor providers won't show up automatically. [Microsoft GitHub+1](https://microsoft.github.io/monaco-editor/)
- You would have to bridge VS Code's provider commands yourself (completion, code actions, rename, references) and render matching User Interface inside Monaco, then apply edits back to the `TextDocument`. That's a lot of plumbing, and still not Copilot. [Visual Studio Code](https://code.visualstudio.com/api/references/vscode-api)

**Result**: Monaco-in-Webview ≠ native editor. You can rebuild a lot, but you can't enable Copilot there.

## "Push it to the extreme": every workaround we pressure-tested

### "WYSIWYG-lite" in the native editor

- Use decorations to dim syntax, add inline badges (images/links), and fold non-active sections when the caret moves (driving built-in fold commands). Keeps everything native (Copilot, multi-cursor, search).
- Still no block-level HyperText Transfer Protocol Markup Language in the text flow; hovers can show rich Markdown transiently. [GitHub](https://github.com/microsoft/vscode/issues/63600)

### Three-pane trick (native center editor + two Webview renderers)

- Middle pane = real editor (editing here keeps Copilot/multi-cursor).
- Top/bottom panes = Webviews rendering the "above" and "below" parts outside a configurable "focus window".
- Works via `onDidChangeTextEditorVisibleRanges` + `revealRange` and Webview messaging; but you cannot clamp the center editor to "exactly N lines," and you can't perfectly pin editor group sizes (only nudge with "Increase/Decrease View Size" commands). [Stack Overflow+2vshaxe.github.io+2](https://stackoverflow.com/questions/47683420/vscode-extension-api-on-scroll)

### Notebooks with aggressive User Experience tweaks

- You can register your own notebook type, customize serialization (e.g., map headings to big cells), add commands to auto-collapse non-active cells, and hide/relocate toolbars.
- You cannot remove the fundamental cell concept or globally redefine core gestures (like double-click semantics). [Visual Studio Code](https://code.visualstudio.com/api/extension-guides/notebook)

### Pull Request/Upstream the missing primitive ("Editor Insets" / "Block decorations")

- Editor Insets proposal (`createWebviewTextEditorInset`) would allow a line-anchored webview block inside the native editor—this is the closest official concept to "rich blocks inline," but it's proposed/backlog, not shipped. [Visual Studio Code+1](https://code.visualstudio.com/updates/v1_36)
- Related requests—more flexible decorations and variable line height (multi-line attachments)—also sit in backlog. [GitHub](https://github.com/microsoft/vscode/issues/63600)
- Embedding the native editor in Webview is explicitly a non-goal for the platform. [GitHub](https://github.com/microsoft/vscode/issues/153198)

## Why this "doesn't work" in today's Application Programming Interface terms (root causes)

1. Native editor lacks block rendering primitives. You can't inject multi-line HyperText Transfer Protocol Markup Language/DOM, can't replace text wholesale, and can't add click-through overlays. Decorations are deliberately lightweight. [GitHub](https://github.com/microsoft/vscode/issues/63600)
2. Webviews aren't editors. Custom editors use Webviews for User Interface; Webviews can't access VS Code Application Programming Interfaces directly and aren't `TextEditor` instances, so editor-targeted extensions (Copilot, inline completions) don't attach. [Visual Studio Code+2Visual Studio Code+2](https://code.visualstudio.com/api/extension-guides/custom-editors)
3. Notebooks are native, but cell-scoped. Cell inputs are real editors (good), but selection/multi-cursor User Experience is per-cell; cross-cell multi-cursor is not a first-class operation. Notebook search exists (with filters) but differs ergonomically from a single buffer. [Visual Studio Code+2Visual Studio Code+2](https://code.visualstudio.com/blogs/2021/11/08/custom-notebooks)
4. Monaco-in-Webview ≠ VS Code editor. You can embed Monaco and rebuild a lot of User Experience, but you won't get Copilot and other editor providers "for free," because they're built for VS Code's editor instances, not arbitrary Webviews. [Stack Overflow+1](https://stackoverflow.com/questions/43663729/integrate-vs-code-extensions-in-the-monaco-editor)

## What still is shippable (if you decide to compromise)

- **Best native approximation (keeps Copilot)**: "Focus mode" with programmatic folding + decorations + rich hovers. It won't be true in-place HyperText Transfer Protocol Markup Language, but it stays single-buffer, fast, and compatible with Copilot and multi-cursor. [Visual Studio Code+1](https://code.visualstudio.com/api/references/vscode-api)
- **Best fidelity (sacrifices Copilot)**: Custom Text Editor with Webview + embedded Monaco, your own renderer overlay, and a bridge to VS Code providers (completion/rename/actions) via execute-provider commands—accepting that Copilot won't attach there. [Visual Studio Code](https://code.visualstudio.com/api/extension-guides/custom-editors)
- **R&D / long shot**: Invest in an upstream Editor Insets proposal Minimum Viable Product (line-anchored webview blocks) and drive it to stable. If accepted, it could finally enable safe, rich inline blocks inside the native editor (the only path that truly checks every box you want). [Visual Studio Code](https://code.visualstudio.com/updates/v1_36)

### One-screen "what's missing" checklist (Monaco in Webview vs. native)

- **Copilot / Inline Completions**: not available in Webview/Monaco; works in native editor/notebook cells. [GitHub](https://github.com/microsoft/vscode-discussions/discussions/26)
- **Language providers User Interface (lightbulb, hovers, signature help, code lens, inlay hints)**: automatic in native editor; you must mirror results/User Interface yourself in Webview/Monaco. [Visual Studio Code](https://code.visualstudio.com/api/references/vscode-api)
- **Diagnostics User Interface (squiggles/gutter/overview stripes)**: automatic in native; mirror markers yourself in Webview. [Visual Studio Code](https://code.visualstudio.com/api/references/vscode-api)
- **Find/replace/multi-cursor keybindings**: native works; in Webview you must rebind keys under `webviewFocus` and wire to Monaco. [Visual Studio Code](https://code.visualstudio.com/updates/v1_11)
- **Breadcrumbs/minimap/SCM gutters/testing/debug inlays**: automatic in native; not in Webview unless you rebuild equivalents. [Visual Studio Code](https://code.visualstudio.com/api/references/vscode-api)
- **Theme & settings sync (font/tabSize/rulers)**: automatic in native; manual bridge to Webview/Monaco. [Visual Studio Code](https://code.visualstudio.com/api/extension-guides/webview)

## Final verdict

With current public Application Programming Interfaces, you cannot deliver "real in-place rendered Markdown" and keep Copilot + native editor superpowers in a single, seamless pane. The blockers are architectural (native editor lacks block widgets; Webview isn't an editor; notebooks impose cells). The closest today is a native "focus mode" (folding + decorations + hovers). The only long-term way to truly unlock your vision in the native editor is pushing an upstream Application Programming Interface like Editor Insets / block decorations to stable. [Visual Studio Code+1](https://code.visualstudio.com/updates/v1_36)

## Sources

- Custom Editors (User Interface in Webview; `CustomTextEditorProvider` uses `TextDocument`). [Visual Studio Code](https://code.visualstudio.com/api/extension-guides/custom-editors)
- Webview Application Programming Interface (iframe model; message passing only). [Visual Studio Code](https://code.visualstudio.com/api/extension-guides/webview)
- Non-goal: embed VS Code editor in Webview (feature request cites the non-goal). [GitHub](https://github.com/microsoft/vscode/issues/153198)
- Notebook Application Programming Interface / not isolated webviews; editors integrate with extensions. [Visual Studio Code](https://code.visualstudio.com/blogs/2021/11/08/custom-notebooks)
- Notebook editor architecture (inputs vs outputs). [GitHub](https://github.com/microsoft/vscode/wiki/Notebook-documentation)
- Inline Completions Application Programming Interface finalized (Copilot example). [GitHub](https://github.com/microsoft/vscode-discussions/discussions/26)
- Decorations can't be multi-line / replace text (requests for richer decorations/backlog). [GitHub](https://github.com/microsoft/vscode/issues/63600)
- Editor Insets proposal (`createWebviewTextEditorInset`)—closest to inline rich blocks, still proposed/backlog. [Visual Studio Code+1](https://code.visualstudio.com/updates/v1_36)
- Visible ranges / revealRange / layout nudge (events & resize commands for three-pane workaround). [Stack Overflow+2vshaxe.github.io+2](https://stackoverflow.com/questions/47683420/vscode-extension-api-on-scroll)
- Notebook search options (inputs/outputs filters). [Visual Studio Code](https://code.visualstudio.com/docs/datascience/jupyter-notebooks)
- Cross-cell multi-cursor: user reports/requests indicate limitation (community evidence). [Reddit+1](https://www.reddit.com/r/vscode/comments/1d0oedn/selecting_all_instances_in_multiple_cells_of_code/)

If you want, I can trim this into a one-page internal memo or a public "proposal" draft you could post on the Editor Insets issue to kick off an Application Programming Interface discussion.

Source: [VS Code editor research](https://chatgpt.com/c/68d8e339-166c-832c-a91c-41e9b7ff3c67)
