import * as vscode from "vscode";
import katex from "katex";
import { MarkdownEditorProvider } from "../markdownEditorProvider";
import { OverlayData, OverlayRange } from "../types/overlay";

interface ParsedOverlay {
  overlay: OverlayData;
  endLine: number;
}

export class SyntaxOverlayProvider implements vscode.Disposable {
  private editorProvider?: MarkdownEditorProvider;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly decorationTypes = new Map<number, vscode.TextEditorDecorationType>();
  private readonly documentOverlays = new Map<string, OverlayData[]>();

  constructor(private readonly context: vscode.ExtensionContext) {
    this.initializeDecorations();
    this.registerListeners();
  }

  setCustomEditorProvider(provider: MarkdownEditorProvider) {
    this.editorProvider = provider;
    this.refreshOpenDocuments();
  }

  dispose(): void {
    this.decorationTypes.forEach((decoration) => decoration.dispose());
    this.decorationTypes.clear();

    this.disposables.forEach((disposable) => disposable.dispose());

    this.documentOverlays.clear();
  }

  private initializeDecorations() {
    for (let level = 1; level <= 6; level++) {
      const decoration = vscode.window.createTextEditorDecorationType({
        opacity: "0.45",
        fontWeight: "600",
      });
      this.decorationTypes.set(level, decoration);
    }
  }

