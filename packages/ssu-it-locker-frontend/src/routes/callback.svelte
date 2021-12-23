<script>
  import { page } from '$app/stores';
  const result = $page.query.get('result');
  const id = fetch('http://localhost:3000/auth/callback?result=' + encodeURIComponent(result)).then((res) => res.json());
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