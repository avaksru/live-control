<script>
	import Tooltip from './Tooltip.svelte';
	import Box from './Box.svelte';
  
	let edit=false;
	function handleClick() {
	edit = true;
	console.log(Conf);		
		
	}
	function handleClick1() {
	edit = false;
	//console.log(Conf);		
		
	}
	let Conf=[
		{ 
	 "Удалить": 0,
   "Тип элемента": "dht",
   "Id": "tmp817",
   "Виджет": "anydataTemp",
   "Имя вкладки": "Системные",
   "Имя виджета": "Температура",
   "Позиция виджета": 1,
   "FIELD8": "c[1]",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "dht",
   "Id": "hum817",
   "Виджет": "anydataHum",
   "Имя вкладки": "Системные",
   "Имя виджета": "Влажность",
   "Позиция виджета": 2,
   "FIELD8": "c[1]",
   "FIELD9": "pin[4]",
   "FIELD10": "type[dht22]",
   "FIELD11": "int[10]"
 },
 {
   "Удалить": 0,
   "Тип элемента": "uptime",
   "Id": "upt169",
   "Виджет": "anydataTime",
   "Имя вкладки": "Системные",
   "Имя виджета": "%name%#uptime",
   "Позиция виджета": 3,
   "FIELD8": "int[60]",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "logging",
   "Id": "crt843",
   "Виджет": "chart",
   "Имя вкладки": "Графики",
   "Имя виджета": "История",
   "Позиция виджета": 4,
   "FIELD8": "val[tmp817]",
   "FIELD9": "int[60]",
   "FIELD10": "cnt[200]",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "logging",
   "Id": "crt683",
   "Виджет": "chart",
   "Имя вкладки": "Графики",
   "Имя виджета": "История",
   "Позиция виджета": 5,
   "FIELD8": "val[tmp817]",
   "FIELD9": "int[300]",
   "FIELD10": "cnt[200]",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "logging",
   "Id": "crt398",
   "Виджет": "chart",
   "Имя вкладки": "Графики",
   "Имя виджета": "История",
   "Позиция виджета": 6,
   "FIELD8": "val[hum817]",
   "FIELD9": "int[60]",
   "FIELD10": "cnt[300]",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "button-out",
   "Id": "btn51",
   "Виджет": "toggleBtn",
   "Имя вкладки": "Системные",
   "Имя виджета": "Выключить#все",
   "Позиция виджета": 4,
   "FIELD8": "",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "button-out",
   "Id": "btn52",
   "Виджет": "toggleBtn",
   "Имя вкладки": "Системные",
   "Имя виджета": "Гостинная",
   "Позиция виджета": 5,
   "FIELD8": "pin[12]",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "button-out",
   "Id": "btn53",
   "Виджет": "toggleBtn",
   "Имя вкладки": "Системные",
   "Имя виджета": "Спальня",
   "Позиция виджета": 6,
   "FIELD8": "pin[13]",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "button-out",
   "Id": "btn54",
   "Виджет": "toggleBtn",
   "Имя вкладки": "Системные",
   "Имя виджета": "Прихожая",
   "Позиция виджета": 7,
   "FIELD8": "pin[14]",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "pwm-out",
   "Id": "pwm51",
   "Виджет": "range",
   "Имя вкладки": "Системные",
   "Имя виджета": "Яркость",
   "Позиция виджета": 8,
   "FIELD8": "pin[15]",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "pwm-out",
   "Id": "pwm52",
   "Виджет": "range",
   "Имя вкладки": "Системные",
   "Имя виджета": "Яркость",
   "Позиция виджета": 9,
   "FIELD8": "pin[16]",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 },
 {
   "Удалить": 0,
   "Тип элемента": "output-value",
   "Id": "txt5",
   "Виджет": "anydata",
   "Имя вкладки": "Системные",
   "Имя виджета": "Статус",
   "Позиция виджета": 10,
   "FIELD8": "",
   "FIELD9": "",
   "FIELD10": "",
   "FIELD11": ""
 }
]	
</script>
<body>
 {#each Conf as wiget, i}	 
<Box>
	<b on:click={handleClick}>{wiget["Имя виджета"]}</b><span on:click={handleClick1} class="letter1">{wiget["Виджет"]}</span>
	{#if edit == true}

<table border="0" width="100%"  >
	<tr>
		<td>Тип элемента</td>
		<td><input type="text" disabled value='{wiget["Тип элемента"]}'  /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td></Tooltip>

	</tr>
	<tr>
		<td>Id</td>
		<td><input type="text" value='{wiget["Id"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Виджет</td>
		<td><input type="text"  value='{wiget["Виджет"]}' /></td>
	<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Имя вкладки</td>
		<td><input type="text" value='{wiget["Имя вкладки"]}' /></td>
			<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td></Tooltip>
	</tr>
	<tr>
		<td>Имя виджета</td>
		<td><input type="text" value='{wiget["Имя виджета"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Позиция виджета</td>
		<td><input type="text" value='{wiget["Позиция виджета"]}' /></td>
	<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>PIN</td>
		<td><input type="text" value='{wiget["FIELD8"]}' /></td>
			<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Частота опроса</td>
		<td><input type="text" value='{wiget["FIELD9"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Тип датчика</td>
			<td><input type="text" value='{wiget["FIELD10"]}' /></td>
			<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Еще что то</td>
			<td><input type="text" value='{wiget["FIELD11"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать" left color="#92CBF1" ><td>?</td>	</Tooltip>
	</tr>

</table>	
{:else}
<table   border="0" width="100%" >
	<tr>
		<td>&nbsp;</td>
		<td><span class="letter">элемент</span><p>{wiget["Тип элемента"]}</p></td>
		<td><span class="letter">Id</span><p>{wiget["Id"]}</p> </td>
		<td><span class="letter">Имя вкладки</span><p>{wiget["Имя вкладки"]}</p> </td>
		<td><span class="letter">Позиция</span><p>{wiget["Позиция виджета"]}</p> </td>
	</tr>
	<tr>
		<td>&nbsp;</td>
		<td><span class="letter">pin</span><p>{wiget["FIELD8"]}</p></td>
		<td><span class="letter">type</span><p>{wiget["FIELD9"]}</p></td>
		<td><span class="letter">Опрос</span><p>{wiget["FIELD10"]}</p></td>
		<td><span class="letter">Параметр</span><p>{wiget["FIELD11"]}</p></td>
	</tr>
</table>
	{/if}
</Box>
	  {/each}  
<input type="text" placeholder="tmp817" />
</body>
<style>
	.signup-text-input{
	color:#C8C8C8;
	}
	.active {
			visibility: visible
	}
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
  padding:1px;
  border:0;
  box-shadow:0 0 15px 10px rgba(0,0,0,0.06);
	border-radius:5px;
}	
	 .letter { 
     color: grey; 
     font-size: 60%; 
		 padding-left: 0px; 
		 opacity: 0.33;
		
     }
		 .letter1 { 
     color: grey; 
     font-size: 80%; 
		 padding-left: 20px 
		
     }
select {
  width: 70%;
  padding:10px;
  border-radius:10px;
}	
input[type=password] {
 
}
	
</style>