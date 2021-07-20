	<script>
	import Cookies, { get } from 'js-cookie';
	import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';
	import Toggle from "svelte-toggle";
	import Chart from 'svelte-frappe-charts';
	import Logo from './Logo.svelte';
	//import mqtt from 'mqtt/dist/mqtt.min';

	// темная тема 
		let darkMode = false;
	//	data.darktheme=(Cookies.get('darktheme') == "true") ? true : false; 
	if (Cookies.get('darktheme') == "true"){window.document.body.classList.value='dark-mode';}

	function toggleTheme() {
    window.document.body.classList.toggle('dark-mode')
	if (window.document.body.classList.value == 'dark-mode'){Cookies.set('darktheme', "true", { expires: 365 });}
	else {Cookies.set('darktheme', "False", { expires: 365 });}
	}
		//секция переменных============================================
		let myip = document.location.hostname;
		let configSetupJson = "{}";
		let espName = "IotManager";
		let chipID = "";
		let colors;
		let	lineOptions;
		let axisOptions;
		let graf_1=[];
		let graf_2=[];
		let NewWiget="";
		let NewPage="";
		let NewPrefics="";
		let date="";
		let hours ="";
		let minutes="";
		let temp;
		let selectedprefics; 
	// декларируем массив для  списка всех ESP в сети 
	let devices = [];
	// декларируем массив для списка всех websocket  
	let socket =[];
	// декларируем массив для списка всех виджетов  
	let wigets =[];
	// декларируем массив для списка всех страниц   
	let pages =[];
	// декларируем массив для списка всех префиксов  
	let prefics =[{'prefics':''}];
	// выбраный префикс
	let selected;	
	// массивы для построения графиков
	let graf_time=[];
	let graf_val=[];
	let dataLine=[];
	
// ==на время разработки==
//myip = "192.168.36.127";

	let connectionType = 'MQTT';
	let client;
	let topic;
	let connected = false;

	let clientId = 'IotManager_';
   
   
   
// MQTT====================================================================
function MQTTChange(){
	console.log("The selected option is " + JSON.stringify(selected));
	wigets=[];
	prefics=[];
	pages=[];
	clientId += '_' + Math.floor(Math.random() * 10000);
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
        path: '' + selected.mqtt_path,
        protocolId: 'MQTT',
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
      console.log(`MQTT connected ${url}`);
      connected = client.connected;
      const topic = selected.mqtt_prefix;
      client.subscribe(topic+'/#', function (err) {
        if (err) {
          console.error(err);
          } else {
          console.log(`MQTT subscribed on topic '${topic}'`);
          client.publish(topic, 'HELLO')
        }
      });
    };
  
    const onMessage = (topic, message) => {
      const msg = message.toString();
      const time = new Date().getTime();
      (addMessage(msg, topic));
	  };
   
//try{
    client = mqtt.connect(mqtt_options);
    client.on('connect', onConnect);
    client.on('message', onMessage);
    client.on('error', (err) => {
      console.log('MQTT', err);
      client.end();
      connected = client.connected;
    });
    client.on('close', () => {
     console.log('MQTT ' + clientId + ' disconnected');
     connected = client.connected;
    });
	
}
if (connectionType == 'MQTT'){

 
	// ==на время разработки==
	 MQTTconnections=JSON.parse(MQTTconnections);
	


	clientId += '_' + Math.floor(Math.random() * 10000);
      connected = false;
      const mqtt_options = {
        clientId: clientId,
        servers: [
          {
            host: MQTTconnections[0].mqtt_host,
            port: Number(MQTTconnections[0].mqtt_port),
            protocol: MQTTconnections[0].connection_protocol,
          },
        ],
        path: '' + MQTTconnections[0].mqtt_path,
        protocolId: 'MQTT',
        protocolVersion: 4,
        keepalive: 30, 
        clean: true,
        reconnectPeriod: 100000,
        connectTimeout: 30 * 1000,
        rejectUnauthorized: false,
      };
        mqtt_options.username = MQTTconnections[0].mqtt_username;
        mqtt_options.password = MQTTconnections[0].mqtt_password;
	    topic = MQTTconnections[0].mqtt_prefix;
      	const url = `${mqtt_options.servers[0].protocol}://${mqtt_options.servers[0].host}:${mqtt_options.servers[0].port}${mqtt_options.path}`;
    
    const onConnect = () => {
      console.log(`MQTT connected ${url}`);
      connected = client.connected;
      const topic = MQTTconnections[0].mqtt_prefix;
      client.subscribe(topic+'/#', function (err) {
        if (err) {
          console.error(err);
          } else {
          console.log(`MQTT subscribed on topic '${topic}'`);
          client.publish(topic, 'HELLO')
        }
      });
    };
  
    const onMessage = (topic, message) => {
      const msg = message.toString();
      const time = new Date().getTime();
      (addMessage(msg, topic));
	  };
   
//try{
    client = mqtt.connect(mqtt_options);
    client.on('connect', onConnect);
    client.on('message', onMessage);
    client.on('error', (err) => {
      console.log('MQTT', err);
      client.end();
      connected = client.connected;
    });
    client.on('close', () => {
     console.log('MQTT ' + clientId + ' disconnected');
     connected = client.connected;
    });
//} catch (e) {
//}
//console.log(MQTTconnections);
}

