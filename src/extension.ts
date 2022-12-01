import * as vscode from 'vscode';
import { transform } from './main';
import { ReplaceExplorer } from './ui';
import { Command, RangeItem, EXTENSION_SCHEME } from './constants';
import { RegisterCodeAction } from './codeAction';
import { createRangeByRangeItem } from './utils/getRange';
import { getReplaceText } from './utils/getReplaceText';
import GlobalReplace from './globalReplace';
import WorkspaceAdaptor from './lib/workspace';
import ContentProvider from './contentProvider';

export function activate(context: vscode.ExtensionContext) {
    // 主要命令
    // TODO 整合到bootStrapper
    let textTransform = vscode.commands.registerTextEditorCommand(
        Command.REPLACE_EVENT,
        (editor) => {
            transform(editor);
        }
    );
    let docReplace = vscode.commands.registerCommand(
        Command.DOC_REPLACE_EVENT,
        async (uri: vscode.Uri, rangeItem: RangeItem) => {
            let document = await vscode.workspace.openTextDocument(uri);
            let replaceUri = vscode.Uri.from({
                scheme: EXTENSION_SCHEME,
                query: JSON.stringify({
                    match: GlobalReplace.getMatchExp(),
                    replace: GlobalReplace.getReplaceExp(),
                }),
                path: uri.path,
            });

            const currentRange = createRangeByRangeItem(rangeItem);

            vscode.commands.executeCommand(
                'vscode.diff',
                uri,
                replaceUri,
                `${document.fileName} ↔ ${document.fileName} (JS Replace Preview)`
            );
        }
    );

    let workspaceAdaptor = new WorkspaceAdaptor(vscode.workspace);
    let contentProvider = new ContentProvider();
    let disposable = workspaceAdaptor.registerTextDocumentContentProvider(
        EXTENSION_SCHEME,
        contentProvider
    );

    context.subscriptions.push(disposable);
    context.subscriptions.push(textTransform);
    context.subscriptions.push(docReplace);
    // 注册code action
    new RegisterCodeAction(context);
    // UI
    new ReplaceExplorer(context);
}

export function deactivate() {}
