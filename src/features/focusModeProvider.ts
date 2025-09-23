import * as vscode from "vscode";

export class FocusModeProvider implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];
  private decorationType: vscode.TextEditorDecorationType;
  private currentFocusMode: "off" | "paragraph" | "section" = "off";

  constructor() {
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: "rgba(128, 128, 128, 0.1)",
      opacity: "0.5",
    });

    this.registerListeners();
  }

  private registerListeners() {
    // Update focus highlighting when cursor moves
    this.disposables.push(
      vscode.window.onDidChangeTextEditorSelection(
        this.onSelectionChange.bind(this)
      )
    );

    // Update focus highlighting when document changes
    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this))
    );

    // Update focus highlighting when configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(
        this.onConfigurationChange.bind(this)
      )
    );
  }

  private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent) {
    if (event.textEditor.document.languageId === "markdown") {
      this.updateFocusHighlight(event.textEditor);
    }
  }

  private onDocumentChange(event: vscode.TextDocumentChangeEvent) {
    const editor = vscode.window.activeTextEditor;
    if (
      editor &&
      editor.document === event.document &&
      event.document.languageId === "markdown"
    ) {
      this.updateFocusHighlight(editor);
    }
  }

  private onConfigurationChange(event: vscode.ConfigurationChangeEvent) {
    if (event.affectsConfiguration("markright.focusMode")) {
      const config = vscode.workspace.getConfiguration("markright");
      this.currentFocusMode = config.get("focusMode", "off") as
        | "off"
        | "paragraph"
        | "section";

      const editor = vscode.window.activeTextEditor;
      if (editor && editor.document.languageId === "markdown") {
        this.updateFocusHighlight(editor);
      }
    }
  }

  private updateFocusHighlight(editor: vscode.TextEditor) {
    if (this.currentFocusMode === "off") {
      editor.setDecorations(this.decorationType, []);
      return;
    }

    const document = editor.document;
    const selection = editor.selection;
    const currentLine = selection.active.line;

    let focusRange: vscode.Range;

    if (this.currentFocusMode === "paragraph") {
      focusRange = this.getParagraphRange(document, currentLine);
    } else if (this.currentFocusMode === "section") {
      focusRange = this.getSectionRange(document, currentLine);
    } else {
      return;
    }

    // Create decorations for lines outside the focus range
    const decorations: vscode.DecorationOptions[] = [];

    // Lines before focus range
    if (focusRange.start.line > 0) {
      decorations.push({
        range: new vscode.Range(0, 0, focusRange.start.line, 0),
      });
    }

    // Lines after focus range
    if (focusRange.end.line < document.lineCount - 1) {
      decorations.push({
        range: new vscode.Range(
          focusRange.end.line + 1,
          0,
          document.lineCount,
          0
        ),
      });
    }

    editor.setDecorations(this.decorationType, decorations);
  }

  private getParagraphRange(
    document: vscode.TextDocument,
    currentLine: number
  ): vscode.Range {
    let startLine = currentLine;
    let endLine = currentLine;

    // Find start of paragraph (empty line or start of document)
    while (startLine > 0) {
      const line = document.lineAt(startLine - 1);
      if (line.text.trim() === "") {
        break;
      }
      startLine--;
    }

    // Find end of paragraph (empty line or end of document)
    while (endLine < document.lineCount - 1) {
      const line = document.lineAt(endLine + 1);
      if (line.text.trim() === "") {
        break;
      }
      endLine++;
    }

    return new vscode.Range(
      startLine,
      0,
      endLine,
      document.lineAt(endLine)?.text.length || 0
    );
  }

  private getSectionRange(
    document: vscode.TextDocument,
    currentLine: number
  ): vscode.Range {
    let startLine = 0;
    let endLine = document.lineCount - 1;

    // Find current section based on markdown headers
    const currentSectionLevel = this.getCurrentSectionLevel(
      document,
      currentLine
    );

    // Find start of current section
    for (let i = currentLine; i >= 0; i--) {
      const line = document.lineAt(i);
      const headerMatch = line.text.match(/^(#{1,6})\s/);
      if (headerMatch && headerMatch[1]) {
        const level = headerMatch[1].length;
        if (level <= currentSectionLevel) {
          startLine = i;
          break;
        }
      }
    }

    // Find end of current section
    for (let i = currentLine + 1; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const headerMatch = line.text.match(/^(#{1,6})\s/);
      if (headerMatch && headerMatch[1]) {
        const level = headerMatch[1].length;
        if (level <= currentSectionLevel) {
          endLine = i - 1;
          break;
        }
      }
    }

    return new vscode.Range(
      startLine,
      0,
      endLine,
      document.lineAt(endLine)?.text.length || 0
    );
  }

  private getCurrentSectionLevel(
    document: vscode.TextDocument,
    currentLine: number
  ): number {
    // Find the header that defines the current section
    for (let i = currentLine; i >= 0; i--) {
      const line = document.lineAt(i);
      const headerMatch = line.text.match(/^(#{1,6})\s/);
      if (headerMatch && headerMatch[1]) {
        return headerMatch[1].length;
      }
    }
    return 1; // Default to top level if no header found
  }

  public toggleFocusMode(): void {
    const config = vscode.workspace.getConfiguration("markright");
    const currentMode = config.get("focusMode", "off") as
      | "off"
      | "paragraph"
      | "section";

    let newMode: "off" | "paragraph" | "section";
    switch (currentMode) {
      case "off":
        newMode = "paragraph";
        break;
      case "paragraph":
        newMode = "section";
        break;
      case "section":
      default:
        newMode = "off";
        break;
    }

    config.update("focusMode", newMode, vscode.ConfigurationTarget.Global);
    this.currentFocusMode = newMode;

    vscode.window.showInformationMessage(`Focus mode: ${newMode}`);

    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === "markdown") {
      this.updateFocusHighlight(editor);
    }
  }

  dispose() {
    this.decorationType.dispose();
    this.disposables.forEach((d) => d.dispose());
  }
}
