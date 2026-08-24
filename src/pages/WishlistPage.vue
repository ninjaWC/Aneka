<script setup>
import { ref, watch, onMounted, computed } from 'vue'

// Список членов семьи для вкладок
const familyMembers = [
  { key: 'my', label: 'Мой' },
  { key: 'mom', label: 'Мама' },
  { key: 'dad', label: 'Папа' },
  { key: 'sister', label: 'Сестренка' },
  { key: 'grandma', label: 'Бабушка' },
]

// Активная вкладка по умолчанию
const activeTab = ref('my')

// Начальные данные для каждого члена семьи
const defaultWishlists = {
  my: [
    {
      id: 1,
      title: 'Беспроводные наушники AirPods Max',
      image:
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      link: 'https://apple.com',
    },
    {
      id: 2,
      title: 'Пленочный фотоаппарат Fujifilm',
      image:
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      link: 'https://google.com',
    },
  ],
  mom: [
    {
      id: 1,
      title: 'Шелковый платок',
      image:
        'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&w=600&q=80',
      link: '#',
    },
  ],
  dad: [
    {
      id: 1,
      title: 'Кожаный кошелек',
      image:
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      link: '#',
    },
  ],
  sister: [
    {
      id: 1,
      title: 'Набор косметики',
      image:
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      link: '#',
    },
  ],
  grandma: [
    {
      id: 1,
      title: 'Уютный плед',
      image:
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80',
      link: '#',
    },
  ],
}

// Хранилище всех вишлистов
const wishlistsData = ref(defaultWishlists)

// Загрузка из localStorage при монтировании
onMounted(() => {
  const savedData = localStorage.getItem('app_family_wishlists')
  if (savedData) {
    try {
      wishlistsData.value = JSON.parse(savedData)
    } catch (e) {
      console.error('Ошибка при чтении семейного вишлиста из localStorage', e)
    }
  }
})

// Автосохранение при любых изменениях
watch(
  wishlistsData,
  (newVal) => {
    localStorage.setItem('app_family_wishlists', JSON.stringify(newVal))
  },
  { deep: true },
)

// Текущий список на основе выбранной вкладки
const currentWishlist = computed(() => {
  return wishlistsData.value[activeTab.value] || []
})

// Состояния модального окна
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

const form = ref({
  title: '',
  image: '',
  link: '',
})

// Открытие модалки для добавления
const openAddModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { title: '', image: '', link: '' }
  isModalOpen.value = true
}

// Открытие модалки для редактирования
const openEditModal = (item, event) => {
  if (event.target.closest('.wishlist-card__link-btn')) return

  isEditing.value = true
  editingId.value = item.id
  form.value = {
    title: item.title,
    image: item.image,
    link: item.link,
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

// Сохранение (добавление или обновление) для активного человека
const handleSave = () => {
  if (!form.value.title) return

  const list = wishlistsData.value[activeTab.value]

  if (isEditing.value) {
    const index = list.findIndex((w) => w.id === editingId.value)
    if (index !== -1) {
      list[index] = {
        id: editingId.value,
        title: form.value.title,
        image: form.value.image || 'https://via.placeholder.com/400x500',
        link: form.value.link || '#',
      }
    }
  } else {
    const newId = list.length > 0 ? Math.max(...list.map((w) => w.id)) + 1 : 1
    list.push({
      id: newId,
      title: form.value.title,
      image: form.value.image || 'https://via.placeholder.com/400x500',
      link: form.value.link || '#',
    })
  }

  closeModal()
}

// Удаление карточки из текущего списка
const handleDelete = () => {
  if (editingId.value) {
    wishlistsData.value[activeTab.value] = wishlistsData.value[activeTab.value].filter(
      (w) => w.id !== editingId.value,
    )
    closeModal()
  }
}
</script>

<template>
  <section class="wishlist-section">
    <h3 class="wishlist-section__title title">WishList</h3>

    <!-- Сегментированный переключатель членов семьи (Apple Style) -->
    <div class="family-tabs">
      <button
        v-for="member in familyMembers"
        :key="member.key"
        class="family-tab-btn"
        :class="{ active: activeTab === member.key }"
        @click="activeTab = member.key"
      >
        {{ member.label }}
      </button>
    </div>

    <!-- Сетка карточек выбранного человека -->
    <div class="wishlist-grid">
      <div
        v-for="item in currentWishlist"
        :key="item.id"
        class="wishlist-card"
        @click="(e) => openEditModal(item, e)"
        title="Нажмите, чтобы отредактировать"
      >
        <div class="wishlist-card__image-container">
          <img :src="item.image || 'https://via.placeholder.com/400x500'" :alt="item.title" />
        </div>

        <a
          v-if="item.link && item.link !== '#'"
          :href="item.link"
          target="_blank"
          rel="noopener noreferrer"
          class="wishlist-card__link-btn"
          @click.stop
          title="Открыть ссылку"
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

        <div class="wishlist-card__overlay-content">
          <span class="wishlist-card__id">№ {{ item.id }}</span>
          <h4 class="wishlist-card__title-text">{{ item.title }}</h4>
        </div>
      </div>

      <!-- Кнопка добавления нового желания для текущего человека -->
      <div class="wishlist-card wishlist-add-card" @click="openAddModal">
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
        <span class="add-text">Добавить желание</span>
      </div>
    </div>

    <!-- Модальное окно (iOS Sheet Style) -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <h3 class="modal-title">{{ isEditing ? 'Редактировать желание' : 'Новое желание' }}</h3>

          <div class="form-group">
            <label>Название предмета</label>
            <input type="text" v-model="form.title" placeholder="Что это за вещь?" />
          </div>

          <div class="form-group">
            <label>Ссылка на фото (URL)</label>
            <input type="text" v-model="form.image" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>Ссылка на товар (URL)</label>
            <input type="text" v-model="form.link" placeholder="https://..." />
          </div>

          <div class="modal-actions">
            <button class="btn-cancel" @click="closeModal">Отмена</button>
            <button class="btn-submit" @click="handleSave">
              {{ isEditing ? 'Сохранить' : 'Добавить' }}
            </button>
          </div>

          <button v-if="isEditing" class="btn-delete" @click="handleDelete">Удалить желание</button>
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

.wishlist-section {
  padding: 50px 20px 40px 20px;
  background-color: #f5f5f7;
  font-family:
    -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
  border-radius: 25px;
  margin-top: 0; // Убираем лишний отступ сверху

  &__title {
    margin: 20px 0 15px 0; // Чуть уменьшаем отступ снизу у заголовка
  }
}

/* Сегментированные вкладки семьи в стиле Apple iOS */
.family-tabs {
  display: flex;
  justify-content: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.05);
  padding: 4px;
  border-radius: 14px;
  max-width: fit-content;
  margin: 0 auto 30px auto;
  backdrop-filter: blur(10px);

  .family-tab-btn {
    background: transparent;
    border: none;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 600;
    color: #555;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.25s ease;

    &:hover {
      color: #1d1d1f;
    }

    &.active {
      background: #ffffff;
      color: #1d1d1f;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }
}

.wishlist-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.wishlist-card {
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

    .wishlist-card__link-btn {
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
      rgba(0, 0, 0, 0.75) 0%,
      rgba(0, 0, 0, 0.3) 70%,
      transparent 100%
    );
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__id {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__title-text {
    font-size: 16px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.wishlist-add-card {
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
