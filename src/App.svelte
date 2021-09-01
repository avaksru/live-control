<script>
  let mode = "Config";

  //import Dashboard from "./Dashboard.svelte";
  //import Setup from "./Setup.svelte";
  //import Config from "./Config.svelte";
</script>

<a href="/">| | |</a> <br /><br />
{#if mode == "Dashboard"}
  <Dashboard />
{/if}
{#if mode == "Config"}
  <Config />
{/if}
{#if mode == "Setup"}
  <Setup />
{/if}

<style>
</style>
