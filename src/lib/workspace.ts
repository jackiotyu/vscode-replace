import * as vscode from 'vscode';
import { Command } from '../constants';
import ContentProvider from '../contentProvider';

class WorkSpaceAdaptor {
    constructor(private readonly workspace: typeof vscode.workspace) {}

    get<T>(configName: string) {
        return this.workspace
            .getConfiguration(Command.EXTENSION_NAME)
            .get(configName) as T;
    }

    // 注册只读文档
    registerTextDocumentContentProvider(
        EXTENSION_SCHEME: string,
        context: ContentProvider
    ) {
        return this.workspace.registerTextDocumentContentProvider(
            EXTENSION_SCHEME,
            context
        );
    }
}

export default WorkSpaceAdaptor;
