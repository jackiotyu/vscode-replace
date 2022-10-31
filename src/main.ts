import * as vscode from 'vscode';
import { setMatchTextHighlight, cancelDecoration } from './utils/decoration';
import { pickCommand } from './utils/modal';
import { isPickCommand, isUndefined } from './utils/utils';
import { Command } from './constants';
import { getMatchRangeList } from './utils/getRange';
import { markChange, restoreText } from './utils/getReplaceText';

// 获取需要执行的命令
async function getCommand() {
    let command = await pickCommand();
    return command;
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
                console.log(value, 'value');
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
