import * as vscode from 'vscode';
import { SEARCH_MATCH_COUNT_STR } from './constants';
import localize from './localize';

/** treeView 中文件匹配的数量装饰 */
export default class CountDecorationProvider
    implements vscode.FileDecorationProvider
{
    changeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChangeFileDecorations = this.changeEmitter.event;

    provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FileDecoration> {
        if (RegExp(SEARCH_MATCH_COUNT_STR).test(uri.query)) {
            let count = uri.query.match(/count=(\d+)/)?.[1] || '0';
            return {
                badge: count,
                tooltip: localize('fileDecoration.matchCount', count),
            };
        }
    }
}
