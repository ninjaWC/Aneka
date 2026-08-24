<script setup>
import { ref, watch, onMounted } from 'vue'

// Импорт твоих реальных фотографий
import photo1 from '@/assets/images/photo-1.jpg' // Фото с объятиями возле PAPA
import photo2 from '@/assets/images/photo-2.jpg' // Полароиды с кофе
import photo3 from '@/assets/images/photo-3.jpg' // Тени на стене

// Начальные данные по умолчанию, если в localStorage еще ничего нет
const defaultDays = [
  {
    id: 1,
    date: '12 Октября, 2025',
    title: 'Тот самый теплый вечер вместе',
    image: photo1,
    song: 'Lana Del Rey — Video Games',
  },
  {
    id: 2,
    date: '15 Декабря, 2025',
    title: 'Кофе, уют и наши моменты',
    image: photo2,
    song: 'The Neighbourhood — Sweater Weather',
  },
  {
    id: 3,
    date: '20 Февраля, 2026',
    title: 'Наши тени гуляют по городу',
    image: photo3,
    song: 'CAS — Apocalypse',
  },
]

// Реактивный массив карточек (пробуем загрузить из localStorage)
const memorableDays = ref(defaultDays)

onMounted(() => {
  const savedDays = localStorage.getItem('memorable_days')
  if (savedDays) {
    try {
      memorableDays.value = JSON.parse(savedDays)
    } catch (e) {
      console.error('Ошибка при чтении из localStorage', e)
    }
  }
})

// Автоматически сохраняем в localStorage при любых изменениях
watch(
  memorableDays,
  (newVal) => {
    localStorage.setItem('memorable_days', JSON.stringify(newVal))
  },
  { deep: true },
)

// Состояния модального окна (добавление / редактирование)
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  date: '',
  title: '',
  image: '',
  song: '',
})

// Состояние для увеличения картинки (лайтбокс)
const activeImage = ref(null)

// Открытие модалки для добавления
const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { date: '', title: '', image: '', song: '' }
  isModalOpen.value = true
}

