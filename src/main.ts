import * as vscode from 'vscode';
import * as vm from 'vm';
import { getAllPosition } from './utils/getRange';
import { setMatchTextHighlight, cancelDecoration } from './utils/decoration';
import { getSetting } from './utils/setting';
import { pickCommand } from './utils/modal';
import { isPickCommand, isUndefined } from './utils/utils';
import { Command, DefaultSetting } from './constants';

// 获取需要执行的命令
async function getCommand() {
    let command = await pickCommand();
    return command;
}

/**
 * 获取替换后的内容
 * @param command 设置的替换配置
 * @param text 匹配的文本
 * @param args
 * @returns
 */
function getReplaceText(command: ReplaceCommand, text: string, ...args: string[]) {
    const { replace } = command;

    if (replace === '' || replace === undefined) {
        throw new Error('请输入替换的js表达式');
    }

    const { prefix, match } = getSetting();

    let prefixKey = prefix || DefaultSetting.PREFIX_KEY;
    let paramMap: Record<string, string> = {
        [match || DefaultSetting.MATCH_KEY]: text,
    };

    args.forEach((item, index) => {
        paramMap[`${prefixKey}${index + 1}`] = item;
    });

    // 使用vm模块运行replace内容，获取运行结果
    let context = vm.createContext(paramMap);
    return vm.runInContext(replace || '""', context);
}

/**
 * 获取匹配的范围数组
 * @param activeEditor
 * @param command
 * @returns
 */
function getMatchRangeList(activeEditor: vscode.TextEditor, command: ReplaceCommand) {
    let positionArray = getAllPosition(activeEditor, command.match);
    console.log('positionArray', positionArray);
    let rangeList: Replace.RangeList = [];
    if (positionArray.length) {
        rangeList = positionArray.map((item) => {
            let { line, start, end, group, text } = item;
            // 文字开始和结束范围
            let range = new vscode.Range(new vscode.Position(line, start), new vscode.Position(line, end));
            return {
                group,
                text,
                range,
            };
        });
    }
    return rangeList;
}

function restoreText(activeEditor: vscode.TextEditor, contentList: Replace.replaceRangeWithContent[]) {
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
        },
    );
}

async function markChange(
    value: string,
    activeEditor: vscode.TextEditor,
    contentList: Replace.replaceRangeWithContent[],
    command: ReplaceCommand,
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
            let replaceText = getReplaceText(command, originContent, ...group);
            replaceOperationList.push({ text: replaceText, range: previewRange });
            const oldRange = previewRange;
            const expandedTextLines = replaceText.split('\n');
            const oldLine = oldRange.end.line - oldRange.start.line + 1;
            const lineIncrease = expandedTextLines.length - oldLine;

            let newStartLine = oldRange.start.line + totalLineIncrease;
            let newStart = oldRange.start.character;
            const newEndLine = oldRange.end.line + totalLineIncrease + lineIncrease;

            let newEnd = expandedTextLines[expandedTextLines.length - 1].length;
            if (index > 0 && newEndLine === lastNewRange.end.line) {
                newStart = lastNewRange.end.character + (oldRange.start.character - lastOldRange.end.character);
                newEnd += newStart;
            } else if (index > 0 && newStartLine === lastNewRange.end.line) {
                newStart = lastNewRange.end.character + (oldRange.start.character - lastOldRange.end.character);
            } else if (expandedTextLines.length === 1) {
                newEnd += oldRange.start.character;
            }

            lastOldRange = item.previewRange;
            item.previewRange = lastNewRange = new vscode.Range(newStartLine, newStart, newEndLine, newEnd);

            totalLineIncrease += lineIncrease;
        } catch (error) {
            console.log(error, 'error');
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
            { undoStopBefore: false, undoStopAfter: false },
        );
    }

    if (errorInfo) {
        await restoreText(activeEditor, contentList);
    } else {
        setMatchTextHighlight(
            activeEditor,
            contentList.map((i) => i.previewRange),
        );
    }
    return errorInfo;
}

function getContentList(rangeList: Replace.RangeList): Replace.replaceRangeWithContent[] {
    return rangeList.map(({ range, group, text }) => {
        return {
            originContent: text,
            originRange: range,
            previewRange: range,
            group,
        };
    });
}

async function transform(activeEditor: vscode.TextEditor) {
    let selectCommand = await getCommand();
    if (isUndefined(selectCommand)) return;

    let command: ReplaceCommand;
    let rangeList: Replace.RangeList = [];

    if (isPickCommand(selectCommand)) {
        // TODO 修改处理
        command = { ...selectCommand.command };
        let matched = await vscode.window.showInputBox({
            title: '输入匹配文本的正则表达式',
            placeHolder: '请输入正则表达式',
            value: command.match,
            prompt: '不需要加上前后的/，例如：[0-9]+ 代表 /[0-9]+/g',
            validateInput(value) {
                command.match = value;
                cancelDecoration();
                rangeList = getMatchRangeList(activeEditor, command);
                console.log(rangeList, 'rangeList');
                if (!rangeList.length) {
                    return '未匹配到替换内容';
                }
                setMatchTextHighlight(
                    activeEditor,
                    rangeList.map((i) => i.range),
                );
                return null;
            },
        });

        if (!matched) {
            return;
        }

        let contentList = getContentList(rangeList);

        // 实现修改预览
        let res = await vscode.window.showInputBox({
            title: '输入替换文本的正则表达式',
            placeHolder: '请输入js表达式',
            value: command.replace,
            prompt: '例如：`${$1 + 2}`',
            async validateInput(value) {
                return markChange(value, activeEditor, contentList, command);
            },
        });
        if (!res) {
            restoreText(activeEditor, contentList);
        }
        cancelDecoration();
    } else {
        command = { ...selectCommand };
        rangeList = getMatchRangeList(activeEditor, command);
        if (!rangeList.length) {
            vscode.window.showWarningMessage(`${Command.EXTENSION_NAME}: 未匹配到替换内容`);
            return;
        }
        let contentList = getContentList(rangeList);

        try {
            let errorInfo = await markChange(command.replace, activeEditor, contentList, command);
            if (errorInfo) {
                throw new Error(errorInfo);
            }
        } catch (error: any) {
            console.error(error);
            vscode.window.showWarningMessage(
                `${Command.EXTENSION_NAME}: 解析出错了！\n请检查命令 "${command.name}" 语法是否有错误\n${error}`,
            );
            restoreText(activeEditor, contentList);
            return;
        }
        // 确认替换
        let pickOptions = ['确认', '取消'];
        let confirm = await vscode.window.showInformationMessage('确认替换？', ...pickOptions);
        cancelDecoration();
        if (confirm === pickOptions[1]) {
            restoreText(activeEditor, contentList);
        }
    }
}

export { transform };
