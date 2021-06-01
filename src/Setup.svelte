<script>
	import Tooltip from './Tooltip.svelte';
	import Box from './Box.svelte';

    let devices = [];
    let socket =[];
    let connectionType = 'WS';
	let myip = document.location.hostname;
	let NetworkMap=[];  
	let Conf=[];
    let name;
	
	// ==на время разработки==
	myip = "192.168.36.137";
	
	// подключаемся к локальной машине, получаем карту сети
	function getNetworkMap() {
			devices= JSON.parse('[{"deviceID":"","deviceIP":"' + myip + '","deviceName":""}]');
			devices[0].id=0;
			devices[0].status="close";
			console.log("Подключаемся к WS на localhost ",devices);
			if(connectionType != "MQTT")
			{
			socket[0] = new WebSocket('ws://'+myip+'/ws');
			socket[0].addEventListener('open', function (event) {
			devices[0].id=0;
			devices[0].status="connected";
			devices = devices;
			console.log("WS CONNECTED! "+myip);

// получаем "карту сети" по websocket       
			socket[0].send("getNetworkMap");
// получаем конфигурацию ESP по websocket       			
			socket[0].send("getconfigsetupjson");
			 					
			});
			socket[0].addEventListener('message', function (event) {
// запускаем обработку пришедшего сообщения
			addMessage(event.data,0);
			});
// Обработка ошибок websocket 
			socket[0].addEventListener('close', (event) => {
				  console.log('ws close '+item.deviceIP);
				  devices[0].status="close"; 
			 	  devices = devices;
			});
			socket[0].addEventListener('error', function (event) {
				  console.log(item.deviceIP+' WebSocket error: ', event);
				  devices[0].status="close";
				  devices = devices;
			});
			}
		}
		getNetworkMap();





// добавляем новые подключения из карты сети

function addConnection (devices)  {
	if(devices){ 
			devices.forEach(function(item, i, arr) {
			if (item.deviceIP !=myip){
			//i=i+1;
			console.log("trying connect", item, i);
			socket[i] = new WebSocket('ws://'+item.deviceIP+'/ws');
			socket[i].addEventListener('open', function (event) {
	devices[i].id=i;
	devices[i].status="connected";
	devices = devices;
			console.log("WS CONNECTED! "+item.deviceIP, i);

// получаем конфигурацию ESP по websocket       
		
				socket[i].send("getconfigsetupjson");
			 					
			});
		socket[i].addEventListener('message', function (event) {
// запускаем обработку пришедшего сообщения
			addMessage(event.data, i);
			});
// Обработка ошибок websocket 
			socket[i].addEventListener('close', (event) => {
				  console.log('ws close '+item.deviceIP);
				  devices[i].status="close"; 
			 	  devices = devices;
				   NetworkMap= NetworkMap;
				   console.log(devices);
			});
			socket[i].addEventListener('error', function (event) {
				  console.log(item.deviceIP+' WebSocket error: ', event);
				  devices[i].status="close";
				  devices = devices;
				  NetworkMap=NetworkMap;
				  console.log(devices);
			});
	}
});
	
	}};
	
   // addConnection(devices);
    
    

	function addMessage(data, socket) {
		
	try{
		data = JSON.parse(data);
		data.socket = socket;
    // Если пришел Config
    if (data.apssid)
           {
             Conf =  [
				 ...Conf,
                        data
                    ]
	// Запоминаем настройки MQTT дря быстрой смены в выпадающем списке				
	if (Conf != ""){
	MQTTsample[0].mqttServer=Conf[0].mqttServer;
	MQTTsample[0].mqttPort=Conf[0].mqttPort;
	MQTTsample[0].mqttPortwss=Conf[0].mqttPortwss;
	MQTTsample[0].mqttPrefix=Conf[0].mqttPrefix;
	MQTTsample[0].mqttUser=Conf[0].mqttUser;
	MQTTsample[0].mqttPass=Conf[0].mqttPass;
	MQTTsample[0].mqttPath=Conf[0].mqttPath;
	}
       }

	// Если пришла карта сети   
	   if (data[0].deviceID)
           {
			console.log('пришла карта сети :', data);
			devices = data;
			//Conf=[];
			
			addConnection(devices);
			NetworkMap=data;

       }
       }   catch (e) {
		//	console.log('ERROR parse JSON', data);
			}

        };
   




  let inputIP="";
	let inputName="";

	let edit=true;
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
        "deviceID":"0000000-0000000",
				"deviceIP":inputIP,
        "deviceName":inputName
      }
    ];
	NetworkMap = NetworkMap;
	inputIP="";
	inputName="";
	// сохраняем NetworkMap.json   // Надо добавить перебор сокетов
