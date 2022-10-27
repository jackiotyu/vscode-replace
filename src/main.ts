import * as vscode from "vscode";

interface ReplaceCommand {
    name: string;
    match: RegExp;
    replace: string;
}

type ReplaceGroup = Array<ReplaceCommand>;


async function transform() {
    const activeEditor = vscode.window.activeTextEditor;
    const group = vscode.workspace.getConfiguration('vscode-replace').get('commands') as ReplaceGroup;
    if (!group) {
        return;
    }

    const command = group[0];
    if (!command) {
        return;
    }

    if (!activeEditor) {
      return;
    }

    let doc = activeEditor.document.getText();


    let result = doc.replace(new RegExp(command.match, 'g'), (text, $1, ...args) => {
        return eval(command.replace);
    });
    console.log('result', result);

    var firstLine = activeEditor.document.lineAt(0);
    var lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
    var textRange = new vscode.Range(
        0,
        firstLine.range.start.character,
        activeEditor.document.lineCount - 1,
        lastLine.range.end.character
    );

    activeEditor.edit(builder => {
        builder.replace(textRange, result);
    });
}

export { transform };