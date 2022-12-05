import * as vscode from 'vscode';
import { MatchResultEvent, SelectOptionEvent } from '../event';
import {
    MatchResultMap,
    MatchResultItem,
    Command,
    SEARCH_MATCH_FILE_BADGE,
} from '../constants';
import { TreeNode, FileNode, TextNode } from './TreeNode';
import localize from '../localize';

/** treeItem 的 title */
class TreeItemLabel implements vscode.TreeItemLabel {
    /** 文字内容 */
    label: string;
    /** 高亮位置，二维数组，记录起始索引和结束索引 */
    highlights?: [number, number][];
    constructor(label: string, highlights?: [number, number][]) {
        this.label = label;
        this.highlights = highlights;
    }
}

function isFileNodeChild(e: any): e is FileNode {
    return e === undefined;
}

class TreeProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> =
        new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> =
        this._onDidChangeTreeData.event;
    private TreeData: MatchResultMap = new Map();
    protected forceStop: boolean = false;

    constructor() {
        SelectOptionEvent.event(() => {
            this.forceStop = true;
        });
        MatchResultEvent.event((data) => {
            this.forceStop = false;
            this.TreeData = data.map;
            this._onDidChangeTreeData.fire(undefined);
        });
    }

    // TODO 中断构建
    // 获取子级
    async getChildren(
        element?: FileNode | undefined
    ): Promise<TreeNode[] | TextNode[] | undefined> {
        // 文件
        if (element === undefined) {
            return Array.from(this.TreeData.values()).map((item) => {
                const { uri, range } = item;

                const uriWithBadge = uri.with({
                    query: SEARCH_MATCH_FILE_BADGE,
                });
                let treeItem = new FileNode(
                    uriWithBadge,
                    vscode.TreeItemCollapsibleState.Expanded
                );
                treeItem.label = `${uri.fsPath} (${range.length})`;
                treeItem.tooltip = `${uri.fsPath} (${localize(
                    'fileDecoration.matchCount',
                    String(range.length)
                )})`;
                treeItem.contextValue = 'replaceTreeFile';
                treeItem.iconPath = vscode.ThemeIcon.File;
                return treeItem;
            });
        }

        // 具体匹配位置
        await Promise.resolve().then();
        let range = this.TreeData.get(element.resourceUri?.fsPath || '')?.range;
        let dataList: TextNode[] = [];
        if (range) {
            for (let index = 0; index < range.length; index++) {
                const item = range[index];
                const { text, includeText, previewOffset, startCol } = item;
                let currentText = new TreeItemLabel(includeText, [
                    [
                        startCol - previewOffset,
                        startCol - previewOffset + text.length,
                    ],
                ]);
                let treeItem = new TextNode(currentText);
                treeItem.tooltip = includeText;
                treeItem.contextValue = 'replaceTreeItem';
                treeItem.index = index;
                treeItem.command = {
                    command: Command.DOC_REPLACE_EVENT,
                    arguments: [element.resourceUri?.fsPath, item],
                    title: '',
                };
                dataList.push(treeItem);
            }
        }
        return dataList;
    }

    // 构造tree节点
    getTreeItem(element: TreeNode): Thenable<TreeNode> {
        return Promise.resolve(element);
    }
}

// TODO 选项区
export class View {
    protected treeView?: vscode.TreeView<vscode.TreeItem>;
    constructor(context: vscode.ExtensionContext) {
        this.treeView = vscode.window.createTreeView('panel.result', {
            treeDataProvider: new TreeProvider(),
        });
        context.subscriptions.push(this.treeView);
    }
}
