<div class="card">
  <slot />
</div>

<style>
  .card {
    display: inline-block;
    vertical-align: top;
    width: 19%;
    border: 0px solid #aaa;
    border-radius: 1px;
    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
    padding: 1em;
    margin: 0 2em 1em 0;
    height: auto;
  }
  @media (max-width: 1500px) {
    .card {
      width: 26%;
    }
  }
  @media (max-width: 1060px) {
    .card {
      width: 39%;
    }
  }
  @media (max-width: 750px) {
    .card {
      width: 92%;
    }
  }
</style>
