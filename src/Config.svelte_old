<script>
	import Tooltip from './Tooltip.svelte';
	import Box from './Box.svelte';
  import { Tabs, Tab, TabList, TabPanel } from 'svelte-tabs';
// --------------Добавление элементов-----------
  import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	const [send, receive] = crossfade({
		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});
		
        
      
      let widgets=[
    {
      "id" : 0,
      "description" : "Кнопка управляющая пином",
      "tupe" : "button-out",
      "idPref" : "btn",
      "widget" : "toggleBtn",
      "pageName" : "Кнопки",
      "pageID" : "",
      "name" : "Освещение",
      "order" : "",
      "pin" : ""
    },
      {
      "id" : 1,
      "description" : "Кнопка управляющая пином (с инверсией)",
      "tupe" : "button-out",
      "idPref" : "btn",
      "widget" : "toggleBtn",
      "pageName" : "Кнопки",
      "pageID" : "",
      "name" : "Освещение",
      "order" : "",
      "pin" : "",
      "inv" : "[1]"
    }	,
      {
      "id" : 2,
      "description" :  "Кнопка виртуальная (не привязанная к пину, для использования в сценариях)",
      "tupe" : "button-out",
      "idPref" : "btn",
      "widget" : "toggleBtn",
      "pageName" : "Кнопки",
      "pageID" : "",
      "name" : "Освещение",
      "order" : ""
    }	,
      {
      "id" : 3,
      "description" : "Кнопка физическая, чтение состояния пина (подключается провдами к устройству)",
      "tupe" : "button-in",
      "idPref" : "btn",
      "widget" : "toggleBtn",
      "pageName" : "Кнопки",
      "pageID" : "",
      "name" : "Освещение",
      "order" : "",
      "pin" : "",
      "db" : "[20]"
    }	,
      {
      "id" : 4,
      "description" : "Широтно импульсная модуляция pwm",
      "tupe" : "pwm-out",
      "idPref" : "pwm",
      "widget" : "range",
      "pageName" : "Ползунки",
      "pageID" : "",
      "name" : "Яркость",
      "order" : "",
      "pin" : ""
    }		,
      {
      "id" : 5,
      "description" : "Окно ввода цифровых значений",
      "tupe" : "input-value",
      "idPref" : "dgt",
      "widget" : "inputDigit",
      "pageName" : "Ввод",
      "pageID" : "",
      "name" : "Введите#цифру",
      "order" : ""
    }	
      ];
      
      
	let uid = widgets.length + 1;

    
      
      
      function remove(widget) {
		widgets = widgets.filter(t => t !== widget);
	}
	function add(widget) {
		console.log(widget);
		let widgetNEW={} ;
			for (var key in widget) {
	  	widgetNEW[key] = widget[key];
		 		}
		widgetNEW.id= uid++;
		widgetNEW.done=true,
		widgets = [widgetNEW, ...widgets];
		
	}
      
      function addPreset(){
    
        add(widgets[3]);
        add(widgets[1]);
        
        
      }
      // --------------------------------------------------------

	let edit=false;
	function handleClick() {
	edit = true;
	console.log(Conf);		
		
	}
	function handleClick1() {
	edit = false;
	//console.log(Conf);		
		
	}



const syntaxHighlight = (json) => {
    try {
      json = JSON.stringify(JSON.parse(json), null, 4);
    } catch (e) {
      return json;
    }
    json = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    json = json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
          
				   return match
      }
    );
    return json;
  };

 

