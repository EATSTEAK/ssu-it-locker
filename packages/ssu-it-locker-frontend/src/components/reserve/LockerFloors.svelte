<script lang='ts'>
	import { Button, TabPane } from 'sveltestrap';
	import { getDepartment, range } from '$lib/utils';
	import LockerTabContent from './LockerTabContent.svelte';

	export let floors;
</script>

<LockerTabContent pills>
	{#each Object.entries(floors) as [floorKey, floor], i}
		<TabPane tabId='{floorKey}' tab='{floorKey}층' active='{i === 0}'>
			{#each Object.entries(floor) as [sectionKey, sections]}
				<div id='{sectionKey}'>
					<h2>{sectionKey}</h2>
					{#each sections as section}
						<h5>{getDepartment(section.department)}</h5>
						<div class='d-inline-flex flex-wrap justify-content-between'>
							{#each range(section.range[1] - section.range[0] + 1, section.range[0]) as num}
								<Button>{floorKey}-{sectionKey}-{`${num}`.padStart(3, '0')}</Button>
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</TabPane>
	{/each}
</LockerTabContent>