//	socket.forEach(function(asd, i, arr) {
	socket[0].send('{NetworkMap:'+JSON.stringify(NetworkMap)+'}'); 
  //});

  }
  
function removeTodo(id) {
  NetworkMap.splice(id, 1);
  NetworkMap = NetworkMap;
  // сохраняем NetworkMap.json // Надо добавить перебор сокетов
  //socket.forEach(function(asd, i, arr) {
	socket[0].send('{NetworkMap:'+JSON.stringify(NetworkMap)+'}'); 
  //});
}
	
	

let MQTTsample=[{"mqttServer":"","mqttPort":'',"mqttPortwss":'',"mqttPrefix":"","mqttUser":"","mqttPass":"","mqttPath":""},
{"mqttServer":"meef.ru","mqttPort":1883,"mqttPortwss":18883,"mqttPrefix":"/IotTest","mqttUser":"IotManager:guest","mqttPass":"guest","mqttPath":"/ws"}
]	

	
	let selected;
	let i=0;
	let id=0;
	let wiget=[];


	function chengConf(id) {
 	i=id;
}
	function chengMQTT(selected)
	{
		
		Conf[i]["mqttServer"]=selected.mqttServer;
		Conf[i]["mqttPort"]=selected.mqttPort;
		Conf[i]["mqttPortwss"]=selected.mqttPortwss;
		Conf[i]["mqttPrefix"]=selected.mqttPrefix;
		Conf[i]["mqttUser"]=selected.mqttUser;
		Conf[i]["mqttPass"]=selected.mqttPass;
		Conf[i]["mqttPath"]=selected.mqttPath;

		changeConf(selected.mqttServer, "mqttServer", i);
		changeConf(selected.mqttPort, "mqttPort", i);
		changeConf(selected.mqttPortwss, "mqttPortwss", i);
		changeConf(selected.mqttPrefix, "mqttPrefix", i);
		changeConf(selected.mqttUser, "mqttUser", i);
		changeConf(selected.mqttPass, "mqttPass", i);
		changeConf(selected.mqttPath, "mqttPath", i);

	}
	let m;

	function changeConf(val, name, socet)
	{
console.log(val, name, socet);
socket[socet].send('{"setconfigsetupjson":"1", "name":"'+name+'", "val":"'+val+'"}'); 

	}
function reboot(selected){
socket[selected].send('{"command":"reboot"}'); 
}
function Pastesettings(i){
		Conf[i]["mqttServer"]=Conf[0]["mqttServer"];
		Conf[i]["mqttPort"]=Conf[0]["mqttPort"];
		Conf[i]["mqttPortwss"]=Conf[0]["mqttPortwss"];
		Conf[i]["mqttPrefix"]=Conf[0]["mqttPrefix"];
		Conf[i]["mqttUser"]=Conf[0]["mqttUser"];
		Conf[i]["mqttPass"]=Conf[0]["mqttPass"];
		Conf[i]["mqttPath"]=Conf[0]["mqttPath"];

		changeConf(Conf[i]["mqttServer"], "mqttServer", i);
		changeConf(Conf[i]["mqttPort"], "mqttPort", i);
		changeConf(Conf[i]["mqttPortwss"], "mqttPortwss", i);
		changeConf(Conf[i]["mqttPrefix"], "mqttPrefix", i);
		changeConf(Conf[i]["mqttUser"], "mqttUser", i);
		changeConf(Conf[i]["mqttPass"], "mqttPass", i);
		changeConf(Conf[i]["mqttPath"], "mqttPath", i);


}
</script>

<body>
	



<!--

<p>	{JSON.stringify(Conf[0])}</p>-->
	
	
	<!-- NetworkMap-->
{#if Conf != ""}	
<Box>
	
<b on:click={handleClick}>Network Map</b>	<span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if NetworkMap == ""}
	<b>Файл с картой сети еще не создан</b>
	{/if}
	<div >
		Навсех добавляемых ESP должнабыть такая же прошивка	!!!
		 
	</div>

