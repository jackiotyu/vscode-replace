declare namespace Replace {
    type RangeList = import('vscode').Range[];

    interface replaceRangeWithContent {
        previewRange: import('vscode').Range;
        originRange: import('vscode').Range;
        originContent: string;
    }
}
