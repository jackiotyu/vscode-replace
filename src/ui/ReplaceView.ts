// import * as vscode from 'vscode';
// import BaseView from './BaseView';
// import { SelectOptionEvent } from '../event';
// import { ReplaceCommand } from '../common';

// class TreeProvider
//     extends BaseView
//     implements vscode.TreeDataProvider<vscode.TreeItem>
// {
//     expression?: RegExp;
//     items?: vscode.TreeItem[];
//     constructor() {
//         super();
//         SelectOptionEvent.event((command: ReplaceCommand) => {
//             this.setItems(command.replace);
//             this.refresh();
//         });
//     }
//     setItems(replace: string) {
//         let treeItem = new vscode.TreeItem(replace);
//         treeItem.tooltip = '用于替换的js表达式';
//         treeItem.description = '用于替换的js表达式';
//         this.items = [treeItem];
//     }
// }

// // TODO 选项区
// export class View {
//     constructor(context: vscode.ExtensionContext) {
//         context.subscriptions.push(
//             vscode.window.createTreeView('ReplaceView', {
//                 treeDataProvider: new TreeProvider(),
//             })
//         );
//     }
// }
