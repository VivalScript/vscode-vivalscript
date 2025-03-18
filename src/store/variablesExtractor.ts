import * as vscode from 'vscode';
import { isInsideComment } from '../utils';
import { AudioObject, ObjectType, Tag } from './types';


class DeclaredVarsExtractor {
        private groupTagRegex = /\[([^\"\]]+)\]/g;
        private tagRegex = /\[[^"\]]+\]/g;
        private stringTagRegex = '\\[[^"\\]]+\\]';
        public declarationObjRegex = /\b(audio|music|song|sound|ambience|list)\(\s*((?!(?:https?|MISSING|FEW|audio|music|song|sound|ambience|list)\b)[A-z_À-ÖØ-öø-ÿ][\wÀ-ÖØ-öø-ÿ]*)\s*\)/g;
        public referenceObjRegex = /\b(?:audio|music|song|sound|ambience)\b\s*(?:\[[^"\]]+\]\s*)*(?!(?:https?|MISSING|FEW|audio|music|song|sound|ambience|list)\b)([A-z_À-ÖØ-öø-ÿ][\wÀ-ÖØ-öø-ÿ]*)\b\s*(?:\[[^"\]]+\]\s*)*/g;
        // public test = RegExp(`\\b(?:audio|music|song|sound|ambience)\\b\\s*(?:${this.stringTagRegex}\\s*)*(?!https?|MISSING|FEW|audio|music|song|sound|ambience|list)([A-z_À-ÖØ-öø-ÿ][\wÀ-ÖØ-öø-ÿ]*)\\b\\s*(?:${this.stringTagRegex}\\s*)*`, 'g');
        private declarationTagRegex = /\b(audio|music|song|sound|ambience)\b\s*\[([^\"\]]+)\]/g;
        private referenceTagRegex = /\[([^\"\]\n]+)\]/g;


        public extractDeclaredObjects(
                document: vscode.TextDocument
        ): Map<string, AudioObject> {
                const declared = new Map<string, AudioObject>();
                for (let i = 0; i < document.lineCount; i++) {
                        const line = document.lineAt(i).text;
                        let match: RegExpExecArray | null;
                        // this.declarationObjRegex.lastIndex = 0;
                        while ((match = this.declarationObjRegex.exec(line)) !== null) {
                                const obj_name = match[2];
                                const start_index = match.index + match[0].indexOf(obj_name);
                                if (isInsideComment(line, start_index)) { continue; }
                                
                                const audio_object = new AudioObject(obj_name, match[1] as ObjectType, new vscode.Position(i, start_index), new vscode.Position(i, start_index + obj_name.length));
                                // this.tagRegex.lastIndex = 0;
                                while ((match = this.groupTagRegex.exec(line.substring(start_index))) !== null) {
                                        const tag_name = match[1];
                                        const start_index = match.index + match[0].indexOf(tag_name);
                                        if (isInsideComment(line, start_index)) { continue; }
                                        audio_object.addTag(tag_name);
                                }
                                // console.log(audio_object);
                                declared.set(obj_name, audio_object);
                        }
                }

                return declared;
        }

        public extractReferencedObjects(
                document: vscode.TextDocument,
                declaredObjects: Map<string, AudioObject>
        ): [
                vscode.Position,
                vscode.Position
        ][] {
                const references: [vscode.Position, vscode.Position][] = [];
                for (let i = 0; i < document.lineCount; i++) {
                        const line = document.lineAt(i).text;
                        let match: RegExpExecArray | null;
                        // this.referenceObjRegex.lastIndex = 0;
                        while ((match = this.referenceObjRegex.exec(line)) !== null) {
                                const obj_name = match[1];
                                const start_index = match.index + match[0].indexOf(obj_name);
                                if (isInsideComment(line, start_index)) { continue; }
                                const audio_object = declaredObjects.get(obj_name);
                                if (!audio_object) { continue; }

                                const position: [vscode.Position, vscode.Position] = [new vscode.Position(i, start_index), new vscode.Position(i, start_index + obj_name.length)];
                                // console.log(position);
                                // audio_object.references.push(position);
                                // console.log(audio_object);
                                references.push(position);
                        }
                }

                return references;
        }

        public extractSingleObjectReferences(
                document: vscode.TextDocument,
                audioObject: AudioObject
        ): [
                vscode.Position,
                vscode.Position
        ][] {
                const references: [vscode.Position, vscode.Position][] = [];
                for (let i = 0; i < document.lineCount; i++) {
                        const line = document.lineAt(i).text;
                        let match: RegExpExecArray | null;
                        // this.referenceObjRegex.lastIndex = 0;
                        while ((match = this.referenceObjRegex.exec(line)) !== null) {
                                const obj_name = match[1];
                                const start_index = match.index + match[0].indexOf(obj_name);
                                if (isInsideComment(line, start_index)) { continue; }
                                if (obj_name !== audioObject.name) { continue; }

                                const position: [vscode.Position, vscode.Position] = [new vscode.Position(i, start_index), new vscode.Position(i, start_index + obj_name.length)];
                                references.push(position);
                        }
                }

                return references;
        }

        public extractNotExistingReferences(
                document: vscode.TextDocument,
                declaredObjects: Map<string, AudioObject>
        ): {
                startPosition: vscode.Position,
                endPosition: vscode.Position
        }[] {
                const references: { startPosition: vscode.Position, endPosition: vscode.Position }[] = [];
                for (let i = 0; i < document.lineCount; i++) {
                        const line = document.lineAt(i).text;
                        let match: RegExpExecArray | null;
                        while ((match = this.referenceObjRegex.exec(line)) !== null) {
                                const obj_name = match[1];
                                const start_index = match.index + match[0].indexOf(obj_name);
                                if (isInsideComment(line, start_index) || declaredObjects.has(obj_name)) { continue; }

                                references.push({
                                        startPosition: new vscode.Position(i, start_index),
                                        endPosition: new vscode.Position(i, start_index + obj_name.length)
                                });
                        }
                }

                return references;
        }

        public extractTagsFromAudioObject(
                document: vscode.TextDocument,
                declaredObjects: Map<string, AudioObject>,
                list_obj: AudioObject
        ): Set<Tag> {
                let depth = 0;
                const [tags, last_line] = this.extractTagsFromListObject(document, declaredObjects, list_obj, depth);

                return tags;
        }

        private extractTagsFromListObject(
                document: vscode.TextDocument,
                declaredObjects: Map<string, AudioObject>,
                list_obj: AudioObject,
                depth: number
        ): [Set<Tag>, number] {
                console.log(`Extracting Tags at depth: ${depth}`);
                if (list_obj.type !== 'list') { return [list_obj.tags, list_obj.endPosition.line]; }
                const emptyOnError = (errorInfo: string): [Set<Tag>, number] => {
                        console.warn(`${errorInfo.trim()} Returned empty tag set.`);
                        return [new Set<Tag>(), list_obj.endPosition.line];
                };
                if (depth > 10) {
                        return emptyOnError('Too deep to continue recursive function.');
                }
                let index = list_obj.startPosition.line;
                let line = document.lineAt(index).text;
                do {
                        let match: RegExpExecArray | null;
                        // Tags
                        // this.tagRegex.lastIndex = 0;
                        while ((match = this.groupTagRegex.exec(line)) !== null) {
                                const tag_name = match[1];
                                const start_index = match.index + match[0].indexOf(tag_name);
                                if (isInsideComment(line, start_index)) { continue; }
                                console.log(`Identified tag: ${tag_name}`);
                                list_obj.addTag(tag_name);
                                // tags.add(tagName);
                        }
                        // References
                        // this.referenceObjRegex.lastIndex = 0;
                        while ((match = this.referenceObjRegex.exec(line)) !== null) {
                                const obj_name = match[1];
                                console.log(`Identified audio object: ${obj_name}`);
                                if (obj_name === list_obj.name) { continue; }
                                const audio_object = declaredObjects.get(obj_name);
                                if (!audio_object) { continue; }

                                if (audio_object.type !== 'list' || audio_object.tags.size > 0) {
                                        audio_object.tags.forEach(tag => {
                                                list_obj.addTag(tag);
                                        });
                                        console.log('Added tags from:');
                                        console.log(audio_object);
                                        continue;
                                }
                                console.log('Extracting tags recursively of:');
                                console.log(audio_object);
                                const [sub_tags, sub_end_line] = this.extractTagsFromListObject(document, declaredObjects, audio_object, depth++);
                                sub_tags.forEach(tag => {
                                        list_obj.addTag(tag);
                                });
                        }
                        if (list_obj.startPosition.line === index) {
                                index++;
                                line = document.lineAt(index).text;
                                continue;
                        }
                        // Declarations (for some reason)
                        // this.declarationObjRegex.lastIndex = 0;
                        while ((match = this.declarationObjRegex.exec(line)) !== null) {
                                const obj_type = match[1] as ObjectType;
                                if (obj_type !== 'list') { continue; }
                                const obj_name = match[2];
                                const declared_obj = declaredObjects.get(obj_name);
                                if (!declared_obj) { continue; }
                                if (declared_obj.type !== 'list' || declared_obj.tags.size > 0) {
                                        // Technically unreachable.
                                        declared_obj.tags.forEach(tag => {
                                                list_obj.addTag(tag);
                                        });
                                        console.log('Added tags from:');
                                        console.log(declared_obj);
                                        continue;
                                }
                                console.log('Extracting tags recursively of nested:');
                                console.log(declared_obj);
                                const [sub_tags, sub_end_line] = this.extractTagsFromListObject(document, declaredObjects, declared_obj, depth++);
                                sub_tags.forEach(tag => {
                                        list_obj.addTag(tag);
                                });
                                index = sub_end_line;
                        }
                        index++;
                        line = document.lineAt(index).text;
                } while (index < document.lineCount && !line.includes('}'));

                return [list_obj.tags, index];
        }

        public extractGlobalTags(
                document: vscode.TextDocument
        ): Set<Tag> {
                const tags = new Set<Tag>();
                for (let i = 0; i < document.lineCount; i++) {
                        const line = document.lineAt(i).text;
                        let match: RegExpExecArray | null;
                        // this.groupTagRegex.lastIndex = 0;
                        while ((match = this.groupTagRegex.exec(line)) !== null) {
                                const tag_name = match[1];
                                tags.add(tag_name);
                        }
                }

                return tags;
        }
}

export const declaredVarsExtractor = new DeclaredVarsExtractor();
