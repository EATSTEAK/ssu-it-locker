<script lang='ts'>
	import {
		Alert,
		Card,
		CardSubtitle,
		CardTitle,
		Collapse,
		Nav,
		Navbar,
		NavbarBrand,
		NavbarToggler,
		NavItem,
		NavLink,
		Spinner,
		TabContent,
		TabPane
	} from 'sveltestrap';
	import { onMount } from 'svelte';
	import { fetchWithAuth, getBuilding, getDepartment, LockerMap } from '$lib/utils';
	import { variables } from '$lib/variables';
	import lockerData from '../../lockers.json';
	import LockerFloors from '../../components/reserve/LockerFloors.svelte';


	const lockers: LockerMap = lockerData as LockerMap;

	const lockersByBuilding = Object.entries(lockers).reduce((result, v) => {
		if (result[v[0].split('-')[0]] === undefined) result[v[0].split('-')[0]] = {};
		result[v[0].split('-')[0]][v[0].split('-')[1]] = v[1];
		return result;
	}, {});
	const baseUrl = variables.baseUrl ?? '';

	let isOpen;
	let userInfo;
	onMount(() => {
		userInfo = fetchWithAuth(baseUrl + '/api/user/get', { method: 'GET' }).then((res) => res.json());
	});
</script>

<svelte:head>
	<title>IT대학 사물함 예약 시스템 - 예약하기</title>
</svelte:head>

<main>
	<Navbar color='dark' class='shadow-lg' dark expand='xs'>
		<NavbarBrand>사물함 예약 시스템</NavbarBrand>
		<NavbarToggler on:click={() => (isOpen = !isOpen)} />
		<Collapse {isOpen} navbar expand='xs'>
			<Nav class='me-auto' navbar>
				<NavItem>
					<NavLink href='#' active>예약하기</NavLink>
				</NavItem>
				<NavItem>
					<NavLink href='/logout'>로그아웃</NavLink>
				</NavItem>
			</Nav>
		</Collapse>
	</Navbar>
	<section class='container'>
		<section class='my-3 mx-1 p-3 shadow-lg '>
			<section>
				<h1>내 정보</h1>
				{#await userInfo}
					<Spinner color='primary' size='md' type='grow' />
				{:then data}
					{#if userInfo}
						<Card body>
							<CardTitle>{data.result.id}</CardTitle>
							<CardSubtitle>{getDepartment(data.result.department)}</CardSubtitle>
							<p>예약된 사물함: {data.result.lockerId ? `${data.result.lockerFloor}층 ${data.result.lockerId} 사물함` : '없음'}</p>
						</Card>
					{:else}
						<Spinner color='primary' size='md' type='grow' />
					{/if}
				{:catch err}
					<Alert color='danger'>오류가 발생했습니다! 관리자에게 문의하세요.</Alert>
				{/await}
			</section>
			<section>
				<h1>예약하기</h1>
				<TabContent pills class='nav-fill'>
					{#each Object.entries(lockersByBuilding) as [buildingKey, floors], i}
						<TabPane tabId='{buildingKey}' tab='{getBuilding(buildingKey)}' active='{i === 0}' class='p-2'>
							<LockerFloors floors={floors} />
						</TabPane>
					{/each}
				</TabContent>
			</section>
		</section>
	</section>
</main>