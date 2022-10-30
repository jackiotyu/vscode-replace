declare namespace TreeView {
    type TreeItem = import('vscode').TreeItem;

    type EventType = TreeItem | undefined | null | void;

    type SelectOptionType = ReplaceCommand;
}
