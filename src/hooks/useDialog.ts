import { ref, computed, watch } from "vue";

/**
 * 弹窗管理 Hook
 * @param options 配置选项
 * @returns 弹窗管理相关的状态和方法
 */
export function useDialog(options?: {
  onOpen?: () => void;
  onClose?: () => void;
  resetOnOpen?: boolean;
}) {
  const visible = ref(false);

  // 双向绑定的 visible 计算属性
  const localVisible = computed({
    get: () => visible.value,
    set: (value: boolean) => {
      visible.value = value;
    },
  });

  // 监听弹窗打开/关闭
  watch(visible, (newVal, oldVal) => {
    if (newVal && !oldVal) {
      // 弹窗打开
      if (options?.resetOnOpen && options?.onOpen) {
        options.onOpen();
      }
    } else if (!newVal && oldVal) {
      // 弹窗关闭
      if (options?.onClose) {
        options.onClose();
      }
    }
  });

  // 打开弹窗
  const open = () => {
    visible.value = true;
  };

  // 关闭弹窗
  const close = () => {
    visible.value = false;
  };

  // 切换弹窗状态
  const toggle = () => {
    visible.value = !visible.value;
  };

  return {
    visible,
    localVisible,
    open,
    close,
    toggle,
  };
}
