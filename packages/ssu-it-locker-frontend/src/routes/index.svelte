<script lang='ts'>
	import { getAuthorization } from '$lib/utils';
	import { onMount } from 'svelte';
	import { Button, Spinner } from 'sveltestrap';
	import AuthCard from "../components/auth/AuthCard.svelte";
	import LockerStatus from "../components/auth/LockerStatus.svelte";
	import AuthLayout from "../components/auth/AuthLayout.svelte";

	let callbackUrl;
	let loginCookie;
	onMount(() => {
		loginCookie = getAuthorization();
		if (loginCookie) {
			window.location.href = '/reserve';
		}
		callbackUrl = window.location.protocol + '//' + window.location.host + '/callback/';
	});
</script>

<svelte:head>
	<title>IT대학 사물함 예약 시스템</title>
</svelte:head>
<AuthLayout>
	<AuthCard class='m-3' text="숭실대학교 계정으로 로그인하세요.">
		{#if loginCookie}
			<p>로그인이 확인되었습니다. 메인 페이지로 이동합니다...</p>
		{:else if callbackUrl}
			<Button
				color='primary'
				size='lg'
				class='shadow-none'
				href='https://class.ssu.ac.kr/xn-sso/gw.php?login_type=standalone&callback_url={encodeURIComponent(callbackUrl)}'>
				Login with SSU
			</Button>
		{:else}
			<Spinner color='primary' size='md' type='grow' />
		{/if}
	</AuthCard>
	<LockerStatus class='flex-grow-1 m-3' />
</AuthLayout>

