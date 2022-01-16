<script>
  import { fade, fly } from "svelte/transition";
  import Toggle from "svelte-toggle";
  import Cookies, { get } from "js-cookie";
  let menuvisible = false;
  let settingsvisible = false;
  let mqttvisible = false;
  let mqtt = Cookies.get("selectedMQTT");
  let mqttEditEnable;
  try {
    mqtt = JSON.parse(mqtt);
  } catch (e) {
    console.log("Пустой selectedMQTT ", mqtt);
  }

  function toggleTheme() {
    if (Cookies.get("darktheme") == "true") {
      Cookies.set("darktheme", "false", { expires: 365 });
      window.document.body.classList.value = "light-mode";
    } else {
      Cookies.set("darktheme", "true", { expires: 365 });
      window.document.body.classList.toggle("dark-mode");
    }
  }
  // свайп
  function enableSwipe() {
    if (Cookies.get("enableSwipe") == "true") {
      Cookies.set("enableSwipe", "false", { expires: 365 });
    } else {
      Cookies.set("enableSwipe", "true", { expires: 365 });
    }
  }
  // сохранять MQTT в куки
  function enableMQTTcookies() {
    if (Cookies.get("enableMQTTcookies") == "true") {
      Cookies.set("enableMQTTcookies", "false", { expires: 365 });
      Cookies.set("selectedMQTT", "", { expires: -365 });
      mqttEditEnable = false;
    } else {
      Cookies.set("enableMQTTcookies", "true", { expires: 365 });
      mqttEditEnable = true;
    }
  }
  // показать  новый виджет info
  function show_info() {
    if (Cookies.get("show_info") == "true") {
      //Info = false;
      Cookies.set("show_info", "false", { expires: 365 });
    } else {
      //Info = true;
      Cookies.set("show_info", "true", { expires: 365 });
    }
  }
  // использовать новый виджет info
  function showNew_info() {
    if (Cookies.get("showNew_info") == "true") {
      //Info = false;
      Cookies.set("showNew_info", "false", { expires: 365 });
    } else {
      //Info = true;
      Cookies.set("showNew_info", "true", { expires: 365 });
    }
  }
  // использовать WS
  function enableWS() {
    if (Cookies.get("enableWS") == "true") {
      //    Info = false;
      //  nodeInfo = false;
      Cookies.set("enableWS", "false", { expires: 365 });
    } else {
      //  Info = true;
      //  nodeInfo = true;
      Cookies.set("enableWS", "true", { expires: 365 });
    }
  }
  let wsIP = Cookies.get("wsIP");
  function setwsIP() {
    Cookies.set("wsIP", wsIP, { expires: 365 });
  }
  function setMQTT() {
    Cookies.set("selectedMQTT", mqtt, { expires: 365 });
  }
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
      style="margin-left: 15px; cursor: pointer;"
      on:click={() => ((menuvisible = false), (settingsvisible = true))}
    >
      Настройки
    </p>
    <p
      style="margin-left: 15px; cursor: pointer;"
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

    <table>
      <tr>
        <td>Тема светлая / темная</td>
        <td>
          {#if Cookies.get("darktheme") == "true"}
            <Toggle
              on:toggle={() => toggleTheme()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
            />
          {:else}
            <Toggle
              on:toggle={() => toggleTheme()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
              toggled=""
            />
          {/if}
        </td>
      </tr>
      <tr>
        <td>Перелистывание страниц свайпом от края экрана </td>
        <td>
          {#if Cookies.get("enableSwipe") == "true"}
            <Toggle
              on:toggle={() => enableSwipe()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
            />
          {:else}
            <Toggle
              on:toggle={() => enableSwipe()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
              toggled=""
            />
          {/if}</td
        >
      </tr>
      <tr>
        <td>Запоминать последнее выбранное подключение</td>
        <td>
          {#if Cookies.get("enableMQTTcookies") == "true"}
            <Toggle
              on:toggle={() => enableMQTTcookies()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
            />
          {:else}
            <Toggle
              on:toggle={() => enableMQTTcookies()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
              toggled=""
            />
          {/if}</td
        >
      </tr>
      <tr>
        <td>Батарея, RSSI, last_seen в компактном виджете</td>
        <td>
          {#if Cookies.get("showNew_info") === "false"}
            <Toggle
              on:toggle={() => showNew_info()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
              toggled=""
            />
          {:else}
            <Toggle
              on:toggle={() => showNew_info()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
            />
          {/if}</td
        >
      </tr>
      <tr>
        <td>Статус беспроводного датчика скрыть / показать</td>
        <td>
          {#if Cookies.get("show_info") === "false"}
            <Toggle
              on:toggle={() => show_info()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
              toggled=""
            />
          {:else}
            <Toggle
              on:toggle={() => show_info()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
            />
          {/if}</td
        >
      </tr>
      <tr>
        <td>Подключатся к заданному IP</td>
        <td>
          {#if Cookies.get("enableWS") == "true"}
            <Toggle
              disabled
              on:toggle={() => enableWS()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
            />
          {:else}
            <Toggle
              disabled
              on:toggle={() => enableWS()}
              style="float: right"
              label=""
              toggledColor="#6495ED"
              untoggledColor="gray"
              switchColor="#eee"
              toggled=""
            />
          {/if}</td
        >
      </tr>
      <tr>
        <td>IP addres ESP</td>
        <td>
          <input
            disabled
            type="text"
            id="id"
            bind:value={wsIP}
            on:change={setwsIP}
          /></td
        >
      </tr>
    </table>
    <p align="center">
      <button
        style="width: 75px;  display: flex;
        align-items: center;
        justify-content: center; height: calc(1.25rem + 2px);"
        on:click={() => ((settingsvisible = false), window.location.reload())}
        >Закрыть</button
      >
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
    Запоминать последнее выбранное подключение

    {#if Cookies.get("enableMQTTcookies") == "true"}
      <Toggle
        on:toggle={() => enableMQTTcookies()}
        style="float: right"
        label=""
        toggledColor="#6495ED"
        untoggledColor="gray"
        switchColor="#eee"
      />
    {:else}
      <Toggle
        on:toggle={() => enableMQTTcookies()}
        style="float: right"
        label=""
        toggledColor="#6495ED"
        untoggledColor="gray"
        switchColor="#eee"
        toggled=""
      />
    {/if}
    <br /> <br />

    <!-- {JSON.stringify(mqtt)}-->
    <input
      hidden
      type="text"
      id="user_id"
      bind:value={mqtt.user_id}
      on:change={setMQTT}
    />
    <input
      hidden
      type="text"
      id="mqtt_id"
      bind:value={mqtt.mqtt_id}
      on:change={setMQTT}
    />

    Connection_name
    <input
      type="text"
      id="connection_name"
      bind:value={mqtt.connection_name}
      on:change={setMQTT}
    />
    MQTT server
    <input
      type="text"
      id="mqtt_host"
      bind:value={mqtt.mqtt_host}
      on:change={setMQTT}
    />
    MQTT over WebSocket (WSS port)
    <input
      type="text"
      id="mqtt_port"
      bind:value={mqtt.mqtt_port}
      on:change={setMQTT}
    />
    mqtt Prefix
    <input
      type="mqtt_prefix"
      id="id"
      bind:value={mqtt.mqtt_prefix}
      on:change={setMQTT}
    />
    mqtt User
    <input
      type="text"
      id="mqtt_username"
      bind:value={mqtt.mqtt_username}
      on:change={setMQTT}
    />
    mqtt Password
    <input
      type="text"
      id="mqtt_password"
      bind:value={mqtt.mqtt_password}
      on:change={setMQTT}
    />
    mqtt Path
    <input
      type="text"
      id="mqtt_path"
      bind:value={mqtt.mqtt_path}
      on:change={setMQTT}
    />

    <p align="center">
      <button
        style="width: 75px;  display: flex;
      align-items: center;
      justify-content: center; height: calc(1.25rem + 2px);"
        on:click={() => ((mqttvisible = false), window.location.reload())}
        >Закрыть</button
      >
    </p>
  </div>
{/if}

<style>
  table {
    margin-left: 20px;
  }

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
    width: 45%; /* Ширина слоя */
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
  input {
    width: 100%;
    height: calc(1.25rem + 2px);
    background-color: #1d3040;
    color: #bfc2c7;
  }
</style>
