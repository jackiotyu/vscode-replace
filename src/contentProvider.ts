import * as vscode from 'vscode';
import { genReplace } from './utils/replace';

// vscode只读文档的实现
export default class ContentProvider
    implements vscode.TextDocumentContentProvider {
    changeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.changeEmitter.event;
    // 提供只读文档内容
    // TODO 添加缓存
    // TODO 监听文档修改事件
    async provideTextDocumentContent(
        uri: vscode.Uri,
        cancelToken: vscode.CancellationToken
    ): Promise<string> {
        let docText = '';
        try {
            let { query, path } = uri;
            // 获取源文件内容
            let document = await vscode.workspace.openTextDocument(path);
            docText = document.getText();
            let { match, replace } = JSON.parse(query);
            // 直接获取替换的完整文本
            let gen = genReplace(docText, match, replace);
            let current = gen.next();
            let value = current.value;
            let done = current.done;
            while (!done && !cancelToken.isCancellationRequested) {
                current = gen.next();
                value = current.value;
                done = current.done;
            }
            return value;
        } catch (error: any) {
            vscode.window.showWarningMessage(error.message, { modal: true });
            console.warn(error);
            throw error;
        }
    }
}
