# Developer Brief: Issue #3 - WYSIWYG Markdown Editor for VSCode

## Context

This issue outlines a comprehensive feature specification for implementing a WYSIWYG (What You See Is What You Get) Markdown Editor as a VSCode extension. The goal is to create an advanced editing experience that combines the flexibility of markdown source editing with rich visual preview capabilities, including selective editing modes, LaTeX math rendering, diagram support, and extensive customization options.

The specification is organized into 25 detailed features across core rendering, UI/UX, editor behavior, advanced features, configuration, and technical requirements. It's designed as a foundation for a powerful note-taking and document editing tool within VSCode.

## Requirements

- **Core Rendering**: Implement selective editing mode where users can click on rendered content to edit the underlying markdown source
- **Typography System**: Configurable heading hierarchy with custom line heights and spacing
- **Math Support**: LaTeX formula rendering with live preview editing (KaTeX/MathJax options)
- **Table Support**: Visual table editing with cell navigation, resizing, and advanced features
- **Diagram Integration**: Support for Mermaid, GraphViz, and PlantUML with live preview
- **UI Components**: Floating table of contents, collapsible frontmatter, focus modes
- **Performance**: Virtual scrolling, incremental rendering, and caching for large documents
- **Customization**: CSS-based theming system with workspace and global styles
- **Plugin Architecture**: Extensible system for third-party plugins

## Acceptance Criteria

- **Selective Editing**: Smooth transitions between rendered and source views with cursor preservation
- **Typography**: Configurable heading scales (H1: 2.5em, H2: 2.2em, etc.) with smart spacing
- **Math Rendering**: Inline `$...$` and block `$$...$$` formulas with click-to-edit functionality
- **Table Editing**: Visual cell editing, Tab navigation, column resizing, multi-line support
- **Diagram Support**: Live preview with side-by-side editing and export options
- **Performance**: Handle documents >10k lines with virtual scrolling and debounced updates
- **Customization**: CSS variables system with live reload and cascade priority
- **Plugin System**: Extension API with safe mode and settings management

## Tasks/Milestones

### Phase 1: Foundation (Critical Path)

1. **Issue #4**: Core Editor Architecture & Selective Editing Mode (3-4 weeks)

   - Implement selective editing mode with smooth transitions
   - Smart context detection for blocks vs inline elements
   - Syntax dimming system

2. **Issue #5**: Typography System & Rendering Engine (2-3 weeks)
   - Configurable heading hierarchy and line heights
   - CSS architecture with variables and custom file support
   - Live reload for style changes

### Phase 2: Content Enhancement (High Priority)

1. **Issue #6**: Enhanced List and Table Support (2 weeks)

   - Visual list hierarchy with different bullet styles
   - Interactive features (drag/drop, checkbox toggles)
   - Basic table editing with cell navigation

2. **Issue #7**: LaTeX Math & Advanced Tables (3 weeks)
   - LaTeX formula rendering with live preview editing
   - Advanced table features (multi-line cells, column resize)
   - Export options for tables

### Phase 3: UI/UX Enhancement (Medium Priority)

1. **Issue #8**: Navigation & UI Components (2-3 weeks)

   - Floating Table of Contents with level controls
   - Frontmatter collapse/expand functionality
   - Focus modes (typewriter, focus, zen, reading)

2. **Issue #9**: Diagram Support & Media Handling (2-3 weeks)
   - Mermaid, GraphViz, PlantUML rendering
   - Enhanced image handling (resize, preview, lazy loading)
   - Link preview and footnote hover features

### Phase 4: Advanced Features (Low Priority)

1. **Issue #10**: Smart Editing & Auto-completion (2 weeks)

   - Auto-completion for wiki-links, tags, emoji
   - Smart editing assists and table assistance
   - Fuzzy matching for suggestions

2. **Issue #11**: Performance & Configuration (2-3 weeks)
   - Virtual scrolling and incremental rendering
   - Comprehensive settings system with profiles
   - Plugin architecture foundation

## Risks

- **Complexity of Selective Editing**: Mapping cursor positions between rendered and source views may require significant DOM manipulation
- **Performance Bottlenecks**: Large documents with complex content (diagrams, math) could impact rendering performance
- **Library Dependencies**: Integration of KaTeX/MathJax, Mermaid, etc. may introduce compatibility issues
- **CSS Customization**: User-provided CSS could conflict with extension styles or cause rendering issues
- **Plugin Architecture**: Designing a secure and extensible plugin system while maintaining performance

## Open Questions

- Which math renderer to prioritize: KaTeX (faster) or MathJax (more comprehensive)?
- How to handle cursor position mapping in complex nested structures?
- What level of plugin API surface to expose initially?
- How to implement virtual scrolling without breaking existing VSCode editor features?
- Should diagram editing be inline or in separate panels?

## References

- **Primary Spec**: [GitHub Issue #3](https://github.com/PabloLION/MarkLeft/issues/3) - Complete feature specification
- **Related Issues**:
  - Issue #4: Core Editor Architecture
  - Issue #5: Typography System
  - Issue #6: Enhanced Lists & Tables
  - Issue #7: LaTeX Math & Advanced Tables
- **VSCode Extension APIs**: Documentation for custom editors, webview panels, and text document content providers
- **Libraries**: KaTeX, MathJax, Mermaid.js, GraphViz integration guides

## Implementation Notes

- Use VSCode's Custom Editor API for the WYSIWYG experience
- Implement webview-based rendering for rich content display
- Leverage CSS custom properties for theming flexibility
- Consider web workers for heavy processing (math rendering, diagram generation)
- Plan for incremental adoption: start with core selective editing, add features iteratively
