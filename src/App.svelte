	<script>
	//avaks
	import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';
	import Toggle from "svelte-toggle";
	import Chart from 'svelte-frappe-charts';
	
		//роутер для навигации=========================================
		import { Route, router, active } from "tinro";
		router.mode.hash(); // enables hash navigation method
		//router.mode.memory(); // enables in-memory navigation method
	
		//всплывающие уведомления======================================
		import { SvelteToast, toast } from "@zerodevx/svelte-toast";
	
		const app = new SvelteToast({
			target: document.body,
			props: {
				options: {},
			},
		});
	
		//обработка событий при загрузки===============================
		import { onMount } from "svelte";
	
		//секция переменных============================================
		let myip = document.location.hostname;
		let configSetupJson = "{}";
	
		const setMain = "Устройство";
		const setWifi = "WiFi";
		const setMqtt = "MQTT";
	
		const wifissid = "Название сети:";
		const wifipasswd = "Пароль:";
		const mqttserver = "Имя сервера:";
		const mqttport = "Номер порта:";
		const mqttprefix = "Префикс:";
		const mqttuser = "Имя пользователя:";
		const mqttpasswd = "Пароль:";
	//AVAKS
		let espName = "IotManager";
		let chipID = "0000000-0000000";
		let colors;
		let	lineOptions;
	//AVAKS
	
		let routerssid;
		let routerpass;
		let mqttServer;
		let mqttPort;
		let mqttPrefix;
		let mqttUser;
		let mqttPass;
	
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
			routerssid = parseСonfigSetupJson("routerssid");
			routerpass = parseСonfigSetupJson("routerpass");
			mqttServer = parseСonfigSetupJson("mqttServer");
			mqttPort = parseСonfigSetupJson("mqttPort");
			mqttPrefix = parseСonfigSetupJson("mqttPrefix");
			mqttUser = parseСonfigSetupJson("mqttUser");
			mqttPass = parseСonfigSetupJson("mqttPass");
	//AVAKS=======================================================
			espName = parseСonfigSetupJson("name");
			chipID = parseСonfigSetupJson("chipID");
	//AVAKS=======================================================
		}
	
		function pushGreen() {
			toast.push("Saved!", {
				theme: {
					"--toastBackground": "#48BB78",
					"--toastProgressBackground": "#2F855A",
				},
			});
		}
	
		function pushRed() {
			toast.push("Error!", {
				theme: {
					"--toastBackground": "#F56565",
					"--toastProgressBackground": "#C53030",
				},
			});
		}
	
		function upgrade() {
			toast.push("Upgrade in progress...", {
				duration: 20000,
				theme: {
					"--toastBackground": "#48BB78",
					"--toastProgressBackground": "#2F855A",
				},
			});
		}
	
		async function doGetRequest() {
			let res = await fetch("http://" + myip + "/set?test=" + st, {
				mode: "no-cors",
				method: "GET",
			});
			if (res.ok) {
				let text = await res.text();
				alert("received msg: " + text);
			} else {
				alert("status " + res.status);
			}
		}
	
	
	
		//AVAKS =======================================================
	
	
	
	// декларируем массив для  списка всех ESP в сети 
	let devices = [];
	// декларируем массив для списка всех websocket  
	let socket =[];
	// декларируем массив для списка всех виджетов  
	let wigets =[];
	// декларируем массив для списка всех страниц   
	let pages =[];
	// декларируем массив для списка всех префиксов  
	let prefics =[];
	// выбраный префикс
	let selected;	
	// массивы для построения графиков
	let graf_time=[];
	let graf_val=[];
	let dataLine=[];
	
	
	// = на время разработки = суда собираем все сообщения полученные через WS
	let WsData="";
	

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
			addConnection(devices);
			
		}
		
	
	
	
	// ==на время разработки==
	
		devices = '[{"deviceID":"0000000-0000000","deviceIP":"192.168.1.133","deviceName":"PZM"},{"deviceID":"0000000-0000000","deviceIP":"192.168.1.100","deviceName":"ESP_32"},{"deviceID":"0000000-0000000","deviceIP":"192.168.1.101","deviceName":"test1"},{"deviceID":"0000000-0000000","deviceIP":"192.168.1.102","deviceName":"test2"}]';  
		devices= JSON.parse(devices);

			
	
	function addConnection (devices)  {
	if(devices){ 
			devices.forEach(function(item, i, arr) {
				console.log("trying connect", item);
	// Create WebSocket connection.
			socket[i] = new WebSocket('ws://'+item.deviceIP+'/ws');
	// Connection opened
			socket[i].addEventListener('open', function (event) {
	// Шлем "HELLO"
	devices[i].id=i;
	devices[i].status="connected";
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
				addMessage(time, item.deviceIP, item.deviceID, item.deviceName, i, event.data);
			});
	// Обработка ошибок websocket 
			socket[i].addEventListener('close', (event) => {
				  console.log('ws close '+item.deviceIP);
				  devices[i].status="close"; 
				
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
	// обрабатываем пришедшее сообщение
	const addMessage = (time, deviceIP, deviceID, deviceName, socket, data) => {	
	
	
		let json;
		let tmp;
		tmp = "["+data+"]";
		
	
		try{
				tmp = JSON.parse(tmp);
			} catch (e) {
				console.log('полученные данные содержат ошибки', tmp);
			}
	
	
	
	tmp.forEach(function(json, i, array) {
			
//...	console.log('получено ',deviceIP,json);
			
		
	// собираем виджеты	
	// если пришедшее сообщение виджет 	
	if (json.widget){
	// ищем его в массиве виджетов
		let NewWiget="";
		wigets.forEach(function(item, i, array) {
		 if (json.topic==item.topic){
			NewWiget=json.topic;
		//	console.log("Нашли совпадение виджета");
		}		
			 });
	
	// ищем новые страницы
	let NewPage="";
		pages.forEach(function(item, i, array) {
		if (json.page==item.page){
			NewPage=json.page;
		//	console.log("Нашли совпадение страницы");
		}	
	
			 });
	
	// ищем новые префиксы		
	let NewPrefics="";
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
		//	  console.log("prefics",prefics);
	}	
	}  // закончили сбор виджетов
	
	// если новое сообщение статус 
	if (json.status){
	// ищем виджет к которому относится этот статус
	wigets.forEach(function (element){
	
		if (element.topic == json.topic.replace("/status","")) {
	// если получен статус график 
		if (element.widget=="chart"){
			graf_time=[];
			graf_val =[];
		try {
			let temp=json.status;
			temp.forEach(function(item, i, arr) {
				// получаем время 
				let date = new Date(item.x * 1000);
				let hours = date.getHours();
				let minutes = date.getMinutes();
				graf_time = [... graf_time,  hours+':'+minutes, ];
				graf_val = [... graf_val, item.y1, ];
			});

			
				
			if (element.pointRadius=="0"){
			lineOptions = {hideDots:1,regionFill:1};
			} else{
				lineOptions = {regionFill:1};
			}

				dataLine = {
  				labels: graf_time,
  				datasets: [
//        {
//           name: "Some Data", type: "bar",
//            values: [25, 40, 30, 35, 8, 52, 17, -4]
//        },
        {
            name: element.descr,
			
		heatline: 1,
        height: 115,
        region_fill: 1, 
        xAxisMode: "tick",
        yAxisMode: "span",
        xIsSeries: 1,
		truncateLegends: true,
            values: graf_val
        }
    ],
		
}
			
	if (!element.status){
				// архив графика отсутсутствует, то создаем статус и заполняем
					element.status=dataLine;
				
					WsData=WsData + "\r\n"+ JSON.stringify(dataLine);
						 }
				else {
					//console.log(" дописываем новые значения к имеющимся");
					element.status.labels = [...element.status.labels, dataLine.labels[0]];
					element.status.datasets[0].values = [...element.status.datasets[0].values, dataLine.datasets[0].values[0] ]
					WsData=WsData + "\r\n"+ JSON.stringify(element.status);
					}
			} catch (e) {
				console.log('полученные данные для графика содержат ошибки', element.status);
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
	    //Console.log(JSON.stringify(wigets));
		//console.log(pages);
	
	
	
		
	});
	
	
	}
	});
	
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
	
	
	};
	// функция если произошла смена префикса в интерфейсе
	function handleSubmit() {
			console.log("The selected option is " + JSON.stringify(selected.prefics));
			selectedprefics = selected.prefics;
		}
	



	
	// шлем данные в websocket
		function WSpush(ws, uri, val){
	   // console.log(ws, uri, val);
	   	
 		socket[ws].send('{"path":"'+uri+'/control", "status":"'+ val.toString()+'"}');
		console.log('Отправлено   {"path":"'+uri+'/control", "status":"'+ val.toString()+'"}');
		  }
	
	
	
		  addConnection(devices);
		// это временный пример как надо прописывать в файл 
		let NetworkMap='[{"deviceID":"0000000-0000000","deviceIP":"192.168.1.4","deviceName":"test_1"},{"deviceID":"0000000-0000000","deviceIP":"192.168.1.6","deviceName":"test_2"}]';
		let selectedprefics;
		//AVAKS end
	</script>
	
<div class="hamburger-menu">
	<input id="menu__toggle" type="checkbox" />
	<label class="menu__btn" for="menu__toggle">
		<span />
	</label>
	<ul class="menu__box">
		<li>
			<a class="menu__item" href="/" on:click={getСonfigSetupJson}
				>{setMain}</a
			>
		</li>
		<li>
			<a class="menu__item" href="/wifi" on:click={getСonfigSetupJson}
				>{setWifi}</a
			>
		</li>

		<li>
			<a class="menu__item" href="/mqtt" on:click={getСonfigSetupJson}
				>{setMqtt}</a
			>
		</li>
	</ul>

	<ul class="menu__main">
		<Route path="/">
			<div class="head">
				<h2>{setMain}</h2>


				<!-- AVAKS -->
				
				
		<!-- селектор префиксов  -->
		{#if prefics[1]}
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
	
	  <!-- 					 закончили селектор префиксов -->

	  
				<Tabs> 
					<table border="0" style="margin-left: 2%" width="90%">
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
					
					<table border="0" style="margin-left: 2%" width="90%">
							
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
  					switchColor="#eee"
  					toggledColor="blue"
  					untoggledColor="gray"
					/>
					</span>
					{:else}
					<span style="float: right">
						<Toggle on:toggle={WSpush(widget.socket, widget.topic, 1)}
						label=""			
						  switchColor="#eee"
						  toggledColor="blue"
						  untoggledColor="gray"
						toggled=
						/>
		 			</span>
					{/if}

		
					{/if}
<!-- anydata -->				  
		{#if widget.widget === 'anydata'}
		<td><span style="float: left">
		 {widget.descr}</span></td>
		<td></td>
		<td align="right"> 
		 <!--Делаем anidata разноцветными если есть кастомизация цвета-->
		{#if Array.isArray(widget.color) &&  widget.status}
			 {#each widget.color as anydataColor, i}
					{#if widget.status < anydataColor.level && widget.status > widget.color[i-1].level && i>0}
			 		<lable align="left" style="color: {anydataColor.value} "><b>{!widget.status ? '' : widget.status}{!widget.after ? '' : widget.after}</b></lable> 
					{/if}
			{/each}
			<!--если цвет задан значением а не массивом-->
		{:else if  widget.color &&  widget.status} 
			<lable align="left" style="color: {widget.color} "><b>{widget.status}{widget.after}</b></lable> 
			<!--если цвет не задан и статус пустой-->
		{:else if   !widget.status}
			<lable align="left">...</lable> 
			<!--если цвет не задан-->
		{:else if  widget.status}
			<lable align="left"><b>{widget.status}{!widget.after ? '' : widget.after}</b></lable> 
	
		{:else}
				<lable align="left" style="color: black"><b>
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
                            {widget.descr}
		<Chart data={widget.status}   lineOptions={lineOptions} colors={[!widget.color ? 'light-blue' : widget.color]} type= {!widget.type ? 'line' : widget.type} height="200" />
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

				  <br><br><br><br><br><br><br><br>
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

				
				  <br><br><br><br><br><br><br><br>
				  <p align="left" style="margin-top: -5px; margin-bottom: -5px">V 0.0.4
				</p>
				<blockquote>
				<p align="left" style="margin-top: -5px; margin-bottom: -5px">- Тестим ESP32 и mysensors
				</p>
				<p align="left" style="margin-top: -5px; margin-bottom: -5px">- Графики работают в версии для ESP32  
				</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- Температура меняет цвет холдно\тепло\жарко 
					</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- Сделал сортировку виджетов по полю "Позиция виджета" но работает пока не правильно
					</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- Переработаны поля для ввода "Времени" и "Чисел"
					</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- Добавлена поддержка нескольких префиксов!!!!!! для работы с большим количеством устройств в сети.
					</p>
				</blockquote>
				  <p align="left" style="margin-top: -5px; margin-bottom: -5px">V 0.0.3
				</p>
				<blockquote><p align="left" style="margin-top: -5px; margin-bottom: -5px">- графики отключил 
				</p><p></p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- добавлена возможность управлять несколькими ESP в сети 
					</p><p></p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">нужно зайти по адресу http://IP_адрес_вашей_ESP/edit и создать файл NetworkMap.json со следующим содержимым:
					</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px"> {NetworkMap} Устройств может быть сколько угодно.
					</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px"> поменяв deviceIP и deviceName  на свои. На всех ESP должна стоять тестовая прошивка. 
					</p>
				</blockquote>

				  <p align="left" style="margin-top: -5px; margin-bottom: -5px">V 0.0.2
				</p>
				<blockquote>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- добавлен ползунок (range)
					</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- добалены графики
					</p>
				</blockquote>

				<p align="left" style="margin-top: -5px; margin-bottom: -5px">V 0.0.1
				</p>
				<blockquote>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- работают кнопки
					</p>
					<p align="left" style="margin-top: -5px; margin-bottom: -5px">- время работы устройства
					</p>
				</blockquote>

			<!--		  <br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>
				    <textarea rows="15" name="S1" cols="200" >

					{WsData}</textarea>
				
				
			<br>
				<pre>
				{parseСonfigSetupJson("name")}
				</pre>
			-->
			</div>
		
		</Route>

		<Route path="/wifi">
			<div class="head">
				<h2>{setWifi}</h2>
			</div>

			<div class="content">
				<div class="box">
					<slot>
						<form>
							<div class="row">
								<div class="left-column">
									<label for="ssid">{wifissid}</label>
								</div>
								<div class="right-column">
									<input type="text" value={routerssid} />
								</div>
							</div>

							<div class="row">
								<div class="left-column">
									<label for="passwd">{wifipasswd}</label>
								</div>
								<div class="right-column">
									<input type="password" value={routerpass} />
								</div>
							</div>

							<div class="row">
								<div class="center-column">
									<button
										type="button"
										on:click={doGetRequest}
										>Сохранить
									</button>
								</div>
							</div>
						</form>
					</slot>
				</div>
			</div>
		</Route>

		<Route path="/mqtt">
			<div class="head">
				<h2>{setMqtt}</h2>
			</div>

			<div class="content">
				<div class="box">
					<slot>
						<form>
							<div class="row">
								<div class="left-column">
									<label for="ssid">{mqttserver}</label>
								</div>
								<div class="right-column">
									<input type="text" value={mqttServer} />
								</div>
							</div>

							<div class="row">
								<div class="left-column">
									<label for="passwd">{mqttport}</label>
								</div>
								<div class="right-column">
									<input type="text" value={mqttPort} />
								</div>
							</div>

							<div class="row">
								<div class="left-column">
									<label for="passwd">{mqttprefix}</label>
								</div>
								<div class="right-column">
									<input type="text" value={mqttPrefix} />
								</div>
							</div>

							<div class="row">
								<div class="left-column">
									<label for="passwd">{mqttuser}</label>
								</div>
								<div class="right-column">
									<input type="text" value={mqttUser} />
								</div>
							</div>

							<div class="row">
								<div class="left-column">
									<label for="passwd">{mqttpasswd}</label>
								</div>
								<div class="right-column">
									<input type="password" value={mqttPass} />
								</div>
							</div>

							<div class="row">
								<div class="center-column">
									<button
										type="button"
										on:click={doGetRequest}
										>Сохранить
									</button>
								</div>
							</div>
						</form>
					</slot>
				</div>
			</div>
		</Route>
	</ul>
</div>

<style>

	#menu__toggle {
		opacity: 0;
	}

	#menu__toggle:checked ~ .menu__btn > span {
		transform: rotate(45deg);
	}
	#menu__toggle:checked ~ .menu__btn > span::before {
		top: 0;
		transform: rotate(0);
	}
	#menu__toggle:checked ~ .menu__btn > span::after {
		top: 0;
		transform: rotate(90deg);
	}
	#menu__toggle:checked ~ .menu__box {
		visibility: visible;
		left: 0;
	}
	#menu__toggle:checked ~ .menu__main {
		margin-left: 150px; /* размер выхода бокового меню */
	}

	.menu__btn {
		display: flex;
		align-items: center;
		position: fixed;
		top: 20px;
		left: 20px;
		width: 26px;
		height: 26px;
		cursor: pointer;
		z-index: 1;
	}

	.menu__btn > span,
	.menu__btn > span::before,
	.menu__btn > span::after {
		display: block;
		position: absolute;
		width: 100%;
		height: 2px;
		background-color: #616161;
		transition-duration: 0.25s;
	}
	.menu__btn > span::before {
		content: "";
		top: -8px;
	}
	.menu__btn > span::after {
		content: "";
		top: 8px;
	}

	.menu__box {
		display: block;
		position: fixed;
		visibility: hidden;
		top: 0;
		left: -100%;
		width: 150px; /* размер выхода бокового меню */
		height: 100%;
		margin: 0;
		padding: 80px 0;
		list-style: none;
		background-color: #eceff1;
		box-shadow: 1px 0px 6px rgba(0, 0, 0, 0.2);
		transition-duration: 0.25s;
	}

	.menu__item {
		display: block;
		padding: 12px 24px;
		color: #333;
		font-family: "Roboto", sans-serif;
		font-size: 15px; /* размер шрифта бокового меню */
		font-weight: 600;
		text-decoration: none;
		transition-duration: 0.25s;
	}
	.menu__item:hover {
		background-color: #cfd8dc;
	}

	.head {
		text-align: center;
		color: #000000;
		display: block;
	}

	.content {
		color: #000000;
		display: block;
	}

	.box {
		margin: 10px auto 10px;
		width: 50%;
		height: 100%;
		border: 1px solid #aaa;
		border-radius: 2px;
		box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.1);
		padding: 1em;
	}

	.row {
		margin-top: 2%;
		margin-bottom: 2%;
		margin-right: 2%;
		margin-left: 2%;
	}

	.left-column {
		display: inline-block;
		width: 50%;
	}

	.right-column {
		display: inline-block;
		width: auto;
	}

	.center-column {
		display: block;
		text-align: center;
	}

	input {
		width: 100%;
	}

	label {
		display: flex;
	}
</style>
