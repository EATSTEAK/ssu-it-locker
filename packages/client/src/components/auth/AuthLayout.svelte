<div class='container d-flex'>
  <div class='flex-fill d-inline-flex flex-column justify-content-center align-content-center'>
    <main class='d-inline-flex flex-column flex-md-row justify-content-center align-items-stretch'>
      <slot />
    </main>
  </div>
</div>

<style lang='scss'>
  .container {
    min-height: 100%;
    position: relative;
  }
</style>