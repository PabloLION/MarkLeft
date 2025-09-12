# MarkLeft/MarkRight Development Instructions

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.**

## Project Overview
MarkLeft/MarkRight is intended to be a WYSIWYG Markdown editor distributed as both a VS Code Extension (VSCE) and Chrome Extension. Currently, the repository is in a minimal state containing only basic project structure and AI workflow configurations.

## Current Repository State
**CRITICAL**: This repository is currently a template/minimal setup with no actual source code. It contains:
- Basic README.md and LICENSE
- GitHub AI workflow configurations (Claude and Gemini agents)
- Node.js .gitignore template
- No package.json, source code, or build system

## Working Effectively

### Environment Setup
Always run these commands in order to establish a proper development environment:

1. **Verify Node.js environment**:
   - `node --version` - Should return v20.19.5 or compatible
   - `npm --version` - Should return 10.8.2 or compatible

2. **Initialize project structure** (if package.json doesn't exist):
   - `npm init -y` - Creates basic package.json
   - `npm install typescript @types/node --save-dev` - Takes ~5 seconds. NEVER CANCEL.
   - `npx tsc --init` - Creates tsconfig.json configuration

3. **Install VS Code Extension development tools**:
   - `npm install -g yo generator-code` - Takes ~57 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
   - `npm install -g vsce` - Takes ~8 seconds. Set timeout to 120+ seconds. (VS Code extension packaging)

4. **Install Chrome Extension development dependencies**:
   - `npm install webpack webpack-cli typescript ts-loader --save-dev` - Takes ~8 seconds. NEVER CANCEL. Set timeout to 180+ seconds.

### Project Initialization (First Time Setup)
Since this repository currently lacks source code, developers must:

1. **Choose extension type and initialize**:
   - For VS Code: `yo code` (interactive generator)
   - For Chrome: Create manifest.json and basic extension structure

2. **Install common dependencies**:
   - `npm install @types/vscode --save-dev` (for VS Code extensions)
   - `npm install @types/chrome --save-dev` (for Chrome extensions)

### Build and Test Commands
**NOTE**: Currently no build system exists. After project initialization:

1. **TypeScript compilation**:
   - `npx tsc` - Compiles TypeScript files
   - `npx tsc --watch` - Continuous compilation (keep running during development)

2. **VS Code Extension testing**:
   - `code --extensionDevelopmentPath=.` - Opens VS Code with extension loaded
   - F5 in VS Code - Launches Extension Development Host

3. **Chrome Extension testing**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select project directory

### AI Workflow Integration
This repository includes advanced AI agent workflows that are FUNCTIONAL and should be used:

1. **Claude Code Agent**:
   - **Trigger**: Comment `@claude` in any issue or PR comment
   - **Configuration**: `.github/workflows/claude.yml`
   - **Capabilities**: Can read code, make changes, analyze CI results
   - **Usage**: "@claude please review this PR" or "@claude implement feature X"
   - **Permissions**: Can read repository contents, issues, and PRs

2. **Gemini AI Agent**:
   - **Multiple workflow files** for different triggers:
     - `gemini-invoke.yml`: Core workflow for Gemini integration
     - `gemini-triage.yml`: Automated issue triage
     - `gemini-review.yml`: Code review automation
     - `gemini-dispatch.yml`: Workflow dispatch handling
   - **Advanced features**: Uses MCP servers for GitHub integration
   - **Session limits**: Up to 25 conversation turns per session
   - **Tool integration**: Can run shell commands, access GitHub API

3. **AI Agent Best Practices**:
   - **Always use AI agents** for code review before merging changes
   - **Tag agents early** in development process for guidance
   - **Provide context** when requesting AI assistance
   - **AI agents understand the repository structure** and can navigate effectively

### Validation and Testing

**MANUAL VALIDATION REQUIREMENTS**:
Always test functionality after making changes:

1. **VS Code Extension validation**:
   - Create extension: `yo code` (interactive generator - takes 30-60 seconds)
   - Load extension in development host: `code --extensionDevelopmentPath=.`
   - Test markdown editing functionality: Create .md file and test WYSIWYG features
   - Verify extension activates correctly: Check Output panel for activation logs
   - Test commands: Use Ctrl+Shift+P to test registered commands
   - Take screenshot of working extension for validation

2. **Chrome Extension validation**:
   - Load unpacked extension: Navigate to `chrome://extensions/`, enable Developer mode, click "Load unpacked"
   - Test markdown editing in browser context: Open extension popup/page
   - Verify UI components render correctly: Check for console errors (F12)
   - Test content script functionality if applicable
   - Take screenshot of working extension for validation

3. **Code quality checks** (after establishing ESLint configuration):
   - `npm install eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin --save-dev` - Takes ~8 seconds. Set timeout to 180+ seconds.
   - `npx eslint src/` (lint source files)
   - `npx tsc --noEmit` (TypeScript type checking without compilation)
   - Both commands should complete in under 10 seconds for small projects

### Complete End-to-End Validation Scenario
After making any changes, ALWAYS execute this complete workflow:

1. **Environment Verification**:
   - `node --version && npm --version` (should show Node v20+ and npm v10+)
   - `cd` to project directory

2. **Build Process**:
   - `npm install` (install dependencies)
   - `npx tsc` (compile TypeScript - should complete in 1-5 seconds)
   - Check for compilation errors and fix before proceeding

3. **Extension Testing**:
   - For VS Code: `code --extensionDevelopmentPath=.` and test basic functionality
   - For Chrome: Load extension and test in browser environment
   - Verify no console errors or runtime exceptions

4. **Screenshot Documentation**:
   - Take screenshot showing working extension UI
   - Document any new features or changes visually
   - Save screenshots to validate functionality works as expected

### Common Development Tasks

#### Adding New Features
1. **Always create feature branch**: `git checkout -b feature/feature-name`
2. **Implement in TypeScript**: Use `src/` directory structure
3. **Update extension manifests**: Both VS Code package.json and Chrome manifest.json
4. **Test in both environments**: VS Code and Chrome
5. **Run validation steps** before committing

#### File Structure (Recommended)
```
src/
├── vscode/          # VS Code extension specific code
├── chrome/          # Chrome extension specific code
├── shared/          # Shared utilities and components
├── markdown/        # Markdown processing logic
└── wysiwyg/         # WYSIWYG editor components
```

### Known Issues and Workarounds
- **Repository State**: Currently minimal - requires full project initialization
- **No Build System**: Must be created from scratch using TypeScript/webpack
- **No Tests**: Test framework must be established (recommend Jest or Mocha)
- **No Documentation**: API documentation must be created
- **Interactive Commands**: Some generators like `yo code` require manual interaction
- **ESLint Configuration**: Requires interactive setup via `npx eslint --init`

### Troubleshooting Common Issues

1. **"Command not found" errors**:
   - Ensure Node.js and npm are installed: `node --version && npm --version`
   - For global packages, verify PATH includes npm global bin: `npm config get prefix`

2. **Permission errors during npm install**:
   - Use local installation instead of global when possible
   - For global installs, consider using npm without sudo

3. **TypeScript compilation errors**:
   - Check tsconfig.json exists: `npx tsc --init` if missing
   - Verify TypeScript is installed: `npm list typescript`
   - Use `npx tsc --noEmit` to check types without generating files

4. **Extension loading failures**:
   - VS Code: Check Output panel → Extension Host for error messages
   - Chrome: Check chrome://extensions/ page for error details
   - Verify manifest.json/package.json syntax is valid

5. **AI Workflow not triggering**:
   - Ensure exact syntax: `@claude` or proper Gemini triggers
   - Check workflow permissions in repository settings
   - Verify secrets are configured (CLAUDE_CODE_OAUTH_TOKEN, etc.)

### Timing Expectations (NEVER CANCEL - Set Appropriate Timeouts)
- **npm install typescript @types/node**: ~1 second. Set timeout to 60+ seconds.
- **npm install webpack webpack-cli ts-loader**: ~8 seconds. Set timeout to 180+ seconds.
- **npm install -g yo generator-code**: ~57 seconds. NEVER CANCEL. Set timeout to 120+ seconds.
- **npm install -g vsce**: ~8 seconds. Set timeout to 120+ seconds.
- **npm install @types/vscode @types/chrome**: ~1 second. Set timeout to 60+ seconds.
- **npx tsc [single file]**: ~1 second for small TypeScript files
- **npx tsc --init**: ~1 second
- **yo code**: 30-60 seconds for interactive extension generation. NEVER CANCEL.
- **Extension packaging with vsce**: 5-10 seconds when build system is established

### Development Workflow
1. **Always start with environment setup** commands above
2. **Initialize project structure** if not present
3. **Make incremental changes** and test frequently
4. **Use AI agents** for code review by tagging `@claude` or triggering Gemini workflows
5. **Validate manually** before considering changes complete

### Repository Navigation and Key Locations
- **Root directory**: Contains basic project files and configuration
  - `README.md`: Project description (minimal - needs expansion)
  - `LICENSE`: GPL-3.0 license
  - `.gitignore`: Comprehensive Node.js gitignore rules
- **`.github/workflows/`**: AI agent workflow configurations (FUNCTIONAL)
  - `claude.yml`: Claude Code agent configuration
  - `gemini-*.yml`: Multiple Gemini workflow files
- **Future `src/`**: Will contain all source code (not yet created)
  - Recommended structure: `src/vscode/`, `src/chrome/`, `src/shared/`
- **Future `dist/`**: Will contain compiled/packaged extensions
- **Future `test/`**: Will contain test files and test configuration

### Critical File Locations After Setup
Once project is initialized, key files to monitor:
- `package.json`: Project configuration and dependencies
- `tsconfig.json`: TypeScript compiler configuration  
- `webpack.config.js`: Build system configuration (for Chrome extension)
- `src/extension.ts`: Main VS Code extension entry point
- `manifest.json`: Chrome extension configuration
- `.eslintrc.*`: ESLint configuration (when created)

## Critical Notes
- **NEVER CANCEL long-running operations** - Build tools may take several minutes
- **Always validate changes manually** - Automated tests don't exist yet
- **Repository requires significant setup** - This is a template, not a working project
- **AI workflows are functional** - Use them for assistance and code review
- **Take screenshots** of any UI changes for validation

Always reference these instructions first before exploring the codebase or running commands.