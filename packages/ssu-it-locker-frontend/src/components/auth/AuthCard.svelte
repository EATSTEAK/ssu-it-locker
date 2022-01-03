<!--suppress ReservedWordAsName -->
<script>
  import { Card, CardBody, CardText, Image } from "sveltestrap";
  export let text = '숭실대학교 계정으로 로그인하세요.';
  let clazz;
  export { clazz as class };
</script>

<Card class={`p-2 shadow-lg ${clazz || ''}`}>
  <Image class='mx-3 my-2' style='max-width: 100px;' fluid src='/soongsil_logo.jpg' />
  <CardBody>
    <h1>
      IT대학
    </h1>
    <h3>
      사물함 예약 시스템
    </h3>
    <CardText>
      {text}
    </CardText>
    <slot></slot>
  </CardBody>
</Card>