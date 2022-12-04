import * as vscode from 'vscode';
import { MatchResultEvent, SelectOptionEvent } from '../event';
import {
    MatchResult,
    MatchResultItem,
    Command,
    SEARCH_MATCH_COUNT_STR,
} from '../constants';
import { TreeNode, FileNode, TextNode } from './TreeNode';

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
    private TreeData: MatchResultItem[] = [];
    protected forceStop: boolean = false;

    constructor() {
        SelectOptionEvent.event(() => {
            this.forceStop = true;
        });
        MatchResultEvent.event((data) => {
            this.forceStop = false;
            this.TreeData = Array.from(data.map.values());
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
            return this.TreeData.map((item) => {
                const { uri, range } = item;
                const uriWithCount = uri.with({
                    query: `${SEARCH_MATCH_COUNT_STR}${range.length}`,
                });
                let treeItem = new FileNode(
                    uriWithCount,
                    range.length <= 20
                        ? vscode.TreeItemCollapsibleState.Expanded
                        : vscode.TreeItemCollapsibleState.Collapsed
                );
                treeItem.tooltip = uri.path;
                treeItem.range = range;
                treeItem.contextValue = 'replaceTreeFile';
                treeItem.iconPath = vscode.ThemeIcon.File;
                return treeItem;
            });
        }

        // 具体匹配位置
        return element?.range.map((item, index) => {
            const { text, includeText, startCol } = item;
            // 当前展示内容
            let end = startCol + text.length;
            // [0, end]
            let offset = 0;
            let textBoxWidth = 15;
            if (text.length > textBoxWidth) {
                offset = startCol;
            } else {
                end >= textBoxWidth
                    ? (offset = end - textBoxWidth)
                    : (offset = startCol);
            }
            let currentText = new TreeItemLabel(includeText.slice(offset), [
                [startCol - offset, startCol - offset + text.length],
            ]);
            let treeItem = new TextNode(currentText);
            treeItem.tooltip = new vscode.MarkdownString(includeText);
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            treeItem.contextValue = 'replaceTreeItem';
            treeItem.index = index;
            treeItem.uri = element.resourceUri;
            treeItem.command = {
                command: Command.DOC_REPLACE_EVENT,
                arguments: [element.resourceUri, item],
                title: '',
            };
            return treeItem;
        });
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
