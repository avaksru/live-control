<script>
	import { Route, router, active } from "tinro";
	let setMain = "Конфигурация устройства";
	let setWifi = "Конфигурация WiFi";
	let setMqtt = "Конфигурация MQTT";
	let inputValue;
	function submitHandler() {
		console.log("лог", inputValue);
	}
</script>

<div class="sidenav">
	<button on:click={() => router.goto("/")}>{setMain}</button>
	<button on:click={() => router.goto("/wifi")}>{setWifi}</button>
	<button on:click={() => router.goto("/mqtt")}>{setMqtt}</button>
</div>

<div class="mainpage">
	<Route path="/">
		<div class="head">
			<h2>{setMain}</h2>
		</div>
	</Route>

	<Route path="/wifi">
		<div class="head">
			<h2>{setWifi}</h2>
		</div>
		<div class="content">
			<h4>Название сети</h4>
			<form on:submit|preventDefault={submitHandler}>
				<input
					type="text"
					on:input={(event) => (inputValue = event.target.value)}
				/>
				<button type="submit"> Сохранить </button>
			</form>
		</div>
	</Route>

	<Route path="/mqtt">
		<div class="head">
			<h2>{setMqtt}</h2>
		</div>
	</Route>
</div>

<style>
	.sidenav {
		height: 100%; /* Full-height: remove this if you want "auto" height */
		width: 250px; /* Set the width of the sidebar */
		position: fixed; /* Fixed Sidebar (stay in place on scroll) */
		z-index: 1; /* Stay on top */
		top: 0; /* Stay at the top */
		left: 0;
		background-color: rgba(17, 17, 17, 0.658); /* Black */
		overflow-x: hidden; /* Disable horizontal scroll */
		padding-top: 20px;
	}

	/* The navigation menu links */
	.sidenav button {
		/*text-align: center;*/
		margin: 10px auto 10px;
		width: 220px;
		padding: 6px 8px 6px 16px;
		text-decoration: none;
		font-size: 15px;
		color: #000000;
		display: block;
	}

	.mainpage {
		margin-left: 250px; /* Same as the width of the sidebar */
		padding: 0px 10px;
	}
	.head {
		text-align: center;
		color: #000000;
		display: block;
	}
	.content {
		text-align: center;
		color: #000000;
		display: block;
		margin: 50px auto 50px;
	}
</style>
