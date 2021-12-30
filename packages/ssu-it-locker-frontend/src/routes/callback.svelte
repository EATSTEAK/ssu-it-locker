<script lang="ts">
  import { variables } from '$lib/variables';
  import { onMount } from "svelte";
  const baseUrl = variables.baseUrl ?? '';
  let result;
  let id;
  onMount(() => {
    result = new URLSearchParams(window.location.search).get('result');
    id = fetch(baseUrl + '/api/auth/callback?result=' + encodeURIComponent(result)).then((res) => res.json());
  });
</script>

<h1>SSU Auth result.</h1>
<p>Result Token: {result}</p>
{#await id}
  <p>Obtaining id...</p>
{:then data}
  <p>Id: {JSON.stringify(data)}</p>
{:catch error}
  <p>Error!: {JSON.stringify(error)}</p>
{/await}