<table border="0" width="100%">

	{#if NetworkMap != ""}
	{#each NetworkMap as espconf, m}
	<tr>
	<td width="1%" class="letter2">IP</td><td><input type="text" disabled required bind:value='{NetworkMap[m]["deviceIP"]}'  />	</td>		
	<td width="1%">Name</td><td width="30%"><input type="text" required bind:value='{NetworkMap[m]["deviceName"]}'  /></td>
	<td><button  on:click={()=> removeTodo(m)} >-</button></td>
	</tr>
	{/each}
	
	<tr>
	<td width="1%" class="letter2">IP</td><td><input type="text" bind:value="{inputIP}" /></td>
	<td width="1%">Name</td><td width="30%"><input type="text" bind:value="{inputName}" /></td>
	<td><button  on:click={()=> addTodo(inputIP, inputName)} >+</button></td>
	</tr>
	{:else}
	<tr>
	<td width="1%" class="letter2">IP</td><td><input disabled type="text" required bind:value='{Conf[i].ip}'  /></td>
	<td width="1%">Name</td><td width="30%"><input type="text" required bind:value='{Conf[i].name}'  /></td>
	<td><button on:click={()=> addTodo(Conf[i].ip, Conf[i].name)}  >+</button></td></tr>
	{/if}
	

	</table>	<br>
	<p><a target="_self" href="http://{myip}/setup">Сохранить</a></p>
</Box>
	
	
	<b >Select ESP</b> 	<span><select   bind:value={selected} on:change="{chengConf(selected)}">
		{#each Conf as espconf, n}
			<option value={n}>
				<b>{Conf[n]["name"]}</b> ({Conf[n]["ip"]})
			</option>
		{/each}
			
	</select></span> 
	

	<!--WIFI-->	
	<button on:click={Pastesettings(i)}>Paste settings</button>  <button on:click={reboot(Conf[i].socket)}>Reboot</button>
<Box>
<b on:click={handleClick}>WIFI</b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if edit == true}

<table border="0" width="100%">
	<tr>
	
		<td width="40%">ESP name</td>
		<td><input type="text" required bind:value='{Conf[i].name}'on:change={ changeConf(Conf[i].name, 'name', Conf[i].socket)} /></td>
		<Tooltip title="Имя устройства должно состоять из английских букв и иметь длинну от 6 до 12 символов"> <td>?</td>	</Tooltip>
	</tr><hr>
	<tr>
		<td>WIFI name</td>
		<td><input type="text"  bind:value='{Conf[i].routerssid}'on:change={changeConf(Conf[i].routerssid, 'routerssid', Conf[i].socket)} /></td>
		<Tooltip title="После того как вы введете логин пароль от вашего wifi роутера необходимо нажать кнопку сохранить, а затем обязательно нажать кнопку перезагрузить устройство внизу этой страницы" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>WIFI password</td>
		<td><input type="password"  bind:value='{Conf[i]["routerpass"]}' on:change={changeConf(Conf[i].routerpass, 'routerpass', Conf[i].socket)} /></td>
	<Tooltip title="После того как вы введете логин пароль от вашего wifi роутера необходимо нажать кнопку сохранить, а затем обязательно нажать кнопку перезагрузить устройство внизу этой страницы" ><td>?</td>	</Tooltip>
	</tr><hr>
		<tr>
		<td>AP name</td>
		<td><input type="text" required bind:value='{Conf[i]["apssid"]}' on:change={changeConf(Conf[i].apssid, 'apssid', Conf[i].socket)} /></td>
			<Tooltip title="Устройство постоянно сканирует сеть на наличие wifi. Если роутер отключен, то устройство автоматически перейдет в режим точки доступа. Когда wifi появится устройство автоматически подключится к роутеру снова, и выключит точку доступа" ><td>?</td>	</Tooltip>
	</tr>
</table>	

	{/if}
</Box>

<!-- Users-->
<Box>
<b on:click={handleClick}>Users</b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if edit == true}

<table border="0" width="100%">
<tr>
		<td width="40%">WEB admin login</td>
		<td><input type="text" required bind:value='{Conf[i]["weblogin"]}' on:change={changeConf(Conf[i].weblogin, 'weblogin', Conf[i].socket)} /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>WEB admin password</td>
		<td><input type="password" required bind:value='{Conf[i]["webpass"]}' on:change={changeConf(Conf[i].webpass, 'webpass', Conf[i].socket)}/></td>
	<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr>
	</table>	

	{/if}
</Box>
	
<!--Teame-->
	<Box>
<b on:click={handleClick}>Time </b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if edit == true}

<table border="0" width="100%">
<tr>
		<td width="40%">Time Zone</td>
		<td><input type="text" required bind:value='{Conf[i]["timezone"]}' on:change={changeConf(Conf[i].timezone, 'timezone', Conf[i].socket)}/></td>
			<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>NTP server</td>
		<td><input type="text" required bind:value='{Conf[i]["ntp"]}' on:change={changeConf(Conf[i].ntp, 'ntp', Conf[i].socket)}/></td>
		<Tooltip title="После изменения поля NTP сервер необходимо перезагрузить устройство" ><td>?</td>	</Tooltip>
	</tr>
