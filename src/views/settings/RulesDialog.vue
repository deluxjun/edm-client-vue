<template>
    <!-- <el-dialog ref="windowRef" :top="top" :title="$t('label.manageRule')" :width='width' :before-close="onClose" :visible.sync="dialogVisible" :fullscreen="true" v-draggable> -->
    <el-dialog ref="windowRef" :title="$t('label.manageRule')" :before-close="onClose" :visible.sync="dialogVisible" :fullscreen="true" >
      <rules :containerHeight='containerHeight' :elementId="elementId">
      </rules>
    </el-dialog>


</template>

<script>
export default {
  name: 'RulesDialog',
  props: {
    width: {
      default: '80%',
      type: String
    },
    containerHeight: {
      default: '100%',
      type: String
    },
    elementId: {
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
      top : '50px'
    }
  },
  components : {
    'rules' : () => import('./Rules.vue')
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

</style>
