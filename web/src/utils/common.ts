import { AppContext } from 'vue';

export const vscode = window.__vscode__ ?? window.acquireVsCodeApi?.();
window.__vscode__ ??= vscode;

let baseUri = '';
export function getBaseUri() {
    if (baseUri) return baseUri;
    const dataUri = document.querySelector('input[data-uri]');
    if (!dataUri) return;
    baseUri = decodeURIComponent(dataUri.getAttribute('data-uri') || '');

    return baseUri;
}

export default {
    install: (app: AppContext) => {
        app.config.globalProperties.baseUri = getBaseUri();
    },
};
