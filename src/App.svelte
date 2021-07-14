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
	
	//секция переменных============================================
	let myip = document.location.hostname;
	let configSetupJson = "{}";
	const setMain = "Dashboard";
	const setConfig = "Config";
	const setSetup = "Setup";
	
	
	//функции=======================================================


</script>



<div class="hamburger-menu">
	<input id="menu__toggle" type="checkbox" />
	<label class="menu__btn" for="menu__toggle">
		<span />
	</label>
	<ul class="menu__box">
		<li>
			<a class="menu__item" href="/" 
				>{setMain}</a>
		</li>
		<li>
			<a class="menu__item" href="/config" 
				>{setConfig}</a>
		</li>
	

		<li>
			<a class="menu__item" href="/setup" 
				>{setSetup}</a>
		</li>
	</ul>

	<ul class="menu__main">
		<Route path="/">
			<div class="head">
				<h2>{setMain}</h2>
				
				
			</div>
<Dashboard/>


		</Route>

		<Route path="/config">
			<div class="head">
				<h2>{setConfig}</h2>
			</div>


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
	h2{
		color: gray;
	}
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
		top: 10px;
		left: 10px;
		width: 13px;
		height: 13px;
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
		width: 120px; /* размер выхода бокового меню */
		height: 100%;
		margin: 0;
		padding: 80px 0;
		list-style: none;
		background-color: #eceff1;
		box-shadow: 1px 0px 26px rgba(0, 0, 0, 0.2);
		transition-duration: 0.25s;
	}

	:global(body.dark-mode) .menu__box {
		background-color: #375874;
    
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
	:global(body.dark-mode) .menu__item {
		 	color: #bfc2c7;		
	}
	.menu__item:hover {
		background-color: #cfd8dc;
	}
	:global(body.dark-mode) .menu__item:hover{
		 	color: #1e2b42;		
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