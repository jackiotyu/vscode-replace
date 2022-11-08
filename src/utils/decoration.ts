import * as vscode from 'vscode';

let decoration: vscode.TextEditorDecorationType;

export const getDecoration = () => {
    if (decoration) cancelDecoration();
    decoration = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('merge.currentHeaderBackground'),
    });
    return decoration;
};

export const cancelDecoration = () => {
    decoration?.dispose();
};

/**
 * 匹配内容高亮
 * @param activeEditor
 * @param command
 */
export function setMatchTextHighlight(activeEditor: vscode.TextEditor, rangeList: vscode.Range[]) {
    cancelDecoration();
    if (rangeList.length) {
        let decorationType = getDecoration();
        activeEditor.setDecorations(decorationType, rangeList);
    }
}

export function cancelMatchTextHighlight(rangeList: Replace.RangeList) {
    if (rangeList.length) {
        cancelDecoration();
    }
}