// Открытие модалки для редактирования
const openEditModal = (day, event) => {
  event.stopPropagation() // Чтобы не срабатывал клик по карточке/фото
  isEditing.value = true
  editingId.value = day.id
  form.value = {
    date: day.date,
    title: day.title,
    image: day.image,
    song: day.song,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Сохранение (добавление или обновление)
const handleSave = () => {
  if (!form.value.title || !form.value.date) return

  if (isEditing.value) {
    // Редактирование существующей
    const index = memorableDays.value.findIndex((d) => d.id === editingId.value)
    if (index !== -1) {
      memorableDays.value[index] = {
        id: editingId.value,
        date: form.value.date,
        title: form.value.title,
        image: form.value.image || 'https://via.placeholder.com/400x300',
        song: form.value.song || 'Любимая песня',
      }
    }
  } else {
    // Добавление новой
    memorableDays.value.push({
      id: Date.now(),
      date: form.value.date,
      title: form.value.title,
      image: form.value.image || 'https://via.placeholder.com/400x300',
      song: form.value.song || 'Любимая песня',
    })
  }

  closeModal()
}

// Удаление карточки
const handleDelete = () => {
  if (editingId.value) {
    memorableDays.value = memorableDays.value.filter((d) => d.id !== editingId.value)
    closeModal()
  }
}

const openImageZoom = (imgUrl) => {
  activeImage.value = imgUrl
}

const closeImageZoom = () => {
  activeImage.value = null
}
</script>

<template>
  <section class="memorable-days">
    <h3 class="memorable-days__title title">Memorable Days</h3>

    <div class="memorable-days__content">
      <!-- Карточки памятных дней -->
      <div v-for="day in memorableDays" :key="day.id" class="memorable-days__card">
        <div class="card-header-actions">
          <div class="memorable-days__card-date">{{ day.date }}</div>
          <!-- Кнопка редактирования карточки -->
          <button class="edit-btn" @click="(e) => openEditModal(day, e)" title="Редактировать">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>

        <!-- Клик по фото открывает увеличение -->
        <div class="memorable-days__card-photo" @click="openImageZoom(day.image)">
          <img :src="day.image || 'https://via.placeholder.com/400x300'" :alt="day.title" />
        </div>

        <div class="memorable-days__card-title">{{ day.title }}</div>

        <!-- Мини-плеер для песни в стиле Apple Music -->
        <div class="memorable-days__song-player">
          <div class="song-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div class="song-info">
            <span class="song-name">{{ day.song }}</span>
            <span class="song-label">Ассоциация дня</span>
          </div>
        </div>
      </div>

      <!-- Кнопка добавления нового события -->
      <div class="memorable-days__add-new" @click="openAddModal">
        <div class="memorable-days__add-new__icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
        <div class="memorable-days__add-new__title">Еще памятное событие!</div>
      </div>
    </div>

    <!-- Модальное окно добавления/редактирования в стиле Apple Sheet -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <h3 class="modal-title">
            {{ isEditing ? 'Редактировать воспоминание' : 'Новое воспоминание' }}
          </h3>

          <div class="form-group">
            <label>Дата (например: 12 Октября, 2025)</label>
            <input type="text" v-model="form.date" placeholder="Введите дату..." />
          </div>

          <div class="form-group">
            <label>Заголовок события</label>
            <input type="text" v-model="form.title" placeholder="О чем этот день?" />
          </div>

          <div class="form-group">
            <label>Ссылка на фото (URL или путь)</label>
            <input type="text" v-model="form.image" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>Песня-ассоциация</label>
            <input type="text" v-model="form.song" placeholder="Исполнитель — Трек" />
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">Отмена</button>
            <button class="btn-submit" @click="handleSave">
              {{ isEditing ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>

          <!-- Кнопка удаления видна только при редактировании -->
          <button v-if="isEditing" class="btn-delete" @click="handleDelete">
            Удалить воспоминание
          </button>
        </div>
      </div>
    </Transition>

    <!-- Полноэкранный просмотрщик фото (Лайтбокс) -->
    <Transition name="fade">
      <div v-if="activeImage" class="lightbox-overlay" @click="closeImageZoom">
        <div class="lightbox-content">
          <img :src="activeImage" alt="Увеличенное фото" />
        </div>
      </div>
    </Transition>
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
  background-color: #9ad1d4;
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
  border-radius: 25px;

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

    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.1);
    }

    .card-header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    &-date {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #86868b;
    }

    .edit-btn {
      background: rgba(0, 0, 0, 0.04);
      border: none;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #555;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
        color: #000;
      }
    }

    &-photo {
      border-radius: 16px;
      width: 100%;
      height: 200px;
      overflow: hidden;
      background-color: #e0e0e0;
      cursor: zoom-in;

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
      background: #fa233b;
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
    }

    &__title {
      font-size: 16px;
      font-weight: 600;
      color: #1d1d1f;
      text-align: center;
    }
  }
}

/* Модальное окно (Apple Sheet Style) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: 30px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0 0 10px 0;
  text-align: center;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 12px;
    font-weight: 600;
    color: #86868b;
  }

  input {
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    background: rgba(0, 0, 0, 0.02);
    font-size: 14px;
    color: #1d1d1f;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      background: #fff;
      border-color: #0071e3;
      box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.1);
    }
  }
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;

  button {
    flex: 1;
    padding: 12px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: transform 0.2s ease;

    &:active {
      transform: scale(0.97);
    }
  }

  .btn-cancel {
    background: rgba(0, 0, 0, 0.05);
    color: #1d1d1f;

    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  }

  .btn-submit {
    background: #0071e3;
    color: white;

    &:hover {
      background: #0077ed;
    }
  }
}

.btn-delete {
  background: transparent;
  color: #fa233b;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
  text-align: center;
  margin-top: -4px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
}

/* Полноэкранный просмотрщик фото (Lightbox) */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  cursor: zoom-out;
  padding: 20px;
}

.lightbox-content {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
}

/* Анимации появления */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
