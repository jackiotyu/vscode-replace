import * as vscode from 'vscode';
import { Disposable } from 'vscode';
import { getCommands } from './setting';
import { SelectCommand } from '../common';
import localize from '../localize';

export function pickCommand(): Promise<SelectCommand> {
    const disposables: Disposable[] = [];
    const commands = getCommands();
    if (!commands?.length) return Promise.resolve(undefined);

    const items = commands.map((command) => {
        return {
            label: command.name,
            description: command.description,
            buttons: [
                {
                    iconPath: new vscode.ThemeIcon('pencil'),
                    tooltip: localize('modal.pickCommand.tooltip'),
                },
            ],
        };
    });

    return new Promise<SelectCommand>((resolve, reject) => {
        let quickPick = vscode.window.createQuickPick();
        quickPick.items = items;
        quickPick.onDidTriggerItemButton((selection) => {
            let button = selection.button;
            let command = commands.find((i) => i.name === selection.item.label);
            quickPick.hide();
            if (command) {
                resolve({ button, command });
            } else {
                resolve(undefined);
            }
        });
        quickPick.onDidChangeSelection((item) => {
            quickPick.hide();
            let command = commands.find((i) => i.name === item[0].label);
            resolve(command);
        });
        quickPick.onDidHide(() => {
            quickPick.dispose();
            quickPick.hide();
            resolve(undefined);
        });
        quickPick.show();
    }).finally(() => {
        disposables.forEach((d) => d.dispose());
    });
}