</script>
<body>
	<Tabs> 
      
    <TabList >
  
      <Tab>Настройка</Tab>
      <Tab>добавить элемент</Tab>
      <Tab>добавить присет</Tab>
      <Tab>JSON</Tab>
  </TabList>
  
    
    <TabPanel>






 {#each widgets.filter(t => t.done) as wiget, i}	 
<Box>
	<b on:click={handleClick}>{wiget["description"]}</b><span on:click={handleClick1} class="letter1">{wiget["tupe"]}</span>
	{#if edit == true}

<table border="0" width="100%"  >
	<tr>
		<td>Тип элемента</td>
		<td><input type="text" disabled value='{wiget["Тип элемента"]}'  /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td></Tooltip>

	</tr>
	<tr>
		<td>Id</td>
		<td><input type="text" value='{wiget["id"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Виджет</td>
		<td><input type="text"  value='{wiget["widget"]}' /></td>
	<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Имя вкладки</td>
		<td><input type="text" value='{wiget["pageName"]}' /></td>
			<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td></Tooltip>
	</tr>
	<tr>
		<td>Имя виджета</td>
		<td><input type="text" value='{wiget["name"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Позиция виджета</td>
		<td><input type="text" value='{wiget["order"]}' /></td>
	<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>PIN</td>
		<td><input type="text" value='{wiget["pin"]}' /></td>
			<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Частота опроса</td>
		<td><input type="text" value='{wiget["FIELD9"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Тип датчика</td>
			<td><input type="text" value='{wiget["FIELD10"]}' /></td>
			<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>
	<tr>
		<td>Еще что то</td>
			<td><input type="text" value='{wiget["inv"]}' /></td>
		<Tooltip title="Бла-бла-бла про то как это использовать"  ><td>?</td>	</Tooltip>
	</tr>

</table>	
{:else}
<table   border="0" width="100%" >
	<tr>
		<td>&nbsp;</td>
		<td><span class="letter">элемент</span><p>{wiget["tupe"]}</p></td>
		<td><span class="letter">Id</span><p>{wiget["id"]}</p> </td>
		<td><span class="letter">Имя вкладки</span><p>{wiget["pageName"]}</p> </td>
		<td><span class="letter">Позиция</span><p>{wiget["order"]}</p> </td>
	</tr>
	<tr>
		<td>&nbsp;</td>
		<td><span class="letter">pin</span><p>{wiget["pin"]}</p></td>
		<td><span class="letter">type</span><p>{wiget["FIELD9"]}</p></td>
		<td><span class="letter">Опрос</span><p>{wiget["FIELD10"]}</p></td>
		<td><span class="letter">Параметр</span><p>{wiget["FIELD11"]}</p></td>
	</tr>
</table>
	{/if}
</Box>
	  {/each}  

  </TabPanel>

 <!-- // добавление элементов-->
  <TabPanel>
    
   
    
    
    
    <div class='board'>
    
      <div class='left'>
        <h2>элементы</h2>
        {#each widgets.filter(t => !t.done) as widget (widget.id)}
          <label
            in:receive="{{key: widget.id}}"
           
            animate:flip
          >
            {widget.description}
            <button on:click="{() => add(widget)}">➕</button>
          </label>
        {/each}
      </div>
    
      <div class='right'>
        <h2>готово</h2>
        {#each widgets.filter(t => t.done) as widget (widget.id)}
          <label
            in:receive="{{key: widget.id}}"
         
            animate:flip
          >
          
            {widget.description}
            <button on:click="{() => remove(widget)}">❌</button>
          </label>
        {/each}
      </div>
    
  </TabPanel>

 <!-- // Добавление присетов -->
  <TabPanel>
   

    <div class='board'>
    
      <div class='left'>
        <h2>песеты</h2>
        <div on:click={addPreset}>Докинуть два виджета</div>
      </div>
    
      <div class='right'>
        <h2>готово</h2>
        {#each widgets.filter(t => t.done) as widget (widget.id)}
          <label
          in:receive="{{key: widget.id}}"
         
                      animate:flip
          >
          
            {widget.description}
            <button on:click="{() => remove(widget)}">❌</button>
          </label>
        {/each}
      </div>
    </div>
    
  </TabPanel>

  <TabPanel>
   
    <pre>
   
    <p><textarea rows="35"  id="S1">{syntaxHighlight(JSON.stringify(widgets.filter(t => t.done)))}</textarea></p>

    </pre>
  
  </TabPanel>
  </Tabs> 

<br><br>
<div  class="letter" align="center" >developed by avaks@meef.ru</div>
</body>

<style>
  textarea {
     width:100%;
     height:100%;
  }

.board {
        max-width: 36em;
        margin: 0 auto;
      }
    
      .left, .right {
        float: left;
        width: 50%;
        padding: 0 1em 0 0;
        box-sizing: border-box;
      }
    
      h2 {
        font-size: 2em;
        font-weight: 200;
        user-select: none;
      }
    
      label {
        top: 0;
        left: 0;
        display: block;
        font-size: 1em;
        line-height: 1;
        padding: 0.5em;
        margin: 0 auto 0.5em auto;
        border-radius: 2px;
        background-color: #eee;
        user-select: none;
      }
    
      
    
      .right label {
        background-color: rgb(180,240,100);
      }
    
      button {
        float: right;
        height: 1em;
        box-sizing: border-box;
        padding: 0 0.5em;
        line-height: 1;
        background-color: transparent;
        border: none;
        color: rgb(170,30,30);
        opacity: 0;
        transition: opacity 0.2s;
      }
    
      label:hover button {
        opacity: 1;
      }













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