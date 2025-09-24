import * as vscode from "vscode";
import { MarkdownEditorProvider } from "./markdownEditorProvider";
import { WikiLinkProvider } from "./features/wikiLinkProvider";
import { FocusModeProvider } from "./features/focusModeProvider";
import { SyntaxOverlayProvider } from "./features/syntaxOverlayProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("MarkRight extension is now active!");

  // Register the markdown editor provider
  const provider = new MarkdownEditorProvider(context);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      MarkdownEditorProvider.viewType,
      provider
    )
  );

  // Register wiki link provider
  const wikiLinkProvider = new WikiLinkProvider();
  context.subscriptions.push(wikiLinkProvider);

  // Register focus mode provider
  const focusModeProvider = new FocusModeProvider();
  context.subscriptions.push(focusModeProvider);

  // Register syntax overlay provider for typography enhancements
  const syntaxOverlayProvider = new SyntaxOverlayProvider(context);
  syntaxOverlayProvider.setCustomEditorProvider(provider);
  context.subscriptions.push(syntaxOverlayProvider);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand("markright.openEditor", () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor && activeEditor.document.languageId === "markdown") {
        vscode.commands.executeCommand(
          "vscode.openWith",
          activeEditor.document.uri,
          MarkdownEditorProvider.viewType
        );
      } else {
        vscode.window.showInformationMessage(
          "Please open a markdown file first"
        );
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("markright.insertWikiLink", () => {
      wikiLinkProvider.insertWikiLink();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("markright.toggleFocusMode", () => {
      focusModeProvider.toggleFocusMode();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("markright.togglePreview", () => {
      provider.togglePreview();
    })
  );
}

export function deactivate() {}
