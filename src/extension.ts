import * as vscode from 'vscode';
import { transform } from './main';
import { ReplaceExplorer } from './ui';
import { SelectOptionEvent } from './event';
import { Command } from './constants';
import { RegisterCodeAction } from './codeAction';
import { ReplaceCommand } from './common';

export function activate(context: vscode.ExtensionContext) {
    // 主要命令
    let textTransform = vscode.commands.registerTextEditorCommand(
        Command.REPLACE_EVENT,
        (editor) => {
            transform(editor);
        }
    );
    context.subscriptions.push(textTransform);
    // 注册code action
    new RegisterCodeAction(context);
    // UI
    vscode.commands.registerCommand(
        Command.SELECT_OPTION_EVENT,
        (command: ReplaceCommand) => {
            SelectOptionEvent.fire(command);
        }
    );
    new ReplaceExplorer(context);
}

export function deactivate() {}
