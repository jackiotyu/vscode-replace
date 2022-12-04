import * as vscode from 'vscode';
import { transform } from './main';
import { ReplaceExplorer } from './ui';
import { Command, RangeItem, EXTENSION_SCHEME } from './constants';
import { RegisterCodeAction } from './codeAction';
import { createRangeByRangeItem } from './utils/getRange';
import GlobalReplace from './globalReplace';
import WorkspaceAdaptor from './lib/workspace';
import ContentProvider from './contentProvider';
import { FileNode, TextNode } from './ui/TreeNode';
import CountDecorationProvider from './fileDecorationProvider';

export function activate(context: vscode.ExtensionContext) {
    // 主要命令
    // TODO 整合到bootStrapper
    let commandTextTransform = vscode.commands.registerTextEditorCommand(
        Command.REPLACE_EVENT,
        (editor) => {
            transform(editor);
        }
    );
    let commandDocReplace = vscode.commands.registerCommand(
        Command.DOC_REPLACE_EVENT,
        async (uri: vscode.Uri, rangeItem: RangeItem) => {
            let document = await vscode.workspace.openTextDocument(uri);
            let replaceUri = vscode.Uri.from({
                scheme: EXTENSION_SCHEME,
                query: JSON.stringify({
                    match: GlobalReplace.getMatchExp(),
                    replace: GlobalReplace.getReplaceExp(),
                }),
                path: uri.fsPath,
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

    let commandReplaceItem = vscode.commands.registerCommand(
        'jsReplace.ReplaceItem',
        (item) => {
            // TODO 替换当前位置
            console.log('🚀 args >>', item);
        }
    );
    let commandCancelReplaceItem = vscode.commands.registerCommand(
        'jsReplace.CancelReplaceItem',
        (item: TextNode) => {
            if (!item?.uri) return;
            GlobalReplace.excludeRange(item.uri, item.index);
        }
    );
    let commandReplaceFolder = vscode.commands.registerCommand(
        'jsReplace.ReplaceFile',
        (item) => {
            if (!item?.resourceUri) return;
            GlobalReplace.replaceFile(item.resourceUri);
        }
    );
    let commandCancelReplaceFolder = vscode.commands.registerCommand(
        'jsReplace.CancelReplaceFile',
        (item?: FileNode) => {
            if (!item?.resourceUri) return;
            GlobalReplace.excludeFile(item.resourceUri);
        }
    );

    let workspaceAdaptor = new WorkspaceAdaptor(vscode.workspace);
    let contentProvider = new ContentProvider();
    let registerTextDocument =
        workspaceAdaptor.registerTextDocumentContentProvider(
            EXTENSION_SCHEME,
            contentProvider
        );

    let registerFileDecoration = vscode.window.registerFileDecorationProvider(
        new CountDecorationProvider()
    );

    context.subscriptions.push(registerTextDocument);
    context.subscriptions.push(commandTextTransform);
    context.subscriptions.push(commandDocReplace);
    context.subscriptions.push(commandCancelReplaceItem);
    context.subscriptions.push(commandReplaceItem);
    context.subscriptions.push(commandReplaceFolder);
    context.subscriptions.push(commandCancelReplaceFolder);
    context.subscriptions.push(registerFileDecoration);
    // 注册code action
    new RegisterCodeAction(context);
    // UI
    new ReplaceExplorer(context);
}

export function deactivate() {}
