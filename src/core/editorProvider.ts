import * as vscode from 'vscode';
import { MarkLeftDocument } from './document';
import { getWebviewContent } from '../ui/webview';

export class MarkLeftEditorProvider implements vscode.CustomTextEditorProvider {
    private static readonly viewType = 'markleft.editor';

    constructor(private readonly context: vscode.ExtensionContext) {}

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new MarkLeftEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(
            MarkLeftEditorProvider.viewType,
            provider
        );
        return providerRegistration;
    }

    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        const markLeftDocument = new MarkLeftDocument(document);

        // Setup webview options
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media'),
                vscode.Uri.joinPath(this.context.extensionUri, 'out'),
            ]
        };

        // Set initial HTML content
        webviewPanel.webview.html = getWebviewContent(
            webviewPanel.webview,
            this.context.extensionUri,
            markLeftDocument.getContent()
        );

        // Handle messages from webview
        webviewPanel.webview.onDidReceiveMessage(
            message => this.handleWebviewMessage(message, markLeftDocument),
            undefined,
            this.context.subscriptions
        );

        // Update webview when document changes
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                this.updateWebview(webviewPanel.webview, markLeftDocument);
            }
        });

        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        // Set context when this editor is active
        webviewPanel.onDidChangeViewState(() => {
            vscode.commands.executeCommand('setContext', 'markLeftEditorActive', webviewPanel.active);
        });

        // Initial context setting
        vscode.commands.executeCommand('setContext', 'markLeftEditorActive', true);
    }

    private handleWebviewMessage(message: any, document: MarkLeftDocument): void {
        switch (message.type) {
            case 'edit':
                // Handle editing requests from webview
                document.makeEdit(message.text, message.range);
                break;
            case 'ready':
                // Webview is ready, can send initial data
                break;
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    private updateWebview(webview: vscode.Webview, document: MarkLeftDocument): void {
        webview.postMessage({
            type: 'update',
            content: document.getContent(),
            timestamp: Date.now()
        });
    }
}