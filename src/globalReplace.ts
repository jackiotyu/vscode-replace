import * as vscode from 'vscode';
import { MatchResultEvent } from './event';
import { isNullOrUndefined } from './utils/utils';
import { MatchResultItem } from './constants';
import { isBinaryFileSync } from 'isbinaryfile';
import { getRange } from './utils/getRange';
import { readFile } from 'fs/promises';

function canWrite() {
    return vscode.workspace.fs.isWritableFileSystem('file');
}

class GlobalReplace {
    protected excludeExp: vscode.GlobPattern = '';
    protected includeExp: vscode.GlobPattern = '';
    protected matchExp: string = '';
    protected replaceExp: string = '';

    async match(exp?: string) {
        this.matchExp = isNullOrUndefined(exp) ? '' : exp;
        if (isNullOrUndefined(exp) || !canWrite()) {
            MatchResultEvent.fire({ count: 0, file: 0, list: [] });
            return;
        }
        const MAX_FILE_SIZE = 10000;
        let uriList = await vscode.workspace.findFiles(
            this.includeExp,
            this.excludeExp,
            MAX_FILE_SIZE
        );
        // res = res.filter(item => {
        //     return vscode.workspace.fs.stat(item).
        // })

        let fileUriList: vscode.Uri[] = [];

        // 排除二进制和不可写入的文件
        await Promise.all(
            uriList.map(async (item) => {
                try {
                    let stat = await vscode.workspace.fs.stat(item);
                    if (
                        stat.permissions !== vscode.FilePermission.Readonly &&
                        !isBinaryFileSync(item.fsPath)
                    ) {
                        // TODO 保持顺序
                        fileUriList.push(item);
                    }
                } catch (error) {}
            })
        );

        let matchResultList: MatchResultItem[] = [];

        // TODO 匹配文件
        await Promise.all(
            fileUriList.map(async (item) => {
                try {
                    const file = await readFile(item.fsPath, 'utf8');
                    const range = getRange(file, this.matchExp);
                    if (range.length) {
                        matchResultList.push({
                            uri: item,
                            range,
                        });
                        console.log('🚀 range >>', range);
                    }
                } catch (error) {}
            })
        );

        MatchResultEvent.fire({
            count: matchResultList.reduce(
                (count, item) => count + item.range?.length,
                0
            ),
            file: matchResultList.length,
            list: matchResultList,
        });
        console.log('🚀 res >>', fileUriList);
    }
    async replace(exp?: string) {
        this.replaceExp = isNullOrUndefined(exp) ? '' : exp;
        if (isNullOrUndefined(exp) || !canWrite()) return [];
        // TODO 执行替换
        console.log('🚀 replace >>', exp);
    }
    async exclude(exp?: vscode.GlobPattern) {
        this.excludeExp = isNullOrUndefined(exp) ? '' : exp;
        this.reloadMatch();
        console.log('🚀 exclude >>', exp);
    }
    async include(exp?: vscode.GlobPattern) {
        this.includeExp = isNullOrUndefined(exp) ? '' : exp;
        this.reloadMatch();
        console.log('🚀include >>', exp);
    }
    reloadMatch() {
        if (this.matchExp !== '') {
            this.match(this.matchExp);
        }
    }
}

export default new GlobalReplace();
