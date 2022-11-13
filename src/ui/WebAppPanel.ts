import * as vscode from 'vscode';
import WebviewEventHandler from '../eventHandler';
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
        const reloadCallback = () => {
            webviewView.webview.html = this._getHtmlForWebview(
                webviewView.webview
            );
        };
        let disposable = webviewView.webview.onDidReceiveMessage((e) => {
            // 判断符合payload格式的内容
            if ('type' in e && 'id' in e) {
                WebviewEventHandler(e, webviewView, reloadCallback);
            }
        });
        this._disposables.push(disposable);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css')
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css')
        );

        let { scriptUri, scriptVendorUri, styleUri } = getResourceUri(
            webview,
            this._extensionUri
        );

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
                <body data-uri="${baseUri}">
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

/**
 * 获取webview资源路径
 * @param webview
 * @param extensionUri
 * @returns
 */
function getResourceUri(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // 判断开发环境
    let isDev = process.env.NODE_ENV !== 'production';
    let scriptUri;
    let scriptVendorUri;
    let styleUri;
    if (isDev) {
        const scriptHost = `http://127.0.0.1:3000`;
        scriptUri = `${scriptHost}/dist-web/main.js`;
        scriptVendorUri = `${scriptHost}/dist-web/chunk-vendors.js`;
        styleUri = `${scriptHost}/dist-web/css/main.css`;
    } else {
        scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'dist-web', 'main.js')
        );
        scriptVendorUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'dist-web', 'chunk-vendors.js')
        );
        styleUri = webview.asWebviewUri(
            vscode.Uri.joinPath(extensionUri, 'dist-web', 'css/main.css')
        );
    }
    return {
        scriptUri,
        scriptVendorUri,
        styleUri,
    };
}
