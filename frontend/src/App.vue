<script setup>
import compress from "./components/compress.vue";
import screencut from "./components/screencut.vue";
import File from "./components/file.vue";
import bigFile from "./components/bigFile.vue";
import flexCards from "./components/flexCards.vue";
import Loading from "./components/loading.vue";
</script>

<template>
  <compress />
  <hr />
  <screencut />
  <hr />
  <File />
  <hr />
  <bigFile />
  <hr />
  <flexCards />
  <hr>
  <Loading />
</template>

<style scoped></style>
