import * as vscode from 'vscode';

export class MarkLeftDocument {
    constructor(private readonly document: vscode.TextDocument) {}

    public getContent(): string {
        return this.document.getText();
    }

    public async makeEdit(text: string, range?: vscode.Range): Promise<void> {
        const edit = new vscode.WorkspaceEdit();
        
        if (range) {
            edit.replace(this.document.uri, range, text);
        } else {
            // Replace entire document
            const fullRange = new vscode.Range(
                this.document.positionAt(0),
                this.document.positionAt(this.document.getText().length)
            );
            edit.replace(this.document.uri, fullRange, text);
        }

        await vscode.workspace.applyEdit(edit);
    }

    public getUri(): vscode.Uri {
        return this.document.uri;
    }

    public getLanguageId(): string {
        return this.document.languageId;
    }
}