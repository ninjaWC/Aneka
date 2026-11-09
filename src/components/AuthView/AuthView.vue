<script setup>
import { ref } from 'vue';
import { supabase } from '@/supabase';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const emit = defineEmits(['success']);

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    errorMessage.value = 'Неверный пароль или почта, любимая ❤️';
    isLoading.value = false;
    return;
  }

  if (data.session) {
    emit('success'); // Уведомляем родительский компонент, что вход выполнен
  }
  isLoading.value = false;
};
</script>

<template>
  <div class="auth-overlay">
    <div class="auth-card">
      <h2>Анека, Привет!</h2>
      <p class="auth-subtitle">Введи пароль, чтобы открыть воспоминания</p>

      <form @submit.prevent="handleLogin" class="auth-form">
        <input 
          type="email" 
          v-model="email" 
          placeholder="Email" 
          required 
          class="auth-input"
        />
        <input 
          type="password" 
          v-model="password" 
          placeholder="Пароль" 
          required 
          class="auth-input"
        />
        
        <p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p>

        <button type="submit" class="auth-btn" :disabled="isLoading">
          {{ isLoading.value ? 'Входим...' : 'Войти' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.auth-card {
  background: #1e293b;
  padding: 40px;
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  text-align: center;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-card h2 {
  margin-bottom: 8px;
  font-size: 24px;
}

.auth-subtitle {
  color: #94a3b8;
  font-size: 14px;
  margin-bottom: 24px;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.auth-input:focus {
  border-color: #38bdf8;
}

.auth-btn {
  width: 100%;
  padding: 12px;
  background: #38bdf8;
  color: #0f172a;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.auth-btn:hover {
  background: #0ea5e9;
}

.auth-error {
  color: #f87171;
  font-size: 13px;
  margin: 0;
}
</style>

