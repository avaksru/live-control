<script>
  import { onMount } from "svelte";
  import Cookies, { get } from "js-cookie";
  import Toggle from "svelte-toggle";
  import Chart from "svelte-frappe-charts";
  import Logo from "./Logo.svelte";
  import mqtt from "mqtt/dist/mqtt.min";
  let difference;
  let last;
  //----------------------settings-----------------------------------------
  let nodeInfo = false;
  let Info = false;
  if (Cookies.get("nodeInfo") == "true") {
    nodeInfo = true;
  } else {
    nodeInfo = false;
  }
  if (Cookies.get("Info") == "true") {
    Info = true;
  } else {
    Info = false;
  }
  function showInfo() {
    if (Cookies.get("Info") == "true") {
      Info = false;
      //  nodeInfo = false;
      Cookies.set("Info", "false", { expires: 365 });
    } else {
      Info = true;
      //  nodeInfo = true;
      Cookies.set("Info", "true", { expires: 365 });
    }
  }
  //----------------------settings-----------------------------------------

  // функция получения времени с момента последнего сообщения
  function timeDifference(endtime) {
    last = "";
    difference = "";
    daysDifference = "";
    hoursDifference = "";
    minutesDifference = "";
    //если дата timestamp
    let date = new Date(+endtime);
    if (date.getMinutes()) {
      last = endtime;
      // console.log("1", endtime);
      //если дата формат datetime'03.12.21 00:17:57'
    } else if (endtime.indexOf(".") !== -1) {
      endtime = endtime.split(".");
      let newdate = endtime[1] + "," + endtime[0] + "," + endtime[2];
      if (new Date(newdate)) {
        last = new Date(newdate).getTime();
        //  console.log("2", endtime);
      }
    } else {
      //если дата формат datetime'2021-12-01T14:38:15'
      if (Date.parse(endtime)) {
        last = Date.parse(endtime);
        //  console.log("3".endtime);
      }
    }
    var difference = new Date().getTime() - last;
    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
    difference -= daysDifference * 1000 * 60 * 60 * 24;
    var hoursDifference = Math.floor(difference / 1000 / 60 / 60);
    difference -= hoursDifference * 1000 * 60 * 60;
    var minutesDifference = checkTime(Math.floor(difference / 1000 / 60));
    function checkTime(i) {
      return i < 10 ? "0" + i : i;
    }
    difference -= minutesDifference * 1000 * 60;
    var secondsDifference = Math.floor(difference / 1000);

    if (last) {
      if (daysDifference > 0) {
        // console.log(difference, endtime, daysDifference, last);
        return (difference =
          daysDifference + " d " + hoursDifference + ":" + minutesDifference);
      } else {
        if (hoursDifference > 0) {
          return (difference =
            hoursDifference + "h " + minutesDifference + "min");
        } else {
          return (difference = minutesDifference + " min");
        }
      }
    } else {
      return (difference = endtime);
    }
  }
  // --функция получения времени с момента последнего сообщения

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
  // myip = "192.168.36.108";

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
          //--------------Zigbee SLS gate---------------------
          client.publish(topic + "/bridge/config/devices/get", "");
          //--------------------------------------------------
        }
      });
    };

    const onMessage = (topic, message) => {
      const msg = message.toString();
      const time = new Date().getTime();
      addMessage(msg, topic);
      //  console.log(topic);
      //  console.log(msg);
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
        mqtt_host: "live-control.ru",
        mqtt_port: "18883",
        mqtt_prefix: "/demo",
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
  let count = 0;
  function addMessage(data, socket) {
    if (connectionType == "MQTT") {
      // console.log("NEW data packet " + socket, data);
      topic = socket;
    }

    let json;
    let tmp = [];

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

      //--------------Zigbee SLS gate---------------------
      /*  tmp = [
        {
          battery: 100,
          illuminance: 123,
          last_seen: 1638974524,
          linkquality: 123,
          occupancy: false,
          occupancy_timeout: 60,
          voltage: 3.04,
          friendly_name: "",
          model_name: "lumi.sensor_motion.aq2",
        },
      ];*/
      if (Array.isArray(tmp)) {
        let friendly_name = tmp[0].friendly_name;
        //console.log("friendly_name ", friendly_name);
        for (let key in tmp[0]) {
          //   console.log(key, ":", tmp[0][key]);
          let descr;
          count = 0;
          if (tmp[0].model_name) {
            descr = tmp[0].model_name + " " + key;
            if (key === "battery") {
              descr = descr + "🔋";
            } else if (key === "humidity") {
              descr = descr + "💧";
            } else if (key === "pressure") {
              descr = descr + "⚖️";
            } else if (key === "temperature") {
              descr = descr + "🌡";
            } else if (key === "linkquality") {
              descr = descr + "📶";
            } else if (key === "voltage") {
              descr = descr + "⚡";
            } else if (key === "illuminance") {
              descr = descr + "🔆";
            } else if (key === "occupancy") {
              descr = descr + "🏃🏼";
            } else if (key === "occupancy_timeout") {
              descr = descr + "⏱";
            } else if (key === "trSeqNum") {
              descr = descr + "🛠";
            } else if (key === "last_seen") {
              descr = descr + "⏱";
            }

            let createWidget = {
              widget: "anydata",
              page: "zigbee SLS gate",
              order: count++,
              descr: descr,
              status: tmp[0][key] ? tmp[0][key] : "False",
              battery: tmp[0]["battery"],
              rssi: tmp[0]["linkquality"],
              lastseen: timeDifference(tmp[0]["last_seen"] * 1000),
              // lastseen: tmp[0]["last_seen"],
              voltage: tmp[0]["voltage"],
              topic: topic + "_" + key,
            };

            if (createWidget.lastseen) {
              if (
                createWidget.lastseen.indexOf("d") !== -1 ||
                createWidget.lastseen.indexOf("h") !== -1
              ) {
                createWidget.statusColor = "DarkSlateBlue";
              }
            }
            // console.log(createWidget);
            tmp = [...tmp, createWidget];
            //   console.log(tmp);
          } else if (tmp[0].UptimeStr) {
            //console.log("tmp ", tmp[0]);
            descr = "Zigbee шлюз " + " / " + key;
            let createWidget = {
              widget: "anydata",
              page: "zigbee SLS gate",
              order: count++,
              descr: descr,
              status: tmp[0][key] ? tmp[0][key] : "False",
              topic: topic + "_" + key,
            };

            tmp = [...tmp, createWidget];
          }
        }
      }
      /*  let message = tmp[0].message;
      message.forEach(function (json, i, array) {
        let widget_name;
        if (json.type === "EndDevice") {
          if (json.friendly_name) {
            widget_name = json.friendly_name;
          } else {
            widget_name = json.ieeeAddr;
          }
          let createWidget = {
            widget: "anydata",
            page: "zigbee SLS gate",
            order: i,
            descr: widget_name,
            topic: json.ieeeAddr,
          };
          tmp = [...tmp, createWidget];
        }
      });
*/
      //----------//Zigbee SLS gate----------------------------------------

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
            //============================================отличие MQTT и WS============================================
            let messegetopic;
            if (connectionType === "MQTT") {
              messegetopic = topic.replace("/status", "");
            } else {
              messegetopic = json.topic.replace("/status", "");
            }
            //============================================//отличие MQTT и WS============================================

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
                          if (i > temp.length - 30) {
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
                //console.log(element);

                //==========================добавляем в виджет инфу о RSSI, Battary и LastSeen ============================================
                if (messegetopic.toLowerCase().indexOf("_rssi") != -1) {
                  wigets.forEach(function (wiriles_element) {
                    if (
                      wiriles_element.topic.substring(
                        0,
                        wiriles_element.topic.lastIndexOf("_")
                      ) ===
                      messegetopic.substring(
                        0,
                        messegetopic.toLowerCase().indexOf("_rssi")
                      )
                    ) {
                      wiriles_element.rssi = json.status;
                      //   console.log(wiriles_element);
                    }
                  });
                }

                if (messegetopic.toLowerCase().indexOf("_battery") != -1) {
                  wigets.forEach(function (wiriles_element) {
                    if (
                      wiriles_element.topic.substring(
                        0,
                        wiriles_element.topic.lastIndexOf("_")
                      ) ==
                      messegetopic.substring(
                        0,
                        messegetopic.toLowerCase().indexOf("_battery")
                      )
                    ) {
                      wiriles_element.battery = json.status;
                      // console.log(wiriles_element);
                    }
                  });
                }
                if (messegetopic.toLowerCase().indexOf("_last") != -1) {
                  wigets.forEach(function (wiriles_element) {
                    if (
                      wiriles_element.topic.substring(
                        0,
                        wiriles_element.topic.lastIndexOf("_")
                      ) ===
                      messegetopic.substring(
                        0,
                        messegetopic.toLowerCase().indexOf("_last")
                      )
                    ) {
                      wiriles_element.lastseen = timeDifference(json.status);
                      //console.log(wiriles_element.lastseen);
                      if (
                        wiriles_element.lastseen.indexOf("d") !== -1 ||
                        wiriles_element.lastseen.indexOf("h") !== -1
                      ) {
                        wiriles_element.statusColor = "DarkSlateBlue";
                      }
                    }
                  });
                }
                if (messegetopic.toLowerCase().indexOf("_last_seen") != -1) {
                  wigets.forEach(function (wiriles_element) {
                    if (
                      wiriles_element.topic.substring(
                        0,
                        wiriles_element.topic.lastIndexOf("_")
                      ) ===
                      messegetopic.substring(
                        0,
                        messegetopic.toLowerCase().indexOf("_last_seen")
                      )
                    ) {
                      wiriles_element.lastseen = timeDifference(json.status);
                      //console.log(wiriles_element);
                      if (
                        wiriles_element.lastseen.indexOf("d") !== -1 ||
                        wiriles_element.lastseen.indexOf("h") !== -1
                      ) {
                        wiriles_element.statusColor = "DarkSlateBlue";
                      }
                    }
                  });
                }
                //==========================Только для  MySensors ============================================
                if (messegetopic.toLowerCase().indexOf("-100") != -1) {
                  wigets.forEach(function (wiriles_element) {
                    if (
                      wiriles_element.topic.substring(
                        0,
                        wiriles_element.topic.lastIndexOf("-")
                      ) ===
                      messegetopic.substring(
                        0,
                        messegetopic.toLowerCase().indexOf("-100")
                      )
                    ) {
                      wiriles_element.rssi = json.status;
                      //   console.log(wiriles_element);
                    }
                  });
                }
                if (messegetopic.toLowerCase().indexOf("-101") != -1) {
                  wigets.forEach(function (wiriles_element) {
                    if (
                      wiriles_element.topic.substring(
                        0,
                        wiriles_element.topic.lastIndexOf("-")
                      ) ===
                      messegetopic.substring(
                        0,
                        messegetopic.toLowerCase().indexOf("-101")
                      )
                    ) {
                      wiriles_element.battery = json.status;
                      // console.log(wiriles_element);
                    }
                  });
                }

                //==========================//добавляем в виджет инфу о RSSI и Battary ============================================
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
              element.lastseen = timeDifference(json.info);
              if (
                element.lastseen.indexOf("d") !== -1 ||
                element.lastseen.indexOf("h") !== -1
              ) {
                element.statusColor = "DarkSlateBlue";
              }
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
    setStartPosition();
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

  let StartPosition = 10;
  function setStartPosition() {
    StartPosition = 10;
    wigets.forEach(function (item, i, arr) {
      if (item.pos) {
        if (item.pos.x) {
          let pos_max = item.pos.x;
          if (pos_max.split("px").join("") > StartPosition) {
            StartPosition = pos_max.split("px").join("");
          }
        }
        if (item.pos.dx) {
          let pos_max = item.pos.dx;
          if (pos_max.split("px").join("") > StartPosition) {
            StartPosition = pos_max.split("px").join("");
          }
        }
      }
    });
  }

  function setStyle(widget, align) {
    let style;
    let descrStyle;
    let statusStyle;
    // если есть color проверяем наличие statusColor
    if (widget.color != "" && !widget.statusColor) {
      widget.statusColor = widget.color;
    }
    if (widget.font != "" && !widget.statusFont) {
      widget.statusFont = widget.font;
    }

    /*	
		if ( Array.isArray(widget.descrColor) ){	
		widget.descrColor.forEach(function (item, i, arr) {
		if (item.level && widget.status < item.level && widget.status > widget.descrColor[i - 1].level && i > 0){
		descrStyle =  widget.descrStyle?widget.descrStyle:"" + " font-family:"+widget.descrFont+"; font-size: "+widget.descrSize+"px; color:"+item.value+";";
				}	 
		 });
	}else{
descrStyle =  widget.descrStyle?widget.descrStyle:"" + " font-family:"+widget.descrFont+"; font-size: "+widget.descrSize+"px; color:"+widget.descrColor+";";
			}
			
					if ( Array.isArray(widget.statusColor) ){	
		widget.statusColor.forEach(function (item, i, arr) {
		if (item.level && widget.status < item.level && widget.status > widget.statusColor[i - 1].level && i > 0){
			statusStyle = widget.statusStyle?widget.statusStyle:"" +" font-family:"+widget.statusFont+"; font-size: "+widget.statusSize+"px; color: "+item.value+";";	
		 }	 
		 });
	}else{
statusStyle = widget.statusStyle?widget.statusStyle:"" + " font-family:"+widget.statusFont+"; font-size: "+widget.statusSize+"px; color: "+widget.statusColor+";";	
	
	}
			
*/
    // console.log(widget);
    let color;

    if (typeof widget.descrColor == "object") {
      widget.descrColor.forEach(function (key, i) {
        if (
          key.level - 1 + 1 <= widget.status - 1 + 1 &&
          widget.status - 1 + 1 > -1 &&
          key.level - 1 + 1 > -1
        ) {
          color = key.value;
        }

        if (
          key.level - 1 >= widget.status - 1 &&
          widget.status - 1 + 1 < 0 &&
          key.level - 1 < 0
        ) {
          color = key.value;
        }
      });
      descrStyle = widget.descrStyle
        ? widget.descrStyle
        : "" +
          " font-family:" +
          widget.descrFont +
          "; font-size: " +
          widget.descrSize +
          "px; color: " +
          color +
          ";";
    } else {
      descrStyle = widget.descrStyle
        ? widget.descrStyle
        : "" +
          " font-family:" +
          widget.descrFont +
          "; font-size: " +
          widget.descrSize +
          "px; color:" +
          widget.descrColor +
          ";";
    }

    if (typeof widget.statusColor == "object") {
      widget.statusColor.forEach(function (key, i) {
        if (
          key.level - 1 + 1 <= widget.status - 1 + 1 &&
          widget.status - 1 + 1 > -1 &&
          key.level - 1 + 1 > -1
        ) {
          color = key.value;
        }

        if (
          key.level - 1 >= widget.status - 1 &&
          widget.status - 1 + 1 < 0 &&
          key.level - 1 < 0
        ) {
          color = key.value;
        }
      });
      statusStyle = widget.statusStyle
        ? widget.statusStyle
        : "" +
          " font-family:" +
          widget.statusFont +
          "; font-size: " +
          widget.statusSize +
          "px; color: " +
          color +
          ";";
    } else {
      statusStyle = widget.statusStyle
        ? widget.statusStyle
        : "" +
          " font-family:" +
          widget.statusFont +
          "; font-size: " +
          widget.statusSize +
          "px; color: " +
          widget.statusColor +
          "; ";
    }

    if (align === "left") {
      if (widget.pos) {
        if (widget.pos.dy) {
          style =
            "position: absolute; left: " +
            widget.pos.dy +
            "; top: " +
            widget.pos.dx +
            "; ";
        }
      } else {
        style = "margin:0; float:left; ";
      }
      style = style + descrStyle;
      return style;
    }
    if (align === "right") {
      if (widget.pos) {
        if (widget.pos.x) {
          style =
            "position: absolute; left: " +
            widget.pos.y +
            "; top: " +
            widget.pos.x +
            "; ";
        }
      } else {
        style = "margin:0; float: right; ";
      }
      style = style + statusStyle;
      return style;
    }
    if (align === "centr") {
      if (widget.pos) {
        if (widget.pos.dy) {
          style =
            "position: absolute; left: " +
            widget.pos.dy +
            "; top: " +
            widget.pos.dx +
            "; ";
        }
      } else {
        style =
          "display: block; margin-left: auto; margin-right: auto; text-align: center; ";
      }
      style = style + statusStyle;
      return style;
    }
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

  var fonts = [
    "Montez",
    "Lobster",
    "Josefin Sans",
    "Shadows Into Light",
    "Pacifico",
    "Amatic SC",
    "Orbitron",
    "Rokkitt",
    "Righteous",
    "Dancing Script",
    "Bangers",
    "Chewy",
    "Sigmar One",
    "Architects Daughter",
    "Abril Fatface",
    "Covered By Your Grace",
    "Kaushan Script",
    "Gloria Hallelujah",
    "Satisfy",
    "Lobster Two",
    "Comfortaa",
    "Cinzel",
    "Courgette",
  ];
  let style = "Sigmar One";
</script>

<link
  href="https://fonts.googleapis.com/css?family=Montez|Lobster|Josefin+Sans|Shadows+Into+Light|Pacifico|Amatic+SC:700|Orbitron:400,900|Rokkitt|Righteous|Dancing+Script:700|Bangers|Chewy|Sigmar+One|Architects+Daughter|Abril+Fatface|Covered+By+Your+Grace|Kaushan+Script|Gloria+Hallelujah|Satisfy|Lobster+Two:700|Comfortaa:700|Cinzel|Courgette"
  rel="stylesheet"
  type="text/css"
/>

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
  style=" position: absolute;  z-index: 2; right: 20%; top: 0%;"
  on:click={toggleTheme}
  id="toggleTheme"
>
  🔆
</div>
<div
  style=" position: absolute;  z-index: 2; right: 35%; top: 0%; color:blue;"
  on:click={showInfo}
  id="toggleInfo"
>
  ℹ️
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
      on:click={MQTTChange}
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

{#each pages as pagesName, i}
  {#if selectedTab === i}
    <table
      style="opacity:{opacity}%; margin-left: 0%; margin-top:{StartPosition}px"
      border="0"
      width="99%"
    >
      {#each wigets as widget, i}
        <!--Отображаем виджеты только для выбранного префикса-->

        {#if !selectedprefics || selectedprefics === widget.prefics}
          {#if widget.page === pagesName.page}
            <tr>
              <!-- Toggle -->
              {#if widget.widget === "toggle"}
                <td style="width: 100%;">
                  <span id="lable{i}" style={setStyle(widget, "left")}>
                    {widget.descr}</span
                  >
                </td>

                <td />

                <td>
                  {#if widget.status == "1"}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <Toggle
                        on:toggle={WSpush(widget.socket, widget.topic, 0)}
                        style="float: right"
                        label=""
                        toggledColor="#6495ED"
                        untoggledColor="#FF6347"
                        switchColor="#eee"
                      />
                    </span>
                  {:else}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <Toggle
                        on:toggle={WSpush(widget.socket, widget.topic, 1)}
                        label=""
                        toggledColor="#FF6347"
                        untoggledColor="gray"
                        switchColor="#eee"
                        toggled=""
                      />
                    </span>
                  {/if}
                </td>{/if}
              <!-- anydata -->

              {#if widget.widget === "anydata" && widget.topic
                  .toLowerCase()
                  .indexOf("_rssi") == -1 && widget.topic
                  .toLowerCase()
                  .indexOf("_battery") == -1 && widget.topic
                  .toLowerCase()
                  .indexOf("_last") == -1 && widget.topic
                  .toLowerCase()
                  .indexOf("_last_seen") == -1 && widget.topic
                  .toLowerCase()
                  .indexOf("-100") == -1 && widget.topic
                  .toLowerCase()
                  .indexOf("-101") == -1 && widget.topic
                  .toLowerCase()
                  .indexOf("linkquality") == -1 && widget.topic
                  .toLowerCase()
                  .indexOf("voltage") == -1}
                <td>
                  <span style={setStyle(widget, "left")} id="lable{i}">
                    {widget.descr}
                    <!--    //==========================добавляем в виджет инфу о RSSI и Battary ============================================   -->

                    {#if widget.nodeInfo || widget.battery}
                      {#if Info == true}
                        <div
                          class="letter"
                          align="left"
                          style="color: {!widget.nodeInfoColor
                            ? 'gray'
                            : widget.nodeInfoColor};font-family:{widget.descrFont}; font-size: {widget.descrSize *
                            2}px;  "
                        >
                          {!widget.battery ? "" : "🔋"}

                          {#if widget.battery < 4}
                            {!widget.battery ? "" : widget.battery}
                          {:else if widget.battery < 10}
                            <span style="color: red;">
                              {!widget.battery ? "" : widget.battery}
                            </span>
                          {:else if widget.battery < 30}
                            <span style="color: reoranged;">
                              {!widget.battery ? "" : widget.battery}
                            </span>
                          {:else}
                            <span style="color: green;">
                              {!widget.battery ? "" : widget.battery}
                            </span>
                          {/if}
                          {!widget.voltage ? "" : "⚡"}{!widget.voltage
                            ? ""
                            : widget.voltage}
                          {!widget.rssi ? "" : "📶"}{!widget.rssi
                            ? ""
                            : widget.rssi}
                          {!widget.lastseen ? "" : "⏱"}

                          {!widget.lastseen ? "" : widget.lastseen}
                        </div>
                      {/if}
                    {/if}

                    <!--  //==========================//добавляем в виджет инфу о RSSI и Battary ============================================   -->
                    <!--Инфо от ноды mysens отображается под названием виджета-->

                    {#if widget.nodeInfo && nodeInfo == true}
                      <div
                        class="letter"
                        align="left"
                        style="color: {!widget.nodeInfoColor
                          ? 'gray'
                          : widget.nodeInfoColor};font-family:{widget.descrFont}; font-size: {widget.descrSize /
                          2}px;  "
                      >
                        {!widget.nodeInfo ? "" : widget.nodeInfo}
                      </div>
                    {/if}
                  </span>
                </td>
                <td />
                <td align="right" style="white-space: nowrap;">
                  <!--если статус пустой-->
                  {#if !widget.status}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      ...</span
                    >
                  {:else}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      {!widget.status ? "" : widget.status}{!widget.after
                        ? ""
                        : widget.after}
                    </span>
                  {/if}
                </td>
              {/if}

              <!-- input -->
              {#if widget.widget === "input"}
                <td>
                  <span id="lable{i}" style={setStyle(widget, "left")}>
                    {widget.descr}</span
                  ></td
                >
                <td />
                {#if widget.type === "number"}
                  <td align="right">
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <div
                        style="float: right; display:inline;  width: 120px  "
                      >
                        <input
                          on:click={WSpush(
                            widget.socket,
                            widget.topic,
                            widget.status - 1
                          )}
                          type="button"
                          value="-  "
                          style=" border: 1px solid lightblue; width: 25px"
                        />
                        <input
                          on:change={((widget["send"] = true),
                          WSpush(widget.socket, widget.topic, widget.status))}
                          class:red={widget["send"] == true}
                          style="width: 45px "
                          type="tel"
                          neme={widget.topic}
                          bind:value={widget.status}
                          size="20"
                          min="-1000"
                          max="1000000"
                        />
                        <input
                          on:click={WSpush(
                            widget.socket,
                            widget.topic,
                            widget.status - 1 + 2
                          )}
                          type="button"
                          value="+  "
                          style="border: 1px solid lightblue; width: 25px"
                        />
                      </div></span
                    >
                  </td>
                {:else if widget.type === "time"}
                  <td align="right">
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <div style="float: right; display:inline-block">
                        <input
                          on:change={((widget["send"] = true),
                          WSpush(widget.socket, widget.topic, widget.status))}
                          class:red={widget["send"] == true}
                          type="time"
                          bind:value={widget.status}
                          size="20"
                          min="00:00"
                          max="23:59"
                          required
                        />
                      </div></span
                    >
                  </td>
                {:else}
                  <td align="right">
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <div style="display:inline-block">
                        <input
                          on:change={((widget["send"] = true),
                          WSpush(widget.socket, widget.topic, widget.status))}
                          class:red={widget["send"] == true}
                          bind:value={widget.status}
                          size="20"
                        />
                      </div>
                    </span>
                  </td>
                {/if}
              {/if}
              <!-- btn -->
              {#if widget.widget == "btn"}
                <td>
                  <span id="lable{i}" style={setStyle(widget, "left")}>
                    {widget.descr}</span
                  ></td
                >
                <td />
                <td align="right">
                  {#if widget.status != 0 && widget.status != 1}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <button
                        class="btn"
                        on:click={((widget["send"] = true),
                        WSpush(widget.socket, widget.topic, 1))}
                        ><span
                          >&nbsp;&nbsp;{!widget.status
                            ? ""
                            : widget.status}&nbsp;&nbsp;</span
                        ></button
                      ></span
                    ><br />
                  {:else}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <button
                        class="btn"
                        on:click={((widget["send"] = true),
                        WSpush(widget.socket, widget.topic, 1))}
                        ><span
                          >&nbsp;&nbsp; {!widget.text
                            ? ""
                            : widget.text}&nbsp;&nbsp;</span
                        ></button
                      ></span
                    ><br />
                  {/if}
                </td>
              {/if}
              <!-- select -->
              {#if widget.widget === "select"}
                <td>
                  <span id="labl{i}" style={setStyle(widget, "left")}>
                    {widget.descr}</span
                  ></td
                >
                <td />
                <td align="right">
                  {#if widget.status == 0}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <button
                        class="btnoff"
                        on:click={((widget["send"] = true),
                        (this.style.border = "1px solid red"),
                        WSpush(widget.socket, widget.topic, 1))}
                        ><span
                          >{!widget.options[0]
                            ? "OFF"
                            : widget.options[0]}</span
                        ></button
                      ></span
                    ><br />
                  {:else}
                    <span id="status{i}" style={setStyle(widget, "right")}>
                      <button
                        class="btn"
                        on:click={((widget["send"] = true),
                        (this.style.border = "1px solid red"),
                        WSpush(widget.socket, widget.topic, 0))}
                        ><span
                          >{!widget.options[1] ? "ON" : widget.options[1]}</span
                        ></button
                      ></span
                    ><br />
                  {/if}
                </td>
              {/if}
              <!-- chart -->
              {#if widget.widget === "chart"}
                <td colspan="3">
                  {#if widget.status}
                    {#if widget.topic.includes("_2")}
                      <span style={setStyle(widget, "centr")}>
                        <Chart
                          data={widget.status}
                          {lineOptions}
                          {axisOptions}
                          colors={[!widget.color ? "light-blue" : widget.color]}
                          type={!widget.type ? "line" : widget.type}
                          height="300"
                        /></span
                      >
                    {:else if !widget.topic.includes("_1")}
                      <span id="lable{i}" style={setStyle(widget, "left")}>
                        {widget.descr}</span
                      >
                      <span id="status{i}" style={setStyle(widget, "centr")}>
                        <Chart
                          data={widget.status}
                          {lineOptions}
                          {axisOptions}
                          colors={[!widget.color ? "light-blue" : widget.color]}
                          type={!widget.type ? "line" : widget.type}
                          height="300"
                        />
                        {#if widget.type == "bar"}
                          {#if n == 0}
                            <div on:click={() => showStat()}>♻️</div>
                          {/if}
                          {#if n == 1}
                            <div on:click={() => hideStat()}>♻️</div>
                            <br />
                            {#if widget.monthStat[0]["00"] > 0}
                              за месяц {Math.round(
                                widget.monthStat[0]["00"] * 10
                              ) / 10}<br />
                            {/if}
                            {#if widget.monthStat[0]["01"] > 0}январь {Math.round(
                                widget.monthStat[0]["01"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["02"] > 0}февраль {Math.round(
                                widget.monthStat[0]["02"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["03"] > 0}март {Math.round(
                                widget.monthStat[0]["03"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["04"] > 0}апрель {Math.round(
                                widget.monthStat[0]["04"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["05"] > 0}май {Math.round(
                                widget.monthStat[0]["05"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["06"] > 0}июнь {Math.round(
                                widget.monthStat[0]["06"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["07"] > 0}июль {Math.round(
                                widget.monthStat[0]["07"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["08"] > 0}август {Math.round(
                                widget.monthStat[0]["08"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["09"] > 0}сентябрь {Math.round(
                                widget.monthStat[0]["09"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["10"] > 0}октябрь {Math.round(
                                widget.monthStat[0]["10"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["11"] > 0}ноябрь {Math.round(
                                widget.monthStat[0]["11"] * 10
                              ) / 10}<br />{/if}
                            {#if widget.monthStat[0]["12"] > 0}декабрь {Math.round(
                                widget.monthStat[0]["12"] * 10
                              ) / 10}<br />{/if}
                          {/if}
                        {/if}
                      </span>
                    {/if}
                  {/if}
                </td>
              {/if}

              <!-- range -->
              {#if widget.widget === "range"}
                <td colspan="3">
                  <span id="lable{i}" style={setStyle(widget, "left")}>
                    <div>
                      {widget.descr}
                      {widget.status / 10}
                      {widget.after}
                    </div>
                  </span>

                  <span id="status{i}" style={setStyle(widget, "centr")}>
                    <input
                      on:change={WSpush(
                        widget.socket,
                        widget.topic,
                        widget.status
                      )}
                      type="range"
                      bind:value={widget.status}
                      min={widget.min}
                      max={widget.max * 10}
                    />
                  </span>
                </td>
              {/if}
            </tr>
          {/if}
        {/if}
      {/each}
    </table>
  {/if}
{/each}

<br /><br />
<div class="letter" align="center">developed by: avaks@meef.ru</div>

<style>
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
