import * as vscode from 'vscode';
export function getRange(text: string, reg: string) {
    let regexp = RegExp(reg, 'g');
    let matchGroup;
    let res = [];
    while ((matchGroup = regexp.exec(text)) !== null) {
        let matchText = matchGroup[0];
        res.push({
            start: matchGroup.index,
            end: matchGroup.index + matchText.length,
        });
    }
    return res;
}

export function getAllPosition(editor: vscode.TextEditor, reg: string) {
    let lastLine = editor.document.lineCount;
    let eol = editor.document.eol === vscode.EndOfLine.LF ? '\n' : '\r\n';
    let text = editor.document.getText();
    let textArray = text.split(eol);
    let positionArray = [];
    for (let index = 0; index < lastLine; index++) {
        const text = textArray[index];
        let range = getRange(text, reg);
        if (range.length) {
            positionArray.push(...range.map((item) => ({ line: index, ...item })));
        }
    }
    return positionArray;
}
