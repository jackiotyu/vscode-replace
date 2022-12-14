import * as vscode from 'vscode';
import BaseView from './BaseView';
import { Command } from '../constants';

class TreeProvider extends BaseView implements vscode.TreeDataProvider<vscode.TreeItem> {
    constructor() {
        super();
        this.setItems();
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(Command.EXTENSION_NAME)) {
                this.setItems();
                this.refresh();
            }
        });
    }
    setItems() {
        this.items = [];
        let commands = vscode.workspace.getConfiguration(Command.EXTENSION_NAME).get<ReplaceGroup>('commands') || [];
        this.items = commands.map((command) => {
            let item = new vscode.TreeItem(command.name);
            item.description = command.description;
            item.iconPath = command.description;
            item.command = {
                title: command.name,
                command: Command.SELECT_OPTION_EVENT,
                arguments: [command],
            };
            return item;
        });
    }
}

// TODO 选项区
export class View {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.window.createTreeView('OptionView', {
                treeDataProvider: new TreeProvider(),
            }),
        );
    }
}
