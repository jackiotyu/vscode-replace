import * as vscode from 'vscode';
import { transform } from './main';
import { ReplaceExplorer } from './ui';
import { SELECT_OPTION_EVENT, REPLACE_EVENT } from './constants';
import { SelectOptionEvent } from './event';

export function activate(context: vscode.ExtensionContext) {
    let textTransform = vscode.commands.registerTextEditorCommand(REPLACE_EVENT, (editor) => {
        transform(editor);
    });
    context.subscriptions.push(textTransform);
    vscode.commands.registerCommand(SELECT_OPTION_EVENT, (command: ReplaceCommand) => {
        SelectOptionEvent.fire(command);
    });
    new ReplaceExplorer(context);
}

export function deactivate() {}
