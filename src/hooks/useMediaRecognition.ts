import { ref, computed, watch } from "vue";
import { MediaService } from "@/services";
import type { MediaItem } from "@/types";
import { extractErrorMessage, validateMediaTitle } from "@/utils/mediaUtils";

/**
 * 媒体识别状态类型
 */
export type MediaRecognitionState =
  | "idle"
  | "loading"
  | "success"
  | "error"
  | "not-found";

/**
 * 媒体识别结果类型
 */
export interface MediaRecognitionResult {
  state: MediaRecognitionState;
  result: MediaItem | null;
  errorMessage: string;
}

/**
 * 媒体识别 Hook
 * @returns 媒体识别相关的状态和方法
 */
export function useMediaRecognition() {
  // 状态管理
  const mediaTitle = ref("");
  const loading = ref(false);
  const result = ref<MediaItem | null>(null);
  const errorMessage = ref("");

  // 是否有结果或错误信息需要显示
  const hasResultOrError = computed(() => {
    return result.value || errorMessage.value;
  });

  // 重置所有状态
  const resetState = () => {
    mediaTitle.value = "";
    result.value = null;
    errorMessage.value = "";
  };

  // 清空结果和错误
  const clearResult = () => {
    result.value = null;
    errorMessage.value = "";
  };

  /**
   * 执行媒体识别
   * @param title 可选的媒体标题，如果不提供则使用当前的 mediaTitle
   */
  const recognize = async (title?: string): Promise<MediaRecognitionResult> => {
    const titleToRecognize = title || mediaTitle.value;

    // 验证输入
    const validation = validateMediaTitle(titleToRecognize);
    if (!validation.isValid) {
      errorMessage.value = validation.errorMessage!;
      result.value = null;
      return {
        state: "error",
        result: null,
        errorMessage: validation.errorMessage!,
      };
    }

    loading.value = true;
    errorMessage.value = "";
    result.value = null;

    try {
      console.log("开始识别媒体:", titleToRecognize.trim());
      const recognitionResult = await MediaService.Recognize(
        titleToRecognize.trim()
      );
      console.log("识别结果:", recognitionResult);

      if (recognitionResult && recognitionResult.title) {
        result.value = recognitionResult;
        errorMessage.value = "";
        return {
          state: "success",
          result: recognitionResult,
          errorMessage: "",
        };
      } else {
        result.value = null;
        errorMessage.value = "";
        return {
          state: "not-found",
          result: null,
          errorMessage: "",
        };
      }
    } catch (error) {
      console.error("识别媒体失败:", error);
      result.value = null;
      const errorMsg = extractErrorMessage(error);
      errorMessage.value = errorMsg;

      return {
        state: "error",
        result: null,
        errorMessage: errorMsg,
      };
    } finally {
      loading.value = false;
    }
  };

  return {
    // 状态
    mediaTitle,
    loading,
    result,
    errorMessage,
    hasResultOrError,

    // 方法
    recognize,
    resetState,
    clearResult,
  };
}
