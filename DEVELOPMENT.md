# MarkLeft Development Setup

## Project Structure

```
MarkLeft/
├── src/
│   ├── core/              # Core editor functionality
│   │   ├── editorProvider.ts    # Custom editor provider
│   │   └── document.ts          # Document management
│   ├── ui/                # User interface components  
│   │   └── webview.ts           # Webview HTML generation
│   ├── features/          # Feature implementations (future)
│   ├── utils/             # Utility functions (future)
│   └── extension.ts       # Main extension entry point
├── media/                 # Static assets
│   ├── styles.css         # Main stylesheet
│   ├── script.js          # Main JavaScript
│   └── example-workspace-style.css  # Example custom CSS
├── out/                   # Compiled TypeScript output
├── package.json           # Extension manifest
├── tsconfig.json          # TypeScript configuration
├── .eslintrc.js          # ESLint configuration
├── PROJECT_BREAKDOWN.md   # Detailed implementation plan
├── README.md              # Project documentation
└── sample.md              # Test markdown file
```

## Commands Available

- `npm install` - Install dependencies
- `npm run compile` - Compile TypeScript
- `npm run watch` - Watch mode compilation  
- `npm run lint` - Run ESLint
- `npm run test` - Run tests (when implemented)
- `npm run package` - Package extension for distribution

## Development Workflow

1. Make changes to TypeScript files in `src/`
2. Run `npm run compile` or use watch mode
3. Press F5 in VSCode to launch extension development host
4. Open `sample.md` and select "Open with MarkLeft"
5. Test changes in the custom editor

## Current Implementation Status

### ✅ Completed (Phase 1)
- Basic VSCode extension structure
- Custom editor provider registration
- Webview-based editor with HTML/CSS/JS
- Basic selective editing click handling
- Typography hierarchy with CSS variables
- Table of contents structure
- Frontmatter collapse/expand
- Configuration system
- Keyboard shortcuts

### 🚧 In Progress
- Enhanced markdown parsing
- Improved selective editing transitions
- Better error handling

### 📋 Next Steps (Phase 2)
- KaTeX integration for LaTeX rendering
- Advanced table editing capabilities
- Mermaid diagram support
- Enhanced list interactions
- Performance optimizations

## Testing

Currently manual testing with `sample.md`. To test:

1. Open VSCode in this project
2. Press F5 to launch development host
3. Open `sample.md`
4. Right-click and select "Open with MarkLeft"
5. Test features like:
   - Clicking on text elements (selective editing)
   - Using keyboard shortcuts (Ctrl+Shift+M, Ctrl+Shift+T)
   - Resizing window (responsive TOC)

## Configuration

The extension respects VSCode settings under the `markleft.*` namespace. See `package.json` for all available settings.

## Custom CSS

Users can create `.vscode/markdown-style.css` in their workspace to customize styling. See `media/example-workspace-style.css` for examples.

## Contributing

See `PROJECT_BREAKDOWN.md` for detailed feature breakdown that can be used to create individual GitHub issues for development.