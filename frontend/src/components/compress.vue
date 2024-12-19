<!-- 压缩图片 -->
<script setup>
import { ref } from "vue";
import { saveAs } from "file-saver"; // 用来保存blob对象很方便

const base64Url = ref("");
const imgRef = ref(null);

const fileChange = (e) => {
  let file = e.target.files[0];
  console.log(file);
  // 预览：file -> 转为base64
  let reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    base64Url.value = e.target.result;

    // 创建图片对象
    const img = new Image();
    img.src = base64Url.value;
    img.onload = () => {
      let pressCanvas = document.createElement("canvas");
      pressCanvas.width = imgRef.value.width;
      pressCanvas.height = imgRef.value.height;
      let ctx = pressCanvas.getContext("2d");
      ctx.drawImage(
        img, // 使用 Image 对象替代 base64Url.value
        0,
        0,
        imgRef.value.width,
        imgRef.value.height
      );
      pressCanvas.toBlob(
        (blob) => {
          console.log(blob);
          saveAs(blob, "compress.jpg");
          // 将这个blob对象传递给后端
          // let formData = new FormData();
          // formData.append("file", blob);
          // axios.post("/api/compress", formData).then((res) => {
          //   console.log(res);
          // });
        },
        "image/jpg",
        0.1 // 压缩比例
      );
    };
  };
};
</script>

<template>
  <div>
    <h3>压缩图片</h3>
    <input type="file" @change="fileChange" />
    <img ref="imgRef" :src="base64Url" />
  </div>
</template>
