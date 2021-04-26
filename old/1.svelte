<script>
	let name = "svelte";
	let number = 42;
	let html = "<b>This is my text</b>";
	let inputValue;
	function changeNameHandler() {
		name = "new name";
	}
	function submitHandler() {
		console.log("лог", inputValue);
	}
</script>


<svelte:head>
	<h1>Главная страница</h1>
</svelte:head>

<main>
	<h1>Главная страница</h1>
	<button on:click={changeNameHandler}>Кнопка</button>
	<h2>{name.toUpperCase()}</h2>
	<h2>{(Math.random() * number).toFixed(2)}</h2>
	<p>{@html html}</p>

	<form on:submit|preventDefault={submitHandler}>
		<input
			type="text"
			on:input={(event) => (inputValue = event.target.value)}
		/>
		<button type="submit"> Отправить </button>
	</form>

</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

</style>
