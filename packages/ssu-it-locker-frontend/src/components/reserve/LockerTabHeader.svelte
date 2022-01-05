<script>
	import { setContext } from 'svelte';
	import { Nav } from 'sveltestrap';

	setContext('tabs', true);
</script>

<Nav {...$$restProps}>
	<slot />
</Nav>