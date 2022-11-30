import { SelectCommand, PickCommand } from '../common';

export function isPickCommand(command: SelectCommand): command is PickCommand {
    if (typeof (command as PickCommand).button !== 'undefined') {
        return true;
    }
    return false;
}

export function isUndefined(command: any): command is undefined {
    if (typeof command === 'undefined') {
        return true;
    }
    return false;
}

export function isReg(reg: string): boolean {
    try {
        RegExp(reg, 'g');
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 判断是否为null或undefined
 * @param str
 * @returns
 */
export function isNullOrUndefined(str: any): str is undefined | null {
    return str === null || str === undefined;
}

/**
 * 生成id
 * @returns id
 */
export function genID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * 根据key对数组元素去重
 * @param array
 * @param key
 * @returns
 */
export function uniqueListByKey(array: any[], key: string) {
    let idSet = new Set();
    let uniqueList = array.reverse().filter((item) => {
        if (!idSet.has(item[key])) {
            idSet.add(item[key]);
            return true;
        }
        return false;
    });
    return uniqueList.reverse();
}
