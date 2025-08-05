<template>
  <v-app>
    <v-navigation-drawer permanent>
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="MediaTools"
          subtitle="下一代媒体刮削/整理工具"
        />
        <v-divider />
        <v-list-item
          prepend-icon="mdi-database"
          title="仪表盘"
          :to="{ name: 'DashBoard' }"
          link
        />
        <v-list-item
          prepend-icon="mdi-database"
          title="存储管理"
          :to="{ name: 'Storage' }"
          link
        />
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-title>MediaTools - 媒体工具</v-app-bar-title>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>

    <!-- 全局弹窗容器 -->
    <GlobalDialogs />

    <!-- 全局消息组件 -->
    <GlobalMessage />
  </v-app>
</template>

<script lang="ts" setup>
import GlobalMessage from "@/components/GlobalMessage.vue";
import AppHeader from "@/components/AppHeader.vue";
import GlobalDialogs from "@/components/GlobalDialogs.vue";
import { useGlobalDialogs } from "@/hooks";
import type { MediaItem } from "@/types/media";

// 使用全局弹窗管理
const { openMediaRecognitionDialog } = useGlobalDialogs();

// 处理媒体识别请求
const handleMediaRecognition = () => {
  console.log("打开媒体识别对话框");

  openMediaRecognitionDialog({
    onSuccess: (result: MediaItem) => {
      console.log("识别成功:", result);
      // 可以在这里添加全局的成功处理逻辑
    },
    onCancel: () => {
      console.log("取消识别");
    },
    onClose: () => {
      console.log("关闭弹窗");
    },
  });
};
</script>

<style scoped>
/* 全局样式 */
</style>
