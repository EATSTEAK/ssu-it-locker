<!--suppress ReservedWordAsName -->
<script>
  import { Alert, Badge, Card, CardBody, CardText, Col, Row, Spinner } from "sveltestrap";
  import { onMount } from "svelte";
  import { variables } from "$lib/variables";
  import { getDepartment } from "$lib/utils";

  const baseUrl = variables.baseUrl ?? '';
  let clazz;
  export { clazz as class };
  let status;
  onMount(() => {
    status = fetch(baseUrl + '/api/locker/count').then((res) => res.json());
  });
</script>

<Card class={`p-2 shadow-lg ${clazz || ''}`}>
  <CardBody>
    <h1>
      예약 현황
    </h1>
    <CardText>
      {#if status}
        {#await status}
          <Spinner color="primary" size="md" type="grow" />
        {:then data}
          <section class="d-flex flex-column align-items-stretch">
            {#each Object.entries(data.result) as [key, count]}
              <Row class="align-items-center my-2">
                <Col>
                  <h3>{getDepartment(key)}</h3>
                  <p>2022/01/08 00:00~01:00</p>
                </Col>
                <Col xs="auto" class="text-end">
                  <h2><Badge>{count}/140</Badge></h2>
                </Col>
              </Row>
            {/each}
          </section>
        {:catch err}
          <Alert color="danger">{JSON.stringify(err)}</Alert>
        {/await}
      {:else}
        <Spinner color="primary" size="md" type="grow" />
      {/if}
    </CardText>
  </CardBody>
</Card>