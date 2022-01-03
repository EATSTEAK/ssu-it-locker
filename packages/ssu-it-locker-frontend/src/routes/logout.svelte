<script lang='ts'>
	import { variables } from '$lib/variables';
	import { onMount } from 'svelte';
	import { Spinner } from 'sveltestrap';
	import { fetchWithAuth } from '$lib/utils';
	import AuthCard from "../components/auth/AuthCard.svelte";
	import AuthLayout from "../components/auth/AuthLayout.svelte";

	const baseUrl = variables.baseUrl ?? '';

	let id;
	onMount(() => {
		id = fetchWithAuth(baseUrl + '/api/auth/logout', { method: 'GET' }).then((res) => res.json());
		id.then(() => {
			document.cookie = `ssulocker_session=; max-age=-99999999;`;
			window.location.href = '/';
		});
	});
</script>

<svelte:head>
	<title>IT대학 사물함 예약 시스템 - 로그아웃</title>
</svelte:head>

<AuthLayout>
	<AuthCard class='m-3' text="로그아웃하는 중입니다...">
		{#await id}
			<Spinner color='primary' size='md' type='grow' />
		{:then data}
			{#if id}
				<p>로그아웃이 완료되었습니다. 로그인 페이지로 이동합니다.</p>
			{:else}
				<Spinner color='primary' size='md' type='grow' />
			{/if}
		{:catch error}
			<p>오류가 발생하였습니다: {JSON.stringify(error)}</p>
		{/await}
	</AuthCard>
</AuthLayout>
