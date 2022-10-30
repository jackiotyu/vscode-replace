import * as vscode from 'vscode';
import { View as MatchView } from './MatchView';
import { View as OptionView } from './OptionView';
import { View as ReplaceView } from './ReplaceView';
import { View as ResultView } from './ResultView';
import { StatusBar } from './StatusBar';

export class ReplaceExplorer {
    constructor(context: vscode.ExtensionContext) {
        new MatchView(context);
        new OptionView(context);
        new ReplaceView(context);
        new ResultView(context);
        new StatusBar(context);
    }
}
