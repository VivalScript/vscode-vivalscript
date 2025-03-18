import * as vscode from 'vscode';
import { declaredVarsExtractor } from '../store/variablesExtractor';


export class VivalScriptReferenceProvider implements vscode.ReferenceProvider {
        provideReferences(
                document: vscode.TextDocument,
                position: vscode.Position,
                context: vscode.ReferenceContext,
                token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.Location[]> {
                if (token.isCancellationRequested) { return; }
                if (document.languageId !== 'vivalscript') { return; }

                const word = document.getText(document.getWordRangeAtPosition(position));
                const declared_objects = declaredVarsExtractor.extractDeclaredObjects(document);
                const declared_obj = declared_objects.get(word);
                if (!declared_obj) { return; }

                const references: vscode.Location[] = [];
                const addRange = (uri: vscode.Uri, range: vscode.Range | vscode.Position) => {
                        references.push(new vscode.Location(uri, range));
                };
                // edits.replace(document.uri, declared_obj.range(), newName);
                if (context.includeDeclaration) {
                        addRange(document.uri, declared_obj.range());
                }
                declaredVarsExtractor.extractSingleObjectReferences(document, declared_obj).forEach(([startPosition, endPosition]) => {
                        // edits.replace(document.uri, new vscode.Range(startPosition, endPosition), newName);
                        addRange(document.uri, new vscode.Range(startPosition, endPosition));
                });
                return references;
        }
}
