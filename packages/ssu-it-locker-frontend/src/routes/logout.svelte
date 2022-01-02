<script lang='ts'>
	import { variables } from '$lib/variables';
	import { onMount } from 'svelte';
	import { Card, CardBody, CardText, Image, Spinner } from 'sveltestrap';
	import { fetchWithAuth } from '$lib/utils';

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
					로그아웃하는 중입니다...
				</CardText>
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