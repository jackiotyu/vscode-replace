import { WebviewView } from 'vscode';
import {
    WebviewPayloadType,
    ExtCommandsPayload,
    ExtPayloadType,
    MsgType,
} from './constants';
import { getCommands, saveRule } from './utils/setting';
import GlobalReplace from './globalReplace';
import { StopMatchEvent } from './event';

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
        await GlobalReplace.match(value);
        postMessage(webviewView, { id, type: MsgType.MATCH, value: 'ok' });
        return;
    }

    if (type === MsgType.REPLACE) {
        await GlobalReplace.replace(value);
        postMessage(webviewView, { id, type: MsgType.REPLACE, value: 'ok' });
        return;
    }

    if (type === MsgType.INCLUDE) {
        await GlobalReplace.include(value);
        postMessage(webviewView, { id, type: MsgType.INCLUDE, value: 'ok' });
        return;
    }

    if (type === MsgType.EXCLUDE) {
        await GlobalReplace.exclude(value);
        postMessage(webviewView, { id, type: MsgType.EXCLUDE, value: 'ok' });
        return;
    }

    if (type === MsgType.CHANGE_REPLACE) {
        await GlobalReplace.changeReplace(value);
        postMessage(webviewView, {
            id,
            type: MsgType.CHANGE_REPLACE,
            value: 'ok',
        });
        return;
    }

    if (type === MsgType.STOP_MATCH) {
        StopMatchEvent.fire();
        postMessage(webviewView, { id, type: MsgType.STOP_MATCH, value: 'ok' });
        return;
    }

    if (type === MsgType.SAVE_RULE) {
        await saveRule(value);
        postMessage(webviewView, { id, type: MsgType.SAVE_RULE, value: 'ok' });
    }

    if (type === MsgType.CLEAR_MATCH) {
        GlobalReplace.clearMatch();
        postMessage(webviewView, { id, type: MsgType.CLEAR_MATCH });
    }
}