</table>	

	{/if}
</Box>
	
<!--MQTT-->
	<Box>
<select  bind:value={selected} on:change="{chengMQTT(selected)}">
		{#each MQTTsample as mqtt, n}
			<option value={mqtt}>
				<b>{mqtt.mqttServer}</b> 
			</option>
		{/each}
	</select>		

<b on:click={handleClick}>MQTT</b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]} 
		
		<!--	{@html Conf[i]["warning4"]}-->
		</span>  
	{#if edit == true}

<table border="0" width="100%">

	<tr>
		<td width="40%">MQTT server</td>
		<td><input type="text" required bind:value='{Conf[i]["mqttServer"]}' on:change={changeConf(Conf[i].mqttServer, 'mqttServer', Conf[i].socket)} /></td>
		<Tooltip title=""  > <td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>MQTT port</td>
		<td><input type="text" required bind:value='{Conf[i]["mqttPort"]}' on:change={changeConf(Conf[i].mqttPort, 'mqttPort', Conf[i].socket)}/></td>
		<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>MQTT wss port</td>
		<td><input type="text"  bind:value='{Conf[i]["mqttPortwss"]}' on:change={changeConf(Conf[i].mqttPortwss, 'mqttPortwss', Conf[i].socket)}/></td>
		<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>mqttPrefix</td>
		<td><input type="text" required bind:value='{Conf[i]["mqttPrefix"]}' on:change={changeConf(Conf[i].mqttPrefix, 'mqttPrefix', Conf[i].socket)}/></td>
	<Tooltip title="Обратите внимание что поле префикс может состоять только из одного слова и одного разделителя: /prefix, вариант вида: /prefix1/prefix2 работать не будет. После изменения поля prefix необходимо перезагрузить устройство" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>mqttUser</td>
		<td><input type="text" bind:value='{Conf[i]["mqttUser"]}' on:change={changeConf(Conf[i].mqttUser, 'mqttUser', Conf[i].socket)}/></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>mqttPass</td>
		<td><input type="text" bind:value='{Conf[i]["mqttPass"]}' on:change={changeConf(Conf[i].mqttPass, 'mqttPass', Conf[i].socket)} /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>mqttPath</td>
		<td><input type="text" bind:value='{Conf[i]["mqttPath"]}'on:change={changeConf(Conf[i].mqttPath, 'mqttPath', Conf[i].socket)} /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr><hr>
	<!--MQTT2-->
	<b>Rreserve MQTT</b>
	<br>
		<tr>
		<td>MQTT server </td>
		<td><input type="text" bind:value='{Conf[i]["mqttServer2"]}' on:change={changeConf(Conf[i].mqttServer2, 'mqttServer2', Conf[i].socket)} /></td>
		<Tooltip title=""  > <td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>MQTT port</td>
		<td><input type="text" bind:value='{Conf[i]["mqttPort2"]}' on:change={changeConf(Conf[i].mqttPort2, 'mqttPort2', Conf[i].socket)} /></td>
		<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>MQTT wss port</td>
		<td><input type="text" bind:value='{Conf[i]["mqttPortwss2"]}' on:change={changeConf(Conf[i].mqttPortwss2, 'mqttPortwss2', Conf[i].socket)}/></td>
		<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>mqttPrefix</td>
		<td><input type="text"  bind:value='{Conf[i]["mqttPrefix2"]}' on:change={changeConf(Conf[i].mqttPrefix2, 'mqttPrefix2', Conf[i].socket)}/></td>
	<Tooltip title="Поле префикс может состоять только из одного слова и одного разделителя: /prefix, вариант вида: /prefix1/prefix2 работать не будет. После изменения поля prefix необходимо перезагрузить устройство" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>mqttUser</td>
		<td><input type="text" bind:value='{Conf[i]["mqttUser2"]}' on:change={changeConf(Conf[i].mqttUser2, 'mqttUser2', Conf[i].socket)} /></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>mqttPass</td>
		<td><input type="text" bind:value='{Conf[i]["mqttPass2"]}' on:change={changeConf(Conf[i].mqttPass2, 'mqttPass2', Conf[i].socket)}/></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr>
		<tr>
		<td>mqttPath</td>
		<td><input type="text" bind:value='{Conf[i]["mqttPath2"]}' on:change={changeConf(Conf[i].mqttPath2, 'mqttPath2', Conf[i].socket)}/></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr><br>
	<tr>
		<td width="40%">Web dashbord over MQTT</td>
		<td><input disabled type=checkbox bind:checked={Conf[i]["webMQTT"]} on:change={changeConf(Conf[i].webMQTT, 'webMQTT', Conf[i].socket)}></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	</table>	
	{/if}
</Box>

		
<!--Telegram-->
	<Box>
<b on:click={handleClick}>Telegram </b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if edit == true}

