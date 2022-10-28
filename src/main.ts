import * as vscode from 'vscode';

interface ReplaceCommand {
    name: string;
    match: RegExp;
    replace: string;
}

type ReplaceGroup = Array<ReplaceCommand>;

async function transform() {
    const activeEditor = vscode.window.activeTextEditor;
    const group = vscode.workspace.getConfiguration('vscode-replace').get('commands') as ReplaceGroup;
    if (!group?.length) {
        return
    }

    let items: vscode.QuickPickItem[] = group.map(item => ({ label: item.name }))

    let selection = (await vscode.window.showQuickPick(items)) as vscode.QuickPickItem;
    if (!selection) {
        return;
    }

    let command = group.find((i) => i.name === selection.label) as ReplaceCommand;
    if (!command) {
        return;
    }

    if (!activeEditor) {
        return;
    }

    let doc = activeEditor.document.getText();

    let result = doc.replace(new RegExp(command.match, 'g'), (text, $1, $2, $3, ...args) => {
        return eval(command.replace);
    });

    var firstLine = activeEditor.document.lineAt(0);
    var lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
    var textRange = new vscode.Range(
        0,
        firstLine.range.start.character,
        activeEditor.document.lineCount - 1,
        lastLine.range.end.character,
    );

    activeEditor.edit((builder) => {
        builder.replace(textRange, result);
    });
}

export { transform };
