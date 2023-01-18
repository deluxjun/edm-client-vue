<template>

    <el-dialog ref="windowRef"
      :title="title" :width='width' :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
      <div>
      <listPrivGroup :elementId="elementId" @selectedList="onSelected"></listPrivGroup>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <!-- <el-button type="primary" icon="el-icon-plus" @click='createGroup' class='permissionGroupCreate'>{{ $t('label.permissionGroup-create') }}</el-button> -->
        <el-button type="primary" @click="selectAndClose()" id="uploadBtn" :disabled="buttonDisabled">{{ $t('buttons.ok') }}</el-button>
        <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
      </span>

    </el-dialog>
    

</template>

<script>
import Utils from '@/utils/utils'
import Constants from '@/Constants'
import GroupDialog from '@/admintool/groupDialog'


import { create } from 'vue-modal-dialogs'
const groupDialog = create(GroupDialog)

export default {
  name: 'listPrivGroupDialog',
  props: {
    title: String,
    elementId: String,
    width: {
      default: '50%',
      type: String
    },
  },
  data() {
    return {
      dialogVisible : false,
      selectedData: null
    }
  },
  components : {
    'listPrivGroup' : () => import('@/views/security/listPrivGroup.vue')
  },
  mounted() {
    this.dialogVisible = true
    console.log(this.selectedData);
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
      console.log(this.selectedData);
      this.$close(this.selectedData)
    },
    async createGroup(){
      let params = {
        type: constants.VIEW_TYPES.PERMISSION,
        title: this.$t('label.permissionGroup-create'),
        width: '40%',
        elementid: this.elementId
      }
      var results = await groupDialog(params)
      if (results) {
        Event.fire(EventList.PERMISSION_REUSE)
      }
    },
  }
}
</script>

<style>
.permissionGroupCreate{
  float: left;
}
</style>