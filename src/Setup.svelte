<script>
  import Cookies, { get } from "js-cookie";
  import Tooltip from "./Tooltip.svelte";
  import Box from "./Box.svelte";
  //import Toggle from "svelte-toggle";
  import Logo from "./Logo.svelte";
  import Modal from "./Modal.svelte";

  let devices = [];
  let socket = [];
  let connectionType = "WS";
  let myip = document.location.hostname;
  let NetworkMap = [];
  let Conf = [];
  let name;
  let urlMQTT = "";
  let editJSON = "";
  let showModal = false;
  let upgrade = 0;
  let item;
  let seconds = 0;
  function onInterval(callback, milliseconds) {
    const interval = setInterval(callback, milliseconds);
  }
  onInterval(() => (seconds += 1), 1000);
  function countnul() {
    seconds = 0;
  }

  // ==на время разработки==
  myip = "192.168.36.105";

  /*	if (Conf==""){
		Conf = [{
 "ip": myip,		
  "name": "IoT",
  "chipID": "",
  "apssid": "IoT",
  "appass": "",
  "routerssid": "EURECA",
  "routerpass": "4455667788",
  "timezone": 3,
  "ntp": "pool.ntp.org",
  "mqttServer": "",
  "mqttPort": 0,
  "mqttPortwss":"",
  "mqttPath":"",
  "mqttPrefix": "",
  "mqttUser": "",
  "mqttPass": "",
  "mqttServer2": "",
  "mqttPort2": 0,
  "mqttPrefix2": "",
  "mqttUser2": "",
  "mqttPass2": "",
  "scen": "1",
  "telegramApi": "",
  "telegonof": "0",
  "teleginput": "0",
  "autos": "1",
  "weblogin": "admin",
  "webpass": "admin",
  "MqttIn": "0",
  "MqttOut": "0",
  "blink": "0",
  "oneWirePin": "2",
  "serverip": "http://meef.ru",
  "uart": "0",
  "uartS": "9600",
  "uartTX": "12",
  "uartRX": "13",
  "grafmax": "0",
  "socket": "0"
}]; 
}*/

  // темная тема
  let darkMode = false;
  //	data.darktheme=(Cookies.get('darktheme') == "true") ? true : false;
  if (Cookies.get("darktheme") == "true") {
    window.document.body.classList.value = "dark-mode";
  }
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
        devices = devices;
        console.log("WS CONNECTED! " + myip);

        // получаем "карту сети" по websocket
        socket[0].send("getNetworkMap");
        // получаем конфигурацию ESP по websocket
        socket[0].send("getconfigsetupjson");
      });
      socket[0].addEventListener("message", function (event) {
        if (Cookies.get("consolelog") == "true") {
          console.log("NEW data packet " + myip, event.data);
        }
        // запускаем обработку пришедшего сообщения
        //console.log(event.data);
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
        devices = devices;
      });
      socket[0].addEventListener("error", function (event) {
        if (item) {
          console.log(item.deviceIP + " WebSocket error: ", event);
        } else {
          console.log(myip + " WebSocket error: ", event);
        }

        devices[0].status = false;
        devices = devices;
      });
    }
  }
  getNetworkMap();

  // добавляем новые подключения из карты сети

  function addConnection(devices) {
    if (devices) {
      devices.forEach(function (item, i, arr) {
        if (item.deviceIP != myip) {
          console.log("trying connect", item, i);
          socket[i] = new WebSocket("ws://" + item.deviceIP + "/ws");
          socket[i].addEventListener("open", function (event) {
            devices[i].id = i;
            devices[i].status = true;
            devices = devices;
            console.log("WS CONNECTED! " + item.deviceIP, i);

            // получаем конфигурацию ESP по websocket

            socket[i].send("getconfigsetupjson");
          });
          socket[i].addEventListener("message", function (event) {
            // запускаем обработку пришедшего сообщения
            // вывод отладочных сообщений в консоль

            if (Cookies.get("consolelog") == "true") {
              console.log("NEW data packet " + item.deviceIP, event.data);
            }

            addMessage(event.data, i);
          });
          // Обработка ошибок websocket
          socket[i].addEventListener("close", (event) => {
            console.log("ws close " + item.deviceIP);
            devices[i].status = false;
            devices = devices;
            NetworkMap = NetworkMap;
            console.log(devices);
          });
          socket[i].addEventListener("error", function (event) {
            console.log(item.deviceIP + " WebSocket error: ", event);
            devices[i].status = false;
            devices = devices;
            NetworkMap = NetworkMap;
            console.log(devices);
          });
        }
      });
      devices[0].id = 0;
      devices[0].status = true;
    }
  }

  // addConnection(devices);

  function addMessage(data, socket) {
    NetworkMap = NetworkMap;
    devices = devices;

    try {
      data = JSON.parse(data);

      // сохраняем настройки на локальную машину
      if (data.getFileName === "s.conf.csv") {
        data = JSON.stringify(data);
        data = data.replace(/#/g, "_");
        data = JSON.parse(data);
        editJSON = data.getFileText;
        editJSON = editJSON + "/n";
      } else if (data.getFileName === "s.scen.txt") {
        data = JSON.stringify(data);
        data = data.replace(/#/g, "_");
        data = JSON.parse(data);
        editJSON = editJSON + data.getFileText;
      }
      // editor
      else if (
        data.getFileText &&
        data.getFileName != "s.scen.txt" &&
        data.getFileName != "s.conf.csv"
      ) {
        editJSON = data.getFileText;
      }

      if (data.upgrade) {
        console.log("upgrade ", data.upgrade);
        upgrade = data.upgrade;
      }

      // Если пришла карта сети
      if (data.deviceID) {
        //  editJSON = data;
        //  editJSON = JSON.stringify(editJSON);
      }

      data.socket = socket;
      // Если пришел Config
      if (data.apssid) {
        //	console.log(data);
        data.webMQTT = false;
        data.consolelog = false;
        data.darktheme = false;
        data.webMQTT = Cookies.get("webMQTT") == "true" ? true : false;
        data.consolelog = Cookies.get("consolelog") == "true" ? true : false;
        data.darktheme = Cookies.get("darktheme") == "true" ? true : false;

        Conf = [...Conf, data];
        // Запоминаем настройки MQTT дря быстрой смены в выпадающем списке
        if (Conf != "") {
          MQTTsample[0].mqttServer = Conf[0].mqttServer;
          MQTTsample[0].mqttPort = Conf[0].mqttPort;
          MQTTsample[0].mqttPortwss = Conf[0].mqttPortwss;
          MQTTsample[0].mqttPrefix = Conf[0].mqttPrefix;
          MQTTsample[0].mqttUser = Conf[0].mqttUser;
          MQTTsample[0].mqttPass = Conf[0].mqttPass;
          MQTTsample[0].mqttPath = Conf[0].mqttPath;
        }
      }

      // Если пришла карта сети
      if (data[0].deviceID) {
        console.log("пришла карта сети :", data);
        devices = data;
        //Conf=[];

        addConnection(devices);
        NetworkMap = data;
      }
    } catch (e) {
      if (Cookies.get("consolelog") == "true") {
        console.log("ERROR parse JSON", data);
      }
    }
  }

  let inputIP = "";
  let inputName = "";

  let edit = true;
  function handleClick() {
    edit = true;
  }
  function handleClick1() {
    edit = false;
  }

  function addTodo(inputIP, inputName) {
    NetworkMap = [
      ...NetworkMap,
      {
        deviceID: "0000000-0000000",
        deviceIP: inputIP,
        deviceName: inputName,
      },
    ];
    NetworkMap = NetworkMap;
    inputIP = "";
    inputName = "";
    // сохраняем NetworkMap.json на ESP   // Надо добавить перебор сокетов
    //	socket.forEach(function(asd, i, arr) {
    socket[0].send("{NetworkMap:" + JSON.stringify(NetworkMap) + "}");
    //});
  }

  function removeTodo(id) {
    NetworkMap.splice(id, 1);
    NetworkMap = NetworkMap;
    // сохраняем NetworkMap.json // Надо добавить перебор сокетов
    //socket.forEach(function(asd, i, arr) {
    socket[0].send("{NetworkMap:" + JSON.stringify(NetworkMap) + "}");
    //});
  }

  let MQTTsample = [
    {
      mqttServer: "",
      mqttPort: "",
      mqttPortwss: "",
      mqttPrefix: "",
      mqttUser: "",
      mqttPass: "",
      mqttPath: "",
      placeholder: "",
    },
    {
      mqttServer: "meef.ru",
      mqttPort: 1883,
      mqttPortwss: 18883,
      mqttPrefix: "/IotManager",
      mqttUser: "IotManager:guest",
      mqttPass: "guest",
      mqttPath: "/ws",
      placeholder: "",
    },
    {
      mqttServer: "test.mosquitto.org",
      mqttPort: 1883,
      mqttPortwss: 8081,
      mqttPrefix: "/IotManager",
      mqttUser: "",
      mqttPass: "",
      mqttPath: "/ws",
      placeholder: "",
    },
    {
      mqttServer: "broker.hivemq.com",
      mqttPort: 1883,
      mqttPortwss: 8000,
      mqttPrefix: "/IotManager",
      mqttUser: "",
      mqttPass: "",
      mqttPath: "/mqtt",
      placeholder: "",
    },
    {
      mqttServer: "broker.mqttdashboard.com",
      mqttPort: 1883,
      mqttPortwss: 8000,
      mqttPrefix: "/IotManager",
      mqttUser: "",
      mqttPass: "",
      mqttPath: "/mqtt",
      placeholder: "",
    },
    {
      mqttServer: "broker.emqx.io",
      mqttPort: 1883,
      mqttPortwss: 8083,
      mqttPrefix: "/IotManager",
      mqttUser: "",
      mqttPass: "",
      mqttPath: "/mqtt",
      placeholder: "",
    },
    {
      mqttServer: "m3.wqtt.ru",
      mqttPort: "",
      mqttPortwss: "",
      mqttPrefix: "/IotManager",
      mqttUser: "",
      mqttPass: "",
      mqttPath: "",
      placeholder: "Параметры указаны в личном кабинете насайте wqtt.ru",
    },
    {
      mqttServer: "91.204.228.124",
      mqttPort: 1883,
      mqttPortwss: "",
      mqttPrefix: "/IotManager",
      mqttUser: "rise",
      mqttPass: "23ri22se32",
      mqttPath: "",
      placeholder: "",
    },
  ];

  let selected;
  let i = 0;
  let id = 0;
  let wiget = [];

  function chengConf(id) {
    i = id;
  }
  function chengMQTT(selected) {
    Conf[i]["mqttServer"] = selected.mqttServer;
    Conf[i]["mqttPort"] = selected.mqttPort;
    Conf[i]["mqttPortwss"] = selected.mqttPortwss;
    Conf[i]["mqttPrefix"] =
      selected.mqttPrefix + Math.floor(Math.random() * 10000);
    Conf[i]["mqttUser"] = selected.mqttUser;
    Conf[i]["mqttPass"] = selected.mqttPass;
    Conf[i]["mqttPath"] = selected.mqttPath;
    Conf[i]["placeholder"] = selected.placeholder;

    changeConf(selected.mqttServer, "mqttServer", i);
    changeConf(selected.mqttPort, "mqttPort", i);
    changeConf(selected.mqttPortwss, "mqttPortwss", i);
    changeConf(selected.mqttPrefix, "mqttPrefix", i);
    changeConf(selected.mqttUser, "mqttUser", i);
    changeConf(selected.mqttPass, "mqttPass", i);
    changeConf(selected.mqttPath, "mqttPath", i);
  }
  let m;

  function changeConf(val, name, socet) {
    console.log(val, name, socet);
    socket[socet].send(
      '{"setconfigsetupjson":"1", "name":"' + name + '", "val":"' + val + '"}'
    );
    Cookies.set(name, val, { expires: 365 });
  }

  function GetMQTThttp(val, name, socet) {
    console.log(val, name, socet);
    socket[socet].send(
      '{"setconfigsetupjson":"1", "name":"' + name + '", "val":"' + val + '"}'
    );
    Cookies.set(name, val, { expires: 365 });

    if (val == true) {
      urlMQTT =
        "https://meef.ru/dashboard/?id=" +
        Math.floor(Math.random() * 100000000);
      //urlMQTT = "https://192.168.0.10/?id=" + Math.floor(Math.random() * 100000000);
      Cookies.set("urlMQTT", urlMQTT, { expires: 365 });
    } else {
      urlMQTT = "";
      Cookies.set("urlMQTT", urlMQTT, { expires: 365 });
    }
  }

  function reboot(selected) {
    socket[selected].send('{"command":"reboot"}');
  }
  function Pastesettings(i) {
    Conf[i]["mqttServer"] = Conf[0]["mqttServer"];
    Conf[i]["mqttPort"] = Conf[0]["mqttPort"];
    Conf[i]["mqttPortwss"] = Conf[0]["mqttPortwss"];
    Conf[i]["mqttPrefix"] = Conf[0]["mqttPrefix"];
    Conf[i]["mqttUser"] = Conf[0]["mqttUser"];
    Conf[i]["mqttPass"] = Conf[0]["mqttPass"];
    Conf[i]["mqttPath"] = Conf[0]["mqttPath"];

    Conf[i]["mqttServer2"] = Conf[0]["mqttServer2"];
    Conf[i]["mqttPort2"] = Conf[0]["mqttPort2"];
    Conf[i]["mqttPortwss2"] = Conf[0]["mqttPortwss2"];
    Conf[i]["mqttPrefix2"] = Conf[0]["mqttPrefix2"];
    Conf[i]["mqttUser2"] = Conf[0]["mqttUser2"];
    Conf[i]["mqttPass2"] = Conf[0]["mqttPass2"];
    Conf[i]["mqttPath2"] = Conf[0]["mqttPath2"];

    Conf[i]["telegramApi"] = Conf[0]["telegramApi"];
    Conf[i]["telegonof"] = Conf[0]["telegonof"];
    Conf[i]["teleginput"] = Conf[0]["teleginput"];
    Conf[i]["autos"] = Conf[0]["autos"];
    Conf[i]["chatId"] = Conf[0]["chatId"];

    changeConf(Conf[i]["mqttServer"], "mqttServer", i);
    changeConf(Conf[i]["mqttPort"], "mqttPort", i);
    changeConf(Conf[i]["mqttPortwss"], "mqttPortwss", i);
    changeConf(Conf[i]["mqttPrefix"], "mqttPrefix", i);
    changeConf(Conf[i]["mqttUser"], "mqttUser", i);
    changeConf(Conf[i]["mqttPass"], "mqttPass", i);
    changeConf(Conf[i]["mqttPath"], "mqttPath", i);

    changeConf(Conf[i]["mqttServer2"], "mqttServer2", i);
    changeConf(Conf[i]["mqttPort2"], "mqttPort2", i);
    changeConf(Conf[i]["mqttPortwss2"], "mqttPortwss2", i);
    changeConf(Conf[i]["mqttPrefix2"], "mqttPrefix2", i);
    changeConf(Conf[i]["mqttUser2"], "mqttUser2", i);
    changeConf(Conf[i]["mqttPass2"], "mqttPass2", i);
    changeConf(Conf[i]["mqttPath2"], "mqttPath2", i);

    changeConf(Conf[i]["telegramApi"], "telegramApi", i);
    changeConf(Conf[i]["telegonof"], "telegonof", i);
    changeConf(Conf[i]["teleginput"], "teleginput", i);
    changeConf(Conf[i]["autos"], "autos", i);
    changeConf(Conf[i]["chatId"], "chatId", i);
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

  // Селектор wiget.json для editor
  let fileSelected;

  let widgetfiles = [
    { id: 0, name: `` },
    { id: 1, name: `anydataTemp.json` },
    { id: 2, name: `anydataHum.json` },
    { id: 3, name: `anydataPress.json` },
    { id: 4, name: `alarm.json` },
    { id: 5, name: `anydataAlarm.json` },
    { id: 6, name: `anydataAmp.json` },
    { id: 7, name: `anydataHtz.json` },
    { id: 8, name: `anydataPpb.json` },
    { id: 9, name: `anydataPpm.json` },
    { id: 10, name: `anydataTime.json` },
    { id: 11, name: `anydataVlt.json` },
    { id: 12, name: `anydataWhr.json` },
    { id: 13, name: `anydataWtt.json` },
    { id: 14, name: `btn.json` },
    { id: 15, name: `select.json` },
    { id: 16, name: `chart.json` },
    { id: 17, name: `chart3.json` },
    { id: 18, name: `NetworkMap.json` },
  ];

  const syntaxHighlight = (json) => {
    try {
      json = JSON.stringify(JSON.parse(json), null, 4);
    } catch (e) {
      return json;
    }
    json = json
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    json = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        return match;
      }
    );
    return json;
  };
  //	editJSON=JSON.stringify(editJSON);

  // получаем файл с esp
  function widgetFileChenged(fileSelected, i) {
    console.log(fileSelected.name);
    if (
      fileSelected.name == "NetworkMap.json" ||
      fileSelected.name == "config.json"
    ) {
      socket[i].send('{"getFileName" : "' + fileSelected.name + '"}');
    } else {
      socket[i].send('{"getFileName" : "widgets/' + fileSelected.name + '"}');
    }
  }
  // отправляем файл на ESP
  function handleSubmit(val1, wigetJSON, i) {
    let newWigetJSON = document.getElementById("S1").value;
    if (newWigetJSON) {
      newWigetJSON = JSON.parse(newWigetJSON);
      if (fileSelected.name == "NetworkMap.json") {
        newWigetJSON.setFileName = fileSelected.name;
      } else {
        newWigetJSON.setFileName = "widgets/" + fileSelected.name;
      }
      console.log("newWigetJSON: ", newWigetJSON);
      newWigetJSON = JSON.stringify(newWigetJSON);

      socket[i].send(newWigetJSON);
    }
  }
  let src = "progress.gif";

  /*if (upgrade == 6) {
          countnul();

          if (seconds > 10) {
            //  getNetworkMap();
            addConnection(devices);
            showModal = false;
          }
        }
         if (upgrade == 2 || upgrade == 3 || upgrade == 4 || upgrade == 5) {
           countnul();
         }*/

  // сохранение данных пользователя на комп
  function download_settings(name) {
    var json = "";
    let newWigetJSON = document.getElementById("S1").value;
    if (newWigetJSON) {
      json = newWigetJSON;
    }
    let now = new Date().toLocaleDateString();
    var uricontent = "data:application/octet-stream," + encodeURI(json);
    var newwin = window.open("", "_blank");
    var elem = newwin.document.createElement("a");
    elem.download = name + "_" + now + "_settings.txt";
    elem.href = uricontent;
    elem.click();
    setTimeout(function () {
      newwin.close();
    }, 0);
  }
</script>

<body>
  {#if connectionType == "MQTT"}{:else}
    <div
      class="Shutter"
      style="{Shuttervisibl} position: absolute; z-index: 1; right: 1%; top: -45px"
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
  {#if connectionType == "MQTT"}
    <div
      style=" position: absolute;  z-index: 2; right: 2%; top: 1%"
      id="layerMQTT"
    >
      MQTT
    </div>
  {:else}
    <div
      on:mouseenter={Shuttervisibil}
      on:click={Shuttervisibil}
      style="position: absolute;  z-index: 2; right: 1.5%; top: -60px"
      id="layerWS; "
    >
      localNET
    </div>
  {/if}
  <div
    style=" position: absolute;  z-index: 2; right: 90px; top: -60px;"
    on:click={toggleTheme}
    id="toggleTheme"
  >
    <!--🔆-->
  </div>

  {#if Conf != ""}
    {#if showModal}
      <Modal on:close={() => (showModal = false)}>
        <button
          on:click={() =>
            //(showModal = true), socket[i].send("{'upgrade':1}", countnul())

            download_settings(Conf[i].name)}
        >
          Save settings
        </button>
        <button
          on:click={(() => (showModal = true),
          socket[i].send("{'upgrade':1}"),
          countnul())}
        >
          UPGRADE FIRWARE
        </button>
        {#if upgrade == 0}
          <p>Upgrade FS</p>
          <p>Restore settings</p>
          <p>Upgrade BUILD</p>
          <p>Restart ESP</p>
        {/if}

        {#if upgrade == 1}
          <p>
            {seconds} %
            <progress width="100%" align="center" max="100" value={seconds}
              >{seconds}</progress
            >
          </p>
          {#if seconds > 100}
            <p>Upgrade FS, please wait... ❗️</p>
          {:else}
            <p>
              Upgrade FS, please wait... <img {src} alt="progress" />
            </p>
          {/if}
          <p>Restore settings</p>
          <p>Upgrade BUILD</p>
          <p>Restart ESP</p>
        {/if}

        {#if upgrade == 2}
          <p>
            {seconds} %
            <progress width="100%" align="center" max="100" value={seconds}
              >{seconds}</progress
            >
          </p>
          <p>Upgrade FS ✔️</p>
          <p>Restore settings <img {src} alt="progress" /></p>
          <p>Upgrade BUILD</p>
          <p>Restart ESP</p>
        {/if}
        {#if upgrade == 3}
          <p>
            {seconds} %
            <progress width="100%" align="center" max="100" value={seconds}
              >{seconds}</progress
            >
          </p>
          <p>Upgrade FS ✔️</p>
          <p>Restore settings ✔️</p>
          <p>Upgrade BUILD</p>
          <p>Restart ESP</p>
        {/if}
        {#if upgrade == 4}
          <p>
            {seconds} %
            <progress width="100%" align="center" max="100" value={seconds}
              >{seconds}</progress
            >
          </p>
          <p>Upgrade FS ✔️</p>
          <p>Restore settings ✔️</p>
          {#if seconds > 100}
            <p>upgrade BUILD ❗️</p>
          {:else}
            <p>
              Start upgrade BUILD, please wait... <img {src} alt="progress" />
            </p>
          {/if}

          <p>Restart ESP</p>
        {/if}
        {#if upgrade == 5}
          <p>
            {seconds} %
            <progress width="100%" align="center" max="100" value={seconds}
              >{seconds}</progress
            >
          </p>
          <p>Upgrade FS ✔️</p>
          <p>Restore settings ✔️</p>
          <p>BUILD upgrade done! ✔️</p>
          <p>Restart ESP</p>
        {/if}
        {#if upgrade == 6}
          <p>Upgrade FS ✔️</p>
          <p>Restore settings ✔️</p>
          <p>BUILD upgrade done! ✔️</p>
          <p>Restart ESP...<img {src} alt="progress" /></p>
          {countnul()}
          {#if seconds > 20}
            <p hidden>{(upgrade = 0)}</p>
            <p hidden>{getNetworkMap()}</p>
            <p hidden>{(showModal = false)}</p>
          {/if}
        {/if}
      </Modal>
    {/if}

    <Box>
      <table border="0" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td colspan="4" align="center"
            ><h4>{Conf[i].name}{@html Conf[i].warning4}</h4></td
          >
        </tr>
        <tr>
          <td colspan="2"
            >IP <h5>{Conf[i].ip}</h5></td
          >
          <td width="2%">&nbsp;</td>
          <td width="21%"
            >память <h5>{Conf[i].freeBytes}</h5></td
          >
        </tr>
        <tr>
          <td colspan="2">&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td colspan="2"
            >📶 <h5>{@html Conf[i].signal}</h5></td
          >
          <td>&nbsp;</td>
          <td
            >Uptime <h5>{Conf[i].uptime}</h5></td
          >
        </tr>
        <tr>
          <td colspan="2">&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td colspan="2"
            >прошивка <h5>{Conf[i].firmware_name}</h5></td
          >
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td colspan="2">&nbsp;</td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
        </tr>
        <tr>
          <td width="30%" align="center">версия на устройстве</td>
          <td width="30%" align="center"> версия на сервере</td>
          <td align="center">&nbsp;</td>
          <td width="30%" rowspan="2" align="center"
            ><button
              on:click={() => (
                (showModal = true),
                socket[i].send('{"getFileName" : "s.conf.csv"}'),
                socket[i].send('{"getFileName" : "s.scen.txt"}')
              )}
            >
              обновить
            </button>
            <!--
            <button on:click={() => getNetworkMap()}>getNetworkMap</button>
            <button on:click={() => addConnection()}> addConnection </button>
			-->
          </td></tr
        >
        <tr>
          <td align="center"><h5>{Conf[i].firmware_version}</h5></td>
          {#if Conf[i].last_version != Conf[i].firmware_version}
            <td align="center" style="color: #FF0000"
              ><h5>{Conf[i].last_version}</h5></td
            >
          {:else}
            <td align="center"><h5>{Conf[i].last_version}</h5></td>
          {/if}
          <td align="center" />
        </tr>
      </table></Box
    >
    <Box>
      <b on:click={handleClick}>Network Map</b>
      <span on:click={handleClick1} class="letter1" />
      {#if NetworkMap == ""}
        <b>Файл с картой сети еще не создан</b>
      {/if}
      <div>Навсех добавляемых ESP должнабыть такая же прошивка !!!</div>

      <table border="0" width="100%">
        {#if NetworkMap != ""}
          {#each NetworkMap as espconf, m}
            <tr>
              <td width="1%" class="letter2">IP</td><td
                ><input
                  class:red={espconf["status"] == false}
                  type="text"
                  disabled
                  required
                  bind:value={NetworkMap[m]["deviceIP"]}
                />
              </td>
              <td width="1%">Name</td><td width="30%"
                ><input
                  type="text"
                  required
                  bind:value={NetworkMap[m]["deviceName"]}
                /></td
              >
              <td><button on:click={() => removeTodo(m)}>-</button></td>
            </tr>
          {/each}

          <tr>
            <td width="1%" class="letter2">IP</td><td
              ><input type="text" bind:value={inputIP} /></td
            >
            <td width="1%">Name</td><td width="30%"
              ><input type="text" bind:value={inputName} /></td
            >
            <td
              ><button on:click={() => addTodo(inputIP, inputName)}>+</button
              ></td
            >
          </tr>
        {:else}
          <tr>
            <td width="1%" class="letter2">IP</td><td
              ><input
                disabled
                type="text"
                required
                bind:value={Conf[i].ip}
              /></td
            >
            <td width="1%">Name</td><td width="30%"
              ><input type="text" required bind:value={Conf[i].name} /></td
            >
            <td
              ><button on:click={() => addTodo(Conf[i].ip, Conf[i].name)}
                >+</button
              ></td
            ></tr
          >
        {/if}
      </table>
      <br />
      <div>После добавления ESP нажмите "F5" что обновить страницу</div>
    </Box>

    <b>Select ESP</b>
    <span
      ><select bind:value={selected} on:change={chengConf(selected)}>
        {#each Conf as espconf, n}
          <option value={n}>
            <b>{Conf[n]["name"]}</b> ({Conf[n]["ip"]})
          </option>
        {/each}
      </select></span
    >

    <!--WIFI-->
    <button on:click={Pastesettings(i)}
      ><Tooltip
        title="Вставить настройки MQTT и Telegram из верхней в списке ESP "
        >Paste settings</Tooltip
      ></button
    >
    <button on:click={reboot(Conf[i].socket)}>Reboot</button>
    <Box>
      <b on:click={handleClick}>WIFI</b><span
        on:click={handleClick1}
        class="letter1"
      />
      {#if edit == true}
        <table border="0" width="100%">
          <tr>
            <td width="40%">ESP name</td>

            <td>
              <input
                type="text"
                placeholder="IotManager"
                required
                bind:value={Conf[i].name}
                on:change={changeConf(Conf[i].name, "name", Conf[i].socket)}
              />
            </td>

            <Tooltip
              title="Имя устройства должно состоять из английских букв и иметь длинну от 6 до 12 символов"
            >
              <td>?</td>
            </Tooltip>
          </tr>
          <hr />
          <tr>
            <td>WIFI name</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i].routerssid}
                on:change={changeConf(
                  Conf[i].routerssid,
                  "routerssid",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="После того как вы введете логин пароль от вашего wifi роутера необходимо нажать кнопку сохранить, а затем обязательно нажать кнопку перезагрузить устройство внизу этой страницы"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>WIFI password</td>
            <td
              ><input
                type="password"
                bind:value={Conf[i]["routerpass"]}
                on:change={changeConf(
                  Conf[i].routerpass,
                  "routerpass",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="После того как вы введете логин пароль от вашего wifi роутера необходимо нажать кнопку сохранить, а затем обязательно нажать кнопку перезагрузить устройство внизу этой страницы"
              ><td>?</td>
            </Tooltip>
          </tr>
          <hr />
          <tr>
            <td>AP name</td>
            <td
              ><input
                type="text"
                required
                bind:value={Conf[i]["apssid"]}
                on:change={changeConf(Conf[i].apssid, "apssid", Conf[i].socket)}
              /></td
            >
            <Tooltip
              title="Устройство постоянно сканирует сеть на наличие wifi. Если роутер отключен, то устройство автоматически перейдет в режим точки доступа. Когда wifi появится устройство автоматически подключится к роутеру снова, и выключит точку доступа"
              ><td>?</td>
            </Tooltip>
          </tr>
        </table>
      {/if}
    </Box>

    <!-- Users-->
    <Box>
      <b on:click={handleClick}>Users</b><span
        on:click={handleClick1}
        class="letter1"
      />
      {#if edit == true}
        <table border="0" width="100%">
          <tr>
            <td width="40%">WEB admin login</td>
            <td
              ><input
                type="text"
                required
                bind:value={Conf[i]["weblogin"]}
                on:change={changeConf(
                  Conf[i].weblogin,
                  "weblogin",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>WEB admin password</td>
            <td
              ><input
                type="password"
                required
                bind:value={Conf[i]["webpass"]}
                on:change={changeConf(
                  Conf[i].webpass,
                  "webpass",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
        </table>
      {/if}
    </Box>

    <!--Time-->
    <Box>
      <b on:click={handleClick}>Time </b><span
        on:click={handleClick1}
        class="letter1"
      />
      {#if edit == true}
        <table border="0" width="100%">
          <tr>
            <td width="40%">Time Zone</td>
            <td
              ><input
                type="text"
                required
                bind:value={Conf[i]["timezone"]}
                on:change={changeConf(
                  Conf[i].timezone,
                  "timezone",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>NTP server</td>
            <td
              ><input
                type="text"
                required
                bind:value={Conf[i]["ntp"]}
                on:change={changeConf(Conf[i].ntp, "ntp", Conf[i].socket)}
              /></td
            >
            <Tooltip
              title="После изменения поля NTP сервер необходимо перезагрузить устройство"
              ><td>?</td>
            </Tooltip>
          </tr>
        </table>
      {/if}
    </Box>

    <!--MQTT-->
    <Box>
      <b on:click={handleClick}>MQTT</b>
      <select bind:value={selected} on:change={chengMQTT(selected)}>
        {#each MQTTsample as mqtt, n}
          <option value={mqtt}>
            <b>{mqtt.mqttServer}</b>
          </option>
        {/each}
      </select> <span>Готовые шаблоны</span>

      <span on:click={handleClick1} class="letter1">
        <!--	{@html Conf[i]["warning4"]}-->
      </span>
      {#if edit == true}
        <table border="0" width="100%">
          <tr>
            <td width="40%">MQTT server</td>
            <td
              ><input
                type="text"
                placeholder={Conf[i]["placeholder"]}
                required
                bind:value={Conf[i]["mqttServer"]}
                on:change={changeConf(
                  Conf[i].mqttServer,
                  "mqttServer",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="После изменеения параметров MQTT требуетсяперезагрузка"
            >
              <td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>MQTT port (TCP)</td>
            <td
              ><input
                type="text"
                required
                placeholder={Conf[i]["placeholder"]}
                bind:value={Conf[i]["mqttPort"]}
                on:change={changeConf(
                  Conf[i].mqttPort,
                  "mqttPort",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="После изменеения параметров MQTT требуетсяперезагрузка"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>MQTT wss port (TLS)</td>
            <td
              ><input
                type="text"
                placeholder={Conf[i]["placeholder"]}
                bind:value={Conf[i]["mqttPortwss"]}
                on:change={changeConf(
                  Conf[i].mqttPortwss,
                  "mqttPortwss",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="Должен быть указан для подключения IOS устройств и подключения к 'Панели управлени' по MQTT через Internet "
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>mqttPrefix</td>
            <td
              ><input
                type="text"
                required
                bind:value={Conf[i]["mqttPrefix"]}
                on:change={changeConf(
                  Conf[i].mqttPrefix,
                  "mqttPrefix",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="Обратите внимание что поле префикс может состоять только из одного слова и одного разделителя: /prefix, вариант вида: /prefix1/prefix2 работать не будет. После изменения поля prefix необходимо перезагрузить устройство"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>mqttUser</td>
            <td
              ><input
                type="text"
                placeholder={Conf[i]["placeholder"]}
                bind:value={Conf[i]["mqttUser"]}
                on:change={changeConf(
                  Conf[i].mqttUser,
                  "mqttUser",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="После изменеения параметров MQTT требуетсяперезагрузка"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>mqttPass</td>
            <td
              ><input
                type="text"
                placeholder={Conf[i]["placeholder"]}
                bind:value={Conf[i]["mqttPass"]}
                on:change={changeConf(
                  Conf[i].mqttPass,
                  "mqttPass",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>mqttPath</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttPath"]}
                on:change={changeConf(
                  Conf[i].mqttPath,
                  "mqttPath",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
          <br />
          <tr>
            <td width="40%">Web dashbord over MQTT</td>
            <td>
              <form
                id="mqttform"
                method="post"
                action={urlMQTT}
                onsubmit="fmSubmit()"
              >
                <input
                  type="checkbox"
                  bind:checked={Conf[i].webMQTT}
                  on:change={GetMQTThttp(
                    Conf[i].webMQTT,
                    "webMQTT",
                    Conf[i].socket
                  )}
                />
                <input
                  hidden
                  type="text"
                  id="id_user"
                  name="id_user"
                  value={urlMQTT}
                />
                <input
                  hidden
                  type="text"
                  id="mqttServer"
                  name="mqttServer"
                  value={Conf[i]["mqttServer"]}
                />
                <input
                  hidden
                  type="text"
                  id="mqttPort"
                  name="mqttPort"
                  value={Conf[i]["mqttPort"]}
                />
                <input
                  hidden
                  type="text"
                  id="mqttPortwss"
                  name="mqttPortwss"
                  value={Conf[i]["mqttPortwss"]}
                />
                <input
                  hidden
                  type="text"
                  id="mqttPrefix"
                  name="mqttPrefix"
                  value={Conf[i]["mqttPrefix"]}
                />
                <input
                  hidden
                  type="text"
                  id="mqttUser"
                  name="mqttUser"
                  value={Conf[i]["mqttUser"]}
                />
                <input
                  hidden
                  type="text"
                  id="mqttPass"
                  name="mqttPass"
                  value={Conf[i]["mqttPass"]}
                />
                <input
                  hidden
                  type="text"
                  id="mqttPath"
                  name="mqttPath"
                  value={Conf[i]["mqttPath"]}
                />

                {#if Conf[i].webMQTT == true}
                  <input type="submit" value="перейти на MQTT" />
                  <!--<a href="{Cookies.get('urlMQTT')}" onclick="document.getElementById('mqttform').submit(); ">перейти на MQTT</a>-->
                  {(urlMQTT = Cookies.get("urlMQTT"))}
                {/if}
              </form>
            </td>
            <Tooltip
              title="Позволяет поучить доступ к 'Панели управления' через Internet по протоколу MQTT. Должен быть указан MQTT wss port (TLS) "
              ><td>?</td>
            </Tooltip>
          </tr>

          <br /><br /><br /><br /><br />

          <!--MQTT2-->
          <b>Rreserve MQTT</b>
          <hr />
          <br />
          <tr>
            <td>MQTT server </td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttServer2"]}
                on:change={changeConf(
                  Conf[i].mqttServer2,
                  "mqttServer2",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td>MQTT port</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttPort2"]}
                on:change={changeConf(
                  Conf[i].mqttPort2,
                  "mqttPort2",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td>MQTT wss port</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttPortwss2"]}
                on:change={changeConf(
                  Conf[i].mqttPortwss2,
                  "mqttPortwss2",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td>mqttPrefix</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttPrefix2"]}
                on:change={changeConf(
                  Conf[i].mqttPrefix2,
                  "mqttPrefix2",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip
              title="Поле префикс может состоять только из одного слова и одного разделителя: /prefix, вариант вида: /prefix1/prefix2 работать не будет. После изменения поля prefix необходимо перезагрузить устройство"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>mqttUser</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttUser2"]}
                on:change={changeConf(
                  Conf[i].mqttUser2,
                  "mqttUser2",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td>mqttPass</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttPass2"]}
                on:change={changeConf(
                  Conf[i].mqttPass2,
                  "mqttPass2",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>mqttPath</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["mqttPath2"]}
                on:change={changeConf(
                  Conf[i].mqttPath2,
                  "mqttPath2",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr><br />
        </table>
      {/if}
    </Box>

    <!--Telegram-->
    <Box>
      <b on:click={handleClick}>Telegram </b><span
        on:click={handleClick1}
        class="letter1"
      />
      {#if edit == true}
        <table border="0" width="100%">
          <br />
          <tr>
            <td width="40%">Enable Telegram</td>

            <td>
              <input
                type="checkbox"
                bind:checked={Conf[i]["telegonof"]}
                on:change={changeConf(
                  Conf[i]["telegonof"] == true ? 1 : 0,
                  "telegonof",
                  Conf[i].socket
                )}
              />

              {#if Conf[i]["telegonof"] == 0}
                {(Conf[i]["telegonof"] = false)}
              {:else}
                {(Conf[i]["telegonof"] = true)}
              {/if}
            </td>

            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr /><tr>
            <td>Enable incoming messages</td>

            <td>
              <input
                type="checkbox"
                bind:checked={Conf[i]["teleginput"]}
                on:change={changeConf(
                  Conf[i]["teleginput"] == true ? 1 : 0,
                  "teleginput",
                  Conf[i].socket
                )}
              />

              {#if Conf[i]["teleginput"] == 0}
                {(Conf[i]["teleginput"] = false)}
              {:else}
                {(Conf[i]["teleginput"] = true)}
              {/if}
            </td>
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr /><tr>
            <td>Auto get chat ID </td>

            <td>
              <input
                type="checkbox"
                bind:checked={Conf[i]["autos"]}
                on:change={changeConf(
                  Conf[i]["autos"] == true ? 1 : 0,
                  "autos",
                  Conf[i].socket
                )}
              />
              {#if Conf[i]["autos"] == 0}
                {(Conf[i]["autos"] = false)}
              {:else}
                {(Conf[i]["autos"] = true)}
              {/if}
            </td>
            <Tooltip title=""><td>?</td></Tooltip>
          </tr><br />
          <tr>
            <td>Telegram API token</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["telegramApi"]}
                on:change={changeConf(
                  Conf[i].telegramApi,
                  "telegramApi",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td>Telegram chat ID</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["chatId"]}
                on:change={changeConf(Conf[i].chatId, "chatId", Conf[i].socket)}
              /></td
            >
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
        </table>
      {/if}
    </Box>

    <!--UART-->
    <Box>
      <b on:click={handleClick}>UART </b><span
        on:click={handleClick1}
        class="letter1"
      />
      {#if edit == true}
        <table border="0" width="100%">
          <tr>
            <td width="40%">Enable UART</td>
            <td>
              <input disabled type="checkbox" bind:checked={Conf[i]["???"]} />
            </td>
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr /><tr>
            <td>Send all messages to UART</td>
            <td
              ><input
                disabled
                type="checkbox"
                bind:checked={Conf[i]["???"]}
              /></td
            >
            <Tooltip title=""><td>?</td></Tooltip>
          </tr><br />
          <tr>
            <td>UART speed</td>
            <td><input disabled type="text" bind:value={Conf[i]["???"]} /></td>
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td>PIN TX</td>
            <td><input disabled type="text" bind:value={Conf[i]["???"]} /></td>
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td>PIN RX</td>
            <td><input disabled type="text" bind:value={Conf[i]["???"]} /></td>
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
        </table>
      {/if}
    </Box>

    <!-- Developer settings-->
    <Box>
      <b on:click={handleClick}>Developer settings</b><span
        on:click={handleClick1}
        class="letter1"
      />
      {#if edit == true}
        <table border="0" width="100%">
          <tr>
            <td width="40%">Update server</td>
            <td
              ><input
                type="text"
                placeholder="http://206.189.49.244"
                bind:value={Conf[i]["serverip"]}
                on:change={changeConf(
                  Conf[i].serverip,
                  "serverip",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td>Split point graphs</td>
            <td
              ><input
                type="text"
                bind:value={Conf[i]["grafmax"]}
                on:change={changeConf(
                  Conf[i].grafmax,
                  "grafmax",
                  Conf[i].socket
                )}
              /></td
            >
            <Tooltip title="Бла-бла-бла про то как это использовать"
              ><td>?</td>
            </Tooltip>
          </tr>
          <tr>
            <td width="40%">Use a dark theme</td>
            <td>
              {#if Conf[i]["darktheme"] == "false"}
                <td
                  ><input
                    type="checkbox"
                    on:change={(changeConf("true", "darktheme", Conf[i].socket),
                    toggleTheme())}
                  /></td
                >
              {:else}
                <td
                  ><input
                    type="checkbox"
                    bind:checked={Conf[i]["darktheme"]}
                    on:change={(changeConf(
                      Conf[i].darktheme,
                      "darktheme",
                      Conf[i].socket
                    ),
                    toggleTheme())}
                  /></td
                >
              {/if}
            </td>
            <Tooltip title=""><td>?</td></Tooltip>
          </tr>
          <tr>
            <td width="40%">Console LOG</td>
            <td>
              {#if Conf[i]["consolelog"] == "false"}
                <td
                  ><input
                    type="checkbox"
                    on:change={changeConf("true", "consolelog", Conf[i].socket)}
                  /></td
                >
              {:else}
                <td
                  ><input
                    type="checkbox"
                    bind:checked={Conf[i]["consolelog"]}
                    on:change={changeConf(
                      Conf[i].consolelog,
                      "consolelog",
                      Conf[i].socket
                    )}
                  /></td
                >
              {/if}
            </td>
            <Tooltip
              title="Включает вывод в консоль браузера всех полученных пакетов"
              ><td>?</td>
            </Tooltip>
          </tr>
        </table>
      {/if}
    </Box>
    <!-- editor-->
    <Box>
      <b on:click={handleClick}>Editor</b><span
        on:click={handleClick1}
        class="letter1"
      />
      {#if edit == true}
        <form>
          <select
            bind:value={fileSelected}
            on:change={widgetFileChenged(fileSelected, i)}
          >
            {#each widgetfiles as file}
              <option value={file}>
                {file.name}
              </option>
            {/each}
          </select>
        </form>
        <button on:click={handleSubmit(fileSelected, editJSON, Conf[i].socket)}
          >Save to ESP</button
        >
        <button
          hidden
          on:click={() =>
            //(showModal = true), socket[i].send("{'upgrade':1}", countnul())
            download_settings(fileSelected.name)}
        >
          Save to PC
        </button>
        <p>
          <textarea rows="15" id="S1">{syntaxHighlight(editJSON)}</textarea>
        </p>
      {/if}
    </Box>
  {:else}
    <p align="center"><Logo /></p>
  {/if}
  <br /><br />
  <div class="letter" align="center">developed by avaks@meef.ru</div>
</body>

<style>
  .letter {
    color: grey;
    font-size: 60%;
    padding-left: 0px;
    opacity: 0.5;
  }
  table {
    margin: 0px;
    background-color: #fafafa;
    line-height: 1;
  }
  td {
    text-align: left;
    padding-left: 1px;
  }
  input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1;
    box-shadow: 0 0 15px 10px rgba(0, 0, 0, 0.06);
    border-radius: 1px;
  }

  .letter1 {
    color: grey;
    font-size: 80%;
    padding-left: 20px;
  }
  .letter2 {
    text-align: left;
    padding-left: 0px;
  }
  select {
    padding: 10px;
    border-radius: 10px;
    padding-left: 20px;
    height: 40px;
    font-size: 13px;
  }
  input[type="password"] {
    width: 100%;
    padding: 10px;
    border: 1;
    box-shadow: 0 0 15px 10px rgba(0, 0, 0, 0.06);
    border-radius: 1px;
  }

  input:required:invalid:not(:placeholder-shown) {
    border-color: crimson;
  }

  .red {
    border-color: crimson;
  }
  .green {
    border-color: greenyellow;
  }

  .tooltip {
    border: 1px solid #ddd;
    box-shadow: 1px 1px 1px #ddd;
    background: white;
    border-radius: 4px;
    padding: 4px;
    position: absolute;
  }
  progress {
    height: 4px;
  }
  textarea {
    width: 100%;
  }

  button {
    height: 30px;
    border-radius: 4px;
    line-height: 0;
  }
  :global(body.light-mode) {
    background-color: white;
  }
  :global(body.dark-mode) {
    background-color: #1d3040;
    color: #bfc2c7;
  }

  :global(body.dark-mode) textarea {
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
  }
  :global(body.dark-mode) button {
    background-color: #1d3040;
    color: #bfc2c7;
  }

  :global(body.dark-mode) div {
    background-color: #1d3040;
    color: #bfc2c7;
  }
  :global(body.dark-mode) span {
    background-color: #1d3040;
    color: #bfc2c7;
  }
  :global(body.dark-mode) lable {
    background-color: #1d3040;
    color: #bfc2c7;
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

  :global(body.dark-mode) table {
    background-color: #1d3040;
    color: #bfc2c7;
  }
  :global(body.dark-mode) .letter1 {
    color: #bfc2c7;
  }
  :global(body.dark-mode) .letter2 {
    color: #bfc2c7;
  }
  :global(body.dark-mode) b {
    color: #bfc2c7;
  }

  :global(body.dark-mode) button {
    background-color: #1d3040;
    color: #bfc2c7;
  }
  h5 {
    display: inline;
  }
</style>
