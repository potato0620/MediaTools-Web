import { ref, reactive } from "vue";

/**
 * 弹窗类型枚举
 */
export enum DialogType {
  MEDIA_RECOGNITION = "media-recognition", // 识别媒体弹窗
  LOG = "log", // 日志弹窗
  // 可以扩展其他弹窗类型
  // USER_PROFILE = 'user-profile',
  // SETTINGS = 'settings',
}

/**
 * 弹窗配置接口
 */
export interface DialogConfig {
  type: DialogType; // 弹窗类型
  visible: boolean; // 弹窗是否可见
  props?: Record<string, any>; // 弹窗属性
  data?: any; // 弹窗数据
}

/**
 * 弹窗事件处理器类型
 */
export interface DialogEventHandlers {
  onSuccess?: (data: any) => void; // 成功事件处理器
  onClose?: () => void; // 关闭事件处理器
}

// 全局状态 - 在模块级别创建，确保所有组件共享同一个实例
const globalActiveDialog = ref<DialogConfig | null>(null);
const globalEventHandlers = reactive<DialogEventHandlers>({});

/**
 * 全局弹窗管理 Hook
 */
export function useGlobalDialogs() {
  /**
   * 打开弹窗
   * @param type 弹窗类型
   * @param props 弹窗属性
   * @param handlers 事件处理器
   */
  const openDialog = (
    type: DialogType,
    props?: Record<string, any>,
    handlers?: DialogEventHandlers
  ) => {
    globalActiveDialog.value = {
      type,
      visible: true,
      props: props || {},
    };

    // 设置事件处理器
    Object.assign(globalEventHandlers, handlers || {});
  };

  /**
   * 关闭弹窗
   */
  const closeDialog = () => {
    if (globalActiveDialog.value) {
      globalActiveDialog.value.visible = false;
      globalActiveDialog.value = null;
    }

    // 清空事件处理器
    globalEventHandlers.onSuccess = undefined;
    globalEventHandlers.onClose = undefined;
  };

  /**
   * 处理弹窗成功事件
   */
  const handleDialogSuccess = (data: any) => {
    if (globalEventHandlers.onSuccess) {
      globalEventHandlers.onSuccess(data);
    }
    closeDialog();
  };

  /**
   * 处理弹窗关闭事件
   */
  const handleDialogClose = () => {
    if (globalEventHandlers.onClose) {
      globalEventHandlers.onClose();
    }
    closeDialog();
  };

  // 特定弹窗的便捷方法
  const openMediaRecognitionDialog = (handlers?: DialogEventHandlers) => {
    openDialog(DialogType.MEDIA_RECOGNITION, {}, handlers);
  };

  const openLogDialog = (handlers?: DialogEventHandlers) => {
    openDialog(DialogType.LOG, {}, handlers);
  };

  return {
    // 状态
    activeDialog: globalActiveDialog,

    // 通用方法
    openDialog,
    closeDialog,
    handleDialogSuccess,
    handleDialogClose,

    // 特定弹窗方法
    openMediaRecognitionDialog,
    openLogDialog,
  };
}
