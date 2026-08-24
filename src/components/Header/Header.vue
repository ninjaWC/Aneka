<script>
    import { ref } from 'vue';
    import '@/components/Header/module/header.module.scss'; // Style import for the header component

  export default {
    name: 'Header',
  };
</script>

<template>
  <header class="header">
    <div class="container">
      <h1 class="header__title">Amalia</h1>
      <ul class="header__navigation">
        <li><a href="#">Memories</a></li>
        <li><a href="#">Wish List</a></li>
        <li><a href="#">Favorite Songs</a></li>
      </ul>
    </div>
  </header>
</template>

<style lang="scss" scoped>
    body{
        box-sizing: border-box;
    }
    .container{
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 15px;
        
        display: flex;

        align-items: center;
        gap: 40px;
    }

  .header {
    // 1. Фиксируем шапку наверху
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    // 2. Эффект матового стекла
    background: rgba(126, 204, 245, 0.644); /* белый с прозрачностью 70% */
    backdrop-filter: blur(8px);         /* основная магия размытия */
    -webkit-backdrop-filter: blur(8px); /* поддержка для Safari */
    
    // 3. Добавим тонкую границу, чтобы отделить от контента
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px; /* Немного уменьшил отступы для аккуратности */
    transition: background 0.3s ease;

    &__title {
        font-family: "Raleway", sans-serif;
        font-weight: 400;
        margin: 0;
        font-size: 1.5rem;
        color: #1d1d1f;
    }
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    gap: 2rem; /* Увеличил отступ между ссылками, так стильнее */
    display: flex;
    
    & li a {
        color: #333;
        text-decoration: none;
        font-size: 14px;
        font-family: "Raleway", sans-serif;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: color 0.2s ease;
    }
    
    & li a:hover {
        color: #000; /* При наведении делаем текст чуть темнее */
    }
  }
</style>