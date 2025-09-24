import * as vscode from "vscode";
import * as path from "path";

export class WebviewContent {
  constructor(private readonly extensionUri: vscode.Uri) {}

  public async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "editor.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "media", "editor.css")
    );
    const katexStyleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "node_modules",
        "katex",
        "dist",
        "katex.min.css"
      )
    );
    const mermaidScriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "node_modules",
        "mermaid",
        "dist",
        "mermaid.min.js"
      )
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = this.getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}'; img-src ${webview.cspSource} https:;">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${katexStyleUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>MarkRight Editor</title>
				<style>
					.editor-pane {
						position: relative;
					}
					#markdown-editor {
						position: relative;
						z-index: 1;
					}
					.overlay-container {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						pointer-events: none;
						z-index: 2;
					}
					.floating-overlay {
						position: absolute;
						background: var(--vscode-editor-background);
						border-radius: 4px;
						padding: 2px 6px;
						opacity: 0.96;
						pointer-events: none;
						color: var(--vscode-editor-foreground);
						box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
					}
					.floating-overlay.hidden {
						opacity: 0;
					}
					.floating-overlay.heading {
						white-space: nowrap;
						background: transparent;
						box-shadow: none;
					}
					.overlay-table {
						border-collapse: collapse;
						width: max-content;
						max-width: 520px;
						background: var(--vscode-editor-background);
						border: 1px solid var(--vscode-panel-border);
					}
					.overlay-table th,
					.overlay-table td {
						border: 1px solid var(--vscode-panel-border);
						padding: 4px 8px;
						background: var(--vscode-editor-background);
						color: var(--vscode-editor-foreground);
					}
					.latex {
						background: var(--vscode-editor-background);
						padding: 8px;
						border: 1px solid var(--vscode-panel-border);
						border-radius: 4px;
					}
					.mermaid {
						background: var(--vscode-editor-background);
						padding: 8px;
						border: 1px solid var(--vscode-panel-border);
						border-radius: 4px;
					}
				</style>
			</head>
			<body>
				<div class="editor-container">
					<div class="toolbar">
						<button class="tool-btn" id="toggle-preview" title="Toggle Preview">👁️</button>
						<button class="tool-btn" id="insert-table" title="Insert Table">📊</button>
						<button class="tool-btn" id="insert-link" title="Insert Wiki Link">🔗</button>
						<button class="tool-btn" id="focus-mode" title="Toggle Focus Mode">🎯</button>
						<button class="tool-btn" id="insert-math" title="Insert Math">∑</button>
						<button class="tool-btn" id="insert-diagram" title="Insert Diagram">📈</button>
					</div>
					
					<div class="editor-content">
						<div class="editor-pane" id="editor-pane">
							<textarea id="markdown-editor" placeholder="Start writing your markdown here..."></textarea>
							<div class="overlay-container" id="overlay-container"></div>
						</div>
						
						<div class="preview-pane" id="preview-pane">
							<div id="markdown-preview" class="markdown-preview"></div>
						</div>
					</div>
				</div>

				<script nonce="${nonce}" src="${mermaidScriptUri}"></script>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }

  private getNonce(): string {
    let text = "";
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}
