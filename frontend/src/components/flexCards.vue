<script setup>

</script>

<template>
    <div>
        <h3>响应式卡片</h3>
        <div style="width: 96%;margin: 0 auto;">
            <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="i in 6" :key="i">
                    <el-card style="max-width: 360px;margin-bottom: 20px;">
                        <template #header>
                            <div class="card-header">
                                <span>Card name</span>
                            </div>
                        </template>
                        <p v-for="o in 4" :key="o" class="text item">{{ 'List item ' + o }}</p>
                        <template #footer>Footer content</template>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<style scoped></style>
