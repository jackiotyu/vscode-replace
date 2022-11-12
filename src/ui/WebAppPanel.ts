import * as vscode from 'vscode';
// import { getNonce } from './getNonce';

export class WebViewPanelProvider implements vscode.WebviewViewProvider {
    private webviewView?: vscode.WebviewView;
    public static readonly viewType = 'panel:webview';
    private _disposables: vscode.Disposable[] = [];

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly _extensionUri = context.extensionUri
    ) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this.webviewView = webviewView;
        webviewView.webview.options = getWebviewOptions(this._extensionUri);
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // TODO
        webviewView.webview.onDidReceiveMessage(async ({ type, value }) => {
            if (type === 'add') {
                vscode.window.showInformationMessage('添加', value);
            }
            if (type === 'reload') {
                webviewView.webview.html = this._getHtmlForWebview(
                    webviewView.webview
                );
            }
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
        );

        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
        );

        // TODO 判断开发环境
        let isDev = true;
        let scriptUri;
        let scriptVendorUri;
        let styleUri;
        if (isDev) {
            const localPort = 3000;
            const localServerUrl = `localhost:${localPort}`;
            const scriptHost = `http://${localServerUrl}`;
            scriptUri = `${scriptHost}/dist-web/main.js`;
            scriptVendorUri = `${scriptHost}/dist-web/chunk-vendors.js`;
            styleUri = `${scriptHost}/dist-web/css/main.css`;
        } else {
            scriptUri = webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, 'dist-web', 'main.js')
            );
            scriptVendorUri = webview.asWebviewUri(
                vscode.Uri.joinPath(
                    this._extensionUri,
                    'dist-web',
                    'chunk-vendors.js'
                )
            );
            styleUri = webview.asWebviewUri(
                vscode.Uri.joinPath(
                    this._extensionUri,
                    'dist-web',
                    'css/main.css'
                )
            );
        }

        const baseUri = webview
            .asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist-web'))
            .toString()
            .replace('%22', '');

        const nonce = +new Date();

        return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="utf-8" />
                    <meta name="viewport" content="width=device-width,
                        initial-scale=1" />
                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                    <link href="${styleUri}" rel="stylesheet">
                    <title>JS Replace Panel</title>
                </head>
                <body>
                <input hidden data-uri="${baseUri}">
                    <div id="app"></div>
                    <script type="text/javascript"
                        src="${scriptVendorUri}" nonce="${nonce}"></script>
                    <script type="text/javascript"
                        src="${scriptUri}" nonce="${nonce}"></script>
                </body>
                </html>
            `;
    }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,
        localResourceRoots: [
            vscode.Uri.joinPath(extensionUri, 'media'),
            vscode.Uri.joinPath(extensionUri, 'dist-web'),
        ],
    };
}
