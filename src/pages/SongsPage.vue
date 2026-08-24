<script setup>
import { ref, watch, onMounted } from 'vue'

// Начальные треки по умолчанию
const defaultSongs = [
  {
    id: 1,
    title: 'Video Games',
    artist: 'Lana Del Rey',
    image:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    link: 'https://spotify.com',
  },
  {
    id: 2,
    title: 'Sweater Weather',
    artist: 'The Neighbourhood',
    image:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    link: 'https://spotify.com',
  },
  {
    id: 3,
    title: 'Apocalypse',
    artist: 'Cigarettes After Sex',
    image:
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
    link: 'https://spotify.com',
  },
]

const favoriteSongs = ref(defaultSongs)

onMounted(() => {
  const savedSongs = localStorage.getItem('app_favorite_songs')
  if (savedSongs) {
    try {
      favoriteSongs.value = JSON.parse(savedSongs)
    } catch (e) {
      console.error('Ошибка при чтении любимых песен из localStorage', e)
    }
  }
})

watch(
  favoriteSongs,
  (newVal) => {
    localStorage.setItem('app_favorite_songs', JSON.stringify(newVal))
  },
  { deep: true },
)

// Состояния модального окна
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  title: '',
  artist: '',
  image: '',
  link: '',
})

// Открытие модалки для добавления
const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { title: '', artist: '', image: '', link: '' }
  isModalOpen.value = true
}

// Открытие модалки для редактирования
const openEditModal = (song, event) => {
  if (event.target.closest('.song-card__link-btn')) return

  isEditing.value = true
  editingId.value = song.id
  form.value = {
    title: song.title,
    artist: song.artist,
    image: song.image,
    link: song.link,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Сохранение трека
const handleSave = () => {
  if (!form.value.title || !form.value.artist) return

  if (isEditing.value) {
    const index = favoriteSongs.value.findIndex((s) => s.id === editingId.value)
    if (index !== -1) {
      favoriteSongs.value[index] = {
        id: editingId.value,
        title: form.value.title,
        artist: form.value.artist,
        image: form.value.image || 'https://via.placeholder.com/400x400',
        link: form.value.link || '#',
      }
    }
  } else {
    const newId =
      favoriteSongs.value.length > 0 ? Math.max(...favoriteSongs.value.map((s) => s.id)) + 1 : 1
    favoriteSongs.value.push({
      id: newId,
      title: form.value.title,
      artist: form.value.artist,
      image: form.value.image || 'https://via.placeholder.com/400x400',
      link: form.value.link || '#',
    })
  }

  closeModal()
}

// Удаление трека
const handleDelete = () => {
  if (editingId.value) {
    favoriteSongs.value = favoriteSongs.value.filter((s) => s.id !== editingId.value)
    closeModal()
  }
}
</script>

<template>
  <section class="songs-section">
    <h3 class="songs-section__title title">Favorite Songs</h3>

    <div class="songs-grid">
      <!-- Карточки песен -->
      <div
        v-for="song in favoriteSongs"
        :key="song.id"
        class="song-card"
        @click="(e) => openEditModal(song, e)"
        title="Нажмите, чтобы отредактировать"
      >
        <!-- Фотография/Обложка на всю карточку -->
        <div class="song-card__image-container">
          <img :src="song.image || 'https://via.placeholder.com/400x400'" :alt="song.title" />
        </div>

        <!-- Кнопка со стрелкой в правом верхнем углу (как в вишлисте) -->
        <a
          v-if="song.link"
          :href="song.link"
          target="_blank"
          rel="noopener noreferrer"
          class="song-card__link-btn"
          @click.stop
          title="Слушать трек"
        >
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
            <line x1="7" y1="17" x2="17" y2="7"></line>
            <polyline points="7 7 17 7 17 17"></polyline>
          </svg>
        </a>

        <!-- Информация о треке поверх фото снизу -->
        <div class="song-card__overlay-content">
          <div class="song-meta">
            <span class="song-card__id">№ {{ song.id }}</span>
            <div class="playing-indicator"><span></span><span></span><span></span></div>
          </div>
          <h4 class="song-card__title-text">{{ song.title }}</h4>
          <span class="song-card__artist-text">{{ song.artist }}</span>
        </div>
      </div>

      <!-- Карточка добавления нового трека -->
      <div class="song-card song-add-card" @click="openAddModal">
        <div class="add-icon-circle">
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
        <span class="add-text">Добавить трек</span>
      </div>
    </div>

    <!-- Модальное окно (iOS Sheet Style) -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <h3 class="modal-title">{{ isEditing ? 'Редактировать трек' : 'Новый трек' }}</h3>

          <div class="form-group">
            <label>Название трека</label>
            <input type="text" v-model="form.title" placeholder="Например: Video Games" />
          </div>

          <div class="form-group">
            <label>Исполнитель</label>
            <input type="text" v-model="form.artist" placeholder="Например: Lana Del Rey" />
          </div>

          <div class="form-group">
            <label>Ссылка на обложку (URL)</label>
            <input type="text" v-model="form.image" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>Ссылка на прослушивание (URL)</label>
            <input type="text" v-model="form.link" placeholder="https://spotify.com/..." />
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">Отмена</button>
            <button class="btn-submit" @click="handleSave">
              {{ isEditing ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>

          <button v-if="isEditing" class="btn-delete" @click="handleDelete">Удалить трек</button>
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

.songs-section {
  padding: 0px 20px 40px 20px;
  background-color: #f5f5f7;
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
  border-radius: 25px;
  margin-top: 40px;

  &__title {
    margin: 20px 0 40px 0;
  }
}

.songs-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.song-card {
  position: relative;
  width: 280px;
  height: 380px;
  border-radius: 24px;
  overflow: hidden;
  background: #e0e0e0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);

    .song-card__link-btn {
      opacity: 1;
      transform: scale(1);
    }
  }

  &__image-container {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }
  }

  &:hover &__image-container img {
    transform: scale(1.05);
  }

  /* Кнопка ссылки в правом верхнем углу */
  &__link-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    background: #ffffff;
    color: #1d1d1f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2;

    opacity: 0;
    transform: scale(0.8);
    transition: all 0.3s ease;

    &:hover {
      background: #34c759;
      color: #ffffff;
      transform: scale(1.05);
    }
  }

  &__overlay-content {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.35) 75%,
      transparent 100%
    );
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .song-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }

  &__id {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Анимированные полоски эквалайзера для вайба музыки */
  .playing-indicator {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 12px;

    span {
      width: 3px;
      background: #fa233b;
      border-radius: 1px;
      animation: bounce 1.2s infinite ease-in-out;

      &:nth-child(1) {
        animation-delay: 0s;
        height: 8px;
      }
      &:nth-child(2) {
        animation-delay: 0.2s;
        height: 12px;
      }
      &:nth-child(3) {
        animation-delay: 0.4s;
        height: 6px;
      }
    }
  }

  &__title-text {
    font-size: 17px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__artist-text {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.75);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}

/* Карточка добавления трека */
.song-add-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: #0071e3;
  }

  .add-icon-circle {
    width: 50px;
    height: 50px;
    background: #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1d1d1f;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  .add-text {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
  }
}

/* Модальное окно */
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
