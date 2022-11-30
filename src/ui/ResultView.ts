import * as vscode from 'vscode';
import { MatchResultEvent, SelectOptionEvent } from '../event';
import { MatchResult, MatchResultItem, RangeItem, Command } from '../constants';
import { url } from 'inspector';

class FileNode extends vscode.TreeItem {
    range: RangeItem[] = [];
    replaceText: string = '';
}

class TextNode extends vscode.TreeItem { }

type TreeNode = FileNode | TextNode;

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
    ): vscode.ProviderResult<vscode.TreeItem[]> {
        if (this.forceStop) {
            return;
        }
        // 文件
        if (element === undefined) {
            return this.TreeData.map((item) => {
                const { uri, range } = item;

                let treeItem = new FileNode(
                    uri,
                    range.length <= 20
                        ? vscode.TreeItemCollapsibleState.Expanded
                        : vscode.TreeItemCollapsibleState.Collapsed
                );
                treeItem.tooltip = uri.path;
                treeItem.range = range;
                treeItem.iconPath = vscode.ThemeIcon.File;
                return treeItem;
            });
        }

        // 具体匹配位置
        return element.range.map((item) => {
            const { text } = item;
            let treeItem = new vscode.TreeItem(text);
            // TODO 展示当前行的匹配位置
            treeItem.tooltip = new vscode.MarkdownString('*' + `${text}` + '*');
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
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
        if (this.forceStop) {
            return Promise.reject();
        }
        return Promise.resolve(element);
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
