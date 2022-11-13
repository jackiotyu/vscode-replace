// import * as vscode from 'vscode';
// import BaseView from './BaseView';
// import { SelectOptionEvent } from '../event';

// class TreeProvider extends BaseView implements vscode.TreeDataProvider<vscode.TreeItem> {
//     items?: vscode.TreeItem[];
//     constructor() {
//         super();
//         SelectOptionEvent.event((command: ReplaceCommand) => {
//             this.setItems(command.match);
//             this.refresh();
//         });
//     }

//     setItems(text: string) {
//         let treeItem = new vscode.TreeItem(text);
//         treeItem.tooltip = '用于匹配的正则表达式';
//         treeItem.description = '用于匹配的正则表达式';
//         this.items = [treeItem];
//     }
// }

// // TODO 选项区
// export class View {
//     constructor(context: vscode.ExtensionContext) {
//         context.subscriptions.push(
//             vscode.window.createTreeView('MatchView', {
//                 treeDataProvider: new TreeProvider(),
//             }),
//         );
//     }
// }
