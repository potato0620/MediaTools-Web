<template>
  <v-dialog v-model="dialogVisible" max-width="800" persistent scrollable>
    <v-card class="log-dialog">
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-text-box-outline" class="mr-2" />
        <span>最新日志</span>
        <v-spacer />
        <v-btn
          icon="mdi-refresh"
          size="small"
          variant="text"
          :loading="state.loading"
          @click="refreshLogs"
        />
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          @click="handleClose"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="log-content">
        <!-- 错误提示 -->
        <v-alert v-if="state.error" type="error" variant="tonal" class="mb-4">
          {{ state.error }}
        </v-alert>

        <!-- 加载状态 -->
        <div
          v-if="state.loading && state.logs.length === 0"
          class="text-center py-8"
        >
          <v-progress-circular indeterminate color="primary" />
          <p class="mt-2 text-grey">正在加载日志...</p>
        </div>

        <!-- 日志列表 -->
        <div v-else-if="state.logs.length > 0" class="logs-container">
          <v-card
            v-for="(log, index) in state.logs"
            :key="index"
            variant="outlined"
            class="mb-2 log-item"
          >
            <v-card-text class="py-2">
              <pre class="log-text">{{ log }}</pre>
            </v-card-text>
          </v-card>
        </div>

        <!-- 空状态 -->
        <div v-else class="text-center py-8">
          <v-icon icon="mdi-file-document-outline" size="64" color="grey" />
          <p class="mt-2 text-grey">暂无日志数据</p>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-4 py-3">
        <v-chip size="small" color="success" variant="tonal" class="mr-2">
          <v-icon start icon="mdi-circle" size="8" class="mr-1" />
          实时更新中
        </v-chip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import { useLogDialog } from "@/hooks/useLogDialog";

// Props
interface Props {
  visible?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
});

// Emits
const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

// 使用日志弹窗hook
const { state, refreshLogs } = useLogDialog();

// 计算弹窗可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    emit("update:visible", value);
  },
});

// 监听可见性变化，管理日志状态
watch(
  () => props.visible,
  (newValue) => {
    if (newValue) {
      // 弹窗打开时获取日志
      refreshLogs();
    } else {
      // 弹窗关闭时清理状态
      state.logs = [];
      state.error = null;
    }
  },
  { immediate: true }
);

// 处理关闭
const handleClose = () => {
  emit("update:visible", false);
};
</script>

<style scoped>
.log-dialog {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.log-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.logs-container {
  max-height: 100%;
}

.log-item {
  transition: all 0.2s ease-in-out;
}

.log-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.log-text {
  font-family: "Consolas", "Monaco", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  color: inherit;
}

.v-card-title {
  background-color: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgb(var(--v-theme-outline));
}

.v-card-actions {
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgb(var(--v-theme-outline));
}
</style>
