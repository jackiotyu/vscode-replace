import * as vscode from 'vscode';
import { Command } from '../constants';

export class StatusBar {
    statusBar: vscode.StatusBarItem;
    constructor(context: vscode.ExtensionContext) {
        let statusBar = vscode.window.createStatusBarItem('replace.statusbar', vscode.StatusBarAlignment.Right, 200);
        statusBar.command = Command.REPLACE_EVENT;
        statusBar.tooltip = 'js replace';
        statusBar.text = 'js replace';
        this.statusBar = statusBar;
        context.subscriptions.push(statusBar);
        this.checkCanShow(vscode.window.activeTextEditor);
        vscode.window.onDidChangeActiveTextEditor((editor) => this.checkCanShow(editor));
    }

    checkCanShow(editor: vscode.TextEditor | undefined): void {
        if (editor) return this.statusBar.show();
        this.statusBar.hide();
    }
}
