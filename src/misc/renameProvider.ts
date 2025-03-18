import * as vscode from 'vscode';
import { declaredVarsExtractor } from '../store/variablesExtractor';


export class VivalScriptRenameProvider implements vscode.RenameProvider {
        provideRenameEdits(
                document: vscode.TextDocument,
                position: vscode.Position,
                newName: string,
                token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.WorkspaceEdit> {
                if (token.isCancellationRequested) { return; }
                if (document.languageId !== 'vivalscript') { return; }

                const word = document.getText(document.getWordRangeAtPosition(position));
                const declared_objects = declaredVarsExtractor.extractDeclaredObjects(document);
                const declared_obj = declared_objects.get(word);
                if (!declared_obj) { return; }

                const edits = new vscode.WorkspaceEdit();
                edits.replace(document.uri, declared_obj.range(), newName);
                declaredVarsExtractor.extractSingleObjectReferences(document, declared_obj).forEach(([startPosition, endPosition]) => {
                        edits.replace(document.uri, new vscode.Range(startPosition, endPosition), newName);
                });
                return edits;
        }
}
