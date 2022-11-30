import { Uri } from 'vscode';

interface TempDoc {
    text: string;
    uri: Uri;
}

export const tempDocMap = new WeakMap<Uri, TempDoc>();
