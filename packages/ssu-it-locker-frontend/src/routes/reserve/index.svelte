<script lang='ts'>
	import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'sveltestrap';

	let isOpen;
</script>

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

		</section>
	</section>
</main>