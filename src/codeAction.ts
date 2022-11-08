import * as vscode from 'vscode';
import { TextDocument, Range, Selection, CodeActionContext, CancellationToken } from 'vscode';
import { Command } from './constants';
import { getCommands, getSetting } from './utils/setting';
import { getReplaceText } from './utils/getReplaceText';

class ReplaceCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    async provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken,
    ) {
        let commands = getCommands();
        if (!commands) return [];
        let actionCommands = commands.map((command) => {
            let action = new vscode.CodeAction(`jsReplace => ${command.name}`, vscode.CodeActionKind.QuickFix);
            action.edit = new vscode.WorkspaceEdit();
            let activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const selections = activeEditor.selections;
                activeEditor.edit((builder) => {
                    for (const selection of [...selections].reverse()) {
                        if (action.edit) {
                            let text = document.getText(selection);
                            let replaceText = text;
                            try {
                                // 获取转换后的文本
                                replaceText = text.replace(new RegExp(command.match, 'g'), (text, ...group) => {
                                    return getReplaceText(command, text, ...group);
                                });
                            } catch (error) {}
                            action.edit?.replace(document.uri, selection, replaceText);
                        }
                    }
                });
            }
            return action;
        });
        return actionCommands;
    }
}

class RegisterCodeAction {
    actionRegister?: vscode.Disposable;
    constructor(context: vscode.ExtensionContext) {
        this.checkRegister(context);
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(Command.EXTENSION_NAME)) {
                this.checkRegister(context);
            }
        });
    }

    // 检查配置
    checkRegister(context: vscode.ExtensionContext) {
        let supportLanguageList = getSetting().actionLanguages;
        this.disposeAction();
        if (!supportLanguageList?.length) return;
        this.registerAction(context, supportLanguageList);
    }

    // 解除code action
    disposeAction() {
        this.actionRegister?.dispose();
    }

    // 注册code action
    registerAction(context: vscode.ExtensionContext, supportLanguageList: string[]) {
        this.actionRegister = vscode.languages.registerCodeActionsProvider(
            supportLanguageList.map((language) => ({ scheme: 'file', language })),
            new ReplaceCodeActionProvider(),
            {
                providedCodeActionKinds: ReplaceCodeActionProvider.providedCodeActionKinds,
            },
        );
        context.subscriptions.push(this.actionRegister);
    }
}

export { RegisterCodeAction };
