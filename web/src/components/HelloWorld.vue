<template>
    <div class="hello">
        <h1>{{ msg }}</h1>
        <button @click="triggerAdd">试试添加9</button>
        <button @click="triggerReload">刷新</button>
        <!-- 注意命名规则 -->
        <vscode-button @click="triggerReload">刷新</vscode-button>
        <vscode-checkbox>选项</vscode-checkbox>
    </div>
</template>

<script setup lang="ts">
import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeCheckbox,
} from '@vscode/webview-ui-toolkit';
import { defineProps, ref } from 'vue';
import { vscode } from '@/utils/common';

// 注册组件
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeCheckbox());

const props = defineProps({
    msg: { type: String, required: true },
});

const msg = ref(props.msg);

function triggerAdd() {
    vscode.postMessage({ type: 'add', value: '1234' });
}
function triggerReload() {
    vscode.postMessage({ type: 'reload' });
}
</script>

<style scoped lang="scss"></style>
