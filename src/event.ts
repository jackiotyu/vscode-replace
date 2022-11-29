import * as vscode from 'vscode';
import { MatchResult } from './constants';

export const SelectOptionEvent =
    new vscode.EventEmitter<TreeView.SelectOptionType>();
export const MatchResultEvent = new vscode.EventEmitter<MatchResult>();
