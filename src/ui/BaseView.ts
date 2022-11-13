import * as vscode from 'vscode';

type EventType = TreeView.EventType;

class BaseView implements vscode.TreeDataProvider<vscode.TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<EventType> = new vscode.EventEmitter<EventType>();
    readonly onDidChangeTreeData: vscode.Event<EventType> = this._onDidChangeTreeData.event;
    items?: vscode.TreeItem[];
    refresh() {
        this._onDidChangeTreeData.fire();
    }

    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        return this.items;
    }

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
    getParent(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
        return null;
    }
}

export default BaseView;
