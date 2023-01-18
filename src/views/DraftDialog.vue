<template>
    <el-dialog ref="windowRef" :top="top" :title="$t('buttons.draft')" :width='width' :before-close="onClose" :visible.sync="dialogVisible" :fullscreen="true" >
      <draft :argElementId="elementId" :argRewriteId="rewriteId" @closeRequested="closeRequested">
      </draft>

      <!-- <span slot="footer" class="dialog-footer">
        <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      </span> -->

    </el-dialog>


</template>

<script>
export default {
  name: 'DraftDialog',
  props: {
    width: {
      default: '80%',
      type: String
    },
    rewriteId: {
      default: null,
      type: String
    },
    elementId: {
      type: Array
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
    'draft' : () => import(/* webpackChunkName: "draft" */ './Draft.vue')
  },
  mounted() {
  },
  computed: {
  },
  methods : {
    onClose(e) {
      this.close()
    },
    close() {
      this.dialogVisible=false;
      if (this.dynamic)
        this.$close(null)
      else
        this.$store.commit('closeHovers')

    },
    closeRequested() {
      Event.fire(EventList.RELOAD_LIST)
      this.close()
    }
  }
}
</script>

<style>

</style>
