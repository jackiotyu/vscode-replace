import mitt from 'mitt';
import { vscode } from './common';

interface Message {
    type: string;
    value?: any;
}

type Events = {
    sendExt: Message;
    // TODO 规定信息格式
    extMsg: any;
};

const Bus = mitt<Events>();

// 从插件进程发过来的消息
// 监听方式：Bus.on('extMsg', e)
window.onmessage = (e) => {
    Bus.emit('extMsg', e.data);
};

// 传递事件给插件进程
// 使用方式：Bus.emit('sendExt', message)
Bus.on('sendExt', (event) => {
    vscode.postMessage(event);
});

export default Bus;
