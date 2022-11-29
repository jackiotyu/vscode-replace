import * as vscode from 'vscode';
import { MatchResultEvent } from '../event';

class TreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<any> =
        new vscode.EventEmitter<any>();
    readonly onDidChangeTreeData: vscode.Event<any> =
        this._onDidChangeTreeData.event;
    private TreeData: vscode.Uri[] = [];

    constructor() {
        MatchResultEvent.event((data) => {
            this.TreeData = data.list;
            this._onDidChangeTreeData.fire(undefined);
        });
    }

    getChildren(
        element?: vscode.TreeItem | undefined
    ): vscode.ProviderResult<vscode.TreeItem[]> {
        return this.TreeData.map((item) => {
            let treeItem = new vscode.TreeItem(item.path);
            treeItem.tooltip = item.path;
            treeItem.resourceUri = item;
            return treeItem;
        });

        // let treeItem = new vscode.TreeItem('结果区');
        // treeItem.tooltip = '替换结果';
        // treeItem.description = '替换结果';
        // return [treeItem, treeItem, treeItem];
    }
    getTreeItem(
        element: vscode.TreeItem
    ): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getParent(
        element: vscode.TreeItem
    ): vscode.ProviderResult<vscode.TreeItem> {
        return null;
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
