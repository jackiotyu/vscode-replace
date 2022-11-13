import mitt from 'mitt';
import { vscode } from './common';
import { ExtPayloadType, WebviewPayloadType } from '@ext/src/constants';

type Events = {
    sendExt: WebviewPayloadType;
    // TODO 规定信息格式
    extMsg: ExtPayloadType;
};

const Bus = mitt<Events>();

// 从插件进程发过来的消息
// 监听方式：Bus.on('extMsg', e)
window.onmessage = (e) => {
    if (e.data.type) {
        Bus.emit('extMsg', e.data);
    }
};

// 传递事件给插件进程
// 使用方式：Bus.emit('sendExt', message)
Bus.on('sendExt', (event) => {
    vscode.postMessage(event);
});

export function sendMsg(message: WebviewPayloadType) {
    return new Promise<ExtPayloadType>((resolve) => {
        Bus.emit('sendExt', message);

        const cb = (data: any) => {
            console.log('e', data);
            if (data.id === message.id) {
                resolve(data);
                Bus.off('extMsg', cb);
            }
        };

        Bus.on('extMsg', cb);
    });
}

export default Bus;
