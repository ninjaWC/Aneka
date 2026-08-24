<script setup>
import { ref } from 'vue';

// Реактивный массив карточек (сюда потом можно будет легко подключить добавление новых)
const memorableDays = ref([
  {
    id: 1,
    date: '12 Октября, 2025',
    title: 'Наша первая поездка',
    image: '', // сюда ссылку на фото
    song: 'Lana Del Rey — Video Games'
  },
  {
    id: 2,
    date: '15 Декабря, 2025',
    title: 'Тот самый вечер в кофейне',
    image: '',
    song: 'The Neighbourhood — Sweater Weather'
  },
  {
    id: 3,
    date: '20 Февраля, 2026',
    title: 'Парк аттракционов',
    image: '',
    song: 'CAS — Apocalypse'
  }
]);

const addNewDay = () => {
  // Логика добавления нового памятного дня
  console.log('Добавить новое событие');
};
</script>

<template>
  <section class="memorable-days">
    <h3 class="memorable-days__title title">Memorable Days</h3>
    
    <div class="memorable-days__content">
      <!-- Карточки памятных дней -->
      <div 
        v-for="day in memorableDays" 
        :key="day.id" 
        class="memorable-days__card"
      >
        <div class="memorable-days__card-date">{{ day.date }}</div>
        
        <div class="memorable-days__card-photo">
          <img :src="day.image || 'https://via.placeholder.com/400x300'" :alt="day.title">
        </div>
        
        <div class="memorable-days__card-title">{{ day.title }}</div>

        <!-- Мини-плеер для песни в стиле Apple Music -->
        <div class="memorable-days__song-player">
          <div class="song-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div class="song-info">
            <span class="song-name">{{ day.song }}</span>
            <span class="song-label">Ассоциация дня</span>
          </div>
        </div>
      </div>

      <!-- Кнопка добавления нового события -->
      <div class="memorable-days__add-new" @click="addNewDay">
        <div class="memorable-days__add-new__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div class="memorable-days__add-new__title">Еще памятное событие!</div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.title {
  padding: 0;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #1d1d1f;
  text-align: center;
  letter-spacing: -0.5px;
}

.memorable-days {
  padding: 40px 20px;
  background-color: #9AD1D4;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif;

  &__content {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  &__title {
    margin: 20px 0 40px 0;
  }

  &__card {
    width: 300px;
    min-height: 420px;
    padding: 18px;
    border-radius: 24px;
    
    /* Эффект матового стекла в стиле Apple */
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
    
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
    }

    &-date {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #86868b;
      margin-bottom: 8px;
    }

    &-photo {
      border-radius: 16px;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background-color: #e0e0e0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
    }

    &:hover &-photo img {
      transform: scale(1.03);
    }

    &-title {
      font-size: 17px;
      font-weight: 600;
      color: #1d1d1f;
      margin: 12px 0 4px 0;
      line-height: 1.3;
    }
  }

  /* Плеер внутри карточки */
  &__song-player {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.03);
    padding: 8px 12px;
    border-radius: 14px;
    margin-top: auto;

    .song-icon {
      width: 28px;
      height: 28px;
      background: #fa233b; /* Фирменный красный Apple Music */
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .song-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .song-name {
        font-size: 12px;
        font-weight: 600;
        color: #1d1d1f;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .song-label {
        font-size: 10px;
        color: #86868b;
      }
    }
  }

  /* Кнопка добавления нового события */
  &__add-new {
    width: 300px;
    min-height: 420px;
    border-radius: 24px;
    padding: 20px;
    
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    border: 2px dashed rgba(255, 255, 255, 0.7);
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.6);
      border-color: rgba(255, 255, 255, 1);
      transform: translateY(-4px);
    }

    &__icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1d1d1f;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border-radius: 50%;
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: #1d1d1f;
      text-align: center;
    }
  }
}
</style>