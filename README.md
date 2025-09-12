# MarkLeft - WYSIWYG Markdown Editor for VSCode

A comprehensive WYSIWYG Markdown editor extension for Visual Studio Code with advanced features like selective editing, LaTeX rendering, enhanced tables, and customizable styling.

## Features

### 🎯 Core Features
- **Selective Editing Mode**: Click to edit specific portions while keeping the rest in preview
- **LaTeX Formula Rendering**: Inline `$...$` and block `$$...$$` math support with KaTeX
- **Enhanced Tables**: Visual editing with drag-to-resize columns and multi-line cells
- **Floating Table of Contents**: Draggable TOC with configurable depth levels
- **Collapsible Frontmatter**: Clean collapsed view with one-click expansion

### 🎨 Styling & Customization
- **Custom CSS Architecture**: Workspace-specific styling with `.vscode/markdown-style.css`
- **Typography Hierarchy**: Configurable line heights for H1-H6 headings
- **Syntax Dimming**: Configurable opacity for markdown syntax elements
- **Multiple Themes**: Support for light, dark, and custom themes

### 🚀 Advanced Features
- **Diagram Support**: Mermaid, GraphViz, and PlantUML rendering (planned)
- **Focus Modes**: Typewriter, focus, zen, and reading modes
- **Smart Editing**: Auto-completion, auto-pairing, smart lists
- **Export Options**: HTML, PDF, DOCX, LaTeX (planned)

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press F5 to open a new VSCode window with the extension loaded
4. Open a Markdown file and use "Open with MarkLeft" from the context menu

## Configuration

The extension supports extensive customization through VSCode settings:

```json
{
  "markleft.css.workspace": true,
  "markleft.heading.scales": [2.5, 2.2, 2.0, 1.8, 1.6, 1.5],
  "markleft.syntax.opacity": 0.4,
  "markleft.toc.defaultLevel": 3,
  "markleft.rendering.mode": "selective",
  "markleft.math.renderer": "katex"
}
```

### Custom CSS

Create a `.vscode/markdown-style.css` file in your workspace to customize the appearance:

```css
:root {
  --markleft-heading-scale-h1: 3.0;
  --markleft-accent-color: #007acc;
}

.markleft-editor h1 {
  color: var(--markleft-accent-color);
  border-bottom: 2px solid var(--markleft-accent-color);
}
```

## Keyboard Shortcuts

- `Ctrl+Shift+M`: Toggle frontmatter collapse/expand
- `Ctrl+Shift+T`: Toggle table of contents
- `Ctrl+Shift+P`: Toggle editing mode (selective/source/preview)

## Current Status

⚠️ **This is a foundation/scaffolding implementation** - Many features are not yet functional. This PR establishes the project structure and extension framework for incremental development.

### What's Working
- ✅ Basic VSCode extension structure
- ✅ Custom editor provider registration
- ✅ Configuration system
- ✅ Basic webview rendering

### What's Not Yet Implemented
- ❌ Proper markdown parsing (uses basic regex)
- ❌ Selective editing mode
- ❌ TOC toggle functionality
- ❌ Frontmatter toggle functionality
- ❌ LaTeX rendering
- ❌ Enhanced tables
- ❌ Focus modes

See [GITHUB_ISSUES_TEMPLATE.md](./GITHUB_ISSUES_TEMPLATE.md) for detailed implementation tasks.

## Development Status

This project is in active development. See [PROJECT_BREAKDOWN.md](./PROJECT_BREAKDOWN.md) for detailed implementation phases and current status.

### Phase 1: Core Foundation ✅
- [x] VSCode extension setup
- [x] Basic selective editing mode
- [x] Typography hierarchy
- [x] CSS architecture

### Phase 2: Content Rendering (In Progress)
- [ ] LaTeX formula rendering
- [ ] Enhanced table support
- [ ] Diagram support

### Phase 3: UI/UX Enhancement (Planned)
- [ ] Advanced TOC features
- [ ] Smart list enhancements
- [ ] Focus modes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## Roadmap

For a detailed breakdown of planned features and implementation phases, see [PROJECT_BREAKDOWN.md](./PROJECT_BREAKDOWN.md).
