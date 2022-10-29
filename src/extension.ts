import * as vscode from 'vscode';
import { transform } from "./main";

export function activate(context: vscode.ExtensionContext) {
	// let transformFile = vscode.commands.registerCommand('vscode-replace.replace', () => {
	// 	transform();
	// });

	let textTransform = vscode.commands.registerTextEditorCommand('vscode-replace.replace', (editor) => {
		transform(editor);
	})

	context.subscriptions.push(textTransform);
	// context.subscriptions.push(transformFile);
}

export function deactivate() {}
