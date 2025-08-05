import { reactive, onUnmounted } from "vue";
import { LogService } from "@/services/log";

export interface LogDialogState {
  visible: boolean;
  logs: string[];
  loading: boolean;
  error: string | null;
}

// 全局状态 - 在模块级别创建，确保所有组件共享同一个实例
const globalState = reactive<LogDialogState>({
  visible: false,
  logs: [],
  loading: false,
  error: null,
});

let globalIntervalId: number | null = null;

export function useLogDialog() {
  /**
   * 获取最新日志
   */
  const fetchLogs = async () => {
    try {
      globalState.loading = true;
      globalState.error = null;
      globalState.logs = await LogService.GetRecentLogs();
    } catch (error) {
      globalState.error =
        error instanceof Error ? error.message : "获取日志失败";
      console.error("获取日志失败:", error);
    } finally {
      globalState.loading = false;
    }
  };

  /**
   * 开始实时更新日志
   */
  const startRealTimeUpdate = (intervalMs: number = 3000) => {
    // 清除之前的定时器
    stopRealTimeUpdate();

    // 立即获取一次
    fetchLogs();

    // 设置定时器
    globalIntervalId = window.setInterval(() => {
      fetchLogs();
    }, intervalMs);
  };

  /**
   * 停止实时更新
   */
  const stopRealTimeUpdate = () => {
    if (globalIntervalId) {
      clearInterval(globalIntervalId);
      globalIntervalId = null;
    }
  };

  /**
   * 打开日志弹窗
   */
  const openLogDialog = (autoUpdate: boolean = true) => {
    globalState.visible = true;
    globalState.logs = [];
    globalState.error = null;

    if (autoUpdate) {
      startRealTimeUpdate();
    } else {
      fetchLogs();
    }
  };

  /**
   * 关闭日志弹窗
   */
  const closeLogDialog = () => {
    globalState.visible = false;
    stopRealTimeUpdate();
    globalState.logs = [];
    globalState.error = null;
  };

  /**
   * 手动刷新日志
   */
  const refreshLogs = () => {
    fetchLogs();
  };

  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopRealTimeUpdate();
  });

  return {
    state: globalState,
    openLogDialog,
    closeLogDialog,
    refreshLogs,
    startRealTimeUpdate,
    stopRealTimeUpdate,
    fetchLogs,
  };
}
