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
import { defineProps, ref } from 'vue';
import Bus from '@/utils/eventBus';

const props = defineProps({
    msg: { type: String, required: true },
});

const msg = ref(props.msg);

function triggerAdd() {
    Bus.emit('sendExt', { type: 'add', value: '1234' });
}
function triggerReload() {
    Bus.emit('sendExt', { type: 'reload' });
}
</script>

<style scoped lang="scss"></style>
