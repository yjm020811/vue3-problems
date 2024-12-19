<!-- 截图 -->
<script setup>
import { ref } from "vue";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

const screencutRef = ref(null);

const screencut = () => {
  html2canvas(screencutRef.value).then((canvas) => {
    console.log(canvas);
    // canvas转为blob
    canvas.toBlob((blob) => {
      saveAs(blob, "screencut.jpg");
    }, "image/jpg");
  });
};
</script>

<template>
  <div>
    <h3>截图</h3>
    <div ref="screencutRef">
      <img style="width: 100px; height: 100px" src="../assets/pig.jpg" alt="" />
    </div>
    <button @click="screencut">截图</button>
  </div>
</template>
