import * as vscode from 'vscode';
import { MatchResultEvent } from '../event';
import { MatchResult, MatchResultItem, rangeItem } from '../constants';
import { url } from 'inspector';

class FileNode extends vscode.TreeItem {
    range: rangeItem[] = [];
}

class TextNode extends vscode.TreeItem {}

type TreeNode = FileNode | TextNode;

class TreeProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> =
        new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> =
        this._onDidChangeTreeData.event;
    private TreeData: MatchResultItem[] = [];

    constructor() {
        MatchResultEvent.event((data) => {
            this.TreeData = data.list;
            this._onDidChangeTreeData.fire(undefined);
        });
    }

    // 获取子级
    getChildren(
        element?: FileNode | undefined
    ): vscode.ProviderResult<vscode.TreeItem[]> {
        if (element === undefined) {
            return this.TreeData.map((item) => {
                const { uri, range } = item;
                let treeItem = new FileNode(
                    uri,
                    vscode.TreeItemCollapsibleState.Expanded
                );
                treeItem.tooltip = uri.path;
                treeItem.range = range;
                treeItem.iconPath = vscode.ThemeIcon.File;
                return treeItem;
            });
        }

        return element.range.map((item) => {
            const { text, start, end, group } = item;
            let treeItem = new vscode.TreeItem(text);
            treeItem.tooltip = text;
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            return treeItem;
        });
    }

    // 构造tree节点
    getTreeItem(element: TreeNode): TreeNode | Thenable<TreeNode> {
        return element;
    }
}

// TODO 选项区
export class View {
    protected treeView?: vscode.TreeView<vscode.TreeItem>;
    constructor(context: vscode.ExtensionContext) {
        this.treeView = vscode.window.createTreeView('panel:result', {
            treeDataProvider: new TreeProvider(),
        });
        context.subscriptions.push(this.treeView);
    }
}
