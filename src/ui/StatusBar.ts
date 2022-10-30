import * as vscode from 'vscode';
import { Command } from '../constants';

export class StatusBar {
    constructor(context: vscode.ExtensionContext) {
        let statusBar = vscode.window.createStatusBarItem('replace.statusbar', vscode.StatusBarAlignment.Right, 200);
        statusBar.command = Command.REPLACE_EVENT;
        statusBar.tooltip = 'js replace';
        statusBar.text = 'js replace';
        context.subscriptions.push(statusBar);
        statusBar.show();
    }
}
