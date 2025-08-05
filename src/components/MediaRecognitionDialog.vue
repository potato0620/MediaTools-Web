<template>
  <BaseDialog
    v-model:visible="computedVisible"
    :title="title"
    max-width="1000"
    :loading="loading"
    persistent
  >
    <!-- 输入区域 -->
    <div class="d-flex align-center gap-3">
      <v-text-field
        v-model="mediaTitle"
        :label="inputLabel"
        :hint="inputHint"
        :placeholder="placeholder"
        persistent-hint
        :loading="loading"
        :disabled="loading"
        variant="outlined"
        clearable
        class="flex-grow-1"
        density="default"
        @keyup.enter="handleRecognize"
        @clear="mediaTitle = ''"
      />
      <v-btn
        color="primary"
        :loading="loading"
        :disabled="!mediaTitle?.trim()"
        class="recognize-btn"
        @click="handleRecognize"
      >
        {{ result ? "重新识别" : confirmText }}
      </v-btn>
    </div>

    <!-- 识别结果区域 -->
    <div v-if="hasResultOrError" class="mt-4">
      <v-divider class="mb-3" />

      <!-- 成功结果 -->
      <v-card
        v-if="result && result.title"
        variant="outlined"
        class="elevation-2"
      >
        <v-card-title class="d-flex align-center bg-success py-2">
          <v-icon class="mr-2 text-white">mdi-check-circle</v-icon>
          <div class="text-white">
            <div class="text-h6">{{ result.title }}</div>
            <div class="text-caption">
              {{ result.year }} | {{ getMediaTypeText(result.media_type) }}
            </div>
          </div>
        </v-card-title>
        <v-card-text class="pa-3">
          <v-row dense>
            <!-- 海报区域 -->
            <v-col cols="12" md="3" class="d-flex justify-center">
              <div class="poster-container">
                <v-img
                  v-if="posterUrl"
                  :src="posterUrl"
                  :alt="`${result.title} 海报`"
                  aspect-ratio="2/3"
                  class="poster-image rounded"
                  cover
                  @error="handlePosterError"
                >
                  <template #placeholder>
                    <v-row
                      class="fill-height ma-0"
                      align="center"
                      justify="center"
                    >
                      <v-progress-circular
                        indeterminate
                        color="primary"
                        size="40"
                      />
                    </v-row>
                  </template>
                </v-img>

                <!-- 海报加载中 -->
                <v-card
                  v-else-if="loadingPoster"
                  class="poster-placeholder d-flex align-center justify-center rounded"
                  height="300"
                  variant="outlined"
                >
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="40"
                  />
                </v-card>

                <!-- 海报加载失败或无海报 -->
                <v-card
                  v-else
                  class="poster-placeholder d-flex flex-column align-center justify-center rounded"
                  height="300"
                  variant="outlined"
                >
                  <v-icon size="60" color="grey-lighten-1" class="mb-2">
                    mdi-image-off
                  </v-icon>
                  <span class="text-caption text-grey">
                    {{ posterError || "暂无海报" }}
                  </span>
                </v-card>
              </div>
            </v-col>

            <!-- 详细信息区域 -->
            <v-col cols="12" md="9">
              <v-row dense>
                <v-col cols="12" sm="6">
                  <v-list density="compact" class="pa-0">
                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >原始标题</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.original_title
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >年份</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.year
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >媒体类型</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        getMediaTypeText(result.media_type)
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="result.platform" class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >平台</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.platform
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="result.resource_pix" class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >分辨率</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.resource_pix
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-list density="compact" class="pa-0">
                    <v-list-item class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >TMDB ID</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.tmdb_id
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="result.imdb_id" class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >IMDb ID</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.imdb_id
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="result.tvdb_id" class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >TVDB ID</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.tvdb_id
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="result.season > 0" class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >季数</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.season_str
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="result.episode > 0" class="px-0 py-1">
                      <v-list-item-title class="text-caption font-weight-bold"
                        >集数</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        result.episode_str
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-col>
          </v-row>

          <!-- 额外信息 -->
          <div v-if="result.episode_title || result.release_groups?.length">
            <v-divider class="my-2" />
            <v-row dense>
              <v-col cols="12">
                <v-list density="compact" class="pa-0">
                  <v-list-item v-if="result.episode_title" class="px-0 py-1">
                    <v-list-item-title class="text-caption font-weight-bold"
                      >集标题</v-list-item-title
                    >
                    <v-list-item-subtitle class="text-body-2">{{
                      result.episode_title
                    }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item
                    v-if="result.release_groups?.length"
                    class="px-0 py-1"
                  >
                    <v-list-item-title class="text-caption font-weight-bold"
                      >发布组</v-list-item-title
                    >
                    <v-list-item-subtitle>
                      <v-chip
                        v-for="group in result.release_groups"
                        :key="group"
                        size="x-small"
                        class="mr-1 mt-1"
                        color="primary"
                        variant="tonal"
                      >
                        {{ group }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- 错误结果 -->
      <v-card v-else-if="errorMessage" variant="outlined" class="elevation-2">
        <v-card-title class="d-flex align-center bg-error py-2">
          <v-icon class="mr-2 text-white">mdi-alert-circle</v-icon>
          <div class="text-white">
            <div class="text-h6">识别失败</div>
          </div>
        </v-card-title>
        <v-card-text class="pa-3">
          <v-alert
            type="error"
            variant="tonal"
            class="mb-0"
            :text="errorMessage"
          />
        </v-card-text>
      </v-card>

      <!-- 未找到结果 -->
      <v-card v-else variant="outlined" class="elevation-2">
        <v-card-title class="d-flex align-center bg-warning py-2">
          <v-icon class="mr-2 text-white">mdi-information</v-icon>
          <div class="text-white">
            <div class="text-h6">未找到匹配结果</div>
          </div>
        </v-card-title>
        <v-card-text class="pa-3">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-0"
            text="未找到匹配的媒体信息，请检查输入的媒体名称是否正确"
          />
        </v-card-text>
      </v-card>
    </div>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, watch, ref, nextTick } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";
import type { MediaItem } from "@/types";
import { useMediaRecognition, useDialog } from "@/hooks";
import { getMediaTypeText } from "@/utils";
import { TMDBService } from "@/services/tmdb";

interface Props {
  visible: boolean;
  title?: string;
  inputLabel?: string;
  inputHint?: string;
  confirmText?: string;
  placeholder?: string;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success", result: MediaItem): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "媒体识别",
  inputLabel: "请输入媒体名称",
  inputHint:
    "例如：[Haruhana] Kaoru Hana wa Rin to Saku - 05 [WebRip][HEVC-10bit 1080p][CHI_JPN].mkv",
  confirmText: "识别",
  placeholder: "",
});
const emit = defineEmits<Emits>();

