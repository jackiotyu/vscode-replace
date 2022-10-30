import * as vscode from 'vscode';

let decoration: vscode.TextEditorDecorationType;

export const getDecoration = () => {
    decoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('merge.currentHeaderBackground'),
    });
    return decoration;
};

export const cancelDecoration = () => {
    decoration?.dispose();
};
