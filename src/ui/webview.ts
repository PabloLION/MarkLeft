import * as vscode from 'vscode';

export function getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    markdownContent: string
): string {
    // Get resource URIs
    const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'script.js'));
    const katexCssUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'katex', 'dist', 'katex.min.css'));
    const katexJsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', 'katex', 'dist', 'katex.min.js'));

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarkLeft Editor</title>
    <link href="${katexCssUri}" rel="stylesheet">
    <link href="${stylesUri}" rel="stylesheet">
    <style>
        :root {
            --syntax-opacity: 0.4;
            --heading-scale-h1: 2.5;
            --heading-scale-h2: 2.2;
            --heading-scale-h3: 2.0;
            --heading-scale-h4: 1.8;
            --heading-scale-h5: 1.6;
            --heading-scale-h6: 1.5;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }
        
        .markdown-content {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .editing-mode {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 8px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }
        
        .markdown-syntax {
            opacity: var(--syntax-opacity);
            transition: opacity 0.2s ease;
        }
        
        .markdown-syntax:hover,
        .editing .markdown-syntax {
            opacity: 1;
        }
        
        h1 { line-height: calc(1em * var(--heading-scale-h1)); font-size: 1.8em; }
        h2 { line-height: calc(1em * var(--heading-scale-h2)); font-size: 1.5em; }
        h3 { line-height: calc(1em * var(--heading-scale-h3)); font-size: 1.3em; }
        h4 { line-height: calc(1em * var(--heading-scale-h4)); font-size: 1.1em; }
        h5 { line-height: calc(1em * var(--heading-scale-h5)); font-size: 1.0em; }
        h6 { line-height: calc(1em * var(--heading-scale-h6)); font-size: 0.9em; }
        
        .frontmatter {
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textBlockQuote-border);
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        
        .frontmatter.collapsed {
            padding: 5px 10px;
            cursor: pointer;
        }
        
        .frontmatter.collapsed::before {
            content: "--- [Metadata: " attr(data-properties) " properties] ---";
            font-style: italic;
            color: var(--vscode-descriptionForeground);
        }
        
        .toc {
            position: fixed;
            right: 20px;
            top: 20px;
            width: 250px;
            background-color: var(--vscode-sideBar-background);
            border: 1px solid var(--vscode-sideBar-border);
            border-radius: 4px;
            padding: 10px;
            max-height: 70vh;
            overflow-y: auto;
            z-index: 1000;
        }
        
        .toc.hidden {
            display: none;
        }
        
        .math-inline, .math-block {
            position: relative;
        }
        
        .math-inline:hover, .math-block:hover {
            background-color: var(--vscode-editor-hoverHighlightBackground);
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="markdown-content" id="content">
        <div class="loading">Loading MarkLeft editor...</div>
    </div>
    
    <div class="toc hidden" id="toc">
        <h4>Table of Contents</h4>
        <div class="toc-controls">
            <label>Depth: <input type="range" id="toc-depth" min="1" max="6" value="3"></label>
        </div>
        <div class="toc-list" id="toc-list"></div>
    </div>

    <script src="${katexJsUri}"></script>
    <script>
        // Store markdown content
        let currentContent = ${JSON.stringify(markdownContent)};
        
        // Basic markdown to HTML conversion (simplified for now)
        function renderMarkdown(content) {
            // This is a very basic implementation - will be enhanced with proper markdown parser
            let html = content
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
                .replace(/\\n/gim, '<br>');
            
            return html;
        }
        
        // Initialize content
        function updateContent() {
            const contentEl = document.getElementById('content');
            contentEl.innerHTML = renderMarkdown(currentContent);
        }
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'update':
                    currentContent = message.content;
                    updateContent();
                    break;
            }
        });
        
        // Send ready message
        const vscode = acquireVsCodeApi();
        vscode.postMessage({ type: 'ready' });
        
        // Initial render
        updateContent();
    </script>
    <script src="${scriptUri}"></script>
</body>
</html>`;
}