import { WebviewView } from 'vscode';
import {
    WebviewPayloadType,
    ExtCommandsPayload,
    ExtPayloadType,
    MsgType,
} from './constants';
import { getCommands } from './utils/setting';
import GlobalReplace from './globalReplace';

/**
 * 发送内容给webview，规范payload格式
 * @param webviewView
 * @param payload
 */
function postMessage(webviewView: WebviewView, payload: ExtPayloadType) {
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
    { type, value, id }: WebviewPayloadType,
    webviewView: WebviewView,
    reloadCallback: Function
) {
    // 处理reload事件
    if (type === MsgType.RELOAD) {
        reloadCallback();
        return;
    }

    // 处理获取commands事件
    if (type === MsgType.COMMANDS) {
        const payload: ExtCommandsPayload = {
            type: MsgType.COMMANDS,
            value: getCommands(),
            id,
        };
        postMessage(webviewView, payload);
        return;
    }

    if (type === MsgType.MATCH) {
        // TODO 需要匹配字符串
        GlobalReplace.match(value);
        postMessage(webviewView, { id, type: MsgType.MATCH, value: 'ok' });
        return;
    }

    if (type === MsgType.REPLACE) {
        GlobalReplace.replace(value);
        postMessage(webviewView, { id, type: MsgType.REPLACE, value: 'ok' });
    }

    if (type === MsgType.INCLUDE) {
        GlobalReplace.include(value);
        postMessage(webviewView, { id, type: MsgType.INCLUDE, value: 'ok' });
    }

    if (type === MsgType.EXCLUDE) {
        GlobalReplace.exclude(value);
        postMessage(webviewView, { id, type: MsgType.EXCLUDE, value: 'ok' });
    }
}
