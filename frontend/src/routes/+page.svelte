<script lang="ts">
</script>

<div class="flex flex-col">
  <a href="/app">dashboard</a>
  {#if !localStorage.getItem('token')}
    <a href="/auth/register">Регистрация</a>
    <a href="/auth/login">Войти</a>
  {:else}
    <p>Вы уже в системе</p>
  {/if}
</div>
