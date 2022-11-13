import * as vscode from 'vscode';
import {
    WebviewMsgType,
    ExtMsgType,
    WebviewPayloadType,
    ExtCommandsPayload,
    ExtPayloadType,
} from './constants';
import { getCommands } from './utils/setting';
import { genID } from './utils/utils';

/**
 * 发送内容给webview，规范payload格式
 * @param webviewView
 * @param payload
 */
function postMessage(webviewView: vscode.WebviewView, payload: ExtPayloadType) {
    webviewView.webview.postMessage(payload);
}

/**
 * 统一处理webview事件
 * @param param0
 * @param webviewView
 * @param reloadCallback
 * @returns
 */
export default async function WebviewEventHandler(
    { type, value }: WebviewPayloadType,
    webviewView: vscode.WebviewView,
    reloadCallback: Function
) {
    // 处理reload事件
    if (type === WebviewMsgType.RELOAD) {
        reloadCallback();
        return;
    }

    // 处理获取commands事件
    if (type === WebviewMsgType.COMMANDS) {
        const payload: ExtCommandsPayload = {
            type: ExtMsgType.COMMANDS,
            value: getCommands(),
            id: genID(),
        };
        postMessage(webviewView, payload);
        return;
    }

    if (type === 'error') {
        vscode.window.showErrorMessage(value);
    }
}
