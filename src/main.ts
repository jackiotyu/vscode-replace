import * as vscode from 'vscode';
import { setMatchTextHighlight, cancelDecoration } from './utils/decoration';
import { pickCommand } from './utils/modal';
import { isPickCommand, isUndefined } from './utils/utils';
import { Command } from './constants';
import { getMatchRangeList } from './utils/getRange';
import { markChange, restoreText } from './utils/getReplaceText';
import localize from './localize';

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
            title: localize('transform.match.input.title'),
            placeHolder: localize('transform.match.input.placeHolder'),
            value: command.match,
            prompt: localize('transform.match.input.prompt'),
            validateInput(value) {
                try {
                    command.match = value;
                    cancelDecoration();
                    rangeList = getMatchRangeList(activeEditor, command);
                    if (!rangeList.length) {
                        return localize('transform.error.unmatch');
                    }
                    setMatchTextHighlight(
                        activeEditor,
                        rangeList.map((i) => i.range),
                    );
                    return null;
                } catch (error: any) {
                    return error?.message;
                }
            },
        });

        if (!matched) {
            cancelDecoration();
            return;
        }

        let contentList = getContentList(rangeList);

        // 实现修改预览
        let res = await vscode.window.showInputBox({
            title: localize('transform.replace.input.title'),
            placeHolder: localize('transform.replace.input.placeHolder'),
            value: command.replace,
            prompt: localize('transform.replace.input.prompt'),
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
            vscode.window.showWarningMessage(`${Command.EXTENSION_NAME}: ${localize('transform.error.unmatch')}`);
            return;
        }
        let contentList = getContentList(rangeList);

        try {
            let errorInfo = await markChange(command.replace, activeEditor, contentList, command);
            if (errorInfo) {
                throw new Error(errorInfo);
            }
        } catch (error: any) {
            // console.error(error);
            vscode.window.showWarningMessage(
                localize('transform.error.analysisJs', Command.EXTENSION_NAME, command.name, error),
                // `${Command.EXTENSION_NAME}: 解析出错了！\n请检查命令 "${command.name}" 语法是否有错误\n${error}`,
            );
            restoreText(activeEditor, contentList);
            return;
        }
        // 确认替换
        let pickOptions = [localize('common.action.confirm'), localize('common.action.cancel')];
        let confirm = await vscode.window.showInformationMessage(
            localize('transform.action.replace.confirm'),
            ...pickOptions,
        );
        cancelDecoration();
        if (confirm !== pickOptions[0]) {
            restoreText(activeEditor, contentList);
        }
    }
}

export { transform };
