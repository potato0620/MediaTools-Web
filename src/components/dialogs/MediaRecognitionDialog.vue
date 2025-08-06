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
        :placeholder="placeholder"
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
      <v-card v-if="result && result.title" class="elevation-1">
        <v-card-title class="d-flex align-center bg-success py-2">
          <v-icon class="mr-2 text-white">{{
            isTV ? "mdi-television-classic" : "mdi-movie"
          }}</v-icon>
          <div class="text-white">
            <div class="text-h6">{{ result.title }}</div>
            <div class="text-caption">
              {{ result.year }} | {{ result.media_type }}
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
              <v-tabs v-model="activeTab" color="primary" class="mb-3">
                <v-tab value="basic">基本信息</v-tab>
                <v-tab value="resource">资源信息</v-tab>
                <v-tab v-if="isTV" value="tv">电视剧信息</v-tab>
              </v-tabs>

              <v-tabs-window v-model="activeTab">
                <!-- 基本信息 -->
                <v-tabs-window-item value="basic">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-list density="compact" class="pa-0">
                        <v-list-item class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >原始标题</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.original_title
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >年份</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.year
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >媒体类型</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.media_type
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list density="compact" class="pa-0">
                        <v-list-item class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >TMDB ID</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.tmdb_id
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="result.imdb_id" class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >IMDB ID</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.imdb_id
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="result.tvdb_id" class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >TVDB ID</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.tvdb_id
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>

                <!-- 资源信息 -->
                <v-tabs-window-item value="resource">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-list density="compact" class="pa-0">
                        <v-list-item v-if="result.platform" class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >流媒体平台</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.platform
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.resource_type"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >资源类型</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.resource_type
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.resource_pix"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >分辨率</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.resource_pix
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.video_encode"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >视频编码</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.video_encode
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list density="compact" class="pa-0">
                        <v-list-item
                          v-if="result.audio_encode"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >音频编码</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.audio_encode
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item v-if="result.part" class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >分段</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.part
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >版本号</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.version
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.resource_effect?.length"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >资源效果</v-list-item-title
                          >
                          <v-list-item-subtitle>
                            <v-chip
                              v-for="effect in result.resource_effect"
                              :key="effect"
                              size="x-small"
                              class="mr-1 mt-1"
                              color="secondary"
                              variant="tonal"
                            >
                              {{ effect }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.release_groups?.length"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
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
                </v-tabs-window-item>
                <!-- 电视剧信息 -->
                <v-tabs-window-item v-if="isTV" value="tv">
                  <v-row dense>
                    <v-col cols="12" sm="6">
                      <v-list density="compact" class="pa-0">
                        <v-list-item v-if="result.season > 0" class="px-0 py-1">
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >季数</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.season_str
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.season_year > 0"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >季年份</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.season_year
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.episode > 0"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >集数</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.episode_str
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-list density="compact" class="pa-0">
                        <v-list-item
                          v-if="result.episode_title"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >集标题</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.episode_title
                          }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item
                          v-if="result.episode_date"
                          class="px-0 py-1"
                        >
                          <v-list-item-title
                            class="text-caption font-weight-bold"
                            >集发布日期</v-list-item-title
                          >
                          <v-list-item-subtitle class="text-body-2">{{
                            result.episode_date
                          }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-tabs-window-item>
              </v-tabs-window>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 错误结果 -->
      <v-card v-else-if="errorMessage" class="elevation-1">
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
import { computed, ref, watch } from "vue";
import BaseDialog from "@/components/dialogs/BaseDialog.vue";
import type { MediaItem } from "@/types";
import { useMediaRecognition, useDialog } from "@/hooks";

interface Props {
  visible: boolean;
  title?: string;
  inputLabel?: string;
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
  confirmText: "识别",
  placeholder:
    "例如：[Haruhana] Kaoru Hana wa Rin to Saku - 05 [WebRip][HEVC-10bit 1080p][CHI_JPN].mkv",
});
const emit = defineEmits<Emits>();

// 标签页状态
const activeTab = ref("basic");

// 使用媒体识别 hook（包含海报功能）
const {
  mediaTitle,
  loading,
  result,
  errorMessage,
  hasResultOrError,
  posterUrl,
  loadingPoster,
  posterError,
  recognize,
  resetState,
  handlePosterError,
} = useMediaRecognition();

// 使用弹窗管理 hook
const { localVisible } = useDialog({
  onOpen: resetState,
  resetOnOpen: true,
});

// 判断是否为电视剧
const isTV = computed(() => {
  return result.value?.media_type === "TV";
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

// 监听对话框打开，重置表单和标签页
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetState();
      activeTab.value = "basic"; // 重置到基本信息标签页
    }
  }
);

// 识别媒体
const handleRecognize = async () => {
  const recognitionResult = await recognize();

  // 注意：这里不再自动触发 success 事件，让用户在弹窗中查看结果
  // 如果需要在识别成功时执行某些操作，可以在这里添加
  if (recognitionResult.state === "success" && recognitionResult.result) {
    console.log("识别成功，结果已显示在弹窗中");
    // 重置到基本信息标签页
    activeTab.value = "basic";
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
