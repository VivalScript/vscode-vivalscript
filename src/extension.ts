import * as vscode from 'vscode';
import { VivalScriptSemanticTokenProvider, legend } from './complex/semanticTokensProvider';
import { VivalScriptCompletionItemProvider, VivalScriptCompletionTagProvider } from './complex/completionItemProvider';
import { VivalScriptHoverProvider } from './misc/hoverProvider';
import { cleanPath } from './utils';
import { VivalScriptRenameProvider } from './misc/renameProvider';
import { VivalScriptReferenceProvider } from './misc/referenceProvider';
import { VivalScriptDefinitionProvider } from './misc/definitionProvider';

const selector: vscode.DocumentSelector = {
        language: 'vivalscript',
        scheme: 'file'
};

export function activate(context: vscode.ExtensionContext) {
        console.log('VivalScript Extension is now active!');
        context.subscriptions.push(
                vscode.languages.createDiagnosticCollection('vivalscript')
        );

        context.subscriptions.push(
                vscode.commands.registerCommand(
                        'vivalscript.jumpToRange',
                        (args: {
                                uri: vscode.Uri,
                                range: {
                                        character: number,
                                        line: number
                                }[]
                        }) => {
                                const uri = vscode.Uri.file(cleanPath(args.uri.path));
                                const range = new vscode.Range(args.range[0].line, args.range[0].character, args.range[1].line, args.range[1].character);
                                try {
                                        vscode.window.showTextDocument(uri, { selection: range });
                                } catch (error) {
                                        console.error(`An error has occurred while jumping to range: ${error}`);
                                }
                        }
                )
        );

        context.subscriptions.push(
                vscode.languages.registerHoverProvider(
                        selector,
                        new VivalScriptHoverProvider()
                )
        );

        context.subscriptions.push(
                vscode.languages.registerDocumentSemanticTokensProvider(
                        selector,
                        new VivalScriptSemanticTokenProvider(),
                        legend
                )
        );

        context.subscriptions.push(
                vscode.languages.registerCompletionItemProvider(
                        selector,
                        new VivalScriptCompletionItemProvider(),
                        '.',
                )
        );

        context.subscriptions.push(
                vscode.languages.registerCompletionItemProvider(
                        selector,
                        new VivalScriptCompletionTagProvider(),
                        '[',
                        // '.',
                )
        );

        context.subscriptions.push(
                vscode.languages.registerRenameProvider(
                        selector,
                        new VivalScriptRenameProvider()
                )
        );

        context.subscriptions.push(
                vscode.languages.registerReferenceProvider(
                        selector,
                        new VivalScriptReferenceProvider()
                )
        );

        context.subscriptions.push(
                vscode.languages.registerDefinitionProvider(
                        selector,
                        new VivalScriptDefinitionProvider()
                )
        );
}

export function deactivate() {}
