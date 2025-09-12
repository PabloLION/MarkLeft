# Changelog

All notable changes to the MarkRight extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### Added
- Initial release of MarkRight VSCode extension
- Obsidian-like markdown editor with custom webview
- Wiki-style links ([[link]]) with auto-completion and navigation
- Live LaTeX rendering using KaTeX for mathematical expressions
- Enhanced table editing with improved styling
- Focus modes (paragraph, section, off) for distraction-free writing
- Mermaid diagram support with live rendering
- Custom CSS injection capabilities
- Comprehensive keyboard shortcuts and toolbar actions
- Dark theme optimized for VSCode
- Real-time preview with synchronized scrolling
- Smart features including auto-completion and hover previews
- Configurable settings for all major features
- Test suite for core functionality
- Comprehensive documentation and examples

### Features
- **Wiki Links**: Support for `[[link]]` syntax with file navigation
- **LaTeX Math**: Inline `$math$` and block `$$math$$` rendering
- **Enhanced Tables**: Interactive editing with improved styling
- **Focus Modes**: Paragraph and section highlighting
- **Diagrams**: Mermaid diagram rendering
- **Custom Styling**: Dark theme with custom CSS support
- **Smart Editing**: Auto-completion, hover previews, and shortcuts

### Commands
- `markright.openEditor`: Open MarkRight editor for markdown files
- `markright.insertWikiLink`: Insert wiki-style links
- `markright.toggleFocusMode`: Cycle through focus modes
- `markright.togglePreview`: Toggle preview pane

### Keyboard Shortcuts
- `Ctrl+Shift+M` / `Cmd+Shift+M`: Open MarkRight editor
- `Ctrl+Shift+L` / `Cmd+Shift+L`: Insert wiki link
- `Ctrl+B` / `Cmd+B`: Bold text (in editor)
- `Ctrl+I` / `Cmd+I`: Italic text (in editor)

### Configuration Options
- `markright.enableLivePreview`: Enable/disable live preview
- `markright.enableLatex`: Enable/disable LaTeX rendering
- `markright.enableWikiLinks`: Enable/disable wiki links
- `markright.enableDiagrams`: Enable/disable diagram rendering
- `markright.customCss`: Custom CSS for styling
- `markright.focusMode`: Set default focus mode

## [Unreleased]

### Planned Features
- PlantUML diagram support
- Export functionality (PDF, HTML)
- Custom themes
- Advanced table editing (column sorting, filtering)
- Backlink panel
- Graph view for wiki links
- Performance optimizations
- Mobile support improvements