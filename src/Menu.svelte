<script>
  import { fade, fly } from "svelte/transition";
  let menuvisible = false;
  let settingsvisible = false;
  let mqttvisible = false;
</script>

<button
  id="M_button"
  on:focus={() => (
    (menuvisible = true), (settingsvisible = false), (mqttvisible = false)
  )}
  on:blur={() => (menuvisible = false)}
>
  | | |
</button>

{#if menuvisible}
  <div style="position: absolute; z-index: 1;" id="limpid" />
  <div
    style="position: absolute; z-index: 1;"
    in:fly={{ x: -200, duration: 500 }}
    out:fade
    id="leftmenu"
  >
    <br /> <br />
    <p style="margin-left: 15px;" on:click={() => (menuvisible = false)}>
      <a style="color:grey" href="/"> На главную</a>
    </p>
    <p
      style="margin-left: 15px;"
      on:click={() => ((menuvisible = false), (settingsvisible = true))}
    >
      Настройки
    </p>
    <p
      style="margin-left: 15px;"
      on:click={() => ((menuvisible = false), (mqttvisible = true))}
    >
      MQTT
    </p>
    <br /><br />
    <p style="margin-left: 15px;" on:click={() => (menuvisible = false)}>
      <br /><a style="color:grey" href="https://live-control.ru"
        >live-control.ru</a
      >
    </p>
  </div>
{/if}
{#if settingsvisible}
  <div style="position: absolute; z-index: 1;" id="limpid" />
  <div
    style="position: absolute; z-index: 1;"
    in:fly={{ x: -50, duration: 500 }}
    id="settingsmenu"
  >
    <br /> <br />
    settings
    <p align="center">
      <button on:click={() => (settingsvisible = false)}>Закрыть</button>
      <button on:click={() => (settingsvisible = false)}>Сохранить</button>
    </p>
  </div>
{/if}
{#if mqttvisible}
  <div style="position: absolute; z-index: 1;" id="limpid" />
  <div
    style="position: absolute; z-index: 1;"
    in:fly={{ x: -50, duration: 500 }}
    id="settingsmenu"
  >
    <br /> <br />
    mqtt
    <p align="center">
      <button on:click={() => (mqttvisible = false)}>Закрыть</button>
      <button on:click={() => (mqttvisible = false)}>Сохранить</button>
    </p>
  </div>
{/if}

<style>
  #M_button {
    background-color: transparent;
    border-style: solid;
    border-color: #002137;
    color: blueviolet;
  }
  #limpid {
    position: absolute; /* Абсолютное позиционирование */
    left: 0; /* Положение левого края */
    top: 0; /* Положение верхнего края */
    width: 100%; /* Ширина слоя */
    height: 100%;
    background-color: #002137;
    opacity: 0.7;
  }
  #leftmenu {
    position: absolute; /* Абсолютное позиционирование */
    left: 0; /* Положение левого края */
    top: 0; /* Положение верхнего края */
    width: 25%; /* Ширина слоя */
    height: 100%;
    background-image: linear-gradient(
      to right,
      #002137 150px,
      transparent 100%
    );
    color: gray; /* Цвет текста */
    border-radius: 5px; /* Уголки */
  }

  #settingsmenu {
    position: absolute; /* Абсолютное позиционирование */
    left: 10%; /* Положение левого края */
    top: 11%; /* Положение верхнего края */
    width: 80%; /* Ширина слоя */
    height: 85%;
    background-color: #002137;
    color: gray; /* Цвет текста */
    border-radius: 5px; /* Уголки */
  }
  @media screen and (max-width: 650px) {
    #settingsmenu {
      position: absolute; /* Абсолютное позиционирование */
      left: 1%; /* Положение левого края */
      top: 9%; /* Положение верхнего края */
      width: 98%; /* Ширина слоя */
      height: 98%;
    }
  }
</style>
