<script>
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
	// Панель управления
	import Dashboard from './Dashboard.svelte';
	import Setup from './Setup.svelte';
	import Config from './Config.svelte';

	//обработка событий при загрузки===============================
	import { onMount } from "svelte";
	//секция переменных============================================
	let myip = document.location.hostname;
	let configSetupJson = "{}";
	const setMain = "Dashboard";
	const setConfig = "Configuration";
	const setSetup = "Setup";
	const wifissid = "Название сети:";
	const wifipasswd = "Пароль:";
	const mqttserver = "Имя сервера:";
	const mqttport = "Номер порта:";
	const mqttprefix = "Префикс:";
	const mqttuser = "Имя пользователя:";
	const mqttpasswd = "Пароль:";
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
			console.log("error", res.status);
		}
		getValues();
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
			duration: 5000,
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
</script>

<div class="hamburger-menu">
	<input id="menu__toggle" type="checkbox" />
	<label class="menu__btn" for="menu__toggle">
		<span />
	</label>
	<ul class="menu__box">
		<li>
			<a class="menu__item" href="/" on:click={getСonfigSetupJson}
				>{setMain}</a>
		</li>

		<li>
			<a class="menu__item" href="/config" on:click={getСonfigSetupJson}
				>{setConfig}</a>
		</li>

		<li>
			<a class="menu__item" href="/setup" on:click={getСonfigSetupJson}
				>{setSetup}</a>
		</li>
	</ul>

	<ul class="menu__main">
		<Route path="/">
			<div class="head">
				<h2>{setMain}</h2>
				
				<Dashboard/>


				
			
				
			</div>
		</Route>

		<Route path="/config">
			<div class="head">
				<h2>{setConfig}</h2>
			</div>

Это демо. Тут ничего не работает
			<Config/>

			
		</Route>

		<Route path="/setup">
			<div class="head">
				<h2>{setSetup}</h2>
			</div>
		
		
			<Setup/>
		
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