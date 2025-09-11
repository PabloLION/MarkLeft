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

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
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
			}
		});

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

	private insertWikiLink(document: vscode.TextDocument, position: any, linkText: string) {
		const edit = new vscode.WorkspaceEdit();
		const pos = new vscode.Position(position.line, position.character);
		edit.insert(document.uri, pos, `[[${linkText}]]`);
		return vscode.workspace.applyEdit(edit);
	}

	public togglePreview() {
		// Implementation for toggling preview mode
		vscode.window.showInformationMessage('Preview mode toggled');
	}
}