<script lang='ts'>
	import { onMount } from 'svelte';
	import { Button } from 'sveltestrap';

	let callbackUrl;
	onMount(() => {
		callbackUrl = window.location.protocol + '//' + window.location.host + '/callback/';
	});
</script>
<main>
	<p>Callback: {callbackUrl}</p>
	<Button
		href='https://class.ssu.ac.kr/xn-sso/gw.php?login_type=standalone&callback_url={encodeURIComponent(callbackUrl)}'>
		Login with SSU
	</Button>
</main>
