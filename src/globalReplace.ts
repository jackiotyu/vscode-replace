import * as vscode from 'vscode';
import { MatchResultEvent } from './event';
import { isNullOrUndefined } from './utils/utils';
import { isBinaryFileSync } from 'isbinaryfile';

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
            MatchResultEvent.fire({
                count: 0,
                file: 0,
                list: [],
            });
            return;
        }
        // TODO 遍历文件
        console.log('🚀 match >>', exp);
        const MAX_FILE_SIZE = 10000;
        let uriList = await vscode.workspace.findFiles(
            this.includeExp,
            this.excludeExp,
            MAX_FILE_SIZE
        );
        // res = res.filter(item => {
        //     return vscode.workspace.fs.stat(item).
        // })

        // TODO 排除二进制文件
        // TODO 匹配文件
        let res: vscode.Uri[] = [];

        await Promise.all(
            uriList.map(async (item) => {
                try {
                    let stat = await vscode.workspace.fs.stat(item);
                    console.log('🚀 stat >>', stat);
                    if (
                        stat.permissions !== vscode.FilePermission.Readonly &&
                        !isBinaryFileSync(item.fsPath)
                    ) {
                        res.push(item);
                    }
                } catch (error) {}
            })
        );

        MatchResultEvent.fire({
            count: res.length,
            file: res.length,
            list: res,
        });
        console.log('🚀 res >>', res);
        return '111';
    }
    async replace(exp?: string) {
        this.replaceExp = isNullOrUndefined(exp) ? '' : exp;
        if (isNullOrUndefined(exp) || !canWrite()) return [];
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
