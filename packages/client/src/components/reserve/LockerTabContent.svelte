<script>
	import { createEventDispatcher, setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { classnames } from '$lib/utils';
	import LockerTabHeader from './LockerTabHeader.svelte';

	const dispatch = createEventDispatcher();

	let className = '';
	// noinspection ReservedWordAsName
	export { className as class };
	export let pills = false;
	export let vertical = false;
	export let tabclass = '';

	const activeTabId = writable();
	setContext('tabContent', {
		activeTabId,
		setActiveTab: (tabId) => {
			activeTabId.set(tabId);
			dispatch('tab', tabId);
		}
	});

	$: classes = classnames('tab-content', className, {
		'd-flex align-items-start': vertical
	});
</script>

<div {...$$restProps} class={classes}>
	<LockerTabHeader
		class={classnames({ 'me-3': vertical }, tabclass)}
		{pills}
		tabs={!pills}
		{vertical}
	>
		<slot />
	</LockerTabHeader>
	<slot />
</div>
