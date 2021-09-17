<script>
  import { onMount } from "svelte";
  import Cookies from "js-cookie";
  import { Tabs, Tab, TabList, TabPanel } from "svelte-tabs";
  import Toggle from "svelte-toggle";
  import { fade, fly } from "svelte/transition";
  import SvelteTooltip from "svelte-tooltip";
  import Box from "./Box.svelte";
  import Modal from "./Modal.svelte";

  let showModal = false;
  let isDragging = false;
  let info;
  let ID;
  let X;
  let Y;
  let selected = -1;
  let pages = [];

  let myWidgets = [
    {
      pos: {},
      widget: "btn",
      after: "",
      icon: "speedometer",
      info: " ",
      page: "MySensors",
      order: "1",
      descr: "MySensors uptime",
      topic: "/demo/14919376-1458208/upt9",
    },
    {
      pos: {},
      widget: "btn",
      after: "°С",
      icon: "thermometer",
      font: "OCR A Std",
      color: [
        { level: 0, value: "#0000CC" },
        { level: 12, value: "#3366FF" },
        { level: 16, value: "#33CCFF" },
        { level: 30, value: "#009933" },
        { level: 100, value: "#FF9900" },
      ],
      info: " ",
      page: "MySensors",
      order: "2",
      descr: "🌡Температура 2",
      topic: "/demo/14919376-1458208/2-1",
    },
    {
      pos: {},
      widget: "select",
      options: ["OF", "ON"],
      status: 0,
      info: " ",
      page: "MySensors",
      order: "10",
      descr: "💡Реле",
      topic: "/demo/14919376-1458208/btn39",
    },
  ];
  let widgetsType = {
    undef: "Ошибка",
    toggleBtn: "Переключатель",
    btn: "Кнопка",
    select: "Кнопка переключатель",
    range: "Ползунок",
    inputDate: "Окно ввода даты",
    inputTime: "Окно ввода времени 1",
    inputTimeClock: "Окно ввода времени 2",
    inputDigit: "Окно ввода цифры",
    inputDigitTemp: "Окно ввода температуры",
    inputText: "Окно ввода текста",
    chart: "График без точек",
    chart2: "График с точками",
    chart3: "График дневного расхода (столбики)",
    chart4: "График дневного расхода (плавный)",
    fillgauge: "Бочка",
    "progress-line": "Линия",
    "progress-round": "Круг",
    anydata: "Текст",
    anydataHum: "Влажность (%)",
    anydataPress: "Давление (mm)",
    anydataTemp: "Температура (°С)",
    anydataPpb: "Части на миллиард (ppb)",
    anydataPpm: "Части на миллион (ppm)",
    anydataVlt: "Напряжение (Vlt)",
    anydataAmp: "Сила тока (Amp)",
    anydataWtt: "Мощность (Wtt)",
    anydataWhr: "Энергия (Whr)",
    anydataHtz: "Частота (Htz)",
    anydataTime: "Манометр",
    alarm: "Тревожное сообщение 1",
    anydataAlarm: "Тревожное сообщение 2",
    na: "Без виджета",
  };
  let widgets = [
    {
      description: "Переключатель управляющий пином",
      tupe: "button-out",
      idPref: "btn",
      widget: "toggleBtn",
      pageName: "Главная",
      pageID: "1",
      name: "Переключатель (вкл=1)",
      order: "1",
      pin: "2",
    },
    {
      description: "Переключатель управляющий пином (с инверсией)",
      tupe: "button-out",
      idPref: "btn",
      widget: "toggleBtn",
      pageName: "Главная",
      pageID: "",
      name: "Переключатель (вкл=0)",
      order: "",
      pin: "2",
      inv: "[1]",
    },
    {
      description:
        "Переключатель виртуальный (не привязанный к пину, для использования в сценариях)",
      tupe: "button-out",
      idPref: "btn",
      widget: "toggleBtn",
      pageName: "Главная",
      pageID: "",
      name: "Переключатель виртуальный (без PIN)",
      order: "",
    },
    {
      description:
        "Кнопка физическая, чтение состояния пина (подключается провдами к устройству)",
      tupe: "button-in",
      idPref: "btn",
      widget: "toggleBtn",
      pageName: "Главная",
      pageID: "",
      name: "Чтение состояния PIN",
      order: "",
      pin: "2",
      db: "[20]",
    },
    {
      description: "Кнопка без фиксации",
      tupe: "input-value",
      idPref: "dgt",
      widget: "btn",
      pageName: "Главная",
      pageID: "",
      name: "Кнопка - 'звонок'",
      order: "",
      pin: "2",
    },
    {
      description: "Кнопка виртуальная",
      tupe: "input-value",
      idPref: "dgt",
      widget: "btn",
      pageName: "Главная",
      pageID: "",
      name: "Кнопка - без PIN",
      order: "",
    },
    {
      description: "Кнопка переключатель",
      tupe: "input-value",
      idPref: "dgt",
      widget: "select",
      pageName: "Главная",
      pageID: "",
      name: "Кнопка переключатель (вкл/выкл)",
      order: "",
      pin: "2",
    },
    {
      description: "Широтно импульсная модуляция pwm",
      tupe: "pwm-out",
      idPref: "pwm",
      widget: "range",
      pageName: "Главная",
      pageID: "",
      name: "яркость  громкость",
      order: "",
      pin: "2",
    },
    {
      description: "Окно ввода цифровых значений",
      tupe: "input-value",
      idPref: "dgt",
      widget: "inputDigit",
      pageName: "Главная",
      pageID: "",
      name: "окно ввода цифры",
      order: "",
    },
  ];
  onMount(async () => {
    // setStartPosition();
    findNewPage();
  });
  document.addEventListener("mousedown", function (event) {
    let dragElement = event.target.closest(".draggable");
    if (!dragElement) return;
    event.preventDefault();
    dragElement.ondragstart = function () {
      return false;
    };
    let coords, shiftX, shiftY;
    startDrag(dragElement, event.clientX, event.clientY);
    function onMouseUp(event) {
      finishDrag();
    }
    function onMouseMove(event) {
      moveAt(event.clientX, event.clientY);
    }
    function startDrag(element, clientX, clientY) {
      if (isDragging) {
        return;
      }
      isDragging = true;
      document.addEventListener("mousemove", onMouseMove);
      element.addEventListener("mouseup", onMouseUp);
      shiftX = clientX - element.getBoundingClientRect().left;
      shiftY = clientY - element.getBoundingClientRect().top;
      element.style.position = "fixed";
      moveAt(clientX, clientY);
    }
    function finishDrag() {
      if (!isDragging) {
        return;
      }
      isDragging = false;
      dragElement.style.top =
        parseInt(dragElement.style.top) + pageYOffset + "px";
      dragElement.style.position = "absolute";
      document.removeEventListener("mousemove", onMouseMove);
      dragElement.removeEventListener("mouseup", onMouseUp);
    }
    function moveAt(clientX, clientY) {
      let newX = clientX - shiftX;
      let newY = clientY - shiftY;
      let newBottom = newY + dragElement.offsetHeight;
      if (newBottom > document.documentElement.clientHeight) {
        let docBottom = document.documentElement.getBoundingClientRect().bottom;
        let scrollY = Math.min(docBottom - newBottom, 10);
        if (scrollY < 0) scrollY = 0;
        window.scrollBy(0, scrollY);
        newY = Math.min(
          newY,
          document.documentElement.clientHeight - dragElement.offsetHeight
        );
      }
      if (newY < 0) {
        let scrollY = Math.min(-newY, 10);
        if (scrollY < 0) scrollY = 0; // проверяем ошибки точности
        window.scrollBy(0, -scrollY);
        newY = Math.max(newY, 0); // newY не может быть меньше нуля
      }
      if (newX < 0) newX = 0;
      if (
        newX >
        document.documentElement.clientWidth - dragElement.offsetWidth
      ) {
        newX = document.documentElement.clientWidth - dragElement.offsetWidth;
      }
      dragElement.style.left = newX + "px";
      dragElement.style.top = newY + "px";
      //-----------------------------------------
      info =
        JSON.stringify(dragElement.id) +
        dragElement.style.top +
        dragElement.style.left;
      ID = JSON.stringify(dragElement.id);
      X = dragElement.style.top;
      Y = dragElement.style.left;
      setCoord();
      //-----------------------------------------
    }
  });
  // ------------------------------------------------
  let draggable = false;
  document.addEventListener("keydown", function (event) {
    if (event.code == "AltLeft") {
      draggable = true;
    }
  });
  document.addEventListener("keyup", function (event) {
    if (event.code == "AltLeft") {
      draggable = false;
    }
  });

  //-------------------------------------------
  function setCoord() {
    ID = JSON.parse(ID);
    if (ID.indexOf("btn") == 0) {
      ID = ID.split("btn").join("");
      myWidgets[ID]["pos"]["x"] = X;
      myWidgets[ID]["pos"]["y"] = Y;
    }
    if (ID.indexOf("lable") == 0) {
      ID = ID.split("lable").join("");
      myWidgets[ID].pos["lx"] = X;
      myWidgets[ID].pos["ly"] = Y;
    }
  }

  //-------------------------------------------
  //-------------------------------------------
  function download_json(dt) {
    console.log(dt);
    var json = "";
    json += JSON.stringify(dt, null, 3);
    var uricontent = "data:application/octet-stream," + encodeURI(json);
    var newwin = window.open("", "_blank");
    var elem = newwin.document.createElement("a");
    elem.download = "config.json";
    elem.href = uricontent;
    elem.click();
    setTimeout(function () {
      newwin.close();
    }, 0);
  }
  //--------------------------------------------
  let visible = true;
  function select(i) {
    selected = i;
  }
  // -----------------------------------------
  function sort(i) {
    myWidgets.sort((a, b) => a.order - b.order);
    myWidgets = myWidgets;
    selected = i;
  }

  function add(i) {
    widgets[i]["pos"] = {};
    myWidgets = [...myWidgets, JSON.parse(JSON.stringify(widgets[i]))];
    if (widgets[i].tupe == "button-out") {
      myWidgets[myWidgets.length - 1].id =
        "btn" + Math.floor(Math.random() * 1000);
      myWidgets[myWidgets.length - 1].order = myWidgets.length;
    } else {
      myWidgets[myWidgets.length - 1].id = Math.floor(Math.random() * 10000);
      myWidgets[myWidgets.length - 1].order = myWidgets.length;
    }
    myWidgets = myWidgets;
    findNewPage();
  }
  function findNewPage() {
    pages = [];
    const newPage = Array.from(
      new Set(Array.from(myWidgets, ({ page }) => page))
    );
    newPage.forEach(function (item, i, arr) {
      pages = [...pages, JSON.parse(JSON.stringify({ page: item }))];
    });
    pages.sort(function (a, b) {
      if (a.page < b.page) {
        return -1;
      }
      if (a.page > b.page) {
        return 1;
      }
      return 0;
    });
  }
  function remove(widget) {
    myWidgets = myWidgets.filter((t) => t !== widget);
    findNewPage();
    //	console.log('remove',widget)
  }

  let StartPosition = 10;
  function setStartPosition() {
    myWidgets.forEach(function (item, i, arr) {
      let pos_y = item.x;
      if (pos_y.split("px").join("") > StartPosition) {
        StartPosition = pos_y.split("px").join("");
      }
    });
  }

  // ------------------ загрузка файлас с PC----------------
  let files;
  $: if (files) {
    console.log(files);
    for (const file of files) {
      console.log(`${file.name}: ${file.size} байт(а)`);
      let reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function () {
        console.log(reader.result);
        myWidgets = JSON.parse(reader.result);
        findNewPage();
        files = null;
      };

      reader.onerror = function () {
        console.log(reader.error);
      };
    }
  }
  function setcentr(widget, descr) {
    let style;
    if (descr == 1) {
      style = widget.pos.ly
        ? "position: absolute; left: " +
          widget.pos.ly +
          "; top: " +
          widget.pos.lx
        : "display: block; margin-left: auto; margin-right: auto; text-align: center";
    } else {
      style = widget.pos.y
        ? "position: absolute; left: " + widget.pos.y + "; top: " + widget.pos.x
        : "display: block; margin-left: auto; margin-right: auto; text-align: center";
    }
    return style;
  }
  function setleft(widget, descr) {
    let style;
    if (descr == 1) {
      style = widget.pos.ly
        ? "position: absolute; left: " +
          widget.pos.ly +
          "; top: " +
          widget.pos.lx
        : "margin:0;  float: left;";
    } else {
      style = widget.pos.y
        ? "position: absolute; left: " + widget.pos.y + "; top: " + widget.pos.x
        : "margin:0;  float: left;";
    }
    return style;
  }
  function setright(widget, descr) {
    let style;
    if (descr === 1) {
      style = widget.pos.ly
        ? "position: absolute; left: " +
          widget.pos.ly +
          "; top: " +
          widget.pos.lx
        : "margin:0; float: right;";
    } else {
      style = widget.pos.y
        ? "position: absolute; left: " + widget.pos.y + "; top: " + widget.pos.x
        : "margin:0; float: right;";
    }
    return style;
  }
