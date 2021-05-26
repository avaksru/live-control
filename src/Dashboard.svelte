	<script>
	//avaks
	import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';
	import Toggle from "svelte-toggle";
	import Chart from 'svelte-frappe-charts';
	import mqtt from 'mqtt/dist/mqtt.min';
	let connectionType = 'WS';
	let client;
	let topic;
// MQTT====================================================================
	
if (connectionType === 'MQTT'){
    let clientId = 'IotManager_';
    let connected = false;
    let topic;
    let temp;
    var MQTTconnections;
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
  // MQTT =============================================================================================

		//обработка событий при загрузки===============================
		import { onMount } from "svelte";
	
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
		
	
	
	
		//функции=======================================================
		onMount(async () => {
			getСonfigSetupJson();
		});
	
		async function getСonfigSetupJson() {
			let res = await fetch("http://" + myip + "/config.setup.json", {
				mode: "no-cors",
				method: "GET",
			});
			if (res.ok) {
				configSetupJson = await res.json();
			} else {
				//alert("status " + res.status);
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
	
	
	// = на время разработки = суда собираем все сообщения полученные через WS
	let WsData="";
	
	// темная тема 
	let darkMode = false;
	function toggle() {
        darkMode = !darkMode;
        window.document.body.classList.toggle('dark');
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
		
	
		
	
	// ==на время разработки==
	
	//	devices = '[{"deviceID":"0000000-0000000","deviceIP":"192.168.36.137","deviceName":"test"},{"deviceID":"0000000-0000000","deviceIP":"192.168.36.145","deviceName":"test2"}]';  
	//	devices= JSON.parse(devices);
	
	
	
	function addConnection (devices)  {
	if(devices){ 
			devices.forEach(function(item, i, arr) {
				console.log("trying connect", item);
	// Create WebSocket connection.
			socket[i] = new WebSocket('ws://'+item.deviceIP+'/ws');
	// Connection opened
			socket[i].addEventListener('open', function (event) {
	
	devices[i].id=i;
	devices[i].status="connected";
//	console.log(devices);
		
	devices = [
				...devices
						];
	
				console.log("WS CONNECTED! "+item.deviceIP);
					
			});
	// Listen for messages
			socket[i].addEventListener('message', function (event) {
			   
		//	console.log('получено '+item.deviceIP, event.data);
		//	WsData=WsData + "\r\n"+ "получено "+item.deviceIP+" "+ event.data;
	
	
	// запускаем обработку пришедшего сообщения
				  let time = new Date().getTime();
				addMessage(event.data, i);
			});
	// Обработка ошибок websocket 
			socket[i].addEventListener('close', (event) => {
				  console.log('ws close '+item.deviceIP);
				  devices[i].status="close"; 
			 	console.log(devices);
				  devices = [
			 ...devices
					 ];
			});
			socket[i].addEventListener('error', function (event) {
				  console.log(item.deviceIP+' WebSocket error: ', event);
				  devices[i].status="close";
				
				  devices = [
			 ...devices
					 ];
			});
		});
	}};
	//console.log(devices);
	
	
	
	//обрабатываем пришедшее сообщение =====================================================================
	
	function addMessage(data, socket) {
		if (connectionType =="MQTT")
		{
		
			topic=socket;
		} 	
		
		let json;
		let tmp;
		tmp = "["+data+"]";
	//	tmp = [data];
	try{
		tmp = JSON.parse(tmp);
	tmp.forEach(function(json, i, array) {
	//...	console.log('получено ',deviceIP,json);
			
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
					}
			
		}
	
		



		wigets = [
			 ...wigets
					 ];
		
					 devices = [
	...devices
					 ];	
	  //  console.log(JSON.stringify(wigets));
	
		
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
				addConnection(devices);
			}
	
	
	</script>
	


<!--visibility: hidden;-->
	<div class="Shutter" style="visibility: hidden; position: absolute; width: 70%; z-index: 1; right: 2%; top: 2%" id="layer1">
		<span>
		  <!--Перечисляем девайсы в сети-->
		  {#each devices as NetworkDevice , i}
		  {#if !NetworkDevice.status}
			  <p align="left" style=" margin-top: -5px; margin-bottom: -5px">
			   {NetworkDevice.deviceIP} {NetworkDevice.deviceName} соединяюсь
			  </p>
		  {/if}  	
			 {#if NetworkDevice.status === 'connected'}
			  <p align="left" style="color: green; margin-top: -5px; margin-bottom: -5px">
			   {NetworkDevice.deviceIP} {NetworkDevice.deviceName} подключено
			  </p>
		  {/if}  		  
		  {#if NetworkDevice.status === 'close'}
			  <p align="left" style="color: red; margin-top: -5px; margin-bottom: -5px" on:click={addConnection(devices)}>
			   {NetworkDevice.deviceIP} {NetworkDevice.deviceName} отключено
			   </p>
		  {/if}  		  
	  	  {/each}  
		</span>
	</div>
	<div class="connTupe" style=" position: absolute; width: 10%; z-index: 2; right: 2%; top: 2%" id="layer2"></div>
			
				
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
	
	
	
	  <!-- темная тема  
	
	  <button on:click={toggle}>
		{#if darkMode }
			Go light
		{:else}
			Go dark
		{/if}
	</button>-->
	

	  
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
					 toggledColor='blue'
					 untoggledColor="gray"
					 switchColor="#eee"
					/>
					</span>
					{:else}
					<span style="float: right">
						<Toggle on:toggle={WSpush(widget.socket, widget.topic, 1)}
						label=""			
						toggledColor='blue'
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
		</span>
		{/if}
		</td>
		<td></td>
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
			<lable align="left" style="color: black; font-family: '{widget.font}'" >{widget.status}{!widget.after ? '' : widget.after}</lable> 
	
		{:else}
				<lable align="left" style="color: black; font-family: '{widget.font}'"><b>
				 {!widget.status ? '' : widget.status}{!widget.after ? '' : widget.after}
				</b></lable>
		{/if}
			 
	 
	 </td>
	  {/if}
<!-- input -->	
	  {#if widget.widget === 'input'}
	  <td><span  style="float: left">
		 {widget.descr}</span></td>
	  <td></td>
		 {#if widget.type === 'number'}
		 <td > 
			<div  style="float: right; display:inline-block">
			<input type="button" value="-" style="width: 20%" on:click={WSpush(widget.socket, widget.topic, widget.status-1)}>
			<input style="text-align: right; border: 1px solid #6699FF; width: 50%" type=number neme={widget.topic} bind:value={widget.status} size="20"  on:change={WSpush(widget.socket, widget.topic, widget.status)} min=-1000 max=1000000>
			<input type="button" value="+" style="width: 20%" on:click={WSpush(widget.socket, widget.topic, widget.status-1+2)}>
			
		</div>
		</td>
	  	{:else if  widget.type === 'time'}
		 
		 <td align='right'>
			   <div style="float: right; display:inline-block" ><input style="text-align: right; border: 1px solid #6699FF" type="time" bind:value={widget.status}  size="20" on:change={WSpush(widget.socket, widget.topic, widget.status)}  min="00:00" max="23:59" required ></div>
			</td>
		
		 {:else}
		 
			 <td align='right'><div style="display:inline-block"> <input style="text-align: right; border: 1px solid #6699FF " bind:value={widget.status}  size="20"   on:change={WSpush(widget.socket, widget.topic, widget.status)}  ></div></td>
			
			 {/if}
	  {/if}
<!-- btn -->
	  {#if widget.widget === 'btn'}
	  <td>><span style="float: left">
		 {widget.descr}</span></td>>
	  <td></td>
	  <td align="right"> </td>
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
							
							{widget.descr}  {widget.status / 10} {widget.after}
						
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

				
			


<style>
	:root{
		--bg-color: #FFFFFF;
		--text-color: #000000;
	}

	:global(body) {
		background: var(--bg-color);
		color: var(--text-color);
	}
	:global(input) {
		background: var(--bg-color);
		color: var(--text-color);
	}
	:global(input.dark) {
		--bg-color: #000000;
		--text-color: #FFFFFF;
	}

	:global(select) {
		background: var(--bg-color);
		color: var(--text-color);
	}
	:global(select.dark) {
		--bg-color: #000000;
		--text-color: #FFFFFF;
	}
	:global(button) {
		background: var(--bg-color);
		color: var(--text-color);
	}
	:global(button.dark) {
		--bg-color: #000000;
		--text-color: #FFFFFF;
	}
	:global(body.dark) {
		--bg-color: linear-gradient(#002222,#003E3E,#002222);
		--text-color: #FFFFFF;
	}
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
	.Shutter {
    background: linear-gradient(#E6FFFF,#FFFFFF,#E6FFFF);
    color: blak; 
    padding: 10px; 
    border-radius: 5px; 
   }

	input {
		width: 100%;
	}

	label {
		display: flex;
	}
</style>
