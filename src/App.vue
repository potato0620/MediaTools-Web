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

    <!-- 全局消息组件 -->
    <GlobalMessage />
  </v-app>
</template>

<script lang="ts" setup>
import { GlobalMessage } from "@/components";
</script>

<style scoped>
/* 全局样式 */
</style>
