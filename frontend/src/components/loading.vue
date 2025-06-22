<template>
    <div>
        <h3>element-plus的loading组件使用</h3>
        <div v-loading="isLoading">内容区域</div>
        <el-button @click="isLoading = !isLoading" type="primary">点击切换loading</el-button>
        <button @click="openLoading">打开全屏加载</button>
    </div>
</template>
<script lang='ts' setup>
import { ref } from 'vue'
import { ElLoading } from 'element-plus'
const isLoading = ref(true); // 控制加载状态

const openLoading = () => {
    // 开启加载
    const loadingInstance = ElLoading.service({
        lock: true,          // 锁定屏幕滚动
        text: '加载中...',    // 提示文本
        background: 'rgba(0, 0, 0, 0.7)' // 背景色
    });

    // 模拟异步操作
    setTimeout(() => {
        loadingInstance.close(); // 关闭加载
    }, 2000);
};
</script>
<style lang='scss' scoped></style>