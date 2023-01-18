<template>
    <!-- <kendo-window ref="windowRef" 
      :title="title" :modal="true" @close="onClose" style="display:none">
      <sel-usergroup :viewType='type' :widgetId="'selectUserGroup'" :containerStyle='containerStyle' @selected="onSelected"></sel-usergroup>
    </kendo-window> -->

    <el-dialog ref="windowRef" top="3vh" style='min-width:880px;'
      :title="title" :width='width' :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
      <sel-usergroup :viewType='type' :widgetId="'selectUserGroup'" 
        :containerHeight='containerHeight' 
        :gridSelectable='gridSelectable'
        :memoryList='showMemoryList'
        @selected="onSelected"></sel-usergroup>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="selectAndClose()" id="uploadBtn" :disabled="buttonDisabled">{{ $t('buttons.ok') }}</el-button>
        <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      </span>

    </el-dialog>
    

</template>

<script>
//import UserGroup from './UserGroup'


export default {
  name: 'UserGroupDialog',
  props: {
    title: String,
    type: String,
    width: {
      default: '50%',
      type: String
    },
    containerHeight: String,
    extra: Object,
    gridSelectable: String,
    memoryList:{
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      dialogVisible : false,
      selectedData: null
    }
  },
  components : {
    'sel-usergroup' : () => import('./UserGroup_new.vue')
  },
  mounted() {
    // var window = this.$refs.windowRef.kendoWidget();
    // window.center().open();
    this.dialogVisible = true
    Event.off(EventList.USERGROUP_DOUBLECLICK)
    Event.listen(EventList.USERGROUP_DOUBLECLICK, this.selectAndClose)
  },
  computed: {
    buttonDisabled() {
      return this.selectedData == null || this.selectedData.length < 1
    },
    showMemoryList(){
      console.log(this.memoryList);
      return this.memoryList; 
    },
  },
  methods : {
    onClose(e) {
      console.log('closed')
      this.$close(null)
    },
    onSelected(data) {
      console.log(data)
      this.selectedData = data
    },
    selectAndClose() {
      // this.close();
      this.$close(this.selectedData)
    }
  }
}
</script>

<style>

</style>