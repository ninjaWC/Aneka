<script setup lang="ts">
import { ref } from 'vue'
import MemoriablePage from './pages/MemoriablePage.vue'
import Header from './components/Header/Header.vue'
import LoveBlock from './components/Love/LoveBlock.vue'
import WishlistPage from './pages/WishlistPage.vue'
import SongsPage from './pages/SongsPage.vue'
import WelcomeIntro from './pages/WelcomeIntro.vue'
</script>

<template>
  <WelcomeIntro @finish="onIntroFinish" />

  <Header />
  <LoveBlock />
  <MemoriablePage />
  <WishlistPage />
  <!-- <SongsPage /> -->
</template>

<style scoped></style>
