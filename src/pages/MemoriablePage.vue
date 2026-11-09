<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '@/supabase';

const memories = ref([]);
const isLoading = ref(true);

// Состояния модалки и формы
const isModalOpen = ref(false);
const isEditing = ref(false);
const editingId = ref(null);

const fileInput = ref(null);
const selectedFile = ref(null);
const previewImage = ref('');

// Состояние для зума картинки
const isZoomOpen = ref(false);
const activeZoomImage = ref('');
const openImageZoom = (photoUrl) => {
  if (!photoUrl) return;
  activeZoomImage.value = photoUrl;
  isZoomOpen.value = true;
};
const closeImageZoom = () => {
  isZoomOpen.value = false;
  activeZoomImage.value = '';
};


const form = ref({
  date: '',
  title: '',
  song: '',
  photo: '' // Здесь хранится URL картинки из Supabase Storage
});

// 1. Получение всех воспоминаний
const fetchMemories = async () => {
  isLoading.value = true;
  const { data, error } = await supabase
    .from('MemorableDays')
    .select('*')
    .order('id', { ascending: true });
  if (error) {
    console.error('Ошибка при загрузке воспоминаний:', error.message);
    alert('что-то пошло не так, напиши мне жаным моя');
  } else {
    memories.value = data;
  }
  isLoading.value = false;
  memories.value = data;
  console.log('Fetched memories:', memories.value);
  return data;
};
onMounted(() => {
  fetchMemories();
});

// Открытие модалки для создания
const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  isModalOpen.value = true;
};

// Открытие модалки для редактирования
const openEditModal = (item) => {
  isEditing.value = true;
  editingId.value = item.id;
  form.value = {
    date: item.date,
    title: item.title,
    song: item.song,
    photo: item.photo
  };
  previewImage.value = item.photo; // Показываем текущую картинку в превью
  selectedFile.value = null;
  isModalOpen.value = true;
};

//Сжимаем фоточки перед пушем в БД
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Пропорционально уменьшаем, если картинка шире лимита
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в Blob с заданным качеством (0.8 = 80%)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Ошибка сжатия изображения'));
              return;
            }
            // Создаем новый файл с тем же именем, но сжатый
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};


// Выбор нового файла
const handleFileSelect = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const compressedFile = await compressImage(file, 1200, 0.8);
      selectedFile.value = compressedFile;
      previewImage.value = URL.createObjectURL(compressedFile);
    } catch (err) {
      console.error('Не удалось сжать картинку:', err);
      // Если что-то пошло не так, фоллбечим на оригинал
      selectedFile.value = file;
      previewImage.value = URL.createObjectURL(file);
    }
  }
};


