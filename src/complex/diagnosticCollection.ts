import * as vscode from 'vscode';

const incompleteKeywordRegex = /\b(?:type|id)\b\s*(?:#.*)?$/g;
const incompleteObjRegex = /\b(?:audio|music|song|sound|ambience)\b\s*(?:#.*)?$/g;
const emptyTagRegex = /\[\]/g;

export function updateDiagnostics(
        document: vscode.TextDocument,
        diagnosticCollection: vscode.DiagnosticCollection
) {
        if (document.languageId !== 'vivalscript') { return; }

        const diagnostics: vscode.Diagnostic[] = [];
        for (let i = 0; i < document.lineCount; i++) {
                const line = document.lineAt(i).text;
        }
        
        diagnosticCollection.set(document.uri, diagnostics);
}
