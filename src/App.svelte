<script>
  let mode = "Dashboard";

  import Dashboard from "./Dashboard.svelte";
  // import Setup from "./Setup.svelte";
</script>

<a href="/">| | |</a> <br /><br />
{#if mode == "Dashboard"}
  <Dashboard />
{/if}
{#if mode == "Setup"}
  <Setup />
{/if}

<style>
</style>
