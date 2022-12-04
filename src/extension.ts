import * as vscode from 'vscode';
import { transform } from './main';
import { ReplaceExplorer } from './ui';
import { Command, RangeItem, EXTENSION_SCHEME } from './constants';
import { RegisterCodeAction } from './codeAction';
import { createRangeByRangeItem } from './utils/getRange';
import GlobalReplace from './globalReplace';
import WorkspaceAdaptor from './lib/workspace';
import ContentProvider from './contentProvider';
import CountDecorationProvider from './fileDecorationProvider';
import { FileNode, TextNode } from './ui/TreeNode';

export function activate(context: vscode.ExtensionContext) {
    let contentProvider = new ContentProvider();
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
        async (fsPath: string, rangeItem: RangeItem) => {
            let document = await vscode.workspace.openTextDocument(fsPath);
            let { uri, range } = GlobalReplace.getMatchItem(fsPath) || {};
            let replaceUri = vscode.Uri.from({
                scheme: EXTENSION_SCHEME,
                query: JSON.stringify({
                    match: GlobalReplace.getMatchExp(),
                    replace: GlobalReplace.getReplaceExp(),
                    range: range?.map((i) => i.start).toString(),
                }),
                path: fsPath,
            });

            // vscode.workspace.onDidChangeTextDocument((e) => {
            //     if (e.document.uri.fsPath === fsPath) {
            //         console.log('🚀 文件更改 >>', fsPath);
            //         contentProvider.onDidChangeEmitter.fire(replaceUri);
            //     }
            // });

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
            let fsPath = item?.command?.arguments?.[0];
            if (!fsPath) return;
            GlobalReplace.excludeRange(fsPath, item.index);
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
    let registerTextDocument =
        workspaceAdaptor.registerTextDocumentContentProvider(
            EXTENSION_SCHEME,
            contentProvider
        );
    let registerFileDecorator = vscode.window.registerFileDecorationProvider(
        new CountDecorationProvider()
    );

    context.subscriptions.push(registerTextDocument);
    context.subscriptions.push(registerFileDecorator);
    context.subscriptions.push(commandTextTransform);
    context.subscriptions.push(commandDocReplace);
    context.subscriptions.push(commandCancelReplaceItem);
    context.subscriptions.push(commandReplaceItem);
    context.subscriptions.push(commandReplaceFolder);
    context.subscriptions.push(commandCancelReplaceFolder);
    // 注册code action
    new RegisterCodeAction(context);
    // UI
    new ReplaceExplorer(context);
}

export function deactivate() {}
