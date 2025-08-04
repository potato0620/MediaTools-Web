<template>
  <v-layout class="rounded rounded-md border">
    <v-navigation-drawer>
      <h1 class="app-title">MediaTools</h1>
      <v-list nav>
        <v-list-item title="MediaTools" link></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- title="MediaTools" -->
    <v-app-bar></v-app-bar>

    <v-main class="d-flex align-center justify-center" height="300">
      <v-container>
        <v-sheet
          border="dashed md"
          color="surface-light"
          height="200"
          rounded="lg"
          width="100%"
        ></v-sheet>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script lang="ts" setup>
//
</script>

<style scoped>
.app-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin: 10px 0;
  /* padding: 16px; */
}
</style>
