<script lang='ts'>
	import { getAuthorization } from '$lib/utils';
	import { onMount } from 'svelte';
	import { Button, Card, CardBody, CardText, Image, Spinner } from 'sveltestrap';

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

<main class='d-inline-flex flex-column justify-content-center align-content-start'>
	<section>
		<Card class='m-3 p-2 shadow-lg'>
			<Image class='mx-3 my-2' style='max-width: 100px;' fluid src='/soongsil_logo.jpg' />
			<CardBody>
				<h1>
					IT대학
				</h1>
				<h3>
					사물함 예약 시스템
				</h3>
				<CardText>
					숭실대학교 계정으로 로그인하세요.
				</CardText>
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
			</CardBody>
		</Card>
	</section>
</main>

<style lang='scss'>
  main {
    min-height: 100%;
    position: relative;
  }
</style>
