<template>
  <v-app-bar color="blue-darken-3" dark>
    <v-app-bar-title>MediaTools - 媒体工具</v-app-bar-title>
    <v-spacer />
    <v-btn @click="handleMediaRecognition"> 🔍 识别媒体 </v-btn>
  </v-app-bar>
</template>

<script lang="ts" setup>
interface Emits {
  (e: "media-recognition"): void;
}

const emit = defineEmits<Emits>();

const handleMediaRecognition = () => {
  emit("media-recognition");
};
</script>
