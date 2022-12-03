import * as vscode from 'vscode';
import { isReg } from './utils';
import { ReplaceCommand } from '../common';
import { RangeItem } from '../constants';

/**
 * 生成vscode range
 * @param rangeItem
 * @returns
 */
export function createRangeByRangeItem(rangeItem: RangeItem): vscode.Range {
    return new vscode.Range(
        new vscode.Position(rangeItem.startLine, rangeItem.startCol),
        new vscode.Position(rangeItem.endLine, rangeItem.endCol)
    );
}

/**
 * 从文本中获取换行数和最后一行的长度
 * @param text
 */
export function getLineCountAndLastLineLength(text: string): {
    lineCount: number;
    lastLineLength: number;
} {
    const re = /\n/g;
    let lineCount = 0;
    let lastLineIndex = 0;
    let match: ReturnType<typeof re.exec>;
    while ((match = re.exec(text))) {
        lineCount++;
        lastLineIndex = match.index;
    }

    const lastLineLength =
        lastLineIndex >= 0
            ? Math.max(text.length - lastLineIndex, 0)
            : text.length;

    return {
        lineCount,
        lastLineLength,
    };
}

export function getRange(text: string, reg: string) {
    let regexp = RegExp(reg, 'mg');
    let matchGroup;
    let res = [];
    let max = text.length;
    let count = 0;
    let lineCount = 0;
    let lineSplit = text.split('\n');

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

    let prevMatchEnd = 0;
    let prevMatchEndCol = 0;
    let prevMatchEndLine = 0;

    const ranges = res.map((match) => {
        const inBetweenText = text.slice(prevMatchEnd, match.start);
        const inBetweenStat = getLineCountAndLastLineLength(inBetweenText);
        // 计算开始节点，
        const startCol =
            inBetweenStat.lineCount > 0
                ? Math.max(inBetweenStat.lastLineLength - 1, 0)
                : inBetweenStat.lastLineLength + prevMatchEndCol;
        const stat = getLineCountAndLastLineLength(match.text);
        const startLineNumber = inBetweenStat.lineCount + prevMatchEndLine;
        const endLineNumber = stat.lineCount + startLineNumber;
        const endCol =
            stat.lineCount > 0
                ? stat.lastLineLength
                : stat.lastLineLength + startCol;

        prevMatchEnd = match.end;
        prevMatchEndCol = endCol;
        prevMatchEndLine = endLineNumber;
        // console.log(startLineNumber, lineSplit);
        const includeText = lineSplit.slice(startLineNumber, endLineNumber + 1).join('\n');
        return {
            startLine: startLineNumber,
            startCol,
            endLine: endLineNumber,
            endCol,
            group: match.group,
            text: match.text,
            includeText,
        };
    });

    return ranges;
}

export function getAllPosition(editor: vscode.TextEditor, reg: string) {
    try {
        if (!isReg(reg)) return [];
        let text = editor.document.getText();
        return getRange(text, reg);
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
export function getMatchRangeList(
    activeEditor: vscode.TextEditor,
    command: ReplaceCommand
) {
    try {
        let positionArray = getAllPosition(activeEditor, command.match);
        let rangeList: Replace.RangeList = [];
        if (positionArray.length) {
            rangeList = positionArray.map((item) => {
                let { group, text } = item;
                // 文字开始和结束范围
                let range = createRangeByRangeItem(item);
                return { group, text, range };
            });
        }
        return rangeList;
    } catch (error) {
        // console.log(error);
        return [];
    }
}
