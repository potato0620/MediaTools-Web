<template>
  <v-app>
    <v-navigation-drawer permanent color="surface" class="elevation-3">
      <!-- 顶部品牌区域 - 使用flex布局确保整体高度一致 -->
      <div class="brand-section pa-4 d-flex align-center">
        <v-avatar size="48" color="primary" class="mr-3">
          <v-icon size="32" color="white">mdi-play-box-multiple</v-icon>
        </v-avatar>

        <div class="d-flex flex-column justify-center" style="height: 48px">
          <h1
            class="text-h6 font-weight-bold primary--text mb-0"
            style="line-height: 1.2"
          >
            MediaTools
          </h1>
          <p
            class="text-caption text-medium-emphasis mt-0"
            style="line-height: 1.2"
          >
            下一代媒体刮削/整理工具
          </p>
        </div>
      </div>

      <v-divider class="my-2" />

      <!-- 导航菜单 -->
      <v-list density="compact" nav class="px-2">
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="仪表盘"
          :to="{ name: 'DashBoard' }"
          active-class="primary--text bg-blue-lighten-5"
          rounded="xl"
        />

        <v-list-item
          prepend-icon="mdi-database"
          title="存储管理"
          :to="{ name: 'Storage' }"
          active-class="primary--text bg-blue-lighten-5"
          rounded="xl"
        />
      </v-list>

      <!-- 底部空间填充 -->
      <v-spacer></v-spacer>

      <!-- 底部信息 -->
      <!-- <div class="pa-3 text-center text-caption text-disabled">
    v{{ version }} &copy; {{ new Date().getFullYear() }}
  </div> -->
    </v-navigation-drawer>

    <AppHeader
      @media-recognition="handleMediaRecognition"
      @view-logs="handleViewLogs"
      @action="handleHeaderAction"
    />

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
import type { MediaItem } from "@/types";

// 使用全局弹窗管理
const { openMediaRecognitionDialog, openLogDialog } = useGlobalDialogs();

// 处理媒体识别请求
const handleMediaRecognition = () => {
  console.log("打开媒体识别对话框");

  openMediaRecognitionDialog({
    onSuccess: (result: MediaItem) => {
      console.log("识别成功:", result);
      // 可以在这里添加全局的成功处理逻辑
    },
    onClose: () => {
      console.log("关闭弹窗");
    },
  });
};

// 处理查看日志请求
const handleViewLogs = () => {
  console.log("打开日志弹窗");

  openLogDialog({
    onClose: () => {
      console.log("关闭日志弹窗");
    },
  });
};

// 处理头部其他动作
const handleHeaderAction = (actionId: string) => {
  console.log("执行头部动作:", actionId);

  switch (actionId) {
    case "batch-operation":
      // 处理批量操作
      console.log("执行批量操作");
      break;
    case "settings":
      // 打开设置页面
      console.log("打开设置");
      break;
    default:
      console.log("未知动作:", actionId);
  }
};
</script>

<style scoped>
/* 全局样式 */
</style>
