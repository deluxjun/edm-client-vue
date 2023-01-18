<template>
  <div id ="edrm-empty-body">
  <Layoutscript></Layoutscript>
  <router-view></router-view>
  <dialogs-wrapper wrapper-name="empty-layout" />
  </div>

</template>

<script>
import Layoutscript from '@/views/LayoutScript'

export default {
  name: "EmptyLayout",
  components: {
    Layoutscript,
  },
  watch: {
    $route: function() {
      if (this.$store.state.show !== 'success') this.$store.commit('closeHovers')
    }
  },
  mounted() {
  },
  methods : {
  }
};
</script>

<style>

#edrm-empty-body {
  height: 100%;
}
</style>
