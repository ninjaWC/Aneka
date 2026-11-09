<script setup lang="js">
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';
import MemoriablePage from '@/pages/MemoriablePage.vue'
import Header from '@/components/Header/Header.vue'
import LoveBlock from '@/components/Love/LoveBlock.vue'
import WishlistPage from '@/pages/WishlistPage.vue'
import SongsPage from '@/pages/SongsPage.vue'
import WelcomeIntro from '@/pages/WelcomeIntro.vue'
import AuthView from '@/components/AuthView/AuthView.vue';

const isAuthenticated = ref(false);
const isCheckingAuth = ref(true);

onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  isAuthenticated.value = !!session;
  isCheckingAuth.value = false;

  // Слушаем изменения авторизации (например, если токен протух или вышел)
  supabase.auth.onAuthStateChange((event, session) => {
    isAuthenticated.value = !!session;
  });
});

const handleLogout = async () => {
  await supabase.auth.signOut();
};

</script>

<template>
  <!-- Пока проверяем сессию, можно показать пустой экран или лоадер -->
  <div v-if="isCheckingAuth" class="loader-screen">Загрузка...</div>
    <!-- Если не авторизован — показываем окно входа -->
    <AuthView v-else-if="!isAuthenticated" @success="isAuthenticated = true" />
    <!-- Если авторизован — показываем весь сайт -->
    <div v-else class="main-app">
    <router-view /> 
  </div>
  <WelcomeIntro @finish="onIntroFinish"/>

  <Header />
  <LoveBlock />
  <MemoriablePage />
  <WishlistPage />
  <!-- <SongsPage /> -->
</template>

<style scoped></style>
