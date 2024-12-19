<!-- 文件 -->
<script setup>
import { ref } from "vue";
import axios from "axios";

// 定义响应式变量，用于存储 base64 格式的图片
const imgBase64 = ref("");
// 定义响应式变量，用于存储生成的下载 URL
const downloadUrl = ref("");

// 文件变化事件处理函数
const fileChange = (e) => {
  // 获取上传的文件对象（Files）
  const file = e.target.files[0];
  console.log(file, "file"); // 控制台打印文件信息

  // 检查文件大小，超过 5MB 提示错误
  if (file.size > 1024 * 1024 * 5) {
    alert("文件大小不能超过 5MB");
    return;
  }

  // 检查文件类型，必须为 jpeg 或 png
  if (file.type !== "image/jpeg" && file.type !== "image/png") {
    alert("文件类型必须是 jpg 或 png");
    return;
  }

  // 将 File 转换为 Blob 对象，这里仅用于演示（Blob 可用于切片或其他处理）
  const blob = new Blob([file]);
  console.log(blob);

  // 将 Blob 对象切片，假设取前 150KB 数据
  const sliceBlob = blob.slice(0, 150000);

  // 使用切片后的 Blob 创建新的 File 对象（New File）
  const sliceFile = new File([sliceBlob], "slice_test.png");

  // 使用 URL.createObjectURL 生成一个可以下载的链接
  downloadUrl.value = URL.createObjectURL(sliceFile); // 为 a 标签的 href 生成 URL

  // 创建 FormData 对象，用于文件上传
  const formData = new FormData();

  // 将切割后的 File 对象追加到 FormData 中（append 到 formData）
  formData.append("file", sliceFile);

  /**----------------------------分割线----------------------------------------**/

  /**
   * fileReader 读取文件内容
   */
  // 创建 FileReader 对象，读取文件内容
  const fileReader = new FileReader();

  // 将文件读取为 base64 格式，通常用于图片显示
  fileReader.readAsDataURL(sliceFile); // 这里使用切割后的文件

  /**
   * FileReader 读取完成后的回调函数
   * @param e - 事件对象，包含读取的结果
   */
  fileReader.onload = (e) => {
    // console.log(e.target?.result);  控制台打印 base64 编码结果
    imgBase64.value = e.target?.result; // 更新 imgBase64，用于图片展示
  };

  // 将切割后的文件传为blob并通过formData通过接口传输（通常为 API 请求）
  axios
    .post("/upload", formData)
    .then((response) => {
      console.log("上传成功", response);
    })
    .catch((error) => {
      console.error("上传失败", error);
    });
};
</script>

<template>
  <div>
    <h3>文件</h3>
    <!-- 文件选择框，监听 change 事件 -->
    <input type="file" name="file" @change="fileChange" />

    <!-- 用于展示上传的图片（base64 格式） -->
    <img
      style="width: 100px; height: 100px"
      :src="imgBase64"
      alt=""
      v-if="imgBase64"
    />

    <!-- 下载按钮 -->
    <a v-if="downloadUrl" :href="downloadUrl" download="downloaded_image.png">
      下载切片文件
    </a>
  </div>
</template>
