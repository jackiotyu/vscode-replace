import * as vscode from 'vscode';
import { EXTENSION_SCHEME } from './constants';

// vscode只读文档的实现
export default class ContentProvider
    implements vscode.TextDocumentContentProvider
{
    // 提供只读文档内容
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        return uri.fragment;
    }
}
