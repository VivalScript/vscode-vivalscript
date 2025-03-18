import * as vscode from 'vscode';
import { declaredVarsExtractor } from '../store/variablesExtractor';


export class VivalScriptDefinitionProvider implements vscode.DefinitionProvider {
        provideDefinition(
                document: vscode.TextDocument,
                position: vscode.Position,
                token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.Definition | vscode.DefinitionLink[]> {
                if (token.isCancellationRequested) { return; }
                if (document.languageId !== 'vivalscript') { return; }

                const word = document.getText(document.getWordRangeAtPosition(position));
                const declared_objects = declaredVarsExtractor.extractDeclaredObjects(document);
                const declared_obj = declared_objects.get(word);
                if (!declared_obj) { return; }

                const definition = new vscode.Location(document.uri, declared_obj.range());
                return definition;
        }
}
