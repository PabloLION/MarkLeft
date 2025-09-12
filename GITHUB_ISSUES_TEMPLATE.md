# GitHub Issues Templates for MarkLeft

Since I cannot directly create GitHub issues, here are the formatted issue templates that can be manually created. Each corresponds to the phases outlined in `PROJECT_BREAKDOWN.md`.

## Phase 1: Core Foundation

### Issue #1: VSCode Extension Setup
**Labels**: `priority:critical`, `effort:small`, `phase:1`

**Description:**
Set up the basic VSCode extension project structure and development environment.

**Acceptance Criteria:**
- [x] Create VSCode extension manifest (package.json)
- [x] Set up TypeScript configuration and build system  
- [x] Configure ESLint for code quality
- [x] Create basic extension activation and registration
- [x] Set up development and debugging environment

**Dependencies:** None

---

### Issue #2: Core Rendering Engine  
**Labels**: `priority:critical`, `effort:large`, `phase:1`

**Description:**
Implement the selective editing mode that allows users to click on content to edit while keeping the rest in preview.

**Acceptance Criteria:**
- [x] Implement default preview mode with full formatting
- [ ] Add click-to-edit functionality for specific portions
- [ ] Create smooth transitions between rendered/source views
- [ ] Preserve cursor position during mode transitions
- [ ] Support granularity levels (block, line, word)
- [ ] Implement smart context detection for complex blocks

**Dependencies:** Issue #1

---

### Issue #3: Typography & Styling Foundation
**Labels**: `priority:high`, `effort:medium`, `phase:1`

**Description:**
Create the typography hierarchy and CSS architecture foundation.

**Acceptance Criteria:**
- [x] Implement heading hierarchy (H1-H6) with configurable line heights
- [x] Create CSS variables system for theming
- [x] Set up configurable spacing multipliers
- [x] Implement smart spacing around headings
- [x] Create workspace-specific CSS support

**Dependencies:** Issue #2

---

## Phase 2: Content Rendering Features

### Issue #4: LaTeX Formula Rendering
**Labels**: `priority:high`, `effort:large`, `phase:2`

**Description:**
Integrate mathematical formula rendering with KaTeX or MathJax.

**Acceptance Criteria:**
- [ ] Integrate KaTeX for fast rendering
- [ ] Support inline `$...$` formulas  
- [ ] Support block `$$...$$` formulas
- [ ] Implement formula editor with live preview
- [ ] Add error handling for invalid formulas
- [ ] Implement copy options (LaTeX, MathML, image)
- [ ] Add MathJax as fallback option

**Dependencies:** Issue #2

---

### Issue #5: Enhanced Table Support
**Labels**: `priority:high`, `effort:large`, `phase:2`

**Description:**
Create advanced table editing capabilities beyond basic markdown tables.

**Acceptance Criteria:**
- [ ] Implement visual table editor with direct cell editing
- [ ] Add Tab/Shift+Tab navigation between cells
- [ ] Support column resizing with drag handles
- [ ] Implement multi-line cells with line break support
- [ ] Add cell merging (colspan/rowspan) capabilities
- [ ] Create quick actions toolbar (add/remove rows/columns)
- [ ] Add alignment controls and indicators
- [ ] Support basic spreadsheet-like formulas

**Dependencies:** Issue #2

---

### Issue #6: Diagram Support  
**Labels**: `priority:medium`, `effort:large`, `phase:2`

**Description:**
Add support for rendering diagrams from text descriptions.

**Acceptance Criteria:**
- [ ] Integrate Mermaid diagram rendering
- [ ] Add GraphViz support for complex graphs
- [ ] Implement PlantUML for UML diagrams
- [ ] Create side-by-side edit mode with live preview
- [ ] Add error messages with line numbers for invalid syntax
- [ ] Implement export options (SVG, PNG, PDF)
- [ ] Add theme integration (light/dark mode support)

**Dependencies:** Issue #2

---

## Phase 3: UI/UX Enhancement Features

### Issue #7: Collapsible Frontmatter
**Labels**: `priority:medium`, `effort:small`, `phase:3`

**Description:**
Implement clean frontmatter handling with collapse/expand functionality.

**Acceptance Criteria:**
- [x] Show collapsed state as single line summary
- [x] Add click to expand/edit functionality  
- [ ] Implement YAML syntax highlighting and validation
- [x] Add auto-collapse when cursor leaves area
- [ ] Remember collapse state per document
- [x] Add hotkey toggle (Ctrl+Shift+M)

**Dependencies:** Issue #2

---

### Issue #8: Floating Table of Contents
**Labels**: `priority:high`, `effort:large`, `phase:3`

**Description:**
Create an advanced, interactive table of contents sidebar.

**Acceptance Criteria:**
- [x] Create draggable/resizable TOC sidebar
- [x] Implement level slider (1-6 heading depth control)
- [ ] Add expand/collapse bulk actions ("Expand All to Level X")
- [ ] Create current position indicator with smooth scroll
- [ ] Implement search/filter functionality within headings
- [ ] Add optional automatic numbering (1.1, 1.2, etc.)
- [ ] Support mini-map mode for document structure overview
- [x] Make responsive for mobile/tablet views

**Dependencies:** Issue #2

---

### Issue #9: Syntax Dimming System
**Labels**: `priority:medium`, `effort:medium`, `phase:3`

