<template>
  <v-dialog
    v-model="localVisible"
    :max-width="maxWidth"
    :scrollable="scrollable"
    :persistent="persistent"
    :retain-focus="false"
    :fullscreen="fullscreen"
  >
    <v-card>
      <!-- 标题栏 -->
      <v-card-title
        v-if="showTitle"
        class="d-flex align-center"
        :class="titleClass"
      >
        <slot name="title">
          <span>{{ title }}</span>
        </slot>
        <v-spacer />
        <slot name="title-actions">
          <v-btn
            v-if="showCloseButton"
            icon="mdi-close"
            variant="text"
            size="small"
            @click="handleClose"
          />
        </slot>
      </v-card-title>

      <!-- 内容区域 -->
      <v-card-text :class="contentClass" :style="contentStyle">
        <slot />
      </v-card-text>

      <!-- 操作按钮区域 -->
      <v-card-actions v-if="showActions" :class="actionsClass">
        <slot name="actions">
          <v-spacer />
          <v-btn
            v-if="showConfirmButton"
            :color="confirmColor"
            :loading="loading"
            :disabled="confirmDisabled"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </v-btn>
        </slot>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  visible: boolean;
  title?: string;
  maxWidth?: string | number;
  scrollable?: boolean;
  persistent?: boolean;
  fullscreen?: boolean;
  loading?: boolean;

  // 标题栏
  showTitle?: boolean;
  showCloseButton?: boolean;
  titleClass?: string;

  // 内容区域
  contentClass?: string;
  contentStyle?: string;

  // 操作按钮
  showActions?: boolean;
  showConfirmButton?: boolean;
  confirmText?: string;
  confirmColor?: string;
  confirmDisabled?: boolean;
  actionsClass?: string;
}

interface Emits {
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
  (e: "confirm"): void;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  maxWidth: "600",
  scrollable: false,
  persistent: false,
  fullscreen: false,
  loading: false,

  showTitle: true,
  showCloseButton: true,
  titleClass: "",

  contentClass: "",
  contentStyle: "",

  showActions: true,
  showConfirmButton: true,
  confirmText: "确定",
  confirmColor: "primary",
  confirmDisabled: false,
  actionsClass: "px-6 pb-6",
});

const emit = defineEmits<Emits>();

// 双向绑定visible属性
const localVisible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit("update:visible", value),
});

// 事件处理
const handleClose = () => {
  if (!props.loading) {
    localVisible.value = false;
    emit("close");
  }
};

const handleConfirm = () => {
  emit("confirm");
};
</script>
