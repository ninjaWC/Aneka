<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['finish'])

const step = ref(1)
const totalSteps = 4

// Проверка: показывали ли уже интро
const isVisible = ref(false)

onMounted(() => {
  const hasSeenIntro = localStorage.getItem('app_intro_seen')
  if (!hasSeenIntro) {
    isVisible.value = true
  }
})

const nextStep = () => {
  if (step.value < totalSteps) {
    step.value++
  } else {
    finishIntro()
  }
}

const finishIntro = () => {
  isVisible.value = false
  localStorage.setItem('app_intro_seen', 'true')
  emit('finish')
}

// Для возможности пересмотреть интро вручную (если захочешь добавить кнопку в шапку)
const restartIntro = () => {
  step.value = 1
  isVisible.value = true
}

defineExpose({ restartIntro })
</script>

<template>
  <Transition name="fade">
    <div v-if="isVisible" class="intro-overlay">
      <div class="intro-container">
        <!-- Шаг 1: Приветствие -->
        <Transition name="slide-fade" mode="out-in">
          <div v-if="step === 1" key="step1" class="intro-slide">
            <div class="badge-icon">✨</div>
            <h2 class="intro-title">Привет Анека!</h2>
            <p class="intro-text">
              Я долго думал, что подарить такое, что будет приносить пользу долгие годы и останется
              с тобой навсегда.
            </p>
          </div>

          <!-- Шаг 2: Суть подарка -->
          <div v-else-if="step === 2" key="step2" class="intro-slide">
            <div class="badge-icon">💻</div>
            <h2 class="intro-title">Специально для тебя</h2>
            <p class="intro-text">
              И я решил сделать сайт, полностью спроектированный под тебя и твой вайб.
            </p>
          </div>

          <!-- Шаг 3: Функция Wishlist -->
          <div v-else-if="step === 3" key="step3" class="intro-slide">
            <div class="badge-icon">🎁</div>
            <h2 class="intro-title">Умный WishList</h2>
            <p class="intro-text">
              Больше не придется ломать голову, что же подарить — теперь всё собрано в одном месте.
            </p>
            <div class="intro-subtext">
              Тут ты можешь собирать вишлист не только для себя, но и для родных. Создавай, управляй
              и записывай!
            </div>

            <!-- Интерактивная мини-иллюстрация макета с вкладками -->
            <div class="mockup-preview">
              <div class="mockup-tabs">
                <span class="active">Мой</span>
                <span>Мама</span>
                <span>Папа</span>
                <span>Сестренка</span>
              </div>
              <div class="mockup-card-mini">
                <div class="mini-img"></div>
                <div class="mini-info">
                  <div class="line short"></div>
                  <div class="line long"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Шаг 4: Функция Memories -->
          <div v-else-if="step === 4" key="step4" class="intro-slide">
            <div class="badge-icon">✨</div>
            <h2 class="intro-title">Любимые моменты</h2>
            <p class="intro-text">
              Ты можешь сохранять сюда дни и воспоминания, которые запомнились тебе и отзываются в
              сердце.
            </p>
          </div>
        </Transition>

        <!-- Навигация и точки прогресса -->
        <div class="intro-footer">
          <div class="dots">
            <span
              v-for="i in totalSteps"
              :key="i"
              class="dot"
              :class="{ active: step === i }"
              @click="step = i"
            ></span>
          </div>

          <button class="intro-btn" @click="nextStep">
            {{ step === totalSteps ? 'Начать пользоваться' : 'Далее' }}
          </button>
        </div>

        <!-- Кнопка пропустить -->
        <button class="skip-btn" @click="finishIntro" v-if="step < totalSteps">Пропустить</button>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.intro-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

.intro-container {
  position: relative;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 32px;
  padding: 40px 30px 30px 30px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.intro-slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 280px;
}

.badge-icon {
  font-size: 40px;
  margin-bottom: 20px;
  background: rgba(0, 113, 227, 0.1);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(0, 113, 227, 0.08);
}

.intro-title {
  font-size: 26px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.intro-text {
  font-size: 16px;
  line-height: 1.5;
  color: #333336;
  margin: 0 0 16px 0;
}

.intro-subtext {
  font-size: 13px;
  line-height: 1.4;
  color: #86868b;
  margin-bottom: 16px;
  background: rgba(0, 0, 0, 0.03);
  padding: 10px 14px;
  border-radius: 12px;
}

/* Мини-макет для демонстрации вишлиста с папками */
.mockup-preview {
  width: 100%;
  background: #f5f5f7;
  border-radius: 16px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);

  .mockup-tabs {
    display: flex;
    gap: 4px;
    background: rgba(0, 0, 0, 0.05);
    padding: 3px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    color: #666;

    span {
      flex: 1;
      padding: 4px 0;
      border-radius: 6px;
      text-align: center;

      &.active {
        background: #fff;
        color: #1d1d1f;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      }
    }
  }

  .mockup-card-mini {
    background: #fff;
    border-radius: 10px;
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

    .mini-img {
      width: 36px;
      height: 36px;
      background: #e0e0e0;
      border-radius: 6px;
    }

    .mini-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;

      .line {
        height: 6px;
        background: #eee;
        border-radius: 4px;

        &.short {
          width: 40%;
        }
        &.long {
          width: 80%;
          background: #ccc;
        }
      }
    }
  }
}

.intro-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
}

.dots {
  display: flex;
  justify-content: center;
  gap: 8px;

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      width: 24px;
      border-radius: 4px;
      background: #0071e3;
    }
  }
}

.intro-btn {
  width: 100%;
  background: #0071e3;
  color: white;
  border: none;
  padding: 14px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s;
  box-shadow: 0 10px 20px rgba(0, 113, 227, 0.3);

  &:hover {
    background: #0077ed;
  }

  &:active {
    transform: scale(0.98);
  }
}

.skip-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #86868b;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    color: #1d1d1f;
  }
}

/* Анимации переключения шагов */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
