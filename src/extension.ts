import * as vscode from 'vscode';
import { transform } from './main';
import { ReplaceExplorer } from './ui';
import { Command, RangeItem } from './constants';
import { RegisterCodeAction } from './codeAction';
import { createRangeByRangeItem } from './utils/getRange';
import { getReplaceText } from './utils/getReplaceText';
import GlobalReplace from './globalReplace';

export function activate(context: vscode.ExtensionContext) {
    // 主要命令
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
            const currentRange = createRangeByRangeItem(rangeItem);
            let docText = document.getText();
            // 直接获取替换的完整文本
            const replaceText = docText.replace(
                RegExp(GlobalReplace.getMatchExp(), 'mg'),
                (text, ...args) => {
                    return getReplaceText(
                        GlobalReplace.getReplaceExp(),
                        text,
                        ...args
                    );
                }
            );

            let replaceDocument = await vscode.workspace.openTextDocument({
                content: replaceText,
            });

            vscode.commands.executeCommand(
                'vscode.diff',
                uri,
                replaceDocument.uri,
                `${document.fileName} ↔ ${document.fileName} (Replace Preview)`,
                { selection: currentRange }
            );
            // let document = await vscode.workspace.openTextDocument(uri);
            // vscode.window.showTextDocument(document, {
            //     selection: range,
            // });
        }
    );
    context.subscriptions.push(textTransform);
    context.subscriptions.push(docReplace);
    // 注册code action
    new RegisterCodeAction(context);
    // UI
    new ReplaceExplorer(context);
}

export function deactivate() {}