// 海报相关状态
const posterUrl = ref<string>("");
const loadingPoster = ref<boolean>(false);
const posterError = ref<string>("");

// 使用媒体识别 hook
const {
  mediaTitle,
  loading,
  result,
  errorMessage,
  state,
  hasResultOrError,
  recognize,
  resetState,
} = useMediaRecognition();

// 使用弹窗管理 hook
const { localVisible } = useDialog({
  onOpen: resetState,
  resetOnOpen: true,
});

// 双向绑定visible属性
const computedVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit("update:visible", value),
});

// 监听props.visible变化，同步到localVisible
watch(
  () => props.visible,
  (newVal) => {
    localVisible.value = newVal;
  }
);

// 监听localVisible变化，同步到props
watch(localVisible, (newVal) => {
  computedVisible.value = newVal;
});

// 监听对话框打开，重置表单
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetState();
      resetPosterState();
    }
  }
);

// 监听识别结果变化，获取海报
watch(result, async (newResult) => {
  if (newResult && newResult.tmdb_id && newResult.media_type) {
    await loadPoster(newResult.media_type, newResult.tmdb_id);
  }
});

// 重置海报状态
const resetPosterState = () => {
  posterUrl.value = "";
  loadingPoster.value = false;
  posterError.value = "";
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

// 关闭对话框
const handleCancel = () => {
  if (!loading.value) {
    resetState();
    resetPosterState();
    computedVisible.value = false;
  }
};

// 识别媒体
const handleRecognize = async () => {
  const recognitionResult = await recognize();

  // 注意：这里不再自动触发 success 事件，让用户在弹窗中查看结果
  // 如果需要在识别成功时执行某些操作，可以在这里添加
  if (recognitionResult.state === "success" && recognitionResult.result) {
    console.log("识别成功，结果已显示在弹窗中");
    // 可以选择性地触发 success 事件，但不关闭弹窗
    // emit("success", recognitionResult.result);
  }
};
</script>

<style scoped>
.gap-3 {
  gap: 12px;
}

/* 确保按钮与输入框高度对齐 */
.recognize-btn {
  height: 56px !important; /* 与outlined text-field的默认高度匹配 */
  min-width: 100px;
  align-self: stretch; /* 让按钮填满容器高度 */
}

/* 输入框容器对齐 */
.d-flex.align-center {
  align-items: flex-start; /* 从顶部对齐，而不是center */
}

.poster-container {
  width: 100%;
  max-width: 200px;
}

.poster-image {
  width: 100%;
  max-width: 200px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.poster-image:hover {
  transform: scale(1.02);
}

.poster-placeholder {
  width: 100%;
  max-width: 200px;
  background: rgba(0, 0, 0, 0.05);
  border: 2px dashed rgba(0, 0, 0, 0.12);
}

@media (max-width: 768px) {
  .poster-container {
    max-width: 150px;
  }

  .poster-image,
  .poster-placeholder {
    max-width: 150px;
  }

  .poster-placeholder {
    height: 225px !important;
  }

  /* 移动端按钮调整 */
  .gap-3 {
    gap: 8px;
  }

  .recognize-btn {
    min-width: 80px;
    height: 56px !important;
  }
}
</style>
