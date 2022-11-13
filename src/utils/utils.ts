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
