import * as vscode from 'vscode';
import { declaredVarsExtractor } from '../store/variablesExtractor';
import { Tag } from '../store/types';


interface keyword {
        label: string;
        documentation?: string;
        detail?: string;
        kind: vscode.CompletionItemKind;
}


export class VivalScriptCompletionItemProvider implements vscode.CompletionItemProvider {
        private keywords: keyword[] = [
                // - Audio objects
                {
                        label: 'audio',
                        documentation: "(class) Defines or declares audio objects",
                        kind: vscode.CompletionItemKind.Class,
                },
                {
                        label: 'music',
                        documentation: "(class) Defines or declares 'music' type audio objects",
                        kind: vscode.CompletionItemKind.Class,
                },
                {
                        label: 'song',
                        documentation: "(class) Defines or declares 'song' type music objects",
                        kind: vscode.CompletionItemKind.Class,
                },
                {
                        label: 'sound',
                        documentation: "(class) Defines or declares 'sound effect' type audio objects",
                        kind: vscode.CompletionItemKind.Class,
                },
                {
                        label: 'ambience',
                        documentation: "(class) Defines or declares 'ambience' type audio objects",
                        kind: vscode.CompletionItemKind.Class,
                },
                // - List object
                {
                        label: 'list',
                        documentation: "(class) Declares list objects",
                        kind: vscode.CompletionItemKind.Class,
                },
                // - Keywords
                {
                        label: 'type',
                        documentation: "(keyword) Predecessor of tags. String used to describe and audio object",
                        kind: vscode.CompletionItemKind.Keyword,
                },
                {
                        label: 'id',
                        documentation: "(keyword) Defines the directory for the next audio objects with the same indentation",
                        kind: vscode.CompletionItemKind.Keyword,
                },
                // 'headers',
                // - Operators
                {
                        label: 'or',
                        kind: vscode.CompletionItemKind.Operator,
                },
                {
                        label: 'not',
                        kind: vscode.CompletionItemKind.Operator,
                },
                // - Constants
                {
                        label: 'MISSING',
                        documentation: "(constant) Equivalent to null (JS) or None (Py)",
                        kind: vscode.CompletionItemKind.Constant,
                },
                {
                        label: 'FEW',
                        documentation: "(constant) Variant of MISSING, but refers to amount",
                        kind: vscode.CompletionItemKind.Constant,
                },
                // - Modifiers
                {
                        label: 'main',
                        documentation: "(modifier) Marks an audio object as the first to play from its block or list",
                        kind: vscode.CompletionItemKind.Keyword,
                },
                {
                        label: 'final',
                        documentation: "(modifier) Marks an audio object as the last to play from its block or list",
                        kind: vscode.CompletionItemKind.Keyword,
                },
                {
                        label: 'alt',
                        documentation: "(modifier) Marks an audio object as an alternative to the previous audio object",
                        kind: vscode.CompletionItemKind.Keyword,
                },
                {
                        label: 'timed',
                        documentation: "(modifier) Marks an audio object as to be played timed",
                        kind: vscode.CompletionItemKind.Keyword,
                },
                {
                        label: 'loop',
                        documentation: "(modifier) Marks an audio object as to be played in loop",
                        kind: vscode.CompletionItemKind.Keyword,
                },
                {
                        label: 'maybe',
                        documentation: "(modifier) Marks an audio object as placeholder or under review",
                        kind: vscode.CompletionItemKind.Keyword,
                },
        ];

        public provideCompletionItems(
                document: vscode.TextDocument,
                position: vscode.Position,
                token: vscode.CancellationToken,
                context: vscode.CompletionContext
        ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
                if (token.isCancellationRequested) { return; }
                if (document.languageId !== 'vivalscript') { return; }
                
                const completion_items: vscode.CompletionItem[] = [];
                const line = document.lineAt(position.line).text;
                if (
                        context.triggerCharacter !== '['
                        && line.substring(0, position.character).match(/\s*.*?\[.*$/g)
                        && line.substring(position.character).match(/^.*?\]/g)
                ) {
                        return completion_items;
                }

                this.keywords.forEach((keyword) => {
                        const keyword_completion = new vscode.CompletionItem(keyword.label, keyword.kind);
                        keyword_completion.detail = keyword.detail;
                        keyword_completion.documentation = keyword.documentation;
                        completion_items.push(keyword_completion);
                });

                declaredVarsExtractor.extractDeclaredObjects(document).forEach((audio_object) => {
                        const object_completion = new vscode.CompletionItem(audio_object.name, vscode.CompletionItemKind.Variable);
                        object_completion.detail = `${audio_object.name}: ${audio_object.type}`;
                        completion_items.push(object_completion);
                });

                return completion_items;
        }
}

export class VivalScriptCompletionTagProvider implements vscode.CompletionItemProvider {
        public provideCompletionItems(
                document: vscode.TextDocument,
                position: vscode.Position,
                token: vscode.CancellationToken,
                context: vscode.CompletionContext
        ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
                if (token.isCancellationRequested) { return; }
                if (document.languageId !== 'vivalscript') { return; }
                const completion_items: vscode.CompletionItem[] = [];
                const globalTags = () => {
                        declaredVarsExtractor.extractGlobalTags(document).forEach(tag => {
                                completion_items.push(new vscode.CompletionItem(tag, vscode.CompletionItemKind.Text));
                        });
                        return completion_items;
                };
                const line = document.lineAt(position.line).text;
                // console.log(context.triggerCharacter);
                // if (
                //         context.triggerCharacter !== '['
                // ) {
                //         console.log(line.substring(0, position.character));
                //         console.log(line.substring(position.character));
                //         if (!line.substring(0, position.character).match(/\s*.*?\[.*$/g) ||
                //         !line.substring(position.character).match(/^.*\]/g)) {
                //                 return completion_items;
                //         }
                // }
                // declaredVarsExtractor.referenceObjRegex.lastIndex = 0;
                let match = declaredVarsExtractor.referenceObjRegex.exec(line);
                if (!match) { return globalTags(); }

                const obj_name = match[1];
                const declared_objects = declaredVarsExtractor.extractDeclaredObjects(document);
                const audio_object = declared_objects.get(obj_name);
                if (!audio_object || position.character < audio_object.startPosition.character) { return globalTags(); }
                let tags: Set<Tag>;
                console.log(`=> Started extracting tags for: ${obj_name}`);
                tags = declaredVarsExtractor.extractTagsFromAudioObject(document, declared_objects, audio_object);
                console.log(`=> Extracted tags: ${[...tags]}`);
                tags.forEach(tag => {
                        const tag_completion = new vscode.CompletionItem(tag, vscode.CompletionItemKind.Text);
                        completion_items.push(tag_completion);
                });
                return completion_items;
        }
}
