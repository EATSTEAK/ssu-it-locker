<script lang='ts'>
	import { variables } from '$lib/variables';
	import { onMount } from 'svelte';
	import { Spinner } from 'sveltestrap';
	import AuthCard from "../components/auth/AuthCard.svelte";
	import AuthLayout from "../components/auth/AuthLayout.svelte";

	const baseUrl = variables.baseUrl ?? '';
	let result;
	let id;
	onMount(() => {
		result = new URLSearchParams(window.location.search).get('result');
		id = fetch(baseUrl + '/api/auth/callback?result=' + encodeURIComponent(result)).then((res) => res.json());
		id.then((data) => {
			document.cookie = `ssulocker_session=${encodeURIComponent(data.access_token)}; path=/; domain=${window.location.hostname}; max-age=${data.expires_in}; samesite=lax`;
			window.location.href = '/reserve';
		});
	});
</script>

<svelte:head>
	<title>IT대학 사물함 예약 시스템 - 로그인 중</title>
</svelte:head>

<AuthLayout>
	<AuthCard class='m-3' text='로그인하는 중입니다...'>
		{#await id}
			<Spinner color='primary' size='md' type='grow' />
		{:then data}
			{#if id}
				<p>로그인이 완료되었습니다. 메인 페이지로 이동합니다.</p>
			{:else}
				<Spinner color='primary' size='md' type='grow' />
			{/if}
		{:catch error}
			<p>오류가 발생하였습니다: {JSON.stringify(error)}</p>
		{/await}
	</AuthCard>
</AuthLayout>