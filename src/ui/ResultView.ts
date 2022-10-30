import * as vscode from 'vscode';

class TreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]> {
        let treeItem = new vscode.TreeItem('结果区');
        treeItem.tooltip = '替换结果';
        treeItem.description = '替换结果';
        return [treeItem, treeItem, treeItem];
    }
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getParent(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> {
        return null;
    }
}

// TODO 选项区
export class View {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.window.createTreeView('ResultView', {
                treeDataProvider: new TreeProvider(),
            }),
        );
    }
}
