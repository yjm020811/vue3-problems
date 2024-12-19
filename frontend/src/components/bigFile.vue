<!-- 大文件上传 -->
<script setup>
import { ref } from "vue";

// 绑定文件和上传状态
const selectedFile = ref(null); // 存储选择的文件
const isUploading = ref(false); // 上传状态，标记是否正在上传
const progress = ref(0); // 上传进度，初始化为 0

// 监听文件选择事件
const handleFileChange = (e) => {
  // 获取用户选择的文件，并将其存储在 `selectedFile` 中
  selectedFile.value = e.target.files[0];
  progress.value = 0; // 重置上传进度
  console.log("Selected file:", selectedFile.value);
};

// 上传文件主逻辑
const uploadFile = async () => {
  // 如果没有选择文件，则提示用户选择文件
  if (!selectedFile.value) {
    alert("请先选择文件！");
    return;
  }

  isUploading.value = true; // 设置上传状态为正在上传
  const chunkSize = 2 * 1024 * 1024; // 设置每个文件切片的大小为 2MB
  const file = selectedFile.value; // 获取用户选择的文件
  const uploadUrl = "http://localhost:3000/upload"; // 文件上传的后端接口

  // 将文件切片成指定大小的块
  const createChunks = (file, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < file.size; i += chunkSize) {
      // 使用 `slice` 方法将文件按切片大小分割
      chunks.push(file.slice(i, i + chunkSize));
    }
    return chunks;
  };

  const chunks = createChunks(file, chunkSize); // 切割文件
  const totalChunks = chunks.length; // 计算切片的总数量
  let uploadedChunks = 0; // 已上传的切片数量，初始为 0

  // 上传单个切片
  const uploadChunk = async (formData) => {
    // 通过 fetch API 上传单个切片
    return await fetch(uploadUrl, {
      method: "POST",
      body: formData // 请求体是 FormData，包含文件和元数据
    });
  };

  // 通知后端合并切片
  const mergeChunks = async () => {
    // 上传所有切片后，调用此方法通知后端合并切片
    const mergeUrl = `${uploadUrl}/merge`; // 合并文件的接口
    const response = await fetch(mergeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name }) // 发送文件名给后端
    });
    const result = await response.json(); // 解析后端返回的 JSON 响应
    if (result.success) {
      alert("文件上传完成并合并成功！");
    } else {
      alert("文件合并失败，请检查后端。");
    }
  };

  // 上传所有切片
  for (let i = 0; i < totalChunks; i++) {
    const formData = new FormData();
    formData.append("file", chunks[i]); // 添加当前切片到 FormData
    formData.append("chunkIndex", i); // 切片索引
    formData.append("totalChunks", totalChunks); // 总切片数
    formData.append("fileName", file.name); // 文件名

    try {
      // 上传当前切片
      await uploadChunk(formData);
      uploadedChunks++; // 已上传切片数增加
      progress.value = Math.round((uploadedChunks / totalChunks) * 100); // 更新上传进度
      console.log(`Chunk ${i + 1}/${totalChunks} uploaded.`);
    } catch (error) {
      console.error(`Chunk ${i + 1}/${totalChunks} upload failed.`, error);
      alert("上传失败，请重试！");
      isUploading.value = false; // 设置上传状态为失败
      return;
    }
  }

  if (uploadedChunks === totalChunks) {
    console.log("All chunks uploaded, starting merge...");
    await mergeChunks(); // 如果所有切片上传完，通知后端合并切片
  }

  isUploading.value = false; // 上传完成，设置上传状态为完成
};
</script>

<template>
  <div>
    <h3>大文件切片上传</h3>
    <input type="file" @change="handleFileChange" />
    <!-- 文件选择输入框 -->
    <button :disabled="isUploading" @click="uploadFile">
      <!-- 上传按钮，上传时禁用 -->
      {{ isUploading ? "上传中..." : "开始上传" }}
      <!-- 上传中时按钮显示 "上传中..." -->
    </button>
    <div v-if="progress > 0">上传进度：{{ progress }}%</div>
    <!-- 显示上传进度 -->
  </div>
</template>
