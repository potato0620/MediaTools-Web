<template>
  <!-- 媒体识别弹窗 -->
  <MediaRecognitionDialog
    v-if="isMediaRecognitionDialog"
    v-model:visible="dialogVisible"
    v-bind="activeDialog?.props"
    @success="handleDialogSuccess"
    @update:visible="handleVisibilityChange"
  />

  <!-- 可以在这里添加其他类型的弹窗 -->
  <!-- 
  <UserProfileDialog
    v-else-if="isUserProfileDialog"
    v-model:visible="dialogVisible"
    v-bind="activeDialog?.props"
    @success="handleDialogSuccess"
    @cancel="handleDialogCancel"
  />
  -->
</template>

<script lang="ts" setup>
import { computed } from "vue";
import MediaRecognitionDialog from "./MediaRecognitionDialog.vue";
import { useGlobalDialogs, DialogType } from "@/hooks/useGlobalDialogs";

// 使用全局弹窗管理
const {
  activeDialog,
  closeDialog,
  handleDialogSuccess,
  handleDialogCancel,
  handleDialogClose,
} = useGlobalDialogs();

// 计算弹窗可见性
const dialogVisible = computed({
  get: () => activeDialog.value?.visible || false,
  set: (value: boolean) => {
    if (!value && activeDialog.value) {
      closeDialog();
    }
  },
});

// 计算当前弹窗类型
const isMediaRecognitionDialog = computed(
  () => activeDialog.value?.type === DialogType.MEDIA_RECOGNITION
);

// 处理弹窗可见性变化
const handleVisibilityChange = (visible: boolean) => {
  if (!visible) {
    handleDialogClose();
  }
};

// 可以添加更多弹窗类型的计算属性
// const isUserProfileDialog = computed(() =>
//   activeDialog.value?.type === DialogType.USER_PROFILE
// );
</script>
