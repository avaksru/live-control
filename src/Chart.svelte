<script>
  import { Line, Bar } from 'svelte-chartjs';
  export let element;
 	import ZoomPlugin from 'chartjs-plugin-zoom';
	import * as LuxonAdapter from 'chartjs-adapter-luxon';
	import gradient from 'chartjs-plugin-gradient';
	  import {
		registerables,
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale,
	  } from 'chart.js';
	ChartJS.register(...registerables);
	ChartJS.register(LuxonAdapter);
	ChartJS.register(ZoomPlugin);
	ChartJS.register(gradient);
  ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    CategoryScale
  );
//	console.log (element)
	let 	options = {
    animation: {
        duration: 0
    },
				scales: {
					x: {
						type: 'time',
					}
				},
        aspectRatio: 1.5,
       
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          zoom: {
						pan: {
      enabled: true,
      mode: "x",
      speed: 10,
      threshold: 10
    },
      zoom: {
			wheel: {enabled:true},
			drag: {enabled:true},
			pinch: {enabled:true},
		  drag: false,
      speed: 0.01,
      sensitivity: 0.1,
      limits: {
        max: 10,
        min: 0.5
      },
							wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true,
       				},
              mode: 'x',
							  onZoomComplete({chart}) {
    
      chart.update('none');
    }
            }
          }
        }
      };
//-------------------------------------------
let data;

let graf_time = [];
let graf_val = [];
let dataLine = [];
let monthStat = [];
//console.log (JSON.stringify(element));
let    temp 
let prevStatus = {};


$: element, collectDataToArr();

function collectDataToArr() {

  let firstTime = true;


    try {
//     if (prevStatus !== element.status){        
//      prevStatus = element.status;

  dataLine =[];  
  graf_val = [];
  graf_time = [];
  temp = element.status; 
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
                    if (!firstTime  ) {
                     
                  //    console.log(item)
                      // получаем время
              let        date = new Date(item.x * 1000);
              let       hours = date.getHours();
              let       minutes = checkTime(date.getMinutes());
                      function checkTime(i) {
                        return i < 10 ? "0" + i : i;
                      }
              let days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
              let dayW = days[date.getDay()];
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
                  graf_time = [
                          ...graf_time, new Date(item.x*1000),
                        ];
                  graf_val = [...graf_val, item.y1];
                  
                
                 }  
                 firstTime = false;
                });
                 
                  let grafpointRadius;
                  if (element.pointRadius == "0") {
                    grafpointRadius=0.3;
                  }else {grafpointRadius=2}
                 
               let grafborderColor = "lightblue";
               let grafbackgroundColor = "rgba(17, 209, 247, .06)";
               if(element.color){
                grafborderColor = element.color;
               }
               if (element.type == "bar") {
                grafbackgroundColor = grafborderColor;
               }
         dataLine = {
                    labels: graf_time,
                    datasets: [											
                      {   
												
                        label: element.descr,
                        fill: true,
                        lineTension: 0.3,
												backgroundColor: grafbackgroundColor,
                        pointRadius: grafpointRadius,
												borderColor: grafborderColor,
                        borderWidth: 2, 
                        
                        cubicInterpolationMode: "monotone",
                        data: graf_val,
                      },
                    ],
                  };
   //            }
               } catch (e) {
                  console.log(
                    "полученные данные для графика содержат ошибки",
                    element
                  );
                }
   }
   
                  // показать/скрыть статистику суточного потребления по месяцам
  let n = 0;
  function showStat() {
    n = 1;
  }
  function hideStat() {
    n = 0;
  }

		

</script>
{#if element.type == "bar"}
<div style="height: 400px">
<Bar data={dataLine} options={options} />
</div><br>

{#if n == 0}
  <div on:click={() => showStat()}>♻️</div>
{/if}
{#if n == 1}
  <div on:click={() => hideStat()}>♻️</div>
  <br />
  {#if monthStat[0]["00"] > 0}
    за месяц {Math.round(
      monthStat[0]["00"] * 10
    ) / 10}<br />
  {/if}
  {#if monthStat[0]["01"] > 0}январь {Math.round(
      monthStat[0]["01"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["02"] > 0}февраль {Math.round(
      monthStat[0]["02"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["03"] > 0}март {Math.round(
      monthStat[0]["03"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["04"] > 0}апрель {Math.round(
      monthStat[0]["04"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["05"] > 0}май {Math.round(
      monthStat[0]["05"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["06"] > 0}июнь {Math.round(
      monthStat[0]["06"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["07"] > 0}июль {Math.round(
      monthStat[0]["07"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["08"] > 0}август {Math.round(
      monthStat[0]["08"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["09"] > 0}сентябрь {Math.round(
      monthStat[0]["09"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["10"] > 0}октябрь {Math.round(
      monthStat[0]["10"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["11"] > 0}ноябрь {Math.round(
      monthStat[0]["11"] * 10
    ) / 10}<br />{/if}
  {#if monthStat[0]["12"] > 0}декабрь {Math.round(
      monthStat[0]["12"] * 10
    ) / 10}<br />{/if}
{/if}

{:else}
<div style="height: 400px">
  <Line data={dataLine} options={options} />
</div><br>

{/if}

