<script>
  import { onMount } from "svelte";
  import Cookies, { get } from "js-cookie";
  import Toggle from "svelte-toggle";
  import Chart from "svelte-frappe-charts";
  import Logo from "./Logo.svelte";
  import Box from "./Box.svelte";
  import mqtt from "mqtt/dist/mqtt.min";

  let widgets = [];
  // -------------------Swipe-------------------------------------
  let opacity = 100;
  let touchStart = [];
  let TabCount = 1;
  let selectedTab = 0;
  function onTouchStart(e) {
    opacity = 100;
    touchStart.x = e.changedTouches[0].clientX;
    //  console.log(touchStart.x);
  }
  function onTouchEnd(e) {
    opacity = 100;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const absDx = Math.abs(dx);
    //console.log(dx)
    if (dx < 100) {
      selectedTab = selectedTab + 1;
      if (selectedTab > TabCount) {
        selectedTab = 0;
      }
      // console.log(selectedTab);
    }
    if (dx > -100) {
      selectedTab = selectedTab - 1;
      if (selectedTab < 0) {
        selectedTab = TabCount;
      }
      //   console.log(selectedTab);
    }
    opacity = 100;
  }
  function moveTouch(e) {
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const absDx = Math.abs(dx);
    //  console.log(absDx);
    opacity = 100 / (absDx / 20);
  }

  // -----------------------------------------------------
  let items = [];
  //  let MQTTconnections = [];
  // темная тема
  onMount(async () => {
    if (Cookies.get("darktheme") == "true") {
      window.document.body.classList.value = "dark-mode";
      //window.document.body.classList.toggle("dark-mode");
    }
  });

  function toggleTheme() {
    //  window.document.body.classList.toggle("dark-mode");
    if (window.document.body.classList.value == "dark-mode") {
      window.document.body.classList.value = "light-mode";
      Cookies.set("darktheme", "False", { expires: 365 });
    } else {
      window.document.body.classList.toggle("dark-mode");
      Cookies.set("darktheme", "true", { expires: 365 });
    }
    Cookies.set("selectedMQTT", "", { expires: -365 });
  }
  //секция переменных============================================
  let myip = document.location.hostname;
  let configSetupJson = "{}";
  let espName = "IotManager";
  let chipID = "";
  let colors;
  let lineOptions;
  let axisOptions;
  let graf_1 = [];
  let graf_2 = [];
  let NewWiget = "";
  let NewPage = "";
  let NewPrefics = "";
  let date = "";
  let hours = "";
  let minutes = "";
  let temp;
  let selectedprefics;
  // декларируем массив для  списка всех ESP в сети
  let devices = [];
  // декларируем массив для списка всех websocket
  let socket = [];
  // декларируем массив для списка всех виджетов
  let wigets = [];
  // декларируем массив для списка всех страниц
  let pages = [];
  // декларируем массив для списка всех префиксов
  let prefics = [{ prefics: "" }];
  // выбраный префикс
  let selected;
  // массивы для построения графиков
  let graf_time = [];
  let graf_val = [];
  let dataLine = [];
  // пропускаем первый тик графика для PZM
  let miss;
  // ==на время разработки==
  //myip = "192.168.36.105";

  let connectionType = "MQTT";
  let client;
  let topic;
  let connected = false;

  let clientId = "IotManager_";
  let monthStat = [
    {
      "00": 0,
      "01": 0,
      "02": 0,
      "03": 0,
      "04": 0,
      "05": 0,
      "06": 0,
      "07": 0,
      "08": 0,
      "09": 0,
      "10": 0,
      "11": 0,
      "12": 0,
    },
  ];

  // MQTT====================================================================
  function MQTTChange() {
    wigets = [];
    prefics = [];
    pages = [];

    clientId += "_" + Math.floor(Math.random() * 10000);
    connected = false;
    const mqtt_options = {
      clientId: clientId,
      servers: [
        {
          host: selected.mqtt_host,
          port: Number(selected.mqtt_port),
          protocol: selected.connection_protocol,
        },
      ],
      path: "" + selected.mqtt_path,
      protocolId: "MQTT",
      protocolVersion: 4,
      keepalive: 30,
      clean: true,
      reconnectPeriod: 100000,
      connectTimeout: 30 * 1000,
      rejectUnauthorized: false,
    };
    mqtt_options.username = selected.mqtt_username;
    mqtt_options.password = selected.mqtt_password;
    topic = selected.mqtt_prefix;
    const url = `${mqtt_options.servers[0].protocol}://${mqtt_options.servers[0].host}:${mqtt_options.servers[0].port}${mqtt_options.path}`;

    const onConnect = () => {
      Cookies.set("selectedMQTT", selected, { expires: 365 });
      console.log(`MQTT connected ${url}`);
      connected = client.connected;
      const topic = selected.mqtt_prefix;
      client.subscribe(topic + "/#", function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log(`MQTT subscribed on topic '${topic}'`);
          client.publish(topic, "HELLO");
        }
      });
    };

    const onMessage = (topic, message) => {
      const msg = message.toString();
      const time = new Date().getTime();
      addMessage(msg, topic);
    };

    //try{
    client = mqtt.connect(mqtt_options);
    client.on("connect", onConnect);
    client.on("message", onMessage);
    client.on("error", (err) => {
      console.log("MQTT", err);
      client.end();
      connected = client.connected;
    });
    client.on("close", () => {
      console.log("MQTT " + clientId + " disconnected");
      connected = client.connected;
    });
  }
  let MQTTconnections;
  if (connectionType == "MQTT") {
    // ==на время разработки==
    //  MQTTconnections = JSON.parse(MQTTconnections);

    MQTTconnections = [
      {
        user_id: "10000000",
        connection_name: "тест 1",
        connection_protocol: "wss",
        mqtt_host: "meef.ru",
        mqtt_port: "18883",
        mqtt_prefix: "/IotManager",
        mqtt_username: "IotManager:guest",
        mqtt_password: "guest",
        mqtt_path: "/ws",
        mqtt_id: "10000000",
      },
    ];

    if (Cookies.get("selectedMQTT")) {
      selected = Cookies.get("selectedMQTT");

      try {
        selected = JSON.parse(selected);
      } catch (e) {
        selected = MQTTconnections[0];
      }
    } else {
      selected = MQTTconnections[0];
    }

    //selected = MQTTconnections[0];

    MQTTChange();

    if (Cookies.get("darktheme") == "") {
      window.document.body.classList.value = "dark-mode";
    }
    if (!Cookies.get("darktheme")) {
      window.document.body.classList.value = "dark-mode";
      Cookies.set("darktheme", "true", { expires: 365 });
    }
  }

  // MQTT =============================================================================================

  // подключаемся к локальной машине, получаем карту сети
  function getNetworkMap() {
    devices = JSON.parse(
      '[{"deviceID":"","deviceIP":"' + myip + '","deviceName":""}]'
    );
    devices[0].id = 0;
    devices[0].status = false;
    console.log("Подключаемся к WS на localhost ", devices);
    if (connectionType != "MQTT") {
      socket[0] = new WebSocket("ws://" + myip + "/ws");
      socket[0].addEventListener("open", function (event) {
        devices[0].id = 0;
        devices[0].status = true;
        connected = true;
        devices = devices;
        console.log("WS CONNECTED! " + myip);
        // получаем "карту сети" по websocket
        socket[0].send("getNetworkMap");
        // получаем конфигурацию ESP по websocket
        socket[0].send("HELLO");
      });
      socket[0].addEventListener("message", function (event) {
        if (Cookies.get("consolelog") == "true") {
          console.log("NEW data packet " + myip, event.data);
        }
        // запускаем обработку пришедшего сообщения

        addMessage(event.data, 0);
      });
      // Обработка ошибок websocket
      socket[0].addEventListener("close", (event) => {
        if (item) {
          console.log("ws close " + item.deviceIP);
        } else {
          console.log("ws close " + myip);
        }
        devices[0].status = false;
        connected = false;
        devices = devices;
      });
      socket[0].addEventListener("error", function (event) {
        if (item) {
          console.log(item.deviceIP + " WebSocket error: ", event);
        } else {
          console.log(myip + " WebSocket error: ", event);
        }
        devices[0].status = false;
        connected = false;
        devices = devices;
      });
    }
  }
  if (connectionType != "MQTT") {
    getNetworkMap();
  }

  function addConnection(devices) {
    if (devices) {
      devices.forEach(function (item, i, arr) {
        console.log("trying connect", item);

        // Create WebSocket connection.
        socket[i] = new WebSocket("ws://" + item.deviceIP + "/ws");
        // Connection opened
        socket[i].addEventListener("open", function (event) {
          devices[i].id = i;
          devices[i].status = true;
          connected = true;
          devices = devices;
          console.log("WS CONNECTED! " + item.deviceIP);
          socket[i].send("HELLO");
        });
        // Listen for messages
        socket[i].addEventListener("message", function (event) {
          // вывод отладочных сообщений в консоль

          if (Cookies.get("consolelog") == "true") {
            console.log("NEW data packet " + item.deviceIP, event.data);
          }

          // запускаем обработку пришедшего сообщения
          let time = new Date().getTime();
          addMessage(event.data, i);
        });
        // Обработка ошибок websocket
        socket[i].addEventListener("close", (event) => {
          console.log("ws close " + item.deviceIP);
          devices[i].status = false;
          connected = false;
          devices = devices;
          Shuttervisibil();
        });
        socket[i].addEventListener("error", function (event) {
          console.log(item.deviceIP + " WebSocket error: ", event);
          devices[i].status = false;
          connected = false;
          devices = devices;
          Shuttervisibil();
        });
      });
    }
  }
  //console.log(devices);

  //обрабатываем пришедшее сообщение =====================================================================

  function addMessage(data, socket) {
    if (connectionType == "MQTT") {
      // console.log("NEW data packet " + socket, data);
      topic = socket;
    }

    let json;
    let tmp;

    try {
      let net = JSON.parse(data);

      // Если пришла карта сети
      if (net[0].deviceID) {
        console.log("пришла карта сети :", net);
        devices = net;
        //Conf=[];

        addConnection(devices);
        NetworkMap = data;
      }
    } catch (e) {
      //	console.log('ERROR parse JSON', tmp);
    }

    tmp = "[" + data + "]";

    //tmp = [data];
    try {
      tmp = JSON.parse(tmp);
      tmp.forEach(function (json, i, array) {
        // собираем виджеты
        // если пришедшее сообщение виджет
        if (json.widget) {
          // ищем его в массиве виджетов
          NewWiget = "";
          wigets.forEach(function (item, i, array) {
            if (json.topic == item.topic) {
              NewWiget = json.topic;
              //	console.log("Нашли совпадение виджета");
            }
          });

          // ищем новые страницы
          NewPage = "";
          pages.forEach(function (item, i, array) {
            if (json.page == item.page) {
              NewPage = json.page;
              //	console.log("Нашли совпадение страницы");
            }
          });

          // ищем новые префиксы
          NewPrefics = "";
          prefics.forEach(function (item, i, array) {
            let topic = getprefics(json.topic);
            if (topic == item.prefics) {
              NewPrefics = item.prefics;
              //	console.log("Нашли совпадение префикса");
            }
          });

          // Новый виджет дописываем в массив виджетов
          if (!NewWiget) {
            // дописываем виджету из какого сокета он получен
            json.socket = socket;
            // дописываем виджету префикс
            json.prefics = getprefics(json.topic);
            json.closed = true;
            json.pos = "";

            wigets = [...wigets, json];

            // сортируем
            wigets.sort((a, b) => a.order - b.order);
          }

          // Дописываем новую страницу в массив страниц
          if (!NewPage) {
            pages = [
              ...pages,
              JSON.parse(
                JSON.stringify({ page: json.page, topic: json.topic })
              ),
            ];
            if (pages[1]) {
              TabCount = pages.length - 1;
            }
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

          // Дописываем новый префикс в массив префиксов
          if (!NewPrefics) {
            prefics = [
              ...prefics,
              JSON.parse(JSON.stringify({ prefics: getprefics(json.topic) })),
            ];
          }
        }
        // закончили сбор виджетов

        // если новое сообщение статус
        if (json.status) {
          // ищем виджет к которому относится этот статус
          wigets.forEach(function (element) {
            //отличие MQTT и WS========================================================!!!!!!!!!!!!!!
            let messegetopic;
            if (connectionType === "MQTT") {
              messegetopic = topic.replace("/status", "");
            } else {
              messegetopic = json.topic.replace("/status", "");
            }
            // ========================================================================

            if (element.topic == messegetopic) {
              // если получен статус график

              if (element.widget == "chart") {
                graf_time = [];
                graf_val = [];
                try {
                  temp = json.status;

                  // console.log("!!!!!!!!!!!!!", temp.length);
                  if (!element.status) {
                    // пропускаем первое значение
                    miss = true;
                  }
                  // обнуляем статистикупо месяцам
                  monthStat = [
                    {
                      "00": 0,
                      "01": 0,
                      "02": 0,
                      "03": 0,
                      "04": 0,
                      "05": 0,
                      "06": 0,
                      "07": 0,
                      "08": 0,
                      "09": 0,
                      "10": 0,
                      "11": 0,
                      "12": 0,
                    },
                  ];
                  temp.forEach(function (item, i, arr) {
                    if (miss != true) {
                      // получаем время
                      date = new Date(item.x * 1000);
                      hours = date.getHours();
                      //	minutes =date.getMinutes();
                      minutes = checkTime(date.getMinutes());
                      function checkTime(i) {
                        return i < 10 ? "0" + i : i;
                      }
                      let days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
                      let dayW = days[date.getDay()];
                      //let dw = days[dayW];
                      let day = date.getDate();
                      let month = checkTime(date.getMonth() + 1);
                      // заполняем статистику суточного потребления по месяцам
                      if (element.type == "bar") {
                        monthStat[0][month] = monthStat[0][month] + item.y1;
                        try {
                          if (i > status.length - 30) {
                            monthStat[0]["00"] = monthStat[0]["00"] + item.y1;
                          }
                        } catch (e) {}
                      }
                      //graf_time = [... graf_time,  hours+':'+minutes+' '+day+'.'+month, ];
                      if (element.dateFormat == "HH:mm") {
                        graf_time = [
                          ...graf_time,
                          hours + ":" + minutes + " " + dayW,
                        ];
                      } else if (element.dateFormat == "DD.MM.YYYY") {
                        graf_time = [
                          ...graf_time,
                          day + "." + month + " " + dayW,
                        ];
                      } else {
                        graf_time = [...graf_time, hours + ":" + minutes];
                      }

                      graf_val = [...graf_val, item.y1];
                    }
                    miss = false;
                  });

                  axisOptions = { xAxisMode: "tick", xIsSeries: true };
                  if (element.pointRadius == "0") {
                    lineOptions = { hideDots: 1, regionFill: 1, spline: 1 };
                  } else {
                    lineOptions = { regionFill: 1, dotSize: 3, spline: 1 };
                  }

                  dataLine = {
                    labels: graf_time,
                    datasets: [
                      {
                        name: element.descr,
                        values: graf_val,
                      },
                    ],
                  };

                  if (!element.status) {
                    // архив графика отсутсутствует, то создаем статус и заполняем
                    element.status = dataLine;
                    element.monthStat = monthStat;
                  } else {
                    //console.log(" дописываем новые значения к имеющимся");
                    element.status.labels = [
                      ...element.status.labels,
                      dataLine.labels[0],
                    ];
                    element.status.datasets[0].values = [
                      ...element.status.datasets[0].values,
                      dataLine.datasets[0].values[0],
                    ];
                  }
                } catch (e) {
                  console.log(
                    "полученные данные для графика содержат ошибки",
                    element.status
                  );
                }

                //два графика в одном / пока работает криво только для WS	, надо делать
                if (connectionType === "MQTT") {
                  if (topic.includes("_1/status")) {
                    graf_1 = element.status.datasets[0];
                  }
                  if (topic.includes("_2/status")) {
                    graf_2 = element.status.datasets[0];
                    element.status.datasets[1] = graf_1;
                  }
                } else {
                }
              }
              // данные для прочих витжетов	(заменяем статус на новый)
              else {
                element.status = json.status;
                element.send = false;
              }
            }
            wigets = wigets;
            devices = devices;
            pages = pages;
          });
        }
        //  для mysens
        if (json.info) {
          // ищем виджет к которому относится INFO
          wigets.forEach(function (element) {
            //отличие MQTT и WS========================================================!!!!!!!!!!!!!!
            let messegetopic;
            if (connectionType === "MQTT") {
              messegetopic = topic.replace("/status", "");
            } else {
              messegetopic = json.topic.replace("/status", "");
            }
            // ========================================================================

            if (element.topic == messegetopic) {
              element.nodeInfo = json.info;
            }
          });
        }
        if (json.color) {
          // ищем виджет к которому относится цвет INFO
          wigets.forEach(function (element) {
            //отличие MQTT и WS========================================================!!!!!!!!!!!!!!
            let messegetopic;
            if (connectionType === "MQTT") {
              messegetopic = topic.replace("/status", "");
            } else {
              messegetopic = json.topic.replace("/status", "");
            }
            // ========================================================================

            if (element.topic == messegetopic) {
              element.nodeInfoColor = json.color;
            }
          });
        }
      });
    } catch (e) {
      console.log("ERROR parse JSON", tmp);
    }

    tmp = null;
    temp = null;
    json = null;
    data = null;
    NewWiget = null;
    NewPage = null;
    NewPrefics = null;
    date = null;
    hours = null;
    minutes = null;
  }

  // функция получаем префикс

  function getprefics(topic) {
    if (topic[0] == "/") {
      topic = topic.slice(0, topic.indexOf("/", 2));
      if (topic === "") {
        topic = "IotManager";
      }
      return topic;
    } else {
      topic = topic.slice(0, topic.indexOf("/", 0));
      if (topic === "") {
        topic = "IotManager";
      }
      return topic;
    }
  }
  // функция если произошла смена префикса в интерфейсе
  function handleSubmit() {
    console.log("The selected option is " + JSON.stringify(selected.prefics));
    selectedprefics = selected.prefics;
  }

  // шлем данные в websocket
  function WSpush(ws, uri, val) {
    //    console.log(ws, uri, val);
    if (connectionType == "MQTT") {
      client.publish(uri + "/control", val.toString());
    } else {
      socket[ws].send(
        '{"path":"' + uri + '/control", "status":"' + val.toString() + '"}'
      );

      if (socket[ws].readyState != 1) {
        addConnection(devices);

        // добавить GET запрос
      }
    }
  }

  if (connectionType != "MQTT") {
    //	addConnection(devices);
  }

  function setcentr(widget, descr) {
    let style;
    if (descr == 1) {
      style = widget.pos.dy
        ? "position: absolute; left: " +
          widget.pos.dy +
          "; top: " +
          widget.pos.dx
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
      style = widget.pos.dy
        ? "position: absolute; left: " +
          widget.pos.dy +
          "; top: " +
          widget.pos.dx
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
    if (descr == 1) {
      style = widget.pos.dy
        ? "position: absolute; left: " +
          widget.pos.dy +
          "; top: " +
          widget.pos.dx
        : "margin:0; float: right;";
    } else {
      style = widget.pos.y
        ? "position: absolute; left: " + widget.pos.y + "; top: " + widget.pos.x
        : "margin:0; float: right;";
    }
    return style;
  }
  // обратный отсчет для 		Shutter
  let frame;
  let elapsed = 0;
  let duration = 5000;
  let last_time = window.performance.now();
  (function update() {
    frame = requestAnimationFrame(update);
    const time = window.performance.now();
    elapsed += Math.min(time - last_time, duration - elapsed);
    last_time = time;
    if (elapsed == duration) {
      Shutterhiddn();
    }
  })();

  let Shuttervisibl = "visibility: hidden;";

  function Shuttervisibil() {
    Shuttervisibl = "visibility: visible;";
    //	duration = sec;
    elapsed = 0;
    if (elapsed === duration) {
      Shuttervisibl = "visibility: hidden;";
    }
  }
  function Shutterhiddn() {
    Shuttervisibl = "visibility: hidden;";
  }
  Shuttervisibil();

  function selectTab(i) {
    selectedTab = i;
  }

  // показать/скрыть статистику суточного потребления по месяцам
  let n = 0;
  function showStat() {
    n = 1;
  }
  function hideStat() {
    n = 0;
  }

  //====================================== блок  разукраски =============================

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
  let espData = "";
  function findWidgets() {
    const newTopic = Array.from(
      // находим с каких ESP есть виджеты
      new Set(
        Array.from(wigets, ({ topic }) =>
          topic.slice(0, topic.lastIndexOf("/") + 1)
        )
      )
    );
    newTopic.forEach(function (item, i, arr) {
      // топик для отправки
      //	console.log(item);
      // получаем наборы виджетов длякаждой ESP
      let wigetsString = wigets.filter((items) => items.topic.indexOf(item));
      //	console.log(wigets);
      espData = "";
      i = 0;
      while (i < wigetsString.length) {
        espData = espData + JSON.stringify(wigetsString[i]) + "/n";
        i++;
      }
      // тут пишем в esp
      console.log(espData);
    });
  }
  // findWidgets();
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
  function sort(i) {
    wigets.sort((a, b) => a.order - b.order);
    //wigets = myWidgets;
    selectedWidget = i;
  }
  function select(i) {
    selectedWidget = i;
  }
  let selectedWidget = -1;
  //================================================ end блок  разукраски =============================
</script>

<!---->

<svelte:body
  on:touchstart={onTouchStart}
  on:touchend={onTouchEnd}
  on:touchmove={moveTouch} />

{#if connectionType == "MQTT"}
  {#if MQTTconnections[1]}
    <form on:submit|preventDefault={MQTTChange}>
      <select bind:value={selected} on:change={MQTTChange}>
        {#each MQTTconnections as MQTTconnection}
          {#if MQTTconnection.connection_name == selected.connection_name}
            <option selected value={MQTTconnection}>
              {MQTTconnection.connection_name}
            </option>
          {:else}
            <option value={MQTTconnection}>
              {MQTTconnection.connection_name}
            </option>
          {/if}
        {/each}
      </select>
    </form>
  {/if}
{:else}
  <div
    class="Shutter"
    style="{Shuttervisibl} position: absolute; z-index: 1; right: 1%; top: 0px"
    id="layer1"
  >
    <span>
      <progress value={elapsed / duration} />
      <br /><br />
      <!--Перечисляем девайсы в сети-->
      {#each devices as NetworkDevice, i}
        {#if !NetworkDevice.status && NetworkDevice.status != false}
          <p align="left" style=" margin-top: -5px; margin-bottom: -5px">
            {NetworkDevice.deviceIP}
            {NetworkDevice.deviceName} waiting
          </p>
        {/if}
        {#if NetworkDevice.status == true}
          <p
            align="left"
            style="color: green; margin-top: -5px; margin-bottom: -5px"
          >
            {NetworkDevice.deviceIP}
            {NetworkDevice.deviceName} connected
          </p>
        {/if}
        {#if NetworkDevice.status == false}
          <p
            align="left"
            style="color: red; margin-top: -5px; margin-bottom: -5px"
            on:click={addConnection(devices)}
          >
            {NetworkDevice.deviceIP}
            {NetworkDevice.deviceName} disconnected
          </p>
        {/if}
      {/each}
    </span>
  </div>
{/if}

<div
  style=" position: absolute;  z-index: 2; right: 20%; top: 0%; color:red"
  on:click={toggleTheme}
  id="toggleTheme"
>
  🔆
</div>

{#if connectionType == "MQTT"}
  {#if connected == false}
    <div
      style=" position: absolute;  z-index: 2; right: 2%; top: 0%; color:red"
      on:click={toggleTheme}
      id="layerMQTT"
    >
      MQTT
    </div>
    {#if MQTTconnections[0].mqtt_port == ""}
      <div align="center">
        Для подключения MQTT обязателььно должен быть указан порт "MQTT wss port
        (TLS)"
      </div>
    {/if}
  {/if}
  {#if connected == true}
    <div
      style=" position: absolute;  z-index: 2; right: 2%; top: 0%; color:green"
      on:click={toggleTheme}
      id="layerMQTT"
    >
      MQTT
    </div>
  {/if}
{:else if connected == true}
  <div
    on:mouseenter={Shuttervisibil}
    on:click={Shuttervisibil}
    style="color:green; position: absolute;  z-index: 2; right: 1.5%; top: 0px"
    id="layerWS;  "
  >
    localNET
  </div>
{:else}
  <div
    on:mouseenter={Shuttervisibil}
    on:click={Shuttervisibil}
    style="color:red;  position: absolute;  z-index: 2; right: 1.5%; top: 0px"
    id="layerWS; "
  >
    localNET
  </div>
{/if}
<!-- селектор префиксов  -->
{#if prefics[2]}
  <form on:submit|preventDefault={handleSubmit}>
    <select style="float: left" bind:value={selected} on:change={handleSubmit}>
      {#each prefics as curentprefics}
        <option value={curentprefics}>
          {curentprefics.prefics}
        </option>
      {/each}
    </select>
  </form>
{/if}

<!--закончили селектор префиксов -->

{#if !pages[0]}
  <p align="center"><Logo /></p>
{/if}

<!------------------------------------------------------->

<span style="display:block" align="center">
  {#each pages as pagesName, i}
    <button
      class:tabs__link_active={selectedTab === i}
      on:click={() => selectTab(i)}
      class="tabs__link"
      href="#content-"
      {i}>{pagesName.page}</button
    >
  {/each}
</span>
<div class="block-1">
   

  <br /><br />
  <div class="letter" align="center">developed by: avaks@meef.ru</div>
</div>
<div class="block-2">
  <!--------------блок 2------------------------->

  {#each wigets as wiget, i}
    {#if i == selectedWidget}
      <Box>
        <p>
          <b>{wiget["descr"]}</b>
          <span class="letter1">({wiget["widget"]})</span>
        </p>
        <table border="0" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td>Name</td>
            <td><input type="text" bind:value={wiget["descr"]} /></td>
            <td>&nbsp;</td>
            <td> <input type="color" id="bgcolor" /></td>
            <td><input type="text" bind:value={wiget["descrsize"]} /></td>
          </tr>

          <tr>
            <td>Status</td>
            <td><input type="text" bind:value={wiget["status"]} /></td>
            <td>&nbsp;</td>
            <td> <input type="color" id="bgcolor" /> </td>
            <td><input type="text" bind:value={wiget["size"]} /></td>
          </tr>
        </table>
      </Box>
    {/if}
  {/each}
</div>

<style>
  .block-1 {
    position: fixed;
    left: 0;
    top: 10%;
    width: 100%;
    height: 70%;
    overflow: auto;
  }
  .block-2 {
    position: fixed;
    left: 1%;
    top: 75%;
    width: 100%;
    height: 30%;
    overflow: auto;
  }
  :global(.svelte-tabs__tab-list) {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }
  :global(.svelte-tabs li.svelte-tabs__tab) {
    color: gray;
  }
  :global(.svelte-tabs li.svelte-tabs__selected) {
    color: green;
  }
  .red {
    color: crimson;
  }
  .green {
    color: rgb(20, 220, 37);
  }

  .letter {
    color: grey;
    font-size: 60%;
    padding-left: 15px;
    opacity: 0.8;
  }
  progress {
    height: 4px;
  }

  input {
    text-align: right;
    border: 1px solid #6699ff;
    width: 100%;
  }

  label {
    display: flex;
    justify-content: space-evenly;
    flex-wrap: wrap;
  }
  :global(body.light-mode) {
    background-color: white;
  }

  :global(body.dark-mode) {
    background-color: #1d3040;
    color: #bfc2c7;
  }

  :global(body.dark-mode) span {
    background-color: #1d3040;
    color: #bfc2c7;
  }

  :global(body.dark-mode) div {
    background-color: #1d3040;
    color: #bfc2c7;
  }

  :global(body.dark-mode) input {
    background-color: #1d3040;
    color: #bfc2c7;
  }

  :global(body.dark-mode) select {
    background-color: #1d3040;
    color: #bfc2c7;
    padding: 10px;
    border-radius: 10px;
    padding-left: 20px;
  }
  :global(body.dark-mode) lable {
    background-color: #1d3040;
    color: #bfc2c7;
  }
  select {
    padding: 10px;
    border-radius: 10px;
    padding-left: 20px;
  }
  .Shutter {
    background-color: hsl(200, 16%, 96%);
    color: blak;
    padding: 10px;
    border-radius: 5px;
  }
  :global(body.dark-mode) .Shutter {
    background-color: #1d3040;
    color: #bfc2c7;
    padding: 10px;
    border-radius: 5px;
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
  .btnoff {
    display: inline-block;
    box-sizing: border-box;
    padding: 1px;
    margin: 0 0px 5px 0;
    outline: none;
    border: 1px solid rgb(85, 84, 84);
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
  .btnoff span {
    box-shadow: 7px 7px 5px rgba(0, 0, 0, 0.5);
    display: block;
    box-sizing: border-box;
    padding: 0 8px;
    height: 32px;
    line-height: 33px;
    border: 1px solid rgb(85, 84, 84);
    border-radius: 8px;
    font-size: 14px;
    color: black;
    text-align: center;
    font-weight: 600;
  }

  button {
    color: gray;
    background-color: #fff;
    border-bottom-style: solid;
    border-bottom-width: 1px;
    border-top-width: 0px;
    border-left-width: 0px;
    border-right-width: 0px;
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 1px;
    padding-bottom: 1px;
  }
  :global(body.dark-mode) button {
    background-color: #1d3040;
    color: #bfc2c7;
  }

  /*---------avaks tabs--------*/
  .tabs__link {
    padding: 0.5rem 0.75rem;
    text-decoration: none;
    color: gray;
    text-align: center;
    flex-shrink: 0;
    flex-grow: 1;
    border: 0px;
    background-color: #fff;
  }
  .tabs__link_active {
    color: black;
    cursor: default;
    border-bottom-style: solid;
    border-bottom-width: 1px;
  }
  .tabs__link:not(.tabs__link_active):hover,
  .tabs__link:not(.tabs__link_active):focus {
    border-bottom-style: solid;
    border-bottom-width: 0px;
  }
</style>
