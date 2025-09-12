import * as vscode from 'vscode';
import * as path from 'path';
import { MarkdownRenderer } from './markdownRenderer';
import { WebviewContent } from './webview/webviewContent';

export class MarkdownEditorProvider implements vscode.CustomTextEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new MarkdownEditorProvider(context.extensionUri);
		const providerRegistration = vscode.window.registerCustomEditorProvider(MarkdownEditorProvider.viewType, provider);
		return providerRegistration;
	}

	public static readonly viewType = 'markright.markdownEditor';

	private readonly renderer: MarkdownRenderer;
	private readonly webviewContent: WebviewContent;
	private updateTimeout: NodeJS.Timeout | undefined;
	private activeWebviewPanels = new Set<vscode.WebviewPanel>();

	constructor(
		private readonly extensionUri: vscode.Uri
	) {
		this.renderer = new MarkdownRenderer();
		this.webviewContent = new WebviewContent(extensionUri);
	}

	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = await this.webviewContent.getHtmlForWebview(webviewPanel.webview);
		
		// Track this webview panel
		this.activeWebviewPanels.add(webviewPanel);

		const updateWebview = () => {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		};

		// Debounced update function to prevent excessive updates
		const debouncedUpdate = () => {
			if (this.updateTimeout) {
				clearTimeout(this.updateTimeout);
			}
			this.updateTimeout = setTimeout(updateWebview, 300);
		};

		// Hook up event handlers so that we can synchronize the webview with the text document.
		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				debouncedUpdate();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
			if (this.updateTimeout) {
				clearTimeout(this.updateTimeout);
				this.updateTimeout = undefined;
			}
			this.activeWebviewPanels.delete(webviewPanel);
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'edit':
					this.updateTextDocument(document, e.text);
					return;
				case 'cursor':
					this.updateCursor(e.line, e.character);
					return;
				case 'insertWikiLink':
					this.insertWikiLink(document, e.position, e.text);
					return;
				case 'requestContent':
					updateWebview();
					return;
				case 'openWikiLink':
					this.openWikiLink(e.link);
					return;
			}
		});

		// Send initial content
		updateWebview();
	}

	private updateTextDocument(document: vscode.TextDocument, text: string) {
		const edit = new vscode.WorkspaceEdit();
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			text
		);
		return vscode.workspace.applyEdit(edit);
	}

	private updateCursor(line: number, character: number) {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const position = new vscode.Position(line, character);
			editor.selection = new vscode.Selection(position, position);
			editor.revealRange(new vscode.Range(position, position));
		}
	}

	private insertWikiLink(document: vscode.TextDocument, position: { line: number; character: number }, linkText: string) {
		const edit = new vscode.WorkspaceEdit();
		const pos = new vscode.Position(position.line, position.character);
		edit.insert(document.uri, pos, `[[${linkText}]]`);
		return vscode.workspace.applyEdit(edit);
	}

	public togglePreview() {
		// Toggle preview mode for all active webview panels
		this.activeWebviewPanels.forEach(panel => {
			panel.webview.postMessage({
				type: 'togglePreview'
			});
		});
		
		if (this.activeWebviewPanels.size > 0) {
			vscode.window.showInformationMessage('Preview mode toggled');
		} else {
			vscode.window.showInformationMessage('No active MarkRight editors to toggle preview');
		}
	}

	private async openWikiLink(linkText: string) {
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace open');
			return;
		}

		// Try to find the file
		const pattern = new vscode.RelativePattern(workspaceFolder, `**/${linkText}.md`);
		const files = await vscode.workspace.findFiles(pattern);
		
		if (files.length > 0) {
			// Open the existing file
			const document = await vscode.workspace.openTextDocument(files[0]);
			await vscode.window.showTextDocument(document);
		} else {
			// Create a new file
			const newFileUri = vscode.Uri.joinPath(workspaceFolder.uri, `${linkText}.md`);
			const edit = new vscode.WorkspaceEdit();
			edit.createFile(newFileUri, { ignoreIfExists: true });
			edit.insert(newFileUri, new vscode.Position(0, 0), `# ${linkText}\n\n`);
			
			await vscode.workspace.applyEdit(edit);
			const document = await vscode.workspace.openTextDocument(newFileUri);
			await vscode.window.showTextDocument(document);
		}
	}
}