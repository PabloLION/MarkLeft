(function() {
    'use strict';

    // Get the VS Code API
    const vscode = acquireVsCodeApi();

    // DOM elements
    const editor = document.getElementById('markdown-editor');
    const preview = document.getElementById('markdown-preview');
    const previewPane = document.getElementById('preview-pane');
    const editorPane = document.getElementById('editor-pane');

    // Toolbar buttons
    const togglePreviewBtn = document.getElementById('toggle-preview');
    const insertTableBtn = document.getElementById('insert-table');
    const insertLinkBtn = document.getElementById('insert-link');
    const focusModeBtn = document.getElementById('focus-mode');
    const insertMathBtn = document.getElementById('insert-math');
    const insertDiagramBtn = document.getElementById('insert-diagram');

    // State
    let currentText = '';
    let previewVisible = true;
    let focusMode = 'off';

    // Initialize
    init();

    function init() {
        setupEventListeners();
        setupMermaid();
        requestInitialContent();
    }

    function setupEventListeners() {
        // Editor events
        editor.addEventListener('input', onEditorInput);
        editor.addEventListener('scroll', onEditorScroll);
        editor.addEventListener('keydown', onEditorKeyDown);

        // Toolbar events
        togglePreviewBtn.addEventListener('click', togglePreview);
        insertTableBtn.addEventListener('click', insertTable);
        insertLinkBtn.addEventListener('click', insertWikiLink);
        focusModeBtn.addEventListener('click', toggleFocusMode);
        insertMathBtn.addEventListener('click', insertMath);
        insertDiagramBtn.addEventListener('click', insertDiagram);

        // VS Code messages
        window.addEventListener('message', onVSCodeMessage);

        // Preview click events
        preview.addEventListener('click', onPreviewClick);
    }

    function setupMermaid() {
        // Initialize Mermaid for diagram rendering
        if (typeof mermaid !== 'undefined') {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                themeVariables: {
                    primaryColor: '#007acc',
                    primaryTextColor: '#cccccc',
                    primaryBorderColor: '#3e3e42',
                    lineColor: '#969696',
                    sectionBkgColor: '#252526',
                    altSectionBkgColor: '#1e1e1e',
                    gridColor: '#3e3e42',
                    secondaryColor: '#2d2d30',
                    tertiaryColor: '#1e1e1e'
                }
            });
        }
    }

    function onEditorInput() {
        const text = editor.value;
        currentText = text;
        
        // Send update to VS Code
        vscode.postMessage({
            type: 'edit',
            text: text
        });

        // Update preview
        if (previewVisible) {
            updatePreview(text);
        }
    }

    function onEditorScroll() {
        // Sync scroll between editor and preview
        if (previewVisible) {
            const scrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
            preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight);
        }
    }

    function onEditorKeyDown(event) {
        // Handle special key combinations
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'b':
                    event.preventDefault();
                    insertFormatting('**', '**', 'bold text');
                    break;
                case 'i':
                    event.preventDefault();
                    insertFormatting('*', '*', 'italic text');
                    break;
                case 'k':
                    event.preventDefault();
                    insertWikiLink();
                    break;
            }
        }

        // Handle Tab key for indentation
        if (event.key === 'Tab') {
            event.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            
            if (event.shiftKey) {
                // Shift+Tab: Remove indentation
                unindentText(start, end);
            } else {
                // Tab: Add indentation
                insertText('  ', start, end);
            }
        }
    }

    function onVSCodeMessage(event) {
        const message = event.data;
        
        switch (message.type) {
            case 'update':
                if (message.text !== currentText) {
                    currentText = message.text;
                    editor.value = message.text;
                    if (previewVisible) {
                        updatePreview(message.text);
                    }
                }
                break;
            case 'togglePreview':
                togglePreview();
                break;
        }
    }

    function onPreviewClick(event) {
        // Handle wiki-link clicks
        if (event.target.classList.contains('wiki-link')) {
            event.preventDefault();
            const linkText = event.target.getAttribute('data-link');
            
            vscode.postMessage({
                type: 'openWikiLink',
                link: linkText
            });
        }
    }

    function requestInitialContent() {
        vscode.postMessage({ type: 'requestContent' });
    }

    function updatePreview(text) {
        // Simple markdown rendering (this would be enhanced with a proper renderer)
        let html = text;
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Bold and italic
        html = html.replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>');
        html = html.replace(/\*(.*)\*/gim, '<em>$1</em>');
        
        // Wiki links
        html = html.replace(/\[\[([^\]]+)\]\]/gim, '<a href="#" class="wiki-link" data-link="$1">$1</a>');
        
        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
            if (lang === 'mermaid') {
                return `<div class="mermaid-container"><div class="mermaid">${code}</div></div>`;
            }
            return `<pre class="code-block"><code class="language-${lang || 'text'}">${escapeHtml(code)}</code></pre>`;
        });
        
        // Inline code
        html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
        
        // Line breaks
        html = html.replace(/\n/gim, '<br>');
        
        preview.innerHTML = `<div class="markdown-content" data-focus-mode="${focusMode}">${html}</div>`;
        
        // Render Mermaid diagrams with error handling
        if (typeof mermaid !== 'undefined') {
            try {
                mermaid.run().catch(error => {
                    console.error('Mermaid rendering error:', error);
                    // Find and replace failed diagrams with error messages
                    const failedDiagrams = document.querySelectorAll('.mermaid[data-processed="true"]');
                    failedDiagrams.forEach(diagram => {
                        if (diagram.textContent.includes('syntax error') || diagram.innerHTML.includes('error')) {
                            diagram.innerHTML = `<div class="diagram-error">
                                <strong>Mermaid Diagram Error</strong><br>
                                <small>${error.message || 'Invalid diagram syntax'}</small>
                            </div>`;
                        }
                    });
                });
            } catch (error) {
                console.error('Mermaid initialization error:', error);
            }
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function togglePreview() {
        previewVisible = !previewVisible;
        
        if (previewVisible) {
            previewPane.style.display = 'flex';
            editorPane.style.borderRight = '1px solid var(--border-color)';
            togglePreviewBtn.classList.add('active');
            updatePreview(currentText);
        } else {
            previewPane.style.display = 'none';
            editorPane.style.borderRight = 'none';
            togglePreviewBtn.classList.remove('active');
        }
    }

    function insertTable() {
        const tableText = `\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n| Cell 4   | Cell 5   | Cell 6   |\n`;
        insertTextAtCursor(tableText);
    }

    function insertWikiLink() {
        const selectedText = getSelectedText();
        const linkText = selectedText || 'Link Text';
        insertFormatting('[[', ']]', linkText);
    }

    function toggleFocusMode() {
        const modes = ['off', 'paragraph', 'section'];
        const currentIndex = modes.indexOf(focusMode);
        focusMode = modes[(currentIndex + 1) % modes.length];
        
        focusModeBtn.classList.toggle('active', focusMode !== 'off');
        
        if (previewVisible) {
            updatePreview(currentText);
        }

        // Send focus mode change to VS Code
        vscode.postMessage({
            type: 'focusModeChange',
            mode: focusMode
        });
    }

    function insertMath() {
        const selectedText = getSelectedText();
        const isBlock = selectedText.includes('\n') || selectedText.length > 20;
        
        if (isBlock) {
            insertFormatting('$$\n', '\n$$', selectedText || 'E = mc^2');
        } else {
            insertFormatting('$', '$', selectedText || 'E = mc^2');
        }
    }

    function insertDiagram() {
        const diagramText = `\n\`\`\`mermaid\ngraph TD\n    A[Start] --> B{Is it?}\n    B -->|Yes| C[OK]\n    B -->|No| D[End]\n\`\`\`\n`;
        insertTextAtCursor(diagramText);
    }

    function insertFormatting(prefix, suffix, defaultText) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        const text = selectedText || defaultText;
        
        const newText = prefix + text + suffix;
        insertText(newText, start, end);
        
        // Set cursor position
        const newCursorPos = start + prefix.length;
        editor.setSelectionRange(newCursorPos, newCursorPos + text.length);
        editor.focus();
    }

    function insertTextAtCursor(text) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        insertText(text, start, end);
        
        const newCursorPos = start + text.length;
        editor.setSelectionRange(newCursorPos, newCursorPos);
        editor.focus();
    }

    function insertText(text, start, end) {
        const before = editor.value.substring(0, start);
        const after = editor.value.substring(end);
        
        editor.value = before + text + after;
        currentText = editor.value;
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
    }

    function getSelectedText() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        return editor.value.substring(start, end);
    }

    function unindentText(start, end) {
        const lines = editor.value.split('\n');
        const startLine = editor.value.substring(0, start).split('\n').length - 1;
        const endLine = editor.value.substring(0, end).split('\n').length - 1;
        
        for (let i = startLine; i <= endLine; i++) {
            if (lines[i].startsWith('  ')) {
                lines[i] = lines[i].substring(2);
            }
        }
        
        const newText = lines.join('\n');
        editor.value = newText;
        currentText = newText;
        
        // Trigger input event
        const event = new Event('input', { bubbles: true });
        editor.dispatchEvent(event);
    }

    // Export for debugging
    window.markrightEditor = {
        togglePreview,
        insertTable,
        insertWikiLink,
        toggleFocusMode,
        insertMath,
        insertDiagram
    };
})();