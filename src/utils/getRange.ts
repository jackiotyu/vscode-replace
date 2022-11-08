import * as vscode from 'vscode';
import { isReg } from './utils';

export function getRange(text: string, reg: string) {
    let regexp = RegExp(reg, 'g');
    let matchGroup;
    let res = [];
    let max = text.length;
    let count = 0;
    while ((matchGroup = regexp.exec(text)) !== null && count <= max) {
        let matchText = matchGroup[0];
        if (matchText.length > 0) {
            res.push({
                start: matchGroup.index,
                end: matchGroup.index + matchText.length,
                // 获取$1-$n
                group: matchGroup.slice(1),
                text: matchText,
            });
        }
        count++;
    }
    return res;
}

export function getAllPosition(editor: vscode.TextEditor, reg: string) {
    try {
        if (!isReg(reg)) return [];
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
    } catch (error) {
        // console.log(error, 'error');
        return [];
    }
}

/**
 * 获取匹配的范围数组
 * @param activeEditor
 * @param command
 * @returns
 */
export function getMatchRangeList(activeEditor: vscode.TextEditor, command: ReplaceCommand) {
    try {
        let positionArray = getAllPosition(activeEditor, command.match);
        let rangeList: Replace.RangeList = [];
        if (positionArray.length) {
            rangeList = positionArray.map((item) => {
                let { line, start, end, group, text } = item;
                // 文字开始和结束范围
                let range = new vscode.Range(new vscode.Position(line, start), new vscode.Position(line, end));
                return { group, text, range };
            });
        }
        return rangeList;
    } catch (error) {
        // console.log(error);
        return [];
    }
}
