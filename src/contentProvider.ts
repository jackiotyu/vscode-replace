import * as vscode from 'vscode';
import { debounce } from 'lodash';
import { genReplace } from './utils/replace';
import GlobalReplace from './globalReplace';
import { EXTENSION_SCHEME } from './constants';

// vscode只读文档的实现
export default class ContentProvider
    implements vscode.TextDocumentContentProvider
{
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;
    protected listenChange?: vscode.Disposable;
    protected listenClose?: vscode.Disposable;
    protected listenCancel?: vscode.Disposable;
    /** TODO 监听文档修改事件 */
    triggerChange = debounce(
        (uri: vscode.Uri) => this.onDidChangeEmitter.fire(uri),
        300
    );

    // 提供只读文档内容
    // TODO 添加缓存
    async provideTextDocumentContent(
        uri: vscode.Uri,
        cancelToken: vscode.CancellationToken
    ): Promise<string> {
        let docText = '';
        try {
            this.listenClose?.dispose();
            this.listenChange?.dispose();
            this.listenCancel?.dispose();
            let { path } = uri;
            let isClose = false;
            // 监听修改事件
            this.listenChange = vscode.workspace.onDidChangeTextDocument(
                (e) => {
                    if (
                        e.document.uri.scheme === EXTENSION_SCHEME &&
                        e.document.uri.fsPath === uri.fsPath
                    ) {
                        this.triggerChange(uri);
                    }
                }
            );
            this.listenCancel = cancelToken.onCancellationRequested(() => {
                isClose = true;
            });
            // 监听关闭事件
            this.listenClose = vscode.workspace.onDidCloseTextDocument((e) => {
                if (
                    e.uri.scheme === EXTENSION_SCHEME &&
                    e.uri.fsPath === uri.fsPath
                ) {
                    this.listenChange?.dispose();
                    this.listenClose?.dispose();
                    isClose = true;
                }
            });

            // 获取源文件内容
            let document = await vscode.workspace.openTextDocument(path);
            docText = document.getText();
            let match = GlobalReplace.getMatchExp();
            let replace = GlobalReplace.getReplaceExp();
            let matchItem = GlobalReplace.getMatchItem(path);
            let includeIndexList: number[] = matchItem
                ? matchItem.range.map((i) => i.start)
                : [];
            // 直接获取替换的完整文本
            let gen = genReplace(docText, match, replace, includeIndexList);
            let current = gen.next();
            let value = current.value;
            while (
                !current.done &&
                !cancelToken.isCancellationRequested &&
                !isClose
            ) {
                current = gen.next();
                value = current.value;
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
            return value;
        } catch (error: any) {
            vscode.window.showWarningMessage(error.message, { modal: true });
            console.warn(error);
            throw error;
        }
    }
}
