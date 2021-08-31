<script>
  export let title = "";
  let isHovered = false;
  let x;
  let y;

  function mouseOver(event) {
    isHovered = true;
    x = event.pageX - 400;
    y = event.pageY - 140;
  }
  function mouseMove(event) {
    x = event.pageX - 400;
    y = event.pageY - 140;
  }
  function mouseLeave() {
    isHovered = false;
  }
</script>

<div
  on:mouseover={mouseOver}
  on:mouseleave={mouseLeave}
  on:mousemove={mouseMove}
>
  <slot />
</div>

{#if isHovered}
  <div style="top: {y}px; left: {x}px;" class="tooltip">{title}</div>
{/if}

<style>
  .tooltip {
    border: 1px solid #ddd;
    box-shadow: 1px 1px 1px #ddd;
    background: rgb(185, 238, 241);
    border-radius: 4px;
    padding: 4px;
    position: absolute;
    color: black;
  }
</style>