</script>

<div class="block-1">
  <!--------------блок 1------------------------->
  <select>
    <option>ESP_1(192.168.1.xxx)</option>
    <option>ESP_2(192.168.1.yyy)</option>
  </select>

  <div>
    <label>
      <input
        class="input-file"
        accept=".json"
        bind:files
        id="file"
        type="file"
      />
      <span
        style="position: absolute;top:0; right:0%; border: 2px solid lightblue; border-radius: 8px;height:20px; line-height: 0.9; background-color:#F0F0F0; "
        >&nbsp;Load&nbsp;</span
      >
    </label>
  </div>

  <button
    on:click={function () {
      download_json(myWidgets);
    }}
    style="position: absolute;top:0; right:10%; border: 1px solid lightblue; border-radius: 8px;height:25px; line-height: 0.5;"
    >Seve to PC</button
  >
  <button
    style="position: absolute;top:0; right:25%; border: 1px solid lightblue; border-radius: 8px; height:25px; line-height: 0.5;"
    >Seve to ESP</button
  >

  <br />
  {JSON.stringify(myWidgets)}
  <Tabs>
    <TabList>
      {#each pages as pagesName, i}
        <Tab>{pagesName.page}</Tab>
      {/each}
    </TabList>

    {#each pages as pagesName, i}
      <TabPanel>
        {#each myWidgets as wiget, i}
          {#if wiget.page == pagesName.page}
            <div style="margin-left:10px">
              {#if selected == i}
                <span
                  style={setleft(wiget, 1)}
                  in:fade={{ duration: 1000 }}
                  on:click={function () {
                    select(i);
                  }}
                  class:draggable
                  id="lable{i}"
                >
                  {i}

                  {wiget.descr}
                  <h6 style="display: inline;">({wiget.topic})</h6>
                  <h6 style="display: inline;">
                    {wiget.pin ? "PIN(" + wiget.pin + ")" : ""}
                  </h6>
                </span>
              {:else}
                <span
                  style={setleft(wiget, 1)}
                  in:fade={{ duration: 1000 }}
                  on:click={function () {
                    select(i);
                  }}
                  class:draggable
                  id="lable{i}"
                >
                  {i}

                  {wiget.descr}
                  <h6 style="display: inline;">({wiget.topic})</h6>
                  <h6 style="display: inline;">
                    {wiget.pin ? "PIN(" + wiget.pin + ")" : ""}
                  </h6>
                </span>
              {/if}

              <!-- Toggle -->
              {#if wiget.widget == "toggleBtn"}
                <span
                  style={setright(wiget)}
                  in:fade={{ duration: 1000 }}
                  on:click={function () {
                    select(i);
                  }}
                  class:draggable
                  id="btn{i}"
                >
                  <Toggle
                    label=""
                    toggledColor="#6495ED"
                    untoggledColor="gray"
                    switchColor="#eee"
                  /></span
                >
              {/if}
              <!-- btn -->
              {#if wiget.widget == "btn"}
                <span
                  in:fade={{ duration: 2000 }}
                  style="float: right ; margin-right:20%"
                  on:click={function () {
                    select(i);
                  }}
                  class:draggable
                  id="btn{i}"
                >
                  <button class="btn"
                    ><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  </button>
                </span>
              {/if}
              <!-- select -->
              {#if wiget.widget == "select"}
                <span
                  in:fade={{ duration: 2000 }}
                  style="float: right; margin-right:20%"
                  on:click={function () {
                    select(i);
                  }}
                  class:draggable
                  id="btn{i}"
                >
                  <button class="btn"><span>ON</span></button>
                </span>
              {/if}
              <!-- input -->
              {#if wiget.widget == "inputDigit"}
                <span
                  in:fade={{ duration: 2000 }}
                  style="float: right; margin-right:20%"
                  on:click={function () {
                    select(i);
                  }}
                  class:draggable
                  id="btn{i}"
                >
                  <input placeholder="12345" style="width: 80px " />
                </span>
              {/if}
              <!-- range -->
              {#if wiget.widget == "range"}
                <span
                  in:fade={{ duration: 2000 }}
                  style="float: right; margin-right:20%"
                  on:click={function () {
                    select(i);
                  }}
                  class:draggable
                  id="btn{i}"
                >
                  <input style="width: 80px " type="range" />
                </span>
              {/if}

              <br /><br />
            </div>
          {/if}
        {/each}
      </TabPanel>
    {/each}
  </Tabs>
</div>

<div class="block-2">
  <!--------------блок 2------------------------->

  {#each myWidgets as wiget, i}
    {#if i == selected}
      <Box>
        <button
          style="float: right"
          on:click={() => {
            remove(wiget);
            console.log(wiget);
          }}>❌</button
        >
        <p>
          <b>{wiget["descr"]}</b>
          <span class="letter1">({wiget["name"]})</span>
        </p>
        <table border="0" width="20%">
          <tr>
            <td>
              <div>
                Имя виджета <SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                >
                <input type="text" bind:value={wiget["descr"]} />
              </div>
              <div>
                ( Id ) <SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                > <input type="text" bind:value={wiget["topic"]} />
              </div>

              <div>
                Вкладка <SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                ><input
                  type="text"
                  on:change={function () {
                    findNewPage();
                  }}
                  bind:value={wiget["page"]}
                />
              </div>
              <div>
                Позиция<SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                >
                <input
                  on:change={sort(wiget["order"])}
                  type="number"
                  bind:value={wiget["order"]}
                />
              </div>
            </td>
            <td>&nbsp;&nbsp;&nbsp;</td>
            <td valign="top">
              <div>
                Виджет <SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                ><input type="text" bind:value={wiget["widget"]} />

                <span
                  ><select bind:value={wiget["widget"]}>
                    {#each Object.keys(widgetsType) as widg}
                      console.log( Object.keys(widgetsType));
                      <option value={widg}>
                        {widgetsType[widg]}
                      </option>
                    {/each}
                  </select></span
                >
              </div>
              <div style="display : {wiget['pin'] ? ' inline' : 'none'};">
                PIN<SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                > <input type="text" bind:value={wiget["pin"]} />
              </div>

              <div style="display : {wiget['int'] ? ' inline' : 'none'};">
                Частота опроса <input type="text" bind:value={wiget["int"]} />
                <SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                >
              </div>
              <div style="display : {wiget['FIELD10'] ? ' inline' : 'none'};">
                Тип датчика <input
                  style="margin-left:25px"
                  type="text"
                  bind:value={wiget["FIELD10"]}
                />
                <SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                >
              </div>
              <div style="display : {wiget['inv'] ? ' inline' : 'none'};">
                Инверсия <SvelteTooltip
                  tip="Бла-бла-бла про то как это использовать"
                  right
                  color="#92CBF1">?</SvelteTooltip
                ><input type="text" bind:value={wiget["inv"]} />
              </div>
            </td>
          </tr>
        </table>
      </Box>
    {/if}
  {/each}
</div>
<div class="block-3">
  <!--------------блок 3------------------------->
  <button
    style="float: right; margin-right:2%; border: 1px solid lightblue; border-radius: 8px;"
    on:click={() => (showModal = true)}
  >
    ADD
  </button>
</div>
<!--------блок3---------------------->

{#if showModal}
  <Modal on:close={() => (showModal = false)}>
    <h2 slot="header">Добавьте Элеметы</h2>

    <label>
      показать <input type="checkbox" bind:checked={visible} />
      {visible ? "виджеты" : "преcеты"}
    </label>
    <hr />
    {#if visible}
      {#each widgets as wiget, i}
        <div>
          <span
            on:click={function () {
              add(i);
            }}
            style="float: right; margin-right:5px">{wiget.name}</span
          >
          <!-- Toggle -->

          {#if wiget.widget == "toggleBtn"}
            <span style="float: left">
              <Toggle
                id="btn{i}"
                on:click={function () {
                  add(i);
                }}
                label=""
                toggledColor="#6495ED"
                untoggledColor="gray"
                switchColor="#eee"
              /></span
            >
          {/if}
          <!-- btn -->
          {#if wiget.widget == "btn"}
            <span style="float: left">
              <button
                class="btn"
                on:click={function () {
                  add(i);
                }}
                ><span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
              </button>
            </span>
          {/if}
          <!-- select -->
          {#if wiget.widget == "select"}
            <span style="float: left">
              <button
                class="btn"
                on:click={function () {
                  add(i);
                }}><span>ON</span></button
              >
            </span>
          {/if}
          <!-- input -->
          {#if wiget.widget == "inputDigit"}
            <span style="float: left">
              <input
                placeholder="12345"
                on:click={function () {
                  add(i);
                }}
                style="width: 80px "
              />
            </span>
          {/if}
          <!-- range -->
          {#if wiget.widget == "range"}
            <span style="float: left">
              <input
                on:click={function () {
                  add(i);
                }}
                style="width: 80px "
                type="range"
              />
            </span>
          {/if}
          <br /><br />
        </div>
      {/each}
    {:else}
      тут будут пресеты
    {/if}
    <!--
  <div id="field"></div>
-->
    <div hidden class="hero draggable" id="hero1" />
    <div hidden class="hero draggable" id="hero2" />
    <div hidden class="hero draggable" id="hero3" />
    <div hidden class="hero draggable" id="hero4" />
    <div hidden class="hero draggable" id="hero5" />
    <div hidden class="hero draggable" id="hero6" />

    <img
      hidden
      src="https://en.js.cx/clipart/ball.svg"
      class="draggable"
      id="bal"
      alt=""
    />

    <div style="clear:both" />
  </Modal>
{/if}

<style>
  .input-file {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
  .block-1 {
    position: fixed;
    left: 0;
    top: 0;
    width: 80%;
    height: 55%;
    overflow: auto;
  }
  .block-2 {
    position: fixed;
    left: 2%;
    top: 60%;
    width: 100%;
    height: 40%;
    overflow: auto;
  }
  .block-3 {
    position: fixed;
    left: 80%;
    top: 0%;
    width: 19%;
    height: 65%;
    overflow: auto;
  }

  .hero {
    background: url(https://js.cx/drag-heroes/heroes.png);
    width: 130px;
    height: 128px;
    float: left;
  }

  #hero1 {
    background-position: 0 0;
  }

  #hero2 {
    background-position: 0 -128px;
  }

  #hero3 {
    background-position: -120px 0;
  }

  #hero4 {
    background-position: -125px -128px;
  }

  #hero5 {
    background-position: -248px -128px;
  }

  #hero6 {
    background-position: -244px 0;
  }

  .draggable {
    cursor: pointer;
  }
  table {
    border-collapse: collapse;
    border: "0";
    width: "100%";
  }
  .btn {
    display: inline-block;
    box-sizing: border-box;
    padding: 1px;
    margin: 0 0px 5px 0;
    outline: none;
    border: 1px solid #63b8ff;
    border-radius: 10px;
    height: 36px;
    line-height: 0;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    color: #fff;
    background-color: #fff;
    position: relative;
    overflow: hidden;
    vertical-align: top;
    cursor: pointer;
    user-select: none;
    appearance: none;
    touch-action: manipulation;
  }
  .btn span {
    box-shadow: 7px 7px 5px rgba(0, 0, 0, 0.5);
    display: block;
    box-sizing: border-box;
    padding: 0 8px;
    height: 32px;
    line-height: 33px;
    border: 1px solid #63b8ff;
    border-radius: 8px;
    font-size: 14px;
    color: black;
    text-align: center;
    font-weight: 600;
  }
  input[type="text"] {
    border-radius: 0px;
    box-shadow: 0 0 15px 10px rgba(0, 0, 0, 0.06);
    height: 25px;
    width: 150px;
  }
  select {
    border-radius: 8px;
    height: 30px;
    font-size: 12px;
  }
</style>
