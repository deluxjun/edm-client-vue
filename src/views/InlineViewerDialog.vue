<template>
    <el-dialog id="inline-dialog" ref="windowRef" :title="''+object_name+'-'+$t('prompts.viewer')" :before-close="onClose" :visible.sync="dialogVisible" :fullscreen="true">
      <viewer :argElementId="elementId">
      </viewer>
    </el-dialog>
  

</template>

<script>
export default {
  name: 'ViewerDialog',
  props: {
    elementId: {
      required: true,
      type: String
    },
    object_name: {
      required: true,
      type: String
    },
    dynamic: {  // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      dialogVisible : true,
    }
  },
  components : {
    'viewer' : () => import('./InlineViewer.vue')
  },
  mounted() {
  },
  computed: {
  },
  methods : {
    onClose(e) {
      if (this.dynamic)
        this.$close(null)
      else
        this.$store.commit('closeHovers')
    },
  }
}
</script>

<style>
/* el-header 53px */
#inline-dialog .el-dialog__body {
  height: calc(100% - 53px);
}
</style>