// Полный сброс формы
const resetForm = () => {
  form.value = { date: '', title: '', song: '', photo: '' };
  selectedFile.value = null;
  previewImage.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const closeModal = () => {
  resetForm();
  isModalOpen.value = false;
};

// 2. Сохранение (Create / Update)
const handleSave = async () => {
  if (!form.value.title) return;

  let photoUrl = form.value.photo;
  let uploadedFileName = null; // Будем хранить имя файла на случай отката

  // 1. Если выбрали файл — заливаем в Storage
  if (selectedFile.value) {
    const file = selectedFile.value;
    uploadedFileName = `${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(uploadedFileName, file);

    if (uploadError) {
      console.error('Ошибка загрузки фото:', uploadError.message);
      return;
    }

    const { data: publicURLData } = supabase.storage
      .from('memories')
      .getPublicUrl(uploadedFileName);

    photoUrl = publicURLData.publicUrl;
  }

  // 2. Пытаемся сохранить запись в БД
  const { data, error } = await supabase
    .from('MemorableDays')
    .insert([{
      title: form.value.title,
      date: form.value.date,
      description: 'Пока эти описание не включено в UI',
      photo: photoUrl,
      song: form.value.song
    }])
    .select();

  // 3. ЕСЛИ база выдала ошибку — откатываем загрузку файла (удаляем из бакета)
  if (error) {
    console.error('Ошибка при создании записи в БД:', error.message);
    
    if (uploadedFileName) {
      await supabase.storage
        .from('memories')
        .remove([uploadedFileName]);
      console.log('Файл успешно удален из хранилища из-за ошибки в БД');
    }
    return;
  }

  // Если всё успешно — добавляем в стейт и закрываем модалку
  if (data) {
    memories.value.push(data[0]);
    closeModal();
  }
};

// 3. Удаление
const handleDelete = async () => {
  if (!editingId.value) return;

  const { error } = await supabase
    .from('MemorableDays')
    .delete()
    .eq('id', editingId.value);

  if (!error) {
    memories.value = memories.value.filter(m => m.id !== editingId.value);
    closeModal();
  } else {
    console.error('Ошибка при удалении:', error.message);
  }
};

</script>

<template>
  <section class="memorable-days">
    <h3 class="memorable-days__title title">Memorable Days</h3>

    <div class="memorable-days__content">
      <!-- Карточки памятных дней -->
      <div v-for="day in memories" :key="day.id" class="memorable-days__card">
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
        <div class="memorable-days__card-photo" @click="openImageZoom(day.photo)">
          <img :src="day.photo" :alt="day.title" />
        </div>
        <!-- модальное окно открытой фотографии -->
         <!-- ТУТ НАДО ПЕРЕСМОТРЕТЬ МЕСТО КУДА ЕГО СТОИТ ВПИХНУТЬ, ТУТ НЕ ВАРИАНТ, ВЕРСТКА ЛОМАЕТСЯ И МОДАЛКА В РАМКАХ КАРТОЧКИ ОТРКЫВАЕТСЯ -->
        
        <div class="memorable-days__card-title">{{ day.title }}</div>

        <!-- Мини-плеер для песни в стиле Apple Music -->
        <!-- <div class="memorable-days__song-player">
          <div class="song-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <div class="song-info">
            <span class="song-name">{{ day.song }}</span>
            <span class="song-label">Ассоциация дня</span>
          </div>
        </div> -->
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
    <div v-if="isZoomOpen" class="image-zoom-modal" @click="closeImageZoom">
      <div class="image-zoom-content" @click.stop>
        <img :src="activeZoomImage" alt="Увеличенное воспоминание" />
        <button class="image-zoom-close" @click="closeImageZoom">✕</button>
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
            <label>Дата</label>
            <input type="date" v-model="form.date" placeholder="Введите дату..." />
          </div>

          <div class="form-group">
            <label>Заголовок события</label>
            <input type="text" v-model="form.title" placeholder="О чем этот день?" />
          </div>

          <div class="form-group">
    <label>Фотография воспоминания</label>
    
    <!-- Скрытый инпут для файлов -->
    <input 
      type="file" 
      ref="fileInput" 
      accept="image/*" 
      style="display: none" 
      @change="handleFileSelect"
    />

    <!-- Кастомная кнопка выбора / Превью -->
    <div class="photo-picker" @click="$refs.fileInput.click()">
      <img v-if="previewImage" :src="previewImage" class="photo-preview" />
      <div v-else class="photo-placeholder">
        <span>📷 Нажми, чтобы выбрать фото</span>
      </div>
    </div>
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
  // width: 100%;

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
/* Обертка для загрузки/превью внутри модалки */
.photo-picker {
  width: 100%;
  height: 160px; /* Фиксированная зона под фото в модалке */
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  overflow: hidden; /* Жестко режет всё, что вылазит за рамки модалки */
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
}

/* Сама картинка превью в модалке */
.photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Аккуратно вписывает фото в блок без разрыва верстки */
  display: block;
}

.photo-placeholder {
  text-align: center;
  color: #fff;
  font-size: 14px;
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


// РЕФАКТОРИНГ: Модалка увеличенной картинки

.image-zoom-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  cursor: pointer;
}

.image-zoom-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-zoom-content img {
  width: 100%;
  height: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.image-zoom-close {
  position: absolute;
  top: -15px;
  right: -15px;
  background: #fff;
  color: #000;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

</style>

