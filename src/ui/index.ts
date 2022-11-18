import * as vscode from 'vscode';
// import { WebViewPanelProvider } from './WebAppPanel';
// import { View as MatchView } from './MatchView';
// import { View as OptionView } from './OptionView';
// import { View as ReplaceView } from './ReplaceView';
// import { View as ResultView } from './ResultView';
import { StatusBar } from './StatusBar';

export class ReplaceExplorer {
    constructor(context: vscode.ExtensionContext) {
        // let webview = new WebViewPanelProvider(context, context.extensionUri);
        // new MatchView(context);
        // new OptionView(context);
        // new ReplaceView(context);
        // new ResultView(context);
        new StatusBar(context);
        // WebAppPanel.createOrShow(context.extensionUri);
        // context.subscriptions.push(
        //     vscode.window.registerWebviewViewProvider(
        //         WebViewPanelProvider.viewType,
        //         webview
        //     )
        // );
    }
}
