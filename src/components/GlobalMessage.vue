<template>
  <v-snackbar
    v-model="messageState.show"
    :color="messageState.color"
    :timeout="messageState.timeout"
    location="top"
    vertical
  >
    {{ messageState.message }}
    <template v-slot:actions>
      <v-btn
        variant="text"
        @click="hideMessage"
        icon="mdi-close"
        size="small"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { globalMessageState, hideMessage } from "@/utils/message";

const messageState = globalMessageState;
</script>
