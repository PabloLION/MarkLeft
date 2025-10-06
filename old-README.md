# MarkRight

An Obsidian-like VSCode markdown editor with selective editing, live LaTeX, enhanced tables, diagrams, custom CSS, and smart features like wiki-links, focus modes, and advanced rendering.

## Features

### 🔗 Wiki-Style Links
- Support for `[[link]]` syntax similar to Obsidian
- Auto-completion for existing files
- Click-to-navigate between documents
- Hover previews for linked content

### 📊 Enhanced Tables
- Interactive table editing
- Improved styling and readability
- Responsive design

### 🧮 Live LaTeX Support
- Inline math: `$E = mc^2$`
- Block math: `$$\sum_{i=1}^{n} x_i$$`
- Powered by KaTeX for fast rendering

### 📈 Diagram Support
- Mermaid diagrams
- PlantUML support (planned)
- Syntax highlighting for code blocks

### 🎯 Focus Modes
- **Paragraph Mode**: Highlight current paragraph
- **Section Mode**: Highlight current section based on headers
- **Off Mode**: No highlighting (default)

### 🎨 Custom Styling
- Dark theme optimized for VSCode
- Custom CSS injection capabilities
- Responsive design for different screen sizes

### ⌨️ Smart Features
- Auto-completion for wiki-links
- Keyboard shortcuts for common actions
- Live preview with synchronized scrolling
- Selective editing modes

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Open in VSCode and press F5 to run in development mode

## Usage

### Commands

- **MarkRight: Open Editor** (`Ctrl+Shift+M` / `Cmd+Shift+M`): Open the MarkRight editor for the current markdown file
- **MarkRight: Insert Wiki Link** (`Ctrl+Shift+L` / `Cmd+Shift+L`): Insert a wiki-style link
- **MarkRight: Toggle Focus Mode**: Cycle through focus modes
- **MarkRight: Toggle Preview**: Toggle the preview pane

### Keyboard Shortcuts (in editor)

- `Ctrl/Cmd + B`: Bold text
- `Ctrl/Cmd + I`: Italic text
- `Ctrl/Cmd + K`: Insert wiki link
- `Tab`: Indent text
- `Shift + Tab`: Unindent text

### Toolbar Actions

- 👁️ Toggle Preview
- 📊 Insert Table
- 🔗 Insert Wiki Link
- 🎯 Toggle Focus Mode
- ∑ Insert Math
- 📈 Insert Diagram

## Configuration

The extension provides several configuration options:

```json
{
  "markright.enableLivePreview": true,
  "markright.enableLatex": true,
  "markright.enableWikiLinks": true,
  "markright.enableDiagrams": true,
  "markright.customCss": "",
  "markright.focusMode": "off"
}
```

## Development

### Building

```bash
npm install
npm run compile
```

### Testing

```bash
npm test
```

### Packaging

```bash
npm run package
```

## Architecture

The extension consists of several key components:

- **Extension Entry Point** (`src/extension.ts`): Main activation and command registration
- **Markdown Editor Provider** (`src/markdownEditorProvider.ts`): Custom editor implementation
- **Markdown Renderer** (`src/markdownRenderer.ts`): Enhanced markdown processing with LaTeX and diagrams
- **Wiki Link Provider** (`src/features/wikiLinkProvider.ts`): Wiki-link functionality
- **Focus Mode Provider** (`src/features/focusModeProvider.ts`): Focus mode highlighting
- **Webview Content** (`src/webview/webviewContent.ts`): HTML content for the editor interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [Obsidian](https://obsidian.md/) for the wiki-link concept
- Built on [VSCode Extension API](https://code.visualstudio.com/api)
- Uses [KaTeX](https://katex.org/) for LaTeX rendering
- Uses [Mermaid](https://mermaid-js.github.io/) for diagram rendering
- Uses [marked](https://marked.js.org/) for markdown parsing
