import * as vscode from 'vscode';
import { MatchResultEvent, StopMatchEvent } from './event';
import { isNullOrUndefined } from './utils/utils';
import { createRangeByRangeItem } from './utils/getRange';
import { MatchResultItem, MatchResult } from './constants';
import { isBinaryFileSync } from 'isbinaryfile';
import isBinaryPath from 'is-binary-path';
import { getRange } from './utils/getRange';
import { getReplaceText } from './utils/getReplaceText';
import { readFile } from 'fs/promises';
import localize from './localize';
import { Command } from './constants';

function canWrite() {
    return vscode.workspace.fs.isWritableFileSystem('file');
}

class GlobalReplace {
    protected excludeExp: vscode.GlobPattern = '';
    protected includeExp: vscode.GlobPattern = '';
    protected matchExp: string = '';
    protected replaceExp: string = '';
    /** 匹配结果 */
    protected matchResult: MatchResult = { count: 0, file: 0, map: new Map() };

    /** 提供给外部读取 */
    getReplaceExp() {
        return this.replaceExp;
    }

    /** 提供给外部读取 */
    getMatchExp() {
        return this.matchExp;
    }

    // TODO 中断搜索
    async match(exp?: string) {
        let stopEvent: vscode.Disposable | null = null;
        let forceStop = false;
        try {
            stopEvent = StopMatchEvent.event(() => {
                forceStop = true;
            });

            this.matchExp = isNullOrUndefined(exp) ? '' : exp;
            if (isNullOrUndefined(exp) || !canWrite()) {
                throw new Error('无法匹配');
            }

            const MAX_FILE_SIZE = 10000;
            let uriList = await vscode.workspace.findFiles(
                this.includeExp,
                this.excludeExp,
                MAX_FILE_SIZE
            );

            let fileUriList: vscode.Uri[] = [];

            // 排除二进制和不可写入的文件
            await Promise.all(
                uriList.map(async (item, index) => {
                    if (forceStop) {
                        throw new Error('强制退出');
                    }
                    try {
                        let stat = await vscode.workspace.fs.stat(item);
                        if (
                            stat.permissions !==
                            vscode.FilePermission.Readonly &&
                            !isBinaryPath(item.fsPath) &&
                            !isBinaryFileSync(item.fsPath)
                        ) {
                            // TODO 保持顺序
                            fileUriList.push(item);
                        }
                    } catch (error) { }
                })
            );

            let matchResultList: MatchResultItem[] = [];
            let matchResultMap: Map<vscode.Uri, MatchResultItem> = new Map();

            // 匹配文件
            await Promise.all(
                fileUriList.map(async (item) => {
                    if (forceStop) {
                        throw new Error('强制退出');
                    }
                    try {
                        const file = await readFile(item.fsPath, 'utf8');
                        const range = getRange(file, this.matchExp);
                        if (range.length) {
                            matchResultMap.set(item, {
                                uri: item,
                                range,
                            });
                        }
                    } catch (error) { }
                })
            );

            if (forceStop) {
                throw new Error('强制退出');
            }

            this.matchResult = {
                count: Array.from(matchResultMap.values()).reduce(
                    (count, item) => count + item.range?.length,
                    0
                ),
                file: matchResultMap.size,
                map: matchResultMap,
            };

            // if (!isNullOrUndefined(this.replaceExp)) {
            //     await this.changeReplace(this.replaceExp);
            // }
        } catch (error) {
            this.matchResult = { count: 0, file: 0, map: new Map() };
            console.log('🚀 error >>', error);
        } finally {
            stopEvent?.dispose();
            MatchResultEvent.fire(this.matchResult);
        }

        // console.log('🚀 this.matchResult >>', this.matchResult);
    }
    async replace(exp?: string) {
        this.replaceExp = isNullOrUndefined(exp) ? '' : exp;
        if (isNullOrUndefined(exp) || !canWrite()) return;

        // 判断是合法的js表达式
        if (!this.validateJSExpression(exp)) {
            return;
        }

        // 执行替换
        const list = [...this.matchResult.map.values()].reverse();
        list.forEach(async (item, index) => {
            const workspaceEdit = new vscode.WorkspaceEdit();
            [...item.range].reverse().forEach((rangeItem) => {
                const range = createRangeByRangeItem(rangeItem);
                const newText = getReplaceText(
                    this.replaceExp,
                    rangeItem.text,
                    ...rangeItem.group
                );
                workspaceEdit.replace(item.uri, range, newText);
            });
            this.matchResult.map.delete(item.uri);
            this.matchResult.count -= item.range.length;
            this.matchResult.file = this.matchResult.map.size;
            // 更新 tree view
            MatchResultEvent.fire(this.matchResult);
            // // 直接替换整个文本内容
            // const doc = await vscode.workspace.openTextDocument(item.uri);
            // const workspaceEdit = new vscode.WorkspaceEdit();
            // const lineNumber = Math.max(doc.lineCount - 1, 0);
            // const lastLine = doc.lineAt(lineNumber);
            // const range = new vscode.Range(
            //     new vscode.Position(0, 0),
            //     new vscode.Position(
            //         lineNumber,
            //         lastLine.rangeIncludingLineBreak.end.character
            //     )
            // );
            // workspaceEdit.replace(item.uri, range, item.replaceText);
            vscode.workspace.applyEdit(workspaceEdit);
        });
    }
    async exclude(exp?: vscode.GlobPattern) {
        this.excludeExp = isNullOrUndefined(exp) ? '' : exp;
        await this.reloadMatch();
    }
    async include(exp?: vscode.GlobPattern) {
        this.includeExp = isNullOrUndefined(exp) ? '' : exp;
        await this.reloadMatch();
    }
    changeReplace(exp?: string) {
        this.replaceExp =
            isNullOrUndefined(exp) || !this.validateJSExpression(exp)
                ? ''
                : exp;
    }
    // /**
    //  * TODO 修改匹配内容后，更新实时预览效果
    //  * @param exp
    //  * @param update 更新 tree view 数据
    //  */
    // async changeReplace(exp?: string, update: boolean = false) {
    //     this.replaceExp = isNullOrUndefined(exp) ? '' : exp;
    //     // 判断是合法的js表达式
    //     if (!this.validateJSExpression(exp)) {
    //         return;
    //     }

    //     // TODO 需要优化
    //     await this.matchResult?.list.map(async (item) => {
    //         let doc = await vscode.workspace.openTextDocument(item.uri);
    //         let docText = doc.getText();
    //         docText = docText;
    //         // 直接获取替换的完整文本
    //         item.replaceText = docText.replace(
    //             RegExp(this.matchExp, 'mg'),
    //             (text, ...args) => {
    //                 return getReplaceText(this.replaceExp, text, ...args);
    //             }
    //         );
    //     });

    //     if (update && this.matchResult) {
    //         MatchResultEvent.fire(this.matchResult);
    //     }
    // }
    validateJSExpression(exp?: string): boolean {
        let expError = null;
        try {
            getReplaceText(exp, '', ...Array.from({ length: 99 }, () => ''));
        } catch (error: any) {
            expError = error;
        }

        if (expError) {
            vscode.window.showWarningMessage(
                localize(
                    'transform.error.analysisJs',
                    Command.EXTENSION_NAME,
                    '',
                    expError
                )
            );
            return false;
        }
        return true;
    }
    reloadMatch() {
        if (this.matchExp !== '') {
            return this.match(this.matchExp);
        }
    }
    clearMatch() {
        this.matchResult = { count: 0, file: 0, map: new Map() };
        MatchResultEvent.fire(this.matchResult);
    }
}

export default new GlobalReplace();
