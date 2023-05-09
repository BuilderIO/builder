<script>
  export let number = 0;
</script>

<div>
  <div>
    Number is: {number}
  </div>
  <button on:click={() => number++}>Increment</button>
</div>
