<script lang="ts">
  import { page } from '$app/stores';
  import { variables } from '$lib/variables';
  const result = $page.query.get('result');
  const baseUrl = variables.baseUrl ?? '';
  const id = fetch(baseUrl + '/auth/callback?result=' + encodeURIComponent(result)).then((res) => res.json());
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