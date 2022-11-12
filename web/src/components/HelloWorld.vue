<template>
    <div class="hello">
        <h1>{{ msg }}</h1>
        <button @click="triggerAdd">试试添加9</button>
        <button @click="triggerReload">刷新</button>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { vscode } from '@/utils/common';

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
