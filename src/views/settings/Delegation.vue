<template id="boxTempl">
<el-dialog ref="windowRef" :title="$t('label.manageDelegation')" top="5vh" 
    :width="width" :before-close="onClose" :visible.sync="dialogVisible" v-draggable>
  <div id="box-tree" :style="{'max-height': containerHeight}" class="rules" v-loading="isLoading">
    <script id="boxTreeViewTemplate" type="text/kendo-ui-template">
      <span class="cursor">
        <span class='desGroup'>
           <i class='fa fa-folder treeFolderIcon'></i>
          #: item.text #
        </span>
      </span>
    </script>
    <el-container >
      <el-header v-show="showAssign" class="toolbar bg-purple-light" height="50px">
        <span>{{ $t('messages.selectDocumentBox') }} </span>
        <span>{{ showSelectedFolder }} </span>
      </el-header>
      <el-main style="height: 500px;">
        <kendo-treeview id="boxTree" :data-source="remoteDataSource"
                :data-text-field="'text'"
                @databound='onDataBound'
                @select='onTreeSelect' :template="$Constants.TREEVIEW_TEMPLATE">
        </kendo-treeview>
      </el-main>
    </el-container>
    <el-container >
      <el-header v-show="showAssign" class="toolbar bg-purple-light" height="50px">
        <span>{{ $t('messages.selectOwner') }} </span>
      </el-header>    
      <el-main style="height: 50px;">
        <el-input :value="showOwner" class="label-custom" @click.native="selectOwner" readonly>
          <i class="el-icon-edit el-input__icon" slot="prefix"></i>
        </el-input>    
      </el-main>
    </el-container>
  </div>

<span slot="footer" class="dialog-footer">
  <el-button @click="onClose">{{ $t('buttons.close') }}</el-button>
  <el-button type="primary" @click="handleSave()" :disabled="!canSave">{{ $t('buttons.save') }}</el-button>
</span>

</el-dialog>  
</template>

<script>
import Vue from "vue";
import * as api from '@/utils/api'
import Constants from '@/Constants'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import { TreeView,
        TreeViewItem,
        TreeViewInstaller } from '@progress/kendo-treeview-vue-wrapper'
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import refProgressbar from '@/components/prompts/Progressbar'
import { create } from 'vue-modal-dialogs'

const userDialog = create(SelectUserGroupDialog)

Vue.use(TreeViewInstaller);

export default {
  name: "Delegation",
  components: {
    //'async-progressbar': () => import('@/components/prompts/Progressbar'),
    refProgressbar,
    TreeView,
  },
  props: {
    elementId : {
      required : true, // false for test
      type: String
    },
    containerHeight: {
      default: '600px',
      type: String
    },
    width: {
      default: '500px',
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
      isLoading: true,
      templateScript : null,
      selectedName: '',
      selectedEid: '',
      selectedOwner: {
        id: '',
        name: ''
      },
      requestReload: true,
      selectedFolder: '',
      remoteDataSource: api.getTreeDataSource(`${store.state.baseURL}/json/getTreeList2?rootId=Sites`, 'rid', true, 'list')
    }
  },
  computed: {
    ...mapState(['user']),
    isAdmin () {
      return this.user.isAdmin
    },
    showAssign : function() {
      return this.isAdmin
    },
    containerStyle () {
      return 'height: ' + this.containerHeight + ';'
    },
    showOwner() {
      if (this.selectedOwner.id)
        return Utils.getIdName(this.selectedOwner.id, this.selectedOwner.name)
      return ''
    },
    showSelectedFolder() {
      if (this.selectedName)
        return ' | ' + this.$t('messages.selected', {folder: this.selectedName})
      return ''
    },
    canSave() {
      return this.selectedName && this.selectedOwner.id
    }
  },
  components: {
  },
  mounted () {
  },
  methods: {
    async init() {

      this.isLoading = false
    },
    loadData(){
      var tree = $("#boxTree").data("kendoTreeView");
      tree.dataSource.read();
      this.isLoading = false;
    },
    getTemplateScript() {
      if (!this.templateScript)
          this.templateScript = $('#boxTreeViewTemplate').html()
          return this.templateScript
    },
    onTreeExpandComplete (e) {
        console.log(e);
        console.log("펼치기 성공");
    },
    onTreeDataBound: function(ev) {
      console.log("Event :: tree dataBound");
    },
    onDataBound: function(ev) {
      // 부서함 하위 팀 폴더는 CSS 적용
      let treeview = $("#boxTree").data("kendoTreeView");
      let childNodes = $(".k-item", ev.node)
      for (let index = 0; index < childNodes.length; index++) {
        const n = childNodes[index];
        let d = treeview.dataItem(n)
        if ( d && d.groupId )
          $(n).find('.k-in').addClass('tree-department')
      }      
    },
    postAction(){
      Event.fire(EventList.RELOAD_LIST);
      Event.fire(EventList.RELOAD_TREE, true);
      this.close();
    },    
    onTreeSelect: function(ev) {
      let node = ev.node;
      let dataItem = ev.sender.dataItem(node);
      if (dataItem) {
        ev.sender.select(ev.node);
        this.selectedName=dataItem.text
        this.selectedEid=dataItem.id
      }
      else
        this.selectedName = ''
    },
    requestCompleted(){
        this.$notify({
                    title: this.$t('label.success'),
                    message: this.$t('messages.completed'), type: 'success'
        })
    },
    
    async selectOwner() {
      const params = {
          type: Constants.VIEW_TYPES.SEL_USER,
          title: this.$t('messages.selectUser'),
          width: '80%',
          containerHeight: '600px',
          gridSelectable: Constants.SELECTABLE.ROW
      }
      const result = await userDialog(params)
      if (result) {
        console.log(result[0])
        this.selectedOwner = result[0];
      }
    },
    handleSave() {
      let copyList=[];
      copyList.push(this.elementId);

      if (!this.selectedEid || !this.selectedOwner.id)
        this.$showError(this.$t('messages.invalidData'))

      api.delegation(copyList,this.selectedEid, 'overwrite', this.selectedOwner.id).then(data=>{
        this.hide();
        Event.fire(EventList.SHOW_PROGRESS,data.actionId, true);
      }).catch(error=>{
        console.log(error);
      });

    },
    close(){
      if (this.dynamic)
        this.$close(null)
      else {
        this.dialogVisible=false;
        this.$store.commit('closeHovers')
      }

      if (this.requestReload) {
        Event.fire(EventList.RELOAD_LIST)
        this.requestReload = false
      }
    },
    hide(){
      this.dialogVisible=false;
    },

    onClose(e) {
      this.close();
    },

  },

  created() {
    this.init()
  }  
}
</script>

<style>
.edit-del-btn{
  float: right;
}
#box-tree .bg-purple-light {
    background: #e5e9f2;
    padding: 5px;
    height: inherit !important;
}
#box-tree .k-i-expand{
  /* //display : none !important; */
}
.icon-margin{
  margin-left:10px;
}
</style>