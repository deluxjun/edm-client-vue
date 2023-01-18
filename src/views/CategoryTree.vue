<template id="categoryTempl">
  <div id="category-tree">
    <script id="cateTreeViewTemplate" type="text/kendo-ui-template">
      <span class="cursor">
        <i class="k-icon k-i-categorize"></i>
        <span class='desGroup'>
          #=item.name# (#= item.description#)
        </span>
      </span>
    </script>
    <el-container >
      <!-- <el-header v-show="showAssign" class="toolbar bg-purple-light" height="50px">
        <el-button type="primary" icon="el-icon-plus" size="small" @click='createCategory'>{{ $t('label.add') }}</el-button>
        <span v-if="this.action==true" class="edit-del-btn">
          <el-button type="primary" icon="el-icon-edit" size="small" @click='editCategory'>{{ $t('label.edit') }}</el-button>
          <el-button type="danger" icon="el-icon-close" size="small" @click='deleteAndClose'>{{ $t('buttons.delete') }}</el-button>
        </span>
      </el-header> -->
      <el-main :style="containerStyle">
        <kendo-treeview id="categoryTree" ref="categoryTree"
                        :data-source="treeDataSource"
                        :data-text-field="'name'"
                        @databound='onTreeDataBound'
                        @select='onSelectTree' :auto-bind='false'
                        :template='getTemplateScript()'>
        </kendo-treeview>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Vue from "vue";
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import Constants from '../Constants'

import { TreeView,
        TreeViewItem,
        TreeViewInstaller } from '@progress/kendo-treeview-vue-wrapper'
Vue.use(TreeViewInstaller);
import { create } from 'vue-modal-dialogs'
import setcategoryDialog from '@/admintool/categoryDialog'
import DeleteDialog from '@/admintool/deleteDialog'

const categoryDialog = create(setcategoryDialog)
const deleteDialog = create(DeleteDialog)

export default {
  name: "category",
  components: {
    TreeView
  },
  props: {
    containerHeight: {
      default: '100%;',
      type: String
    },
  },
  data: () => ({
    categories: [],
    childdialogVisable:false,
    treeDataSource: api.getTreeDataSource(`${store.state.baseURL}/json/getCategories`, 'id', true, 'list'),
    categoryTree: null,
    templateScript : null,
    parentId: 'Categories      ',
    eclassId: '',
    eId:'',
    desc: '',
    action: false,
    setParentId: 'Categories      ',
  }),
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
  },
  components: {
  },
  mounted () {
    this.init()
  },
  methods: {
    init(){
          console.log(this.treeDataSource);
          this.treeDataSource.add({"id": null,"name": "/","description": "","parentId":'Categories      '});
          this.treeDataSource.bind();
          // // load root and select
          this.treeWidget = $("#categoryTree").data("kendoTreeView"); 
          this.treeWidget.expandPath([null], this.onTreeExpandComplete);
          var dataItem = this.treeWidget.dataSource.get(null);
          var node = this.treeWidget.findByUid(dataItem.uid);
          this.treeWidget.select(node)
    },
    getTemplateScript() {
      if (!this.templateScript)
          this.templateScript = $('#cateTreeViewTemplate').html()
          return this.templateScript
    },
    onTreeExpandComplete (e) {
        console.log("펼치기 성공");
    },
    onTreeDataBound: function(ev) {
      console.log("Event :: tree dataBound");
    },
    setData(data){
      this.categories = data
    },
    showModal(e) {
      this.childdialogVisable=true
    },
    handleCloseChild(){
      this.categories = this.categories.filter(function(category) {
        return !category.isNew
      })
      this.childdialogVisable=false
    },
    onDataBound: function(ev) {
    },
    onSelectTree: function(ev) {
      let node = ev.node;
      let dataItem = ev.sender.dataItem(node);

      ev.sender.expand(node)
      ev.sender.select(ev.node);
      this.$emit('selected', {eclassId: dataItem.name, desc: dataItem.description})
      this.parentId=dataItem.parentId
      this.eclassId=dataItem.name
      this.desc=dataItem.description
      this.eId=dataItem.id
      this.action=true
    },
    async createCategory() {
          //parentId
          if(this.action){
            this.setParentId=this.eclassId
          }
          const result = await categoryDialog({
              title: this.$t('adminMenu.category_Create'), width: '30%', containerHeight: '400px',
              parentId_prop: this.setParentId, eclassId_prop: '',desc_prop: ''
          });
          if(result){
            api.createEclass(result.parentId,result.eclassId,result.desc)
            .then(data => { 
              var tree=$("#categoryTree").data("kendoTreeView");
              var node = tree.select();
              var dataSet = tree.dataItem(node);
              var dataItem = tree.dataSource.get(dataSet.id);
              var findNode = tree.findByUid(dataItem.uid);
              tree.dataItem(findNode).loaded(false);
              tree.dataItem(findNode).load();
            })
            .catch((error) => {
                  console.log(error); 
            })
          }
    },
    async editCategory() {
          const result = await categoryDialog({
              title: this.$t('adminMenu.category_Edit'), width: '30%', containerHeight: '400px',
              parentId_prop: this.parentId, eclassId_prop: this.eclassId,desc_prop: this.desc
          });
          if(result){
            api.createEclass(result.parentId,result.eclassId,result.desc)
            .then(data => { this.requestCompleted();
            })
            .catch((error) => {
                  console.log(error); 
            })
          }
    },
    async deleteAndClose(){
          const result = await deleteDialog({
              title: this.$t('label.remove'), width: '30%', containerHeight: '400px',
              target_prop: this.desc, targetId_prop: this.eclassId,
              btnType :  Constants.ADMINMENU.DELETE,
          });
          if(result){
            api.deleteCategory(result.id)
            .then(data => { this.requestCompleted();
            })
            .catch((error) => {
                  console.log(error); 
            })
          }
    },
    requestCompleted(){
            console.log("성공");
            this.$notify({
                title: this.$t('label.success'),
                message: this.$t('messages.completed'), type: 'success'
            })
            this.refreshSelectedTreeNode();
    },
    refreshSelectedTreeNode() {
        // refresh tree  
        if(this.action){
          this.categoryTree = $("#categoryTree").data("kendoTreeView");
          let selectedNode = this.categoryTree.select();
          if (selectedNode) {
            let selectedDataItem = this.categoryTree.dataItem(selectedNode);
            let parentNode = selectedDataItem.parentNode()
            parentNode.loaded(false);
            parentNode.load();

            console.log(selectedDataItem);
            var node = this.categoryTree.findByUid(selectedDataItem.uid); 
            this.categoryTree.select(node);
            this.categoryTree.expand(node);
            //console.log("왜안되");
          }
        }else{
           this.categoryTree = $("#categoryTree").data("kendoTreeView");
           let selectedNode = this.categoryTree.select();
           let selectedDataItem = this.categoryTree.dataItem(selectedNode);
           selectedDataItem.loaded(false);
           selectedDataItem.load();
        }
       
    },
  },
}
</script>

<style>
#category-tree .el-header, #category-tree .el-footer {
  /* line-height: 50px; */
}
.edit-del-btn{
  float: right;
}
#category-tree .bg-purple-light {
    background: #e5e9f2;
    padding: 5px;
    height: inherit !important;
}
</style>