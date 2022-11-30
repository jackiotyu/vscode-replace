import mitt from 'mitt';
import { vscode } from './common';
import {
    ExtPayloadType,
    WebviewPayloadType,
    WebviewReloadMsg,
    ExtDefaultPayload,
    WebviewMatchMsg,
    WebviewCommandsMsg,
    ExtCommandsPayload,
    WebviewReplaceMsg,
    MsgType,
    WebviewIncludeMsg,
    WebviewExcludeMsg,
    WebviewStopMatchMsg,
    WebviewChangeReplaceMsg,
    WebviewSaveRuleMsg,
    WebviewClearMatchMsg,
    ExtMatchResultPayload,
} from '@ext/src/constants';

// 规定信息格式
type Events = {
    sendExt: WebviewPayloadType;
    extMsg: ExtPayloadType;
    matchResultMsg: ExtMatchResultPayload;
    commands: WebviewCommandsMsg;
};

const Bus = mitt<Events>();

// 从插件进程发过来的消息
// 监听方式：Bus.on('extMsg', e)
window.onmessage = (e) => {
    const data = e.data;
    if (data && 'id' in data && 'type' in data) {
        if (data.type === MsgType.MATCH_RESULT) {
            return Bus.emit('matchResultMsg', e.data);
        }
        if (data.type === MsgType.COMMANDS) {
            Bus.emit('commands', e.data);
        }
        Bus.emit('extMsg', e.data);
    }
};

// 传递事件给插件进程
// 使用方式：Bus.emit('sendExt', message)
Bus.on('sendExt', (event) => {
    vscode.postMessage(event);
});

/**
 * 发送消息给插件进程
 * @param message 消息内容
 * @returns
 */
export function sendMsg(
    message: WebviewCommandsMsg
): Promise<ExtCommandsPayload>;
export function sendMsg(
    message:
        | WebviewMatchMsg
        | WebviewReplaceMsg
        | WebviewIncludeMsg
        | WebviewExcludeMsg
        | WebviewChangeReplaceMsg
        | WebviewStopMatchMsg
        | WebviewSaveRuleMsg
        | WebviewClearMatchMsg
): Promise<ExtDefaultPayload>;
export function sendMsg(message: WebviewReloadMsg): Promise<void>;
export function sendMsg<U extends WebviewPayloadType, T extends ExtPayloadType>(
    message: U
) {
    return new Promise<T | void>((resolve) => {
        Bus.emit('sendExt', message);

        if (message.type === MsgType.RELOAD) {
            return resolve();
        }

        const cb = (data: any) => {
            console.log('e', data, message.id, message.type);
            if ('id' in data && data.id === message.id) {
                resolve(data);
                Bus.off('extMsg', cb);
            }
        };

        Bus.on('extMsg', cb);
    });
}

export default Bus;
