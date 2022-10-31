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
