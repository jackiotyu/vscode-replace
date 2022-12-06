import * as vscode from 'vscode';
import { ExtendRangeItem } from '../constants';

export class FileNode extends vscode.TreeItem {
    range: ExtendRangeItem[] = [];
    replaceText: string = '';
}
export class TextNode extends vscode.TreeItem {
    index: number = 0;
    fsPath?: string;
}

export type TreeNode = FileNode | TextNode;
