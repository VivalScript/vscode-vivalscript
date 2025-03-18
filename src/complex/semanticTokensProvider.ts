import * as vscode from 'vscode';
import { declaredVarsExtractor } from '../store/variablesExtractor';

const tokenTypes = ['regexp', 'variable'];
const tokenModifiers = ['declaration', 'reference'];

export const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

export class VivalScriptSemanticTokenProvider implements vscode.DocumentSemanticTokensProvider {
        public provideDocumentSemanticTokens(
                document: vscode.TextDocument,
                token: vscode.CancellationToken
        ): vscode.ProviderResult<vscode.SemanticTokens> {
                if (token.isCancellationRequested) { return; }
                if (document.languageId !== 'vivalscript') { return; }
                
                const builder = new vscode.SemanticTokensBuilder(legend);
                // const declaredObjects = new Set<string>();
                const declared_objects = declaredVarsExtractor.extractDeclaredObjects(document);
                
                // Declarations
                declared_objects.forEach((audio_object) => {
                        builder.push(
                                audio_object.range(),
                                'variable',
                                ['declaration']
                        );
                });

                // References
                declaredVarsExtractor.extractReferencedObjects(document, declared_objects).forEach(([startPosition, endPosition]) => {
                        builder.push(
                                new vscode.Range(startPosition, endPosition),
                                'variable'
                        );
                });

                return builder.build();
        }
};
