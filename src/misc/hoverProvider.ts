import * as vscode from 'vscode';
import { declaredVarsExtractor } from '../store/variablesExtractor';

export class VivalScriptHoverProvider implements vscode.HoverProvider {
        provideHover(
                document: vscode.TextDocument,
                position: vscode.Position,
                token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.Hover> {
                if (token.isCancellationRequested) { return; }
                if (document.languageId !== 'vivalscript') { return; }

                const word = document.getText(document.getWordRangeAtPosition(position));
                console.log(word);
                const declared_objects = declaredVarsExtractor.extractDeclaredObjects(document);
                const declared_obj = declared_objects.get(word);
                if (!declared_obj) { return; }

                const markdown = new vscode.MarkdownString();
                const commandUri = vscode.Uri.parse(
                        `command:vivalscript.jumpToRange?${encodeURIComponent(JSON.stringify([{
                                uri: document.uri, // TODO: Add support among files when adding imports
                                range: declared_obj.range()
                        }]))}`
                );
                markdown.appendMarkdown(`(${declared_obj.type}) ${declared_obj.name} => [${declared_obj.startPosition.line}:${declared_obj.startPosition.character}](${commandUri})`);
                markdown.isTrusted = true;
                return new vscode.Hover(markdown);
        }
}
