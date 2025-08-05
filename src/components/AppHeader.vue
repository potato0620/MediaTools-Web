<template>
  <v-app-bar color="blue-darken-3" dark elevation="2">
    <v-app-bar-title>
      <v-icon icon="mdi-movie-search" class="mr-2" />
      MediaTools - 媒体工具
    </v-app-bar-title>

    <v-spacer />

    <!-- 动态按钮组 -->
    <div class="header-actions">
      <v-btn
        v-for="action in headerActions"
        :key="action.id"
        :color="action.color || 'primary'"
        :variant="action.variant || 'elevated'"
        :size="action.size || 'default'"
        :disabled="action.disabled"
        :loading="action.loading"
        class="ml-2 header-btn"
        @click="handleAction(action)"
      >
        <v-icon v-if="action.icon" :icon="action.icon" />
        <span v-if="action.text" class="btn-text">{{ action.text }}</span>
      </v-btn>
    </div>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useThemeManager, useLogDialog } from "@/hooks";

// 按钮动作类型定义
interface HeaderAction {
  id: string;
  text?: string;
  icon?: string;
  color?: string;
  variant?: "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain";
  size?: "x-small" | "small" | "default" | "large" | "x-large";
  disabled?: boolean;
  loading?: boolean;
  action: string; // 对应的事件名称
}

// 事件定义
interface Emits {
  (e: "media-recognition"): void;
  (e: "view-logs"): void;
  (e: "action", actionId: string): void; // 通用动作事件
}

const emit = defineEmits<Emits>();

// 动态加载状态
const loadingStates = ref<Record<string, boolean>>({});

// 使用主题管理hook
const { currentThemeConfig, toggleTheme } = useThemeManager();

// 使用日志弹窗hook
const { openLogDialog } = useLogDialog();

// 头部按钮配置
const headerActions = computed<HeaderAction[]>(() => [
  {
    id: "media-recognition",
    text: "识别媒体",
    icon: "mdi-movie-search",
    color: "primary",
    variant: "elevated",
    loading: loadingStates.value["media-recognition"],
    action: "media-recognition",
  },
  {
    id: "view-logs",
    text: "查看日志",
    icon: "mdi-text-box-outline",
    color: "info",
    variant: "elevated",
    action: "view-logs",
  },
  {
    id: "theme-switch",
    text: currentThemeConfig.value.text,
    icon: currentThemeConfig.value.icon,
    color: "primary",
    variant: "elevated",
    action: "theme-switch",
  },
]);

// 处理按钮点击
const handleAction = (action: HeaderAction) => {
  // 设置加载状态
  if (action.loading !== undefined) {
    loadingStates.value[action.id] = true;
  }

  // 发送对应的事件
  if (action.action === "media-recognition") {
    emit("media-recognition");
  } else if (action.action === "view-logs") {
    // 打开日志弹窗，可以传入标题过滤日志
    openLogDialog();
    emit("view-logs");
  } else if (action.action === "theme-switch") {
    // 切换主题
    toggleTheme();
    return;
  } else {
    // 通用动作事件，可以在父组件中处理其他动作
    emit("action", action.id);
  }

  // 模拟操作完成后清除加载状态
  setTimeout(() => {
    loadingStates.value[action.id] = false;
  }, 1000);
};

// 暴露方法供外部调用
const setActionLoading = (actionId: string, loading: boolean) => {
  loadingStates.value[actionId] = loading;
};

const setActionDisabled = (actionId: string, disabled: boolean) => {
  const action = headerActions.value.find((a) => a.id === actionId);
  if (action) {
    action.disabled = disabled;
  }
};

// 暴露给父组件使用
defineExpose({
  setActionLoading,
  setActionDisabled,
});
</script>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.v-app-bar-title {
  display: flex;
  align-items: center;
}

.header-btn {
  transition: all 0.2s ease-in-out;
}

.btn-text {
  opacity: 0;
  max-width: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: opacity 0.2s ease-in-out, max-width 0.3s ease-in-out;
}

.header-btn:hover .btn-text {
  opacity: 1;
  max-width: 100px; /* 根据需要调整最大宽度 */
  margin-left: 8px;
}
</style>
