import * as vscode from 'vscode';
import * as vm from 'vm';
import { getSetting } from './setting';
import { DefaultSetting } from '../constants';
import { cancelDecoration, setMatchTextHighlight } from './decoration';
import localize from '../localize';
import * as ChangeCase from 'change-case';

/**
 * 获取替换后的内容
 * @param command 设置的替换配置
 * @param index 序号
 * @param text 匹配的文本
 * @param args
 * @returns
 */
export function getReplaceText(
    command: ReplaceCommand,
    index: number,
    text: string,
    ...args: string[]
) {
    const { replace } = command;

    if (replace === '' || replace === undefined) {
        throw new Error(localize('transform.action.replace.confirm'));
    }

    const { prefix, match, order, orderOffset } = getSetting();

    let prefixKey = prefix || DefaultSetting.PREFIX_KEY;
    let paramMap: Record<string, any> = {
        [match || DefaultSetting.MATCH_KEY]: text,
    };
    paramMap[order || DefaultSetting.ORDER_KEY] =
        index + (orderOffset || DefaultSetting.ORDER_OFFSET);
    args.forEach((item, index) => {
        paramMap[`${prefixKey}${index + 1}`] = item;
    });

    paramMap.ChangeCase = ChangeCase;

    // 使用vm模块运行replace内容，获取运行结果
    let context = vm.createContext(paramMap);
    let result = vm.runInContext(replace || '""', context, {
        timeout: 6000,
        displayErrors: true,
    });
    // 类型保护，引用类型和undefined不返回
    let resultType = typeof result;
    if (
        ['object', 'function', 'undefined'].includes(resultType) &&
        result !== null
    ) {
        throw new SyntaxError(localize('replace.error.notString'));
    }
    return String(result);
}

export function restoreText(
    activeEditor: vscode.TextEditor,
    contentList: Replace.replaceRangeWithContent[]
) {
    cancelDecoration();
    return activeEditor.edit(
        (builder) => {
            contentList.forEach((item, index) => {
                builder.replace(item.previewRange, item.originContent);
                item.previewRange = item.originRange;
            });
        },
        {
            undoStopAfter: false,
            undoStopBefore: false,
        }
    );
}

export async function markChange(
    value: string,
    activeEditor: vscode.TextEditor,
    contentList: Replace.replaceRangeWithContent[],
    command: ReplaceCommand
) {
    command.replace = value;
    let errorInfo = null;
    let lastOldRange = new vscode.Range(0, 0, 0, 0);
    let lastNewRange = new vscode.Range(0, 0, 0, 0);
    let totalLineIncrease = 0;

    let replaceOperationList: { range: vscode.Range; text: string }[] = [];

    contentList.some((item, index) => {
        let { originContent, previewRange, group } = item;
        try {
            // FIXME 优化替换
            let replaceText = getReplaceText(
                command,
                index,
                originContent,
                ...group
            );

            replaceOperationList.push({
                text: replaceText,
                range: previewRange,
            });
            const oldRange = previewRange;
            const expandedTextLines = replaceText.split('\n');
            const oldLine = oldRange.end.line - oldRange.start.line + 1;
            const lineIncrease = expandedTextLines.length - oldLine;

            let newStartLine = oldRange.start.line + totalLineIncrease;
            let newStart = oldRange.start.character;
            const newEndLine =
                oldRange.end.line + totalLineIncrease + lineIncrease;

            let newEnd = expandedTextLines[expandedTextLines.length - 1].length;
            if (index > 0 && newEndLine === lastNewRange.end.line) {
                newStart =
                    lastNewRange.end.character +
                    (oldRange.start.character - lastOldRange.end.character);
                newEnd += newStart;
            } else if (index > 0 && newStartLine === lastNewRange.end.line) {
                newStart =
                    lastNewRange.end.character +
                    (oldRange.start.character - lastOldRange.end.character);
            } else if (expandedTextLines.length === 1) {
                newEnd += oldRange.start.character;
            }

            lastOldRange = item.previewRange;
            item.previewRange = lastNewRange = new vscode.Range(
                newStartLine,
                newStart,
                newEndLine,
                newEnd
            );

            totalLineIncrease += lineIncrease;
        } catch (error) {
            // console.warn(error, 'error');
            return (errorInfo = error);
        }
        return false;
    });

    if (replaceOperationList.length) {
        await activeEditor.edit(
            (builder) => {
                replaceOperationList.forEach((item) => {
                    builder.replace(item.range, item.text);
                });
            },
            { undoStopBefore: false, undoStopAfter: false }
        );
    }

    if (errorInfo) {
        await restoreText(activeEditor, contentList);
    } else {
        setMatchTextHighlight(
            activeEditor,
            contentList.map((i) => i.previewRange)
        );
    }
    return errorInfo;
}
