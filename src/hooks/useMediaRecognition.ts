import { ref, computed, watch } from "vue";
import { MediaService } from "@/services";
import { TMDBService } from "@/services/tmdb";
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

  // 海报相关状态
  const posterUrl = ref<string>("");
  const loadingPoster = ref<boolean>(false);
  const posterError = ref<string>("");

  // 是否有结果或错误信息需要显示
  const hasResultOrError = computed(() => {
    return result.value || errorMessage.value;
  });

  // 重置所有状态
  const resetState = () => {
    mediaTitle.value = "";
    result.value = null;
    errorMessage.value = "";
    resetPosterState();
  };

  // 重置海报状态
  const resetPosterState = () => {
    posterUrl.value = "";
    loadingPoster.value = false;
    posterError.value = "";
  };

  // 清空结果和错误
  const clearResult = () => {
    result.value = null;
    errorMessage.value = "";
    resetPosterState();
  };

  // 加载海报
  const loadPoster = async (mediaType: string, tmdbId: number) => {
    try {
      resetPosterState();
      loadingPoster.value = true;

      const url = await TMDBService.ImageService.GetPosterImage(
        mediaType,
        tmdbId
      );
      posterUrl.value = url;
      posterError.value = "";
    } catch (error) {
      console.error("获取海报失败:", error);
      posterError.value = "获取海报失败";
    } finally {
      loadingPoster.value = false;
    }
  };

  // 处理海报加载错误
  const handlePosterError = () => {
    posterError.value = "海报加载失败";
  };

  // 监听识别结果变化，自动获取海报
  watch(result, async (newResult) => {
    if (newResult && newResult.tmdb_id && newResult.media_type) {
      await loadPoster(newResult.media_type, newResult.tmdb_id);
    }
  });

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

    // 海报相关状态
    posterUrl,
    loadingPoster,
    posterError,

    // 方法
    recognize,
    resetState,
    clearResult,
    loadPoster,
    resetPosterState,
    handlePosterError,
  };
}
