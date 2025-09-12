import * as vscode from 'vscode';
import { MarkLeftEditorProvider } from './core/editorProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('MarkLeft extension is being activated');

    // Register custom editor provider
    const provider = new MarkLeftEditorProvider(context);
    context.subscriptions.push(
        vscode.window.registerCustomEditorProvider('markleft.editor', provider)
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('markleft.openEditor', (uri?: vscode.Uri) => {
            if (uri) {
                vscode.commands.executeCommand('vscode.openWith', uri, 'markleft.editor');
            } else {
                vscode.window.showErrorMessage('No file selected');
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markleft.toggleMode', () => {
            vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markleft.toggleTOC', () => {
            // TODO: Implement TOC toggle
            vscode.window.showInformationMessage('TOC toggle not yet implemented');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('markleft.toggleFrontmatter', () => {
            // TODO: Implement frontmatter toggle
            vscode.window.showInformationMessage('Frontmatter toggle not yet implemented');
        })
    );

    console.log('MarkLeft extension activated successfully');
}

export function deactivate() {
    console.log('MarkLeft extension is being deactivated');
}