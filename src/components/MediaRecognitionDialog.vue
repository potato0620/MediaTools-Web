<template>
  <BaseDialog
    v-model:visible="computedVisible"
    :title="title"
    max-width="1000"
    :loading="loading"
    :confirm-text="confirmText"
    :confirm-disabled="!mediaTitle?.trim()"
    persistent
    @confirm="handleRecognize"
  >
    <!-- 输入区域 -->
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
      @keyup.enter="handleRecognize"
      @clear="mediaTitle = ''"
    />

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

    <template #actions>
      <v-spacer />
      <v-btn variant="text" :disabled="loading" @click="handleCancel">
        {{ cancelText }}
      </v-btn>
      <v-btn
        color="primary"
        :loading="loading"
        :disabled="!mediaTitle?.trim()"
        @click="handleRecognize"
      >
        {{ result ? "重新识别" : confirmText }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
import { computed, watch } from "vue";
import BaseDialog from "@/components/BaseDialog.vue";
import type { MediaItem } from "@/types";
import { useMediaRecognition, useDialog } from "@/hooks";
import { getMediaTypeText } from "@/utils";

interface Props {
  visible: boolean;
  title?: string;
  inputLabel?: string;
  inputHint?: string;
  cancelText?: string;
  confirmText?: string;
  placeholder?: string;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "success", result: MediaItem): void;
  (e: "cancel"): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "媒体识别",
  inputLabel: "请输入媒体名称",
  inputHint:
    "例如：[Haruhana] Kaoru Hana wa Rin to Saku - 05 [WebRip][HEVC-10bit 1080p][CHI_JPN].mkv",
  cancelText: "取消",
  confirmText: "识别",
  placeholder: "",
});
const emit = defineEmits<Emits>();

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
    }
  }
);

// 关闭对话框
const handleCancel = () => {
  if (!loading.value) {
    resetState();
    emit("cancel");
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
