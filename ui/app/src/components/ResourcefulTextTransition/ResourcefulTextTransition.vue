<template lang="pug">
  transition-group(
    name="list-horizontal-complete"
  )
    span(
      v-for="(char, index) in activeIconText"
      :key="char.key"
      :data-index="index"
    ).list-horizontal-complete-item {{ char.char }}
</template>

<script>
export default {
  props: ["text"],
  computed: {},
};
</script>
