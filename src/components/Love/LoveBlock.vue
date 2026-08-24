<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const loveReasons = ref({
  "mama":['Прежде всего я люблю тебя за то что ты моя, мой первый ребенок - первая доча! Наша с папой божественное создание появившаяся в любви и согласии!', 'Я люблю тебя с самого первого момента как я узнала о своем положении. Я люблю тебя за то, что ты нас осчастливила появившись в нашей жизни!',' Я люблю тебя всю такую какая ты есть сейчас! Люблю что в тебе перемешены две семьи, которые породнились и создали микс всех характеров и внешних данных.','Я очень люблю тебя за твой иногда вздорный характер, стойкий дух, здоровую самовлюбленность, четкий ум, острый юмор, мягкий эгоцентризм и не смотря на молодость мудрость!' , 'Я люблю твою ангельскую улыбку и личико, твою нежность в движениях, твой звонкий смех, твою милую злость, твои большие объятия и слёзы бусинками. Я люблю тебя за то, что ты меня меняешь и безмерно любишь. Я люблю тебя за то, что ты просто есть в этом мире у меня, у папы, у Яси, у бабушек с дедушками, у Али и у всех кто хоть как-то с тобой контактировал. Ты моя жизнь, ты моя вселенная! Я тебя очень люблю!!!'],
  "papa":['Она мой первенец. Она то чудо, которое не сразу осознаешь, но потом любуешься сквозь слезы счастья.', ' Первые 6 лет  она наполняла нашу жизнь : и громким плачем с бессонными ночами, и сладким смехом с умиленными фразами. Она   росла ангелочком со своей индивидуальностью', ' Когда родилась Ясмин, стала настоящей старшей сестрой. Забота и ответственность были на удивление положительными качествами маленькой девочки.','Сильный и волевой характер, формирование высокого EQ делали старшеклассницу независимую и целеустремленную.','Сейчас ей 22. Она взрослая и самодостаточная. Есть четкие планы на жизнь. Умеет радоваться и получать удовольствие от всего происходящего. Ведущий лидер! Анель моя гордость и моя большая любовь. Пусть преграды в ее жизни будут пологими и сыпучими.'],
  "azheka":['Я люблю Анюшу за то, что она целеустремлённая.', 'Я люблю её за то, что искренняя.', 'Я люблю её за то, что она очень умная.', 'Я люблю её за то, что она добрая.', 'Я люблю Анелек за то, что она моя первая внучка.'],
  "yasmin":['Я люблю Анюшу за то, что она целеустремлённая.', 'Я люблю её за то, что искренняя.', 'Я люблю её за то, что она очень умная.', 'Я люблю её за то, что она добрая.', 'Я люблю Анелек за то, что она моя первая внучка.']
});

let lastReasonIndex = -1; 
let lastPersonKey = ''; 

// Текущие индексы храним в ref, чтобы Vue отслеживал изменения для computed
const currentPersonKey = ref('mama');
const currentReasonIndex = ref(0);

// Вычисляемое свойство для текста и автора
const currentData = computed(() => {
  const texts = loveReasons.value[currentPersonKey.value];
  return {
    text: texts[currentReasonIndex.value],
    author: currentPersonKey.value
  };
});

function getRandomReason() {
  const keys = Object.keys(loveReasons.value);
  
  let randomKey, randomIndex;
  
  // Цикл гарантирует, что не выпадет точно такая же цитата подряд
  do {
    randomKey = keys[Math.floor(Math.random() * keys.length)];
    const texts = loveReasons.value[randomKey];
    randomIndex = Math.floor(Math.random() * texts.length);
  } while (randomKey === lastPersonKey && randomIndex === lastReasonIndex);

  lastPersonKey = randomKey;
  lastReasonIndex = randomIndex;

  currentPersonKey.value = randomKey;
  currentReasonIndex.value = randomIndex;
}

let timer = null;

onMounted(() => {
  console.log('LoveBlock component mounted');
  getRandomReason();
  // Автоматическая смена каждые 6 секунд
  // timer = setInterval(getRandomReason, 6000);
});

onUnmounted(() => {
  clearInterval(timer);
});

// export default {
//   name: 'LoveBlock',
// };
</script>

<template>
  <section class="love-block">
    <h3 class="love-block__title">Why do we love Anel?</h3>
    
    <div @click="getRandomReason()" class="love-block__content">
      <!-- Анимация выпадения и растворения текста -->
      <Transition name="fade-slide" mode="out-in">
        <div :key="currentData.text" class="love-block__card-inner">
          <p class="love-block__text">{{ currentData.text }}</p>
          <span class="love-block-author">— {{ currentData.author }}</span>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .love-block {
    padding: 30px;
    margin-top: 50px;
    background-color: #F4C095;
    border-radius: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-align: center;
    cursor: pointer;
    width: 96%;
    min-height: 100px;
    margin-left: auto;
    margin-right: auto;
    user-select: none;

    
    &__title {
      font-size: 1.8rem;
      margin-bottom: 20px;
      color: #1d1d1f;

      font-family: "Raleway", sans-serif;
      font-weight: 700;
    }
    
    &__content {
      min-height: 120px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    &__card-inner {
      padding-right: 40px;
    }

    &__text {
      font-size: 1.5rem;
      color: #333;
      line-height: 1.5;
      margin: 0 0 15px 0;

      font-family: "Caveat", cursive;
      font-weight: 500;
    }
    
    &-author {
      font-family: "Caveat", cursive;
      font-weight: 500;
      font-size: 1.2rem;
      color: #666;
      // text-transform: uppercase;
      letter-spacing: 0.5px;
      
    }
  }

  /* Настройки анимации выпадания (fade + смещение по вертикали) */
  .fade-slide-enter-active,
  .fade-slide-leave-active {
    transition: opacity 0.4s ease, transform 0.4s ease;
  }

  .fade-slide-enter-from {
    opacity: 0;
    transform: translateY(-10px); /* Выпадает сверху вниз */
  }

  .fade-slide-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>
