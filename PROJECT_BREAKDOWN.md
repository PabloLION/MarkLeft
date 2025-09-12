# MarkLeft WYSIWYG Markdown Editor - Project Breakdown

This document breaks down the comprehensive feature specification into manageable sub-issues for development.

## Phase 1: Core Foundation (Essential Infrastructure)

### Issue 1.1: VSCode Extension Setup
**Priority**: Critical
**Effort**: Small
- Set up VSCode extension project structure
- Configure TypeScript and build system
- Create basic extension manifest (package.json)
- Set up development environment and debugging
- Implement basic activation and registration

### Issue 1.2: Core Rendering Engine
**Priority**: Critical
**Effort**: Large
- Implement selective editing mode (default preview, click to edit source)
- Create smooth transitions between rendered/source views
- Handle cursor position preservation during mode transitions
- Implement granularity levels (block, line, word)
- Smart context detection for complex blocks

### Issue 1.3: Typography & Styling Foundation
**Priority**: High
**Effort**: Medium
- Implement heading hierarchy (H1-H6 with different line heights)
- Create configurable spacing multipliers
- Set up smart spacing around headings
- Create base CSS architecture with CSS variables

## Phase 2: Content Rendering Features

### Issue 2.1: LaTeX Formula Rendering
**Priority**: High
**Effort**: Large
- Integrate KaTeX or MathJax for formula rendering
- Implement inline `$...$` and block `$$...$$` support
- Create formula editor with live preview
- Add error handling for invalid formulas
- Implement copy options (LaTeX, MathML, image)

### Issue 2.2: Enhanced Table Support
**Priority**: High
**Effort**: Large
- Create visual table editor with direct cell editing
- Implement Tab/Shift+Tab navigation
- Add column resizing and alignment controls
- Support multi-line cells and cell merging
- Create quick actions toolbar (add/remove rows/columns)

### Issue 2.3: Diagram Support
**Priority**: Medium
**Effort**: Large
- Integrate Mermaid diagram rendering
- Add GraphViz support
- Implement PlantUML rendering
- Create side-by-side edit mode with preview
- Add export options (SVG, PNG, PDF)

## Phase 3: UI/UX Enhancement Features

### Issue 3.1: Collapsible Frontmatter
**Priority**: Medium
**Effort**: Small
- Implement collapsed state display
- Add click to expand/edit functionality
- Create YAML syntax highlighting and validation
- Implement auto-collapse behavior
- Add hotkey toggle (Ctrl+Shift+M)

### Issue 3.2: Floating Table of Contents
**Priority**: High
**Effort**: Large
- Create draggable/resizable TOC sidebar
- Implement level slider (1-6 heading depth control)
- Add expand/collapse bulk actions
- Create current position indicator with smooth scroll
- Implement search/filter functionality
- Add optional automatic numbering

### Issue 3.3: Syntax Dimming System
**Priority**: Medium
**Effort**: Medium
- Implement configurable opacity for markdown symbols
- Create smart visibility (full opacity on cursor line)
- Add different opacity levels per syntax type
- Implement zen mode (hidden syntax)

## Phase 4: Advanced Editing Features

### Issue 4.1: Smart List Enhancements
**Priority**: Medium
**Effort**: Medium
- Implement visual hierarchy with different bullet styles
- Add indentation guides and alternating backgrounds
- Create smart spacing detection (loose vs tight lists)
- Implement drag and drop reordering
- Add fold/unfold functionality

### Issue 4.2: Auto-completion & Smart Assists
**Priority**: Medium
**Effort**: Medium
- Implement wiki-links `[[...]]` auto-completion
- Add tags `#...` and emoji `:...:` completion
- Create auto-pairing for brackets/quotes/markdown
- Implement smart list continuation
- Add table assistance (auto-align pipes, tab navigation)

### Issue 4.3: Focus Modes
**Priority**: Low
**Effort**: Small
- Implement typewriter mode (current line centered)
- Create focus mode (dim non-active paragraphs)
- Add zen mode (hide all UI)
- Implement reading mode (pure preview)

## Phase 5: Advanced Features

### Issue 5.1: Custom CSS Architecture
**Priority**: High
**Effort**: Medium
- Implement workspace-specific CSS support
- Create global default CSS system
- Set up CSS variables for theming
- Implement live reload on CSS changes
- Create CSS snippets library

### Issue 5.2: GitHub Flavored Markdown Extensions
**Priority**: Medium
**Effort**: Medium
- Implement task lists with progress indicators
- Add strikethrough and emoji shortcodes
- Create autolinks for URLs
- Implement syntax highlighting in code blocks
- Add language detection

### Issue 5.3: Inline Preview Features
**Priority**: Medium
**Effort**: Medium
- Implement link hover previews
- Add image lazy loading and resize functionality
- Create footnote hover previews
- Implement dead link detection
- Add citation management

## Phase 6: Performance & Polish

### Issue 6.1: Performance Optimizations
**Priority**: High
**Effort**: Large
- Implement virtual scrolling for large documents
- Create incremental rendering system
- Add worker thread for heavy processing
- Implement caching system (content, formulas, images)
- Add debounced preview updates

### Issue 6.2: Export & Publishing
**Priority**: Medium
**Effort**: Large
- Implement HTML export with embedded styles
- Add PDF export with print styles
- Create DOCX/ODT export
- Add LaTeX export functionality
- Implement static site generation integration

### Issue 6.3: Configuration System
**Priority**: High
**Effort**: Medium
- Create comprehensive settings structure
- Implement profile system for different document types
- Add settings sync across devices
- Create import/export settings functionality
- Implement reset to defaults per category

## Phase 7: Accessibility & Advanced Features

### Issue 7.1: Accessibility Features
**Priority**: High
**Effort**: Medium
- Implement screen reader optimized modes
- Create high contrast themes
- Add keyboard-only navigation
- Implement voice control integration
- Create adjustable font sizes without breaking layout

### Issue 7.2: File System Integration
**Priority**: Medium
**Effort**: Medium
- Implement auto-save with configurable intervals
- Add file watching for external changes
- Create attachment management system
- Implement relative path handling
- Add drag & drop file upload

### Issue 7.3: Plugin Architecture
**Priority**: Low
**Effort**: Large
- Create extension API for third-party plugins
- Implement plugin marketplace integration
- Add plugin settings management
- Create safe mode to disable plugins

## Development Guidelines

### Technical Stack
- **Language**: TypeScript
- **Framework**: VSCode Extension API
- **Rendering**: Custom HTML/CSS with WebView
- **Math**: KaTeX (primary) / MathJax (fallback)
- **Diagrams**: Mermaid, GraphViz, PlantUML
- **Build**: webpack/rollup
- **Testing**: Jest/Mocha

### Implementation Priorities
1. **Critical Path**: Core rendering engine and selective editing
2. **High Value**: LaTeX, Tables, TOC, CSS customization
3. **Polish**: Performance, accessibility, advanced features

### Estimated Timeline
- **Phase 1**: 2-3 weeks (foundation)
- **Phase 2**: 4-6 weeks (core features)
- **Phase 3**: 3-4 weeks (UI/UX)
- **Phase 4**: 2-3 weeks (editing features)
- **Phase 5**: 3-4 weeks (advanced features)
- **Phase 6**: 3-4 weeks (performance & export)
- **Phase 7**: 2-3 weeks (accessibility & plugins)

**Total Estimated**: 19-27 weeks for full implementation

### Notes for Issue Creation
Each phase can be broken into individual GitHub issues using the structure above. Each issue should include:
- Clear acceptance criteria
- Technical implementation details
- Dependencies on other issues
- Testing requirements
- Documentation updates needed