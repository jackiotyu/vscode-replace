import * as vscode from 'vscode';
import { TextDocument, TextEditor, Range, Selection, CodeActionContext, CancellationToken } from 'vscode';
import { Command, DefaultSetting } from './constants';
import { getSetting, getActionCommands } from './utils/setting';
import { isUndefined } from './utils/utils';
import { getReplaceText } from './utils/getReplaceText';

class ReplaceCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

    async provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken,
    ) {
        let commands = getActionCommands();
        let actionNameFormat = getSetting()?.actionNameFormat || DefaultSetting.ACTION_NAME_FORMAT;
        let activeEditor = vscode.window.activeTextEditor;
        if (!commands?.length) return [];
        if (isUndefined(activeEditor)) return [];
        let editor = activeEditor;
        let selections = [...activeEditor.selections].reverse();
        let textList = selections.map((selection) => document.getText(selection));
        let actionCommands = commands
            .filter((command) => {
                // 启用条件
                let reg = new RegExp(command.match, 'g');
                return textList.some((text) => reg.test(text));
            })
            .map((command) => {
                return this.createAction(command, editor, document, actionNameFormat, selections);
            });
        return actionCommands;
    }

    // action配置
    createAction(
        command: ReplaceCommand,
        activeEditor: TextEditor,
        document: TextDocument,
        actionNameFormat: string,
        selections: Selection[],
    ) {
        let name = command.name;
        let description = command.description || '-';
        let reg = new RegExp(command.match, 'g');
        let action = new vscode.CodeAction(
            actionNameFormat?.replace(/\$name/, name).replace(/\$description/, description),
            vscode.CodeActionKind.QuickFix,
        );
        action.edit = new vscode.WorkspaceEdit();

        activeEditor.edit((builder) => {
            for (const selection of selections) {
                if (action.edit) {
                    // TODO 点击单词位置，获取整个单词
                    let text = document.getText(selection);
                    let replaceText = text;
                    try {
                        // 获取转换后的文本
                        replaceText = text.replace(reg, (text, ...group) => getReplaceText(command, text, ...group));
                    } catch (error) {}
                    action.edit?.replace(document.uri, selection, replaceText);
                }
            }
        });

        return action;
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
        let commands = getActionCommands();
        this.disposeAction();
        if (!supportLanguageList?.length) return;
        if (!commands?.length) return;
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