// MQTT =============================================================================================

	
	

	
	
//Get(Post)=======================================================
/*		if (connectionType != 'MQTT'){
		onMount(async () => {
			getСonfigSetupJson();
		});
		}
		async function getСonfigSetupJson() {
			let res = await fetch("http://" + myip + "/config.setup.json", {
				mode: "no-cors",
				method: "GET",
			});
			if (res.ok) {
				configSetupJson = await res.json();
			} else {
		
			//	console.log("getСonfigSetupJson error", res.status);
			}
			getValues();
			getNetworkMap() 
		}
	
		function parseСonfigSetupJson(key) {
			let result = configSetupJson[key];
			return result;
		}
	
		function getValues() {
			espName = parseСonfigSetupJson("name");
			chipID = parseСonfigSetupJson("chipID");
		}
	
	
	 //Получаем из файла NetworkMap.json список ESP к которым надо подключатся
	 let configNetworkMap = {};
	 let myhost = document.location.host
	 console.log("myhost", myhost);
	
	
	 async function getNetworkMap() {
			let res = await fetch("http://" + myip + "/NetworkMap.json", {
				mode: "no-cors",
				method: "GET",
			});
			if (res.ok) {
				configNetworkMap = await res.json();
				devices=configNetworkMap;
				console.log("получена карта сети",devices);
			} else {
				console.log("NetworkMap.json отсутствует или содержит ошибки", res.status);
				// Если файла не нашли подключаемся к локальной машне
				configNetworkMap = '[{"deviceID":"' +  chipID + '","deviceIP":"' + myip + '","deviceName":"' + espName + '"}]'; 
				  try{
					 devices= JSON.parse(configNetworkMap);
					 console.log("Подключаемся локально",devices);
				 } catch (e) {
				 console.log("configNetworkMap содержит ошибки", configNetworkMap);
	 }
				
			}
			if(connectionType != "MQTT")
			{
				addConnection(devices);
			}
		}
		
	*/
		

		// подключаемся к локальной машине, получаем карту сети
		function getNetworkMap() {
			devices= JSON.parse('[{"deviceID":"","deviceIP":"' + myip + '","deviceName":""}]');
			devices[0].id=0;
			devices[0].status=false;
			console.log("Подключаемся к WS на localhost ",devices);
			if(connectionType != "MQTT")
			{
			socket[0] = new WebSocket('ws://'+myip+'/ws');
			socket[0].addEventListener('open', function (event) {
			devices[0].id=0;
			devices[0].status=true;
			devices = devices;
			console.log("WS CONNECTED! "+myip);
// получаем "карту сети" по websocket       
			socket[0].send("getNetworkMap");
// получаем конфигурацию ESP по websocket       			
			socket[0].send("HELLO");
	 					
			});
			socket[0].addEventListener('message', function (event) {
// запускаем обработку пришедшего сообщения

			addMessage(event.data,0);
			});
// Обработка ошибок websocket 
			socket[0].addEventListener('close', (event) => {
				  console.log('ws close '+item.deviceIP);
				  devices[0].status=false; 
			 	  devices = devices;
			});
			socket[0].addEventListener('error', function (event) {
				  console.log(item.deviceIP+' WebSocket error: ', event);
				  devices[0].status=false;
				  devices = devices;
			});
			}
		}
		if (connectionType != 'MQTT'){
		getNetworkMap();
		}


	
	
	
	function addConnection (devices)  {
	if(devices){
	

			devices.forEach(function(item, i, arr) {
				console.log("trying connect", item);
				
	// Create WebSocket connection.
			socket[i] = new WebSocket('ws://'+item.deviceIP+'/ws');
	// Connection opened
			socket[i].addEventListener('open', function (event) {
			devices[i].id=i;
			devices[i].status=true;
			devices = devices;
			console.log("WS CONNECTED! "+item.deviceIP);
			socket[i].send("HELLO");
	
			});
	// Listen for messages
			socket[i].addEventListener('message', function (event) {
			  
	// вывод отладочных сообщений в консоль		
	
	if (Cookies.get('consolelog') == "true")
	{	
			console.log('NEW data packet '+item.deviceIP, event.data);
	}
	
	// запускаем обработку пришедшего сообщения
				let time = new Date().getTime();
				addMessage(event.data, i);
			});
	// Обработка ошибок websocket 
			socket[i].addEventListener('close', (event) => {
				  console.log('ws close '+item.deviceIP);
				  devices[i].status=false; 
			 	  devices = devices;
				  Shuttervisibil();
			});
			socket[i].addEventListener('error', function (event) {
				console.log(item.deviceIP+' WebSocket error: ', event);
				devices[i].status=false;
				devices = devices;
				Shuttervisibil();
			});
		});
	}};
	//console.log(devices);
	
	
	
	//обрабатываем пришедшее сообщение =====================================================================
	
	function addMessage(data, socket) {
		if (connectionType =="MQTT")
		{
			console.log('NEW data packet '+socket, data);
			topic=socket;
		} 	
		
		let json;
		let tmp;
	
		try{
		let net = JSON.parse(data);

			// Если пришла карта сети   
			if (net[0].deviceID)
           {
			console.log('пришла карта сети :', net);
			devices = net;
			//Conf=[];
			
			addConnection(devices);
			NetworkMap=data;

       }
		
	} catch (e) {
			//	console.log('ERROR parse JSON', tmp);
			}


		
		tmp = "["+data+"]";
			



		//tmp = [data];
	try{
	tmp = JSON.parse(tmp);
	tmp.forEach(function(json, i, array) {

			
	// собираем виджеты	
	// если пришедшее сообщение виджет 	
	if (json.widget){
	// ищем его в массиве виджетов
		NewWiget="";
		wigets.forEach(function(item, i, array) {
		 if (json.topic==item.topic){
			NewWiget=json.topic;
		//	console.log("Нашли совпадение виджета");
		}		
			 });
	
	// ищем новые страницы
	 NewPage="";
		pages.forEach(function(item, i, array) {
		if (json.page==item.page){
			NewPage=json.page;
		//	console.log("Нашли совпадение страницы");
		}	
			 });
	
	// ищем новые префиксы		
	 NewPrefics="";
	prefics.forEach(function(item, i, array) {
		let topic =  getprefics(json.topic);
		if (topic==item	.prefics){
			NewPrefics=item.prefics;
		//	console.log("Нашли совпадение префикса");
		}		 
			 });
	
	// Новый виджет дописываем в массив виджетов
		if (!NewWiget){	
			// дописываем виджету из какого сокета он получен
			json.socket = socket;
			// дописываем виджету префикс 
			json.prefics = getprefics(json.topic)
			json.closed = true; 
			

			 wigets = [
			 ...wigets,
			  json,
			  ];	 
		
	// сортируем 
		wigets.sort(( a, b ) =>  a.order - b.order);  
		}

	// Дописываем новую страницу в массив страниц 
	if (!NewPage){	
	pages = [
				 ...pages,
			 JSON.parse(JSON.stringify({"page" : json.page, "topic": json.topic})),
			  ];

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
	if (!NewPrefics){	
		prefics = [
				 ...prefics,
				 JSON.parse( JSON.stringify({"prefics" : getprefics(json.topic)})),
			  ];
		}	
	}  
	// закончили сбор виджетов
	

	// если новое сообщение статус 
	if (json.status){

	// ищем виджет к которому относится этот статус
	wigets.forEach(function (element){

		
		//отличие MQTT и WS========================================================!!!!!!!!!!!!!!
		let messegetopic;
		if (connectionType==="MQTT")
		{
			messegetopic=topic.replace("/status","");
		}else
		{
			messegetopic=json.topic.replace("/status","");
		} 
	 	// ========================================================================

		if (element.topic == messegetopic) {
	// если получен статус график 
	
	if (element.widget=="chart"){
			graf_time=[];
			graf_val =[];
		try {
			temp=json.status;
			temp.forEach(function(item, i, arr) {
				// получаем время 
				 date = new Date(item.x * 1000);
				 hours = date.getHours();
				 minutes = date.getMinutes();
				graf_time = [... graf_time,  hours+':'+minutes, ];
				graf_val = [... graf_val, item.y1, ];
			});

			
			axisOptions={xAxisMode:'tick', xIsSeries: true};	
			if (element.pointRadius=="0"){
			lineOptions = {hideDots:1,regionFill:1,spline:1};
			} else{
				lineOptions = {regionFill:1, dotSize: 3,spline:1};
			}
			
				
				dataLine = {
  				labels: graf_time,
  				datasets: [
      {
            name: element.descr,
		    values: graf_val
        }

        
    ],
		
}
			
	if (!element.status){
				// архив графика отсутсутствует, то создаем статус и заполняем
					element.status=dataLine;
				
						 }
				else {
					//console.log(" дописываем новые значения к имеющимся");
					element.status.labels = [...element.status.labels, dataLine.labels[0]];
					element.status.datasets[0].values = [...element.status.datasets[0].values, dataLine.datasets[0].values[0] ]
					
					}
			} catch (e) {
				console.log('полученные данные для графика содержат ошибки', element.status);
			}
		
			//два графика в одном / пока работает криво только для WS	, надо делать
		if (connectionType==="MQTT")
		{

		}
		else{
					if (json.topic.includes('_1/status'))
				{
					graf_1=element.status.datasets[0];	
				}
				if (json.topic.includes('_2/status'))
				{
					graf_2=element.status.datasets[0];
					element.status.datasets[1]= graf_1;
				}
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
			
	});
	
	
	}
	//  для mysens
	if (json.info){
// ищем виджет к которому относится INFO
	wigets.forEach(function (element){
	//отличие MQTT и WS========================================================!!!!!!!!!!!!!!
	let messegetopic;
	if (connectionType==="MQTT"){messegetopic=topic.replace("/status","");}
	else{messegetopic=json.topic.replace("/status","");} 
	 // ========================================================================

	if (element.topic == messegetopic) {element.nodeInfo=json.info;}
					});
				 }
				 if (json.color){
// ищем виджет к которому относится цвет INFO
	wigets.forEach(function (element){
	//отличие MQTT и WS========================================================!!!!!!!!!!!!!!
	let messegetopic;
	if (connectionType==="MQTT"){messegetopic=topic.replace("/status","");}
	else{messegetopic=json.topic.replace("/status","");} 
	 // ========================================================================

	if (element.topic == messegetopic) {element.nodeInfoColor=json.color;}
					});
				 }


			
				
						
	


	});
} catch (e) {
				console.log('ERROR parse JSON', tmp);
			}
	
	
	tmp=null;
	temp=null;
	json=null;
	data=null;
	NewWiget=null;
	NewPage=null;
	NewPrefics=null;
	date=null;
	hours=null;
	minutes=null;
	
	
	};

	// функция получаем префикс
	
		function getprefics(topic){
			if (topic[0] =="/"){
				topic=topic.slice(0, topic.indexOf("/",2))
				return topic;
			}else {
				topic=topic.slice(0, topic.indexOf("/",0))
				return topic;
			}
		}
	// функция если произошла смена префикса в интерфейсе
	function handleSubmit() {
			console.log("The selected option is " + JSON.stringify(selected.prefics));
			selectedprefics = selected.prefics;
		}
	



	
	// шлем данные в websocket
		function WSpush(ws, uri, val){
	//    console.log(ws, uri, val);
			if(connectionType == "MQTT")
			{
			
				client.publish(uri+"/control", val.toString());
			}
			else
			{
				
				socket[ws].send('{"path":"'+uri+'/control", "status":"'+ val.toString()+'"}');
			}
		  }
	
	
		  if(connectionType != "MQTT")
			{
			//	addConnection(devices);
			}

	// обратный отсчет для 		Shutter
			let frame;	
			let elapsed = 0;
			let duration = 5000;
			let last_time = window.performance.now();
			(function update() {
			frame = requestAnimationFrame(update);
			const time = window.performance.now();
			elapsed += Math.min(
			time - last_time,
			duration - elapsed
			);
				last_time = time;
				if (elapsed==duration){
					Shutterhiddn();
				}
			}());

		let	Shuttervisibl= "visibility: hidden;";
			 
		function Shuttervisibil(){
				Shuttervisibl= "visibility: visible;";
			//	duration = sec;
				elapsed = 0;
				if (elapsed===duration){
					Shuttervisibl= "visibility: hidden;";
				}

				};
				function Shutterhiddn(){
				Shuttervisibl= "visibility: hidden;";
				};
				Shuttervisibil();

				
</script>


	
<!---->


{#if connectionType == 'MQTT'}
{#if MQTTconnections[1]}
<form on:submit|preventDefault={MQTTChange}>
  <select bind:value={selected}  on:change="{MQTTChange}">
	  {#each MQTTconnections as MQTTconnection}
		  <option value={MQTTconnection}>
			  {MQTTconnection.connection_name}
		  </option>
	  {/each}
  </select>
 
</form>
{/if}
{:else}
	<div class="Shutter" style="{Shuttervisibl} position: absolute; z-index: 1; right: 4%; top: 0%" id="layer1">
		<span>
			<progress value="{elapsed / duration}"></progress>
			<br><br>
		  <!--Перечисляем девайсы в сети-->
		  {#each devices as NetworkDevice , i}
		  {#if !NetworkDevice.status}
			  <p align="left" style=" margin-top: -5px; margin-bottom: -5px">
			   {NetworkDevice.deviceIP} {NetworkDevice.deviceName} waiting
			  </p>
		  {/if}  	
			 {#if NetworkDevice.status == 'true'}
			  <p align="left" style="color: green; margin-top: -5px; margin-bottom: -5px">
			   {NetworkDevice.deviceIP} {NetworkDevice.deviceName} connected
			  </p>
		  {/if}  		  
		  {#if NetworkDevice.status === 'false'}
			  <p align="left" style="color: red; margin-top: -5px; margin-bottom: -5px" on:click={addConnection(devices)}>
			   {NetworkDevice.deviceIP} {NetworkDevice.deviceName} disconnected
			   </p>
		  {/if}  		  
	  	  {/each}  
			
		</span>
	</div>
	{/if}		

	{#if connectionType == 'MQTT'}
		{#if connected==false}
				<div style=" position: absolute;  z-index: 2; right: 2%; top: 1%; color:red" on:click={toggleTheme} id="layerMQTT" >MQTT</div>
				{#if MQTTconnections[0].mqtt_port==""}
				<div  align="center">Для подключения MQTT обязателььно должен быть указан порт "MQTT wss port (TLS)"</div>
				{/if}
			{/if}	
			{#if connected==true}
			<div style=" position: absolute;  z-index: 2; right: 2%; top: 1%; color:green"  on:click={toggleTheme} id="layerMQTT" >MQTT</div>
			{/if}	
			
	{:else}
	<div on:mouseenter={Shuttervisibil} on:click={Shutterhiddn} class="connTupe" style=" position: absolute;  z-index: 2; right: 2%; top: 1%" id="layerWS">websocket</div>
	{/if}		
				
		<!-- селектор префиксов  -->
		{#if prefics[2]}
		<form  on:submit|preventDefault={handleSubmit}>
			<select style="float: left"  bind:value={selected}  on:change="{handleSubmit}">
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
	<p  align="center"><Logo/></p>
	{/if}	

	  <Tabs> 
		<table border="0" style="margin-left: 0%" width="99%">
			<tr><td>
			
		<TabList >
{#each pages as pagesName, i}
		  <Tab>{pagesName.page}</Tab>
{/each} 
		
	</TabList>
	
			</td></tr>
		</table>
	
		{#each pages as pagesName, i}
		
	  
		<TabPanel>
		
		<table border="0"  style="margin-left: 0%" width="99%">
				
		{#each wigets as widget, i}
		<!--Отображаем виджеты только для выбранного префикса-->
		
		{#if !selectedprefics || selectedprefics === widget.prefics}

		{#if widget.page === pagesName.page}
		<tr>
<!-- Toggle -->
		{#if widget.widget === 'toggle'}
		 <td>
		<span style="float: left">
		{widget.descr}</span>
		</td>
		<td></td>
		 <td> 
		{#if widget.status == '1'}	
		<span style="float: right" >
		<Toggle style="float: right" on:toggle={WSpush(widget.socket, widget.topic, 0)}
		label=""			
		 toggledColor = "#6495ED"
		 untoggledColor="#FF6347"
		 switchColor="#eee"
		/>
		</span>
		{:else}
		<span style="float: right">
			<Toggle on:toggle={WSpush(widget.socket, widget.topic, 1)}
			label=""			
			toggledColor='#FF6347'
			untoggledColor="gray"
			switchColor="#eee"
			toggled=
			/>
		 </span>
		{/if}


		{/if}
<!-- anydata -->				  
{#if widget.widget === 'anydata'}
<td>
{#if widget.descrColor}
<span style="float: left" >
<lable align="left" style="color: {widget.descrColor}; font-family: '{widget.descrfont}'">{widget.descr}</lable> 
</span>
{:else}
<span style="float: left; font-family: '{widget.descrfont}'" >
{widget.descr}
<!--Инфо от ноды mysens отображается под названием виджета -->	
<div class=letter align="left" style='color: {!widget.nodeInfoColor ? 'gray' : widget.nodeInfoColor}'>{!widget.nodeInfo ? '' : widget.nodeInfo}</div>

</span>
{/if}
</td>
<td>

<!--Инфо от ноды mysens отображается по середине
<lable align='left' style='color: {!widget.nodeInfoColor ? 'gray' : widget.nodeInfoColor}'>

</lable>-->	


</td>
<td align="right"> 
<!--Делаем anidata разноцветными если есть кастомизация цвета-->
{#if Array.isArray(widget.color) &&  widget.status}
 {#each widget.color as anydataColor, i}
 {#if anydataColor.level && widget.status < anydataColor.level && widget.status > widget.color[i-1].level && i>0}
 <lable align="left" style="color: {anydataColor.value}; font-family: '{widget.font}' ">{!widget.status ? '' : widget.status}{!widget.after ? '' : widget.after}</lable> 
{/if}
{/each}
<!--если цвет задан значением а не массивом-->
{:else if  widget.color &&  widget.status} 
<lable align="left" style="color: {widget.color}; font-family: '{widget.font}'">{widget.status}{widget.after}</lable> 
<!--если цвет не задан и статус пустой-->
{:else if   !widget.status}
<lable align="left">...</lable> 
<!--если цвет не задан-->
{:else if  widget.status}
<lable align="left" style="font-family: '{widget.font}'" >{widget.status}{!widget.after ? '' : widget.after}</lable> 

{:else}
	<lable align="left" style="font-family: '{widget.font}'">
	 {!widget.status ? '' : widget.status}{!widget.after ? '' : widget.after}
	</lable>
{/if}
 

</td>
{/if}
<!-- input -->	
{#if widget.widget === 'input'}
<td><span  style="float: left">
{widget.descr}</span></td>
<td></td>
{#if widget.type === 'number'}
<td align='right'> 
<div  style="float: right; display:inline-block">
<input type="button" value="-  " style=" border: 1px solid lightblue; width: 15% " on:click={WSpush(widget.socket, widget.topic, widget.status-1)}>
<input class:red={widget["send"]==true}  style="width: 30% "   type=tel neme={widget.topic} bind:value={widget.status} size="20"  on:change={widget["send"]=true, WSpush(widget.socket, widget.topic, widget.status)} min=-1000 max=1000000>
<input type="button"  value="+  " style=" border: 1px solid lightblue; width: 15%" on:click={WSpush(widget.socket, widget.topic, widget.status-1+2)}>

</div>
</td>
{:else if  widget.type === 'time'}

<td align='right'>
   <div  style="float: right; display:inline-block" ><input class:red={widget["send"]==true}   type="time" bind:value={widget.status}  size="20" on:change={widget["send"]=true, WSpush(widget.socket, widget.topic, widget.status)}  min="00:00" max="23:59" required ></div>
</td>

{:else}

 <td align='right'><div  style="display:inline-block"> <input class:red={widget["send"]==true}  bind:value={widget.status}  size="20"   on:change={widget["send"]=true, WSpush(widget.socket, widget.topic, widget.status)}  ></div></td>

 {/if}
{/if}
<!-- btn -->
{#if widget.widget == 'btn'}

<td><span style="float: left">{widget.descr}</span></td>
<td></td>
<td align="right">
{#if widget.status !=0 && widget.status !=1 }
	

		<button class="btn" on:click={widget["send"]=true,  WSpush(widget.socket, widget.topic, 1)}><span>&nbsp;&nbsp;{!widget.status? '' : widget.status }&nbsp;&nbsp;</span></button><br> 


{:else}

<button class="btn" on:click={widget["send"]=true, WSpush(widget.socket, widget.topic, 1)}><span>&nbsp;&nbsp; {!widget.text? '' : widget.text }&nbsp;&nbsp;</span></button><br> 

{/if}

</td>
{/if} 
<!-- select -->
{#if widget.widget === 'select'}
<td><span style="float: left">{widget.descr}</span></td>
<td></td>
<td align="right">
	{#if widget.status == 0 }
		<button class="btnoff" on:click={widget["send"]=true, this.style.border='1px solid red', WSpush(widget.socket, widget.topic, 1)}><span>{!widget.options[0]? 'OFF' : widget.options[0]}</span></button><br> 
{:else}

        <button class="btn"  on:click={widget["send"]=true,  this.style.border='1px solid red', WSpush(widget.socket, widget.topic, 0)}><span>{!widget.options[1]? 'ON' : widget.options[1]}</span></button><br> 
{/if}

</td>

{/if} 
<!-- chart -->		
			{#if widget.widget === 'chart'}
			<td  colspan="3">
				
				{#if widget.status} 
				{#if widget.topic.includes('_2')} 
<Chart data={widget.status} lineOptions={lineOptions} axisOptions={axisOptions} colors={[!widget.color ? 'red' : widget.color]} type= {!widget.type ? 'line' : widget.type} height="300" />
				

				{:else if !widget.topic.includes('_1')} 
				{widget.descr}
<Chart data={widget.status} lineOptions={lineOptions} axisOptions={axisOptions} colors={[!widget.color ? 'light-blue' : widget.color]} type= {!widget.type ? 'line' : widget.type} height="300" />
				{/if}
				{/if}
			</td>
			{/if} 
<!-- range -->
			{#if widget.widget === 'range'}
			<td  colspan="3">
				
			<div>	{widget.descr}  {widget.status / 10} {widget.after} </div>
			
				<label>	
										
					<input type=range bind:value={widget.status} min={widget.min} max={widget.max * 10}  on:change={WSpush(widget.socket, widget.topic, widget.status)}>
				</label>
			
				
			</td>
			{/if} 
			
	 </tr>
		{/if}  
		{/if}  
	  
	 
	  {/each}
	
	</table>
	  </TabPanel>
	  {/each}
	  </Tabs>

		
			<br><br>	
			<div  class="letter"  align="center">developed by: avaks@meef.ru</div>


<style>
	:global(.svelte-tabs__tab-list) {
        display: flex;
        justify-content: space-evenly;
        flex-wrap: wrap;
		
	}
	:global(.svelte-tabs li.svelte-tabs__tab){
		color: gray;
		
	}
    :global(.svelte-tabs li.svelte-tabs__selected) {
		  color: green;
		  
    }
	.red{color: crimson;}	
	.green{color: rgb(20, 220, 37);}	

	.letter { 
     color: grey; 
     font-size: 60%; 
		 padding-left: 15px; 
		 opacity: 0.8;
		
		
     }
	 progress{
	   height: 4px;
   }
   

	input {
		
		text-align: right; 
		border: 1px solid #6699FF; 
		width: 100%
	}

	label {
		display: flex;
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
		padding:10px;
  border-radius:10px;
	padding-left: 20px 	
	}
	:global(body.dark-mode) lable {
		background-color: #1d3040;
    	color: #bfc2c7;		
	}
	select {
	
		padding:10px;
  border-radius:10px;
	padding-left: 20px 	
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
        border: 1px solid #63B8FF;
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
     box-shadow: 7px 7px 5px rgba(0,0,0,0.5);
        display: block;	
        box-sizing: border-box;
        padding: 0 8px;    
        height: 32px;
        line-height: 33px;    
        border: 1px solid #63B8FF;
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
     box-shadow: 7px 7px 5px rgba(0,0,0,0.5);
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



	</style>
