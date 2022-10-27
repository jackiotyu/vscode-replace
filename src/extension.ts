import * as vscode from 'vscode';
import { transform } from "./main";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('vscode-replace.replace', () => {
		transform();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
