import * as vscode from 'vscode';
import { transform } from './main';
import { ReplaceExplorer } from './ui';
import { SelectOptionEvent } from './event';
import { Command } from './constants';

export function activate(context: vscode.ExtensionContext) {
    let textTransform = vscode.commands.registerTextEditorCommand(Command.REPLACE_EVENT, (editor) => {
        transform(editor);
    });
    context.subscriptions.push(textTransform);
    vscode.commands.registerCommand(Command.SELECT_OPTION_EVENT, (command: ReplaceCommand) => {
        SelectOptionEvent.fire(command);
    });
    new ReplaceExplorer(context);
}

export function deactivate() {}
