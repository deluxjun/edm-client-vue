<template>
    <el-dialog ref="windowRef" :top="top" :title="$t('prompts.permission')"
      width="800px"
      :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
      <security ref="security" v-bind="$props" :showButton="false" @closeRequested="closeRequested" @toggleButtons="toggleButtons">
      </security>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="apply" :disabled="!enableButtons['apply']">{{ $t('buttons.apply') }}</el-button>
        <el-button @click="requestCancel" :disabled="!enableButtons['close']">{{ $t('buttons.close') }}</el-button>
      </span>

    </el-dialog>


</template>

<script>
export default {
  name: 'SecurityDialog',
  props: {
    argElementIds: {
      type: Array
    },
    argElements: {
      type: Array
    },
    containerHeight:{
      default: '600px',
      type: String
    },
    argElementId: {
      type: String
    },
    dynamic: {  // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    },
    menus: Object,
  },
  data() {
    return {
      dialogVisible : true,
      enableButtons: true,
      top : '50px'
    }
  },
  components : {
    'security' : () => import('./SecurityManagementV2.vue')
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
    closeRequested(reload) {
      if (reload)
        Event.fire(EventList.RELOAD_LIST)
      this.close()
    },
    requestCancel(){
      this.$refs.security.requestCancel()
    },
    apply() {
      this.$refs.security.apply()
    },
    toggleButtons(param) {
      console.log('button toggle : ' + param)
      this.enableButtons = param
    }
  }
}
</script>

<style>

</style>