  private registerListeners() {
    this.disposables.push(
      vscode.workspace.onDidOpenTextDocument((document) =>
        this.updateOverlaysForDocument(document)
      ),
      vscode.workspace.onDidChangeTextDocument((event) =>
        this.updateOverlaysForDocument(event.document)
      ),
      vscode.workspace.onDidCloseTextDocument((document) =>
        this.documentOverlays.delete(document.uri.toString())
      ),
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) {
          return;
        }
        const overlays = this.documentOverlays.get(
          editor.document.uri.toString()
        );
        if (overlays) {
          this.applyDecorations(editor, overlays);
          this.updateOverlayPosition(editor);
        }
      }),
      vscode.window.onDidChangeTextEditorSelection((event) =>
        this.handleSelectionChange(event)
      ),
      vscode.window.onDidChangeTextEditorVisibleRanges((event) =>
        this.updateOverlayPosition(event.textEditor)
      )
    );

    this.disposables.forEach((disposable) =>
      this.context.subscriptions.push(disposable)
    );
  }

  private refreshOpenDocuments() {
    vscode.workspace.textDocuments
      .filter((document) => document.languageId === "markdown")
      .forEach((document) => this.updateOverlaysForDocument(document));
  }

  private updateOverlaysForDocument(document: vscode.TextDocument) {
    if (document.languageId !== "markdown") {
      return;
    }

    const overlays = this.parseDocumentForOverlays(document);
    this.documentOverlays.set(document.uri.toString(), overlays);

    const editor = this.findEditorForDocument(document);
    if (editor) {
      this.applyDecorations(editor, overlays);
    }

    this.sendOverlayUpdates(document, overlays);
  }

  private parseDocumentForOverlays(document: vscode.TextDocument): OverlayData[] {
    const overlays: OverlayData[] = [];

    for (let line = 0; line < document.lineCount; line++) {
      const table = this.tryParseTable(document, line);
      if (table) {
        overlays.push(table.overlay);
        line = table.endLine;
        continue;
      }

      const latex = this.tryParseLatex(document, line);
      if (latex) {
        overlays.push(latex.overlay);
        line = latex.endLine;
        continue;
      }

      const mermaid = this.tryParseMermaid(document, line);
      if (mermaid) {
        overlays.push(mermaid.overlay);
        line = mermaid.endLine;
        continue;
      }

      const heading = this.tryParseHeading(document, line);
      if (heading) {
        overlays.push(heading.overlay);
      }
    }

    return overlays;
  }

  private tryParseHeading(
    document: vscode.TextDocument,
    lineNumber: number
  ): ParsedOverlay | undefined {
    const line = document.lineAt(lineNumber);
    const match = line.text.match(/^(#{1,6})\s+(.*)$/);
    if (!match) {
      return undefined;
    }

    const levelSource = match[1];
    const headingText = match[2];
    if (!levelSource || !headingText) {
      return undefined;
    }

    const level = levelSource.length;
    const rendered = headingText.trim();
    const range = line.range;

    return {
      overlay: {
        type: "heading",
        level,
        range: this.toOverlayRange(range),
        content: line.text,
        rendered,
      },
      endLine: lineNumber,
    };
  }

  private tryParseTable(
    document: vscode.TextDocument,
    startLine: number
  ): ParsedOverlay | undefined {
    if (startLine >= document.lineCount - 1) {
      return undefined;
    }

    const headerLine = document.lineAt(startLine).text;
    const separatorLine = document.lineAt(startLine + 1).text;

    if (!headerLine.includes("|") || !this.isTableSeparator(separatorLine)) {
      return undefined;
    }

    const rows: string[] = [headerLine, separatorLine];
    let endLine = startLine + 1;

    for (let line = startLine + 2; line < document.lineCount; line++) {
      const text = document.lineAt(line).text;
      if (!text.includes("|")) {
        break;
      }
      rows.push(text);
      endLine = line;
    }

    const range = new vscode.Range(
      document.lineAt(startLine).range.start,
      document.lineAt(endLine).range.end
    );

    return {
      overlay: {
        type: "table",
        range: this.toOverlayRange(range),
        content: rows.join("\n"),
        rendered: this.renderTable(rows),
      },
      endLine,
    };
  }

  private tryParseLatex(
    document: vscode.TextDocument,
    startLine: number
  ): ParsedOverlay | undefined {
    const line = document.lineAt(startLine).text.trim();
    if (!line.startsWith("$$")) {
      return undefined;
    }

    let content = "";
    let endLine = startLine;
    let closed = false;

    if (line === "$$") {
      for (let index = startLine + 1; index < document.lineCount; index++) {
        const text = document.lineAt(index).text;
        const trimmed = text.trim();
        if (trimmed.endsWith("$$")) {
          const payload = trimmed === "$$" ? "" : trimmed.slice(0, -2);
          content = `${content}${content ? "\n" : ""}${payload}`;
          endLine = index;
          closed = true;
          break;
        }

        content = `${content}${content ? "\n" : ""}${text}`;
        endLine = index;
      }
    } else if (line.endsWith("$$")) {
      content = line.slice(2, -2).trim();
      closed = true;
    } else {
      content = line.slice(2);
      for (let index = startLine + 1; index < document.lineCount; index++) {
        const text = document.lineAt(index).text;
        const trimmed = text.trim();
        if (trimmed.endsWith("$$")) {
          const payload = trimmed === "$$" ? "" : trimmed.slice(0, -2);
          content = `${content}\n${payload}`;
          endLine = index;
          closed = true;
          break;
        }

        content = `${content}\n${text}`;
        endLine = index;
      }
    }

    if (!closed) {
      return undefined;
    }

    const range = new vscode.Range(
      document.lineAt(startLine).range.start,
      document.lineAt(endLine).range.end
    );

    return {
      overlay: {
        type: "latex",
        range: this.toOverlayRange(range),
        content: document.getText(range),
        rendered: this.renderLatexForOverlay(content.trim()),
      },
      endLine,
    };
  }

  private tryParseMermaid(
    document: vscode.TextDocument,
    startLine: number
  ): ParsedOverlay | undefined {
    const startText = document.lineAt(startLine).text.trim();
    const match = startText.match(/^```(\w+)/);
    if (!match || match[1] !== "mermaid") {
      return undefined;
    }

    const codeLines: string[] = [];
    let endLine = startLine;
    let closed = false;

    for (let index = startLine + 1; index < document.lineCount; index++) {
      const text = document.lineAt(index).text;
      if (text.trim() === "```") {
        endLine = index;
        closed = true;
        break;
      }
      codeLines.push(text);
      endLine = index;
    }

    if (!closed) {
      return undefined;
    }

    const range = new vscode.Range(
      document.lineAt(startLine).range.start,
      document.lineAt(endLine).range.end
    );

    return {
      overlay: {
        type: "diagram",
        range: this.toOverlayRange(range),
        content: document.getText(range),
        rendered: codeLines.join("\n"),
      },
      endLine,
    };
  }

  private isTableSeparator(line: string): boolean {
    const trimmed = line.trim();
    if (!trimmed.includes("-")) {
      return false;
    }

    return /^\s*\|?(\s*:?[-]+:?\s*\|)+\s*$/.test(trimmed);
  }

  private renderTable(rows: string[]): string {
    if (rows.length < 2) {
      return "";
    }

    const headerRow = rows[0];
    const separatorRow = rows[1];
    if (!headerRow || !separatorRow) {
      return "";
    }

    const headerCells = this.splitTableRow(headerRow);
    const bodyRows = rows.slice(2).map((row) => this.splitTableRow(row));

    const headerHtml = headerCells
      .map((cell) => `<th>${cell}</th>`)
      .join("");

    const bodyHtml = bodyRows
      .map((cells) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("");

    return `
      <table class="overlay-table">
        <thead><tr>${headerHtml}</tr></thead>
        <tbody>${bodyHtml}</tbody>
      </table>
    `;
  }

  private splitTableRow(row: string | undefined): string[] {
    if (!row) {
      return [];
    }
    const trimmed = row.trim();
    const withoutEdges = trimmed
      .replace(/^\|/, "")
      .replace(/\|$/, "");
    return withoutEdges.split("|").map((cell) => cell.trim());
  }

  private renderLatexForOverlay(latex: string): string {
    if (!latex) {
      return "";
    }

    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        strict: "warn",
        displayMode: latex.includes("\\n"),
        maxSize: 50,
        maxExpand: 100,
      });
    } catch (error) {
      console.warn("KaTeX overlay rendering error", error);
      return `<span class="latex-error">${latex}</span>`;
    }
  }

  private sendOverlayUpdates(
    document: vscode.TextDocument,
    overlays: OverlayData[]
  ) {
    if (!this.editorProvider) {
      return;
    }

    this.editorProvider.updateOverlays(document.uri, overlays);

    const visibleRange = this.getVisibleRangeForDocument(document);
    this.editorProvider.updateOverlayPosition(document.uri, visibleRange);
    this.editorProvider.updateOverlayVisibility(document.uri, true);
  }

  private getVisibleRangeForDocument(
    document: vscode.TextDocument
  ): { start: number; end: number } {
    const editor = this.findEditorForDocument(document);
    if (editor && editor.visibleRanges.length > 0) {
      const [firstRange] = editor.visibleRanges;
      if (firstRange) {
        return { start: firstRange.start.line, end: firstRange.end.line };
      }
    }

    return {
      start: 0,
      end: Math.max(document.lineCount - 1, 0),
    };
  }

  private updateOverlayPosition(editor: vscode.TextEditor) {
    if (!this.editorProvider || editor.visibleRanges.length === 0) {
      return;
    }

    const [firstRange] = editor.visibleRanges;
    if (!firstRange) {
      return;
    }

    this.editorProvider.updateOverlayPosition(editor.document.uri, {
      start: firstRange.start.line,
      end: firstRange.end.line,
    });
  }

  private handleSelectionChange(
    event: vscode.TextEditorSelectionChangeEvent
  ) {
    if (!this.editorProvider) {
      return;
    }

    const overlays = this.documentOverlays.get(
      event.textEditor.document.uri.toString()
    );
    if (!overlays || overlays.length === 0) {
      return;
    }

    const cursorInOverlay = event.selections.some((selection) =>
      overlays.some((overlay) =>
        this.toVsRange(overlay.range).contains(selection.active)
      )
    );

    this.editorProvider.updateOverlayVisibility(
      event.textEditor.document.uri,
      !cursorInOverlay
    );
  }

  private applyDecorations(
    editor: vscode.TextEditor,
    overlays: OverlayData[]
  ) {
    const headingRanges = new Map<number, vscode.Range[]>();

    overlays.forEach((overlay) => {
      if (overlay.type !== "heading" || !overlay.level) {
        return;
      }
      const ranges = headingRanges.get(overlay.level) ?? [];
      ranges.push(this.toVsRange(overlay.range));
      headingRanges.set(overlay.level, ranges);
    });

    this.decorationTypes.forEach((decoration, level) => {
      const ranges = headingRanges.get(level) ?? [];
      editor.setDecorations(decoration, ranges);
    });
  }

  private findEditorForDocument(
    document: vscode.TextDocument
  ): vscode.TextEditor | undefined {
    return vscode.window.visibleTextEditors.find(
      (editor) => editor.document.uri.toString() === document.uri.toString()
    );
  }

  private toOverlayRange(range: vscode.Range): OverlayRange {
    return {
      start: {
        line: range.start.line,
        character: range.start.character,
      },
      end: {
        line: range.end.line,
        character: range.end.character,
      },
    };
  }

  private toVsRange(range: OverlayRange): vscode.Range {
    return new vscode.Range(
      range.start.line,
      range.start.character,
      range.end.line,
      range.end.character
    );
  }
}
