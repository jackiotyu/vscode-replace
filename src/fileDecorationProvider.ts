import * as vscode from 'vscode';
import { SEARCH_MATCH_FILE_BADGE } from './constants';
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
        if (uri.query === SEARCH_MATCH_FILE_BADGE) {
            return {
                badge: '',
                tooltip: '',
            };
        }
    }
}
