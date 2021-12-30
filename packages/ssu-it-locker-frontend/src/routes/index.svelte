<script lang="ts">
  import { onMount } from "svelte";
  let callbackUrl;
  onMount(() => {
    callbackUrl = window.location.protocol + '//' + window.location.host + '/callback/';
  });
</script>

<h1>Welcome to SvelteKit</h1>
<p>Callback: {callbackUrl}</p>
<p><a href="https://class.ssu.ac.kr/xn-sso/gw.php?login_type=standalone&callback_url={encodeURIComponent(callbackUrl)}">Login with SSU</a></p>
