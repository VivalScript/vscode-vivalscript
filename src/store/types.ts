import * as vscode from 'vscode';

export type Tag = string;

export type ObjectType = 'audio' | 'music' | 'song' | 'sound' | 'ambience' | 'list';


export class AudioObject {
        public name: string;
        public type: ObjectType;
        public startPosition: vscode.Position;
        public endPosition: vscode.Position;
        // public references: [vscode.Position, vscode.Position][];
        public tags: Set<Tag>;

        constructor(name: string, type: ObjectType, startPosition: vscode.Position, endPosition: vscode.Position) {
                this.name = name;
                this.type = type;
                this.startPosition = startPosition;
                this.endPosition = endPosition;
                // this.references = [];
                this.tags = new Set<Tag>();
        }

        public addTag(tag: Tag): void {
                this.tags.add(tag);
        };

        public range(): vscode.Range {
                return new vscode.Range(this.startPosition, this.endPosition);
        }
}

// type ObjectStore = Map<string, AudioObject | ListObject>;

// export const store = new Map<string, AudioObjectOld | ListObjectOld>();
