import * as vscode from 'vscode';
import { MatchResultEvent, SelectOptionEvent } from '../event';
import {
    MatchResultMap,
    MatchResultItem,
    Command,
    SEARCH_MATCH_COUNT_STR,
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
    getChildren(
        element?: FileNode | undefined
    ): vscode.ProviderResult<TreeNode[]> {
        // 文件
        if (element === undefined) {
            return Array.from(this.TreeData.values()).map((item) => {
                const { uri, range } = item;
                let treeItem = new FileNode(
                    uri,
                    range.length <= 20
                        ? vscode.TreeItemCollapsibleState.Expanded
                        : vscode.TreeItemCollapsibleState.Collapsed
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
        return this.TreeData.get(element.resourceUri?.fsPath || '')?.range.map(
            (item, index) => {
                const { text, includeText, previewOffset, startCol } = item;
                let currentText = new TreeItemLabel(
                    includeText.slice(previewOffset),
                    [
                        [
                            startCol - previewOffset,
                            startCol - previewOffset + text.length,
                        ],
                    ]
                );
                let treeItem = new TextNode(currentText);
                treeItem.tooltip = new vscode.MarkdownString(includeText);
                treeItem.collapsibleState =
                    vscode.TreeItemCollapsibleState.None;
                treeItem.contextValue = 'replaceTreeItem';
                treeItem.index = index;
                treeItem.command = {
                    command: Command.DOC_REPLACE_EVENT,
                    arguments: [element.resourceUri?.fsPath, item],
                    title: '',
                };
                return treeItem;
            }
        );
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