**Description:**
Implement configurable opacity system for markdown syntax elements.

**Acceptance Criteria:**
- [x] Set markdown symbols at configurable opacity (default 40%)
- [x] Show full opacity when cursor is on line
- [ ] Support different opacity levels per syntax type
- [ ] Add zen mode (completely hidden syntax)
- [ ] Make opacity levels user-configurable
- [ ] Smooth transitions between opacity states

**Dependencies:** Issue #2

---

## Phase 4: Advanced Editing Features

### Issue #10: Smart List Enhancements
**Labels**: `priority:medium`, `effort:medium`, `phase:4`

**Description:**
Enhance list functionality with visual hierarchy and interactive features.

**Acceptance Criteria:**
- [ ] Implement different bullet styles for nested levels (•, ◦, ▪, ▸)
- [ ] Add indentation guides (vertical lines)
- [ ] Create alternating background colors for readability
- [ ] Detect and handle "loose lists" vs "tight lists" with appropriate spacing
- [ ] Implement drag and drop for reordering items
- [ ] Add click bullet to toggle checkbox functionality
- [ ] Create fold/unfold for nested lists

**Dependencies:** Issue #2

---

### Issue #11: Auto-completion & Smart Assists  
**Labels**: `priority:medium`, `effort:medium`, `phase:4`

**Description:**
Add intelligent editing assistance and auto-completion features.

**Acceptance Criteria:**
- [ ] Implement wiki-links `[[...]]` auto-completion
- [ ] Add tags `#...` auto-completion with existing tag suggestions
- [ ] Create emoji `:...:` auto-completion
- [ ] Add auto-pairing for brackets, quotes, markdown syntax
- [ ] Implement smart list continuation on Enter
- [ ] Add table assistance (auto-align pipes, tab navigation)
- [ ] Create auto-format on paste functionality

**Dependencies:** Issue #2

---

### Issue #12: Focus Modes
**Labels**: `priority:low`, `effort:small`, `phase:4`

**Description:**
Implement various focus modes to improve writing experience.

**Acceptance Criteria:**
- [ ] Implement typewriter mode (current line stays centered)
- [ ] Create focus mode (dim all paragraphs except current)
- [ ] Add zen mode (hide all UI except editor)
- [ ] Implement reading mode (pure preview, no editing indicators)
- [ ] Add smooth transitions between modes
- [ ] Make modes toggleable via keyboard shortcuts

**Dependencies:** Issue #2

---

## Phase 5: Advanced Features

### Issue #13: Custom CSS Architecture
**Labels**: `priority:high`, `effort:medium`, `phase:5`

**Description:**
Enhance the CSS customization system for advanced theming.

**Acceptance Criteria:**
- [x] Support workspace-specific CSS (.vscode/markdown-style.css)
- [x] Create global default CSS system
- [x] Implement CSS variables for comprehensive theming
- [ ] Add live reload on CSS changes
- [ ] Create CSS snippets library for common customizations
- [ ] Implement theme marketplace integration
- [ ] Support per-workspace styling profiles

**Dependencies:** Issue #3

---

### Issue #14: GitHub Flavored Markdown Extensions
**Labels**: `priority:medium`, `effort:medium`, `phase:5`

**Description:**
Add support for GitHub Flavored Markdown features.

**Acceptance Criteria:**
- [ ] Implement task lists with progress indicators
- [ ] Add strikethrough text support
- [ ] Create autolinks for URLs
- [ ] Implement emoji shortcodes with picker
- [ ] Add syntax highlighting in code blocks
- [ ] Support language detection for code blocks
- [ ] Add support for GitHub-style tables

**Dependencies:** Issue #2

---

### Issue #15: Inline Preview Features
**Labels**: `priority:medium`, `effort:medium`, `phase:5`

**Description:**
Add hover previews and inline interactions for various content types.

**Acceptance Criteria:**
- [ ] Implement link hover previews (internal/external)
- [ ] Add favicon display for external links
- [ ] Create dead link detection with visual indicators
- [ ] Implement image lazy loading with blur-up effect
- [ ] Add click to view full-size image in modal
- [ ] Create image resize by dragging corners
- [ ] Add alt text overlay on hover
- [ ] Implement footnote hover previews
- [ ] Add bibliography/citation management

**Dependencies:** Issue #2

---

## Instructions for Creating Issues

1. **Copy the content** for each issue you want to create
2. **Create a new GitHub issue** in the repository
3. **Use the title** as the issue title
4. **Add the labels** mentioned in each issue
5. **Use the description and acceptance criteria** as the issue body
6. **Set up milestones** for each phase (Phase 1, Phase 2, etc.)
7. **Create a project board** to track progress across phases

## Issue Dependencies

Create issues in dependency order:
1. Start with Phase 1 issues (#1-3)
2. Don't start Phase 2 until Issue #2 is complete
3. Phase 3 can begin once core rendering is stable
4. Later phases can run in parallel with proper coordination

## Labels to Create

- **Priority**: `priority:critical`, `priority:high`, `priority:medium`, `priority:low`
- **Effort**: `effort:small`, `effort:medium`, `effort:large`  
- **Phase**: `phase:1`, `phase:2`, `phase:3`, `phase:4`, `phase:5`
- **Type**: `type:feature`, `type:bug`, `type:enhancement`, `type:documentation`
- **Status**: `status:planning`, `status:in-progress`, `status:review`, `status:testing`