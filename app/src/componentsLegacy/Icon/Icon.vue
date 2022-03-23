<script lang="ts">
import { defineComponent, PropType } from "vue";
import CircleArrows from "./icons/CircleArrows.vue";
import CircleHalf from "./icons/CircleHalf.vue";
import PoolIcon from "./icons/PoolIcon.vue";
import DownArrow from "./icons/DownArrow.vue";
import Tick from "./icons/Tick.vue";
import Cross from "./icons/Cross.vue";
import Back from "./icons/Back.vue";
import Plus from "./icons/Plus.vue";
import Eye from "./icons/Eye.vue";
import InfoBox from "./icons/InfoBox.vue";
import Bang from "./icons/Bang.vue";
import Sif from "./icons/Sif.vue";
import Exclaimation from "./icons/Exclaimation.vue";
import Soon from "./icons/Soon.vue";
import InfoFullCircle from "./icons/InfoFullCircle.vue";
import CloseFullCircle from "./icons/CloseFullCircle.vue";

export default defineComponent({
  props: {
    icon: {
      type: String as PropType<
        | "arrows"
        | "back"
        | "circle-half"
        | "pool"
        | "plus"
        | "down"
        | "tick"
        | "cross"
        | "info-box-black"
        | "info-box-gold"
        | "info-box-white"
        | "sif"
        | "exclaimation"
        | "soon"
        | "eye"
        | "info-full-circle"
        | "close-full-circle"
      >,
    },
  },
  components: {
    Cross,
    Tick,
    DownArrow,
    CircleArrows,
    CircleHalf,
    PoolIcon,
    Back,
    Plus,
    InfoBox,
    Sif,
    Exclaimation,
    Soon,
    Eye,
    InfoFullCircle,
    CloseFullCircle,
  },
});
</script>

<template>
  <span class="icon-wrapper">
    <CircleArrows v-if="icon === 'circle-arrows'" />
    <CircleHalf v-if="icon === 'circle-half'" />
    <PoolIcon v-if="icon === 'pool'" />
    <DownArrow v-if="icon === 'down'" />
    <Tick v-if="icon === 'tick'" />
    <Cross v-if="icon === 'cross'" />
    <Back v-if="icon === 'back'" />
    <Plus v-if="icon === 'plus'" />
    <InfoBox v-if="icon === 'info-box-gold'" />
    <InfoBox v-if="icon === 'info-box-black'" color="#818181" />
    <InfoBox v-if="icon === 'info-box-white'" color="#fff" />
    <Sif v-if="icon === 'sif'" />
    <Exclaimation v-if="icon === 'exclaimation'" />
    <Soon v-if="icon === 'soon'" />
    <Eye v-if="icon === 'eye'" />
    <InfoFullCircle v-if="icon === 'info-full-circle'" />
    <CloseFullCircle v-if="icon === 'close-full-circle'" />
  </span>
</template>

<style lang="scss" scoped>
span {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
