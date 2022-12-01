import * as vscode from 'vscode';
import { getReplaceText } from './utils/getReplaceText';

// vscode只读文档的实现
export default class ContentProvider
    implements vscode.TextDocumentContentProvider
{
    changeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.changeEmitter.event;
    // 提供只读文档内容
    // TODO 添加缓存
    // TODO 监听文档修改事件
    async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        let { query, path } = uri;
        // 获取源文件内容
        let document = await vscode.workspace.openTextDocument(path);
        let docText = document.getText();
        let { match, replace } = JSON.parse(query);
        // 直接获取替换的完整文本
        let replaceText = docText.replace(
            RegExp(match, 'mg'),
            (text, ...args) => getReplaceText(replace, text, ...args)
        );
        return replaceText;
    }
}