<table border="0" width="100%"><br>
<tr>
		<td width="40%">Enable Telegram</td>
		<td><input disabled type=checkbox bind:checked = {Conf[i]["telegonof"]} on:change={changeConf(Conf[i].telegonof, 'telegonof', Conf[i].socket)}></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
<tr>
<tr>
		<td>Enable incoming messages</td>
		<td><input disabled type=checkbox bind:checked={Conf[i]["teleginput"]} on:change={changeConf(Conf[i].teleginput, 'teleginput', Conf[i].socket)}></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
<tr>
<tr>
		<td>Auto get chat ID </td>
		<td><input  disabled type=checkbox bind:checked={Conf[i]["autos"]} on:change={changeConf(Conf[i].autos, 'autos', Conf[i].socket)}></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr><br>
<tr>

	<td>Telegram API token</td>
		<td><input type="text" bind:value='{Conf[i]["telegramApi"]}'  on:change={changeConf(Conf[i].telegramApi, 'telegramApi', Conf[i].socket)}/></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Telegram chat ID</td>
		<td><input type="text" bind:value='{Conf[i]["chatId"]}'  on:change={changeConf(Conf[i].chatId, 'chatId', Conf[i].socket)}/></td>
		<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
</table>	

	{/if}
</Box>
		
<!--UART-->
	<Box>
<b on:click={handleClick}>UART </b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if edit == true}

<table border="0" width="100%">
<tr>
		<td width="40%">Enable UART</td>
		<td><input disabled type=checkbox bind:checked={Conf[i]["???"]} ></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
<tr>
<tr>
		<td>Send all messages to UART</td>
		<td><input disabled type=checkbox bind:checked={Conf[i]["???"]}></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr><br>
<tr>
	<td>UART speed</td>
		<td><input disabled type="text" bind:value='{Conf[i]["???"]}' /></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>PIN TX</td>
		<td><input disabled type="text" bind:value='{Conf[i]["???"]}' /></td>
		<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>PIN RX</td>
		<td><input disabled type="text" bind:value='{Conf[i]["???"]}' /></td>
		<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
</table>	

	{/if}
</Box>
	
	
<!-- Developer settings-->
<Box>
<b on:click={handleClick}>Developer settings</b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if edit == true}

<table border="0" width="100%">
<tr>
		<td width="40%">Update server</td>
		<td><input type="text" bind:value='{Conf[i]["serverip"]}' on:change={changeConf(Conf[i].serverip, 'serverip', Conf[i].socket)}/></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Split point graphs</td>
		<td><input type="text" bind:value='{Conf[i]["grafmax"]}'on:change={changeConf(Conf[i].grafmax, 'grafmax', Conf[i].socket)} /></td>
	<Tooltip title="Бла-бла-бла про то как это использовать" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td width="40%">Use a dark theme</td>
		<td><input disabled type=checkbox bind:checked={Conf[i]["darktheme"]} on:change={changeConf(Conf[i].darktheme, 'darktheme', Conf[i].socket)}></td>
			<Tooltip title="" ><td>?</td>	</Tooltip>
	</tr>
	</table>	

	{/if}
</Box>
	{/if}	
</body>


<style>
table {
	margin:0px;
  background-color: #fafafa;
	line-height:1;
	}
td { 
	text-align: left; 
	padding-left: 5px 
	}
input[type=text] {
	width: 100%;
  padding:10px;
  border:1;
  box-shadow:0 0 15px 10px rgba(0,0,0,0.06);
	border-radius:5px;
	
}	

	
		 .letter1 { 
     color: grey; 
     font-size: 80%; 
		 padding-left: 20px 
		
     }
			 .letter2 { 
	text-align: left; 
	padding-left: 0px 
		
     }
select {
  width: 70%;
  padding:10px;
  border-radius:10px;
	padding-left: 20px 

}	
input[type=password] {
 	width: 100%;
	padding:10px;
  border:0;
  box-shadow:0 0 15px 10px rgba(0,0,0,0.06);
	border-radius:5px;
}

input:required:invalid:not(:placeholder-shown) {
  border-color: crimson;
	}
.red{border-color: crimson;}	
	.tooltip {
		border: 1px solid #ddd;
		box-shadow: 1px 1px 1px #ddd;
		background: white;
		border-radius: 4px;
		padding: 4px;
		position: absolute;
	}
</style>