import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class WikiLinkProvider implements vscode.Disposable {
	private disposables: vscode.Disposable[] = [];

	constructor() {
		this.registerProviders();
	}

	private registerProviders() {
		// Register completion provider for wiki-links
		this.disposables.push(
			vscode.languages.registerCompletionItemProvider(
				'markdown',
				{
					provideCompletionItems: this.provideWikiLinkCompletions.bind(this)
				},
				'[' // Trigger completion when typing '['
			)
		);

		// Register hover provider for wiki-links
		this.disposables.push(
			vscode.languages.registerHoverProvider('markdown', {
				provideHover: this.provideWikiLinkHover.bind(this)
			})
		);

		// Register definition provider for wiki-links
		this.disposables.push(
			vscode.languages.registerDefinitionProvider('markdown', {
				provideDefinition: this.provideWikiLinkDefinition.bind(this)
			})
		);
	}

	private async provideWikiLinkCompletions(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken,
		context: vscode.CompletionContext
	): Promise<vscode.CompletionItem[]> {
		const linePrefix = document.lineAt(position).text.substr(0, position.character);
		
		// Check if we're inside a wiki-link
		if (!linePrefix.endsWith('[[') && !this.isInsideWikiLink(linePrefix)) {
			return [];
		}

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return [];
		}

		// Find all markdown files in the workspace
		const markdownFiles = await this.findMarkdownFiles(workspaceFolder.uri);
		
		return markdownFiles.map(file => {
			const fileName = path.basename(file.fsPath, '.md');
			const completion = new vscode.CompletionItem(fileName, vscode.CompletionItemKind.File);
			completion.insertText = fileName;
			completion.detail = `Wiki link to ${fileName}`;
			completion.documentation = new vscode.MarkdownString(`Link to **${fileName}.md**`);
			return completion;
		});
	}

	private async provideWikiLinkHover(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): Promise<vscode.Hover | undefined> {
		const range = document.getWordRangeAtPosition(position, /\[\[([^\]]+)\]\]/);
		if (!range) {
			return undefined;
		}

		const wikiLink = document.getText(range);
		const linkText = wikiLink.slice(2, -2); // Remove [[ ]]

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return undefined;
		}

		// Try to find the referenced file
		const targetFile = await this.findFileByName(workspaceFolder.uri, linkText);
		if (targetFile) {
			const content = new vscode.MarkdownString();
			content.appendMarkdown(`**${linkText}**\n\n`);
			content.appendMarkdown(`*Click to open ${path.basename(targetFile.fsPath)}*`);
			return new vscode.Hover(content, range);
		}

		return undefined;
	}

	private async provideWikiLinkDefinition(
		document: vscode.TextDocument,
		position: vscode.Position,
		token: vscode.CancellationToken
	): Promise<vscode.Definition | undefined> {
		const range = document.getWordRangeAtPosition(position, /\[\[([^\]]+)\]\]/);
		if (!range) {
			return undefined;
		}

		const wikiLink = document.getText(range);
		const linkText = wikiLink.slice(2, -2); // Remove [[ ]]

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
		if (!workspaceFolder) {
			return undefined;
		}

		const targetFile = await this.findFileByName(workspaceFolder.uri, linkText);
		if (targetFile) {
			return new vscode.Location(targetFile, new vscode.Position(0, 0));
		}

		return undefined;
	}

	private isInsideWikiLink(text: string): boolean {
		const lastOpenBracket = text.lastIndexOf('[[');
		const lastCloseBracket = text.lastIndexOf(']]');
		return lastOpenBracket > lastCloseBracket;
	}

	private async findMarkdownFiles(workspaceUri: vscode.Uri): Promise<vscode.Uri[]> {
		const pattern = new vscode.RelativePattern(workspaceUri, '**/*.md');
		return await vscode.workspace.findFiles(pattern);
	}

	private async findFileByName(workspaceUri: vscode.Uri, fileName: string): Promise<vscode.Uri | undefined> {
		const patterns = [
			new vscode.RelativePattern(workspaceUri, `**/${fileName}.md`),
			new vscode.RelativePattern(workspaceUri, `**/${fileName}`)
		];

		for (const pattern of patterns) {
			const files = await vscode.workspace.findFiles(pattern);
			if (files.length > 0) {
				return files[0];
			}
		}

		return undefined;
	}

	public async insertWikiLink(): Promise<void> {
		const editor = vscode.window.activeTextEditor;
		if (!editor || editor.document.languageId !== 'markdown') {
			vscode.window.showErrorMessage('Please open a markdown file first');
			return;
		}

		const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('Please open a workspace first');
			return;
		}

		// Get all markdown files for quick pick
		const markdownFiles = await this.findMarkdownFiles(workspaceFolder.uri);
		const items = markdownFiles.map(file => ({
			label: path.basename(file.fsPath, '.md'),
			description: file.fsPath,
			uri: file
		}));

		const selected = await vscode.window.showQuickPick(items, {
			placeHolder: 'Select a file to link to, or type a new name'
		});

		if (selected) {
			const linkText = selected.label;
			editor.edit(editBuilder => {
				editBuilder.insert(editor.selection.active, `[[${linkText}]]`);
			});
		}
	}

	dispose() {
		this.disposables.forEach(d => d.dispose());
	}
}