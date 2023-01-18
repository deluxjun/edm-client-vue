<template>
  <el-container class="usergroup-class" :style="containerStyle">
    <script id="treeViewTemplate" type="text/kendo-ui-template">
      <span class="cursor">
        <i class="fa fa-users"></i>
        <span class='desGroup'>#: item.description#</span>
        #if(item.id!=null){#
        <span class='idGroup'>(#: item.id#)</span>
        #}#
      </span>
    </script>

    <el-aside v-show="showTree" :width="treeWidth">
      <el-container>
        <el-header v-show="showAssign" class="toolbar bg-purple-light">
          <el-button type="primary" icon="el-icon-plus" size="small" @click='createGroup'>{{ $t('label.add') }}</el-button>
        </el-header>
        <el-main>
          <kendo-treeview :id="treeWidgetId" ref="refTreeview"
            :data-source="treeDataSource"
            :data-text-field="'name'"
            @databound='onTreeDataBound'
            @select='onSelectTree' :auto-bind='false'
            :template='getTemplateScript()'>
          </kendo-treeview>
        </el-main>
      </el-container>
    </el-aside>
    <el-container class="height100 wdith100" v-show="showOnlyGroupTree">
      <el-header class="toolbar bg-purple-light">
        <el-button v-show="showUpdateUser" type="primary" icon="el-icon-plus" size="small" @click='createUser()'>{{ $t('label.add') }}</el-button>
        <el-button v-show="showAssign" type="primary" icon="el-icon-plus" size="small" @click='assignMember()'>{{ $t('label.assign') }}</el-button>
        
        <el-dropdown v-show="showSearch" @command="selectSearchType" trigger="click">
          <el-button size="small" type="info">
          <span class='selectType'>  {{$t('label.user')}}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <template v-for="item in searchList">
              <el-dropdown-item :command="item.id" >{{$t(item.text)}}</el-dropdown-item>
            </template>
          </el-dropdown-menu>
       </el-dropdown>
        <el-input v-show="showSearch" type="text" :placeholder="$t('buttons.search')" size="small" v-model="autoCompleteValue" @keydown.native="handleChange">
          <i class="el-icon-search el-input__icon" slot="prefix"></i>
          <i class="el-icon-circle-close-outline el-input__icon" slot="suffix" @click='resetSearch'></i>
        </el-input>
      </el-header>
      <el-main>
        <kendo-grid :id="widgetId" class="usergroup-grid height100" ref="usergroupGrid"
          :data-source='sharedDataSource()'
          :pageable-numeric='false' 
          :pageable-previous-next='false' 
          :pageable-messages-display='initMessage' 
          :pageable-refresh='false'
          :selectable="gridSelectable"
          :sortable='false' :resizable='true'
          :scrollable-endless='true'
          :auto-bind='false'
          :columns='gridColumns'
          :noRecords='emptyMessage'
          :height="gridHeight"
          @change='onChange'>
        </kendo-grid>
      </el-main>
    </el-container>
    <el-aside width="180px" v-if="showMemoryList">
      <el-header class="toolbar bg-purple-light" height="50px">
        {{$t('adminMenu.selectedlist')}}
      </el-header>
      <el-main>
      <div id="usergroupSelectedList">
        <div :key="data.id" v-for="data in selectedDataTag" class='boxlist'>
            <div v-if='data.type==0' class='view'><i class='fa fa-users'></i><span :title='data.description+"("+data.id+")"'>{{data.description}}({{ data.id }})</span></div>
            <div v-if='data.type==-1' class='view'><i class='fa fa-user'></i><span :title='data.name+"("+data.id+")"'>{{data.name}}({{ data.id }})</span></div>
            <div class='viewdel' @click="handleRemoveManager(data)"><i class="el-icon-error"></i></div>
        </div>
      </div>
      </el-main>
    </el-aside>
    </el-container>
</template>

<script>
import Vue from "vue";

import { mapGetters, mapState, mapMutations } from "vuex";
import { Grid, GridInstaller } from "@progress/kendo-grid-vue-wrapper";
import {
  TreeView,
  TreeViewItem,
  TreeViewInstaller
} from "@progress/kendo-treeview-vue-wrapper";

import listMixin from "./ListGridCommonMixin";

import Constants from '../Constants'
import * as api from "@/utils/api";

import { create } from 'vue-modal-dialogs'
import SelectUserGroupDialog from './SelectUserGroupDialog'
import CreateEditGroupDialog from '@/admintool/groupDialog'
import DeleteDialog from '@/admintool/deleteDialog'
import Utils from '@/utils/utils'

const userGroupDialog = create(SelectUserGroupDialog)
const groupDialog = create(CreateEditGroupDialog)
const deleteDialog = create(DeleteDialog)

Vue.use(GridInstaller);
Vue.use(TreeViewInstaller);

export default {
  name: "usergroup",
  mixins: [listMixin],
  components: {
    Grid
  },
  props: {
    viewType: {
      default: Constants.VIEW_TYPES.GROUP,
      type: String
    },
    widgetId: {
      default: 'user',
      type: String
    },
    treeWidth: {
      default: '250px',
      type: String
    },
    tableWidth:{
      default: '100%',
      type: String
    },
    containerHeight: {
      default: '100%',
      type: String
    },
    containerWidth: String,
    gridSelectable: {
      default: '',
      type: String
    },
    AdminPage: {
      default: false,
      type: Boolean
    },
    memoryList:{
      default: false,
      type: Boolean
    }
  },
  data: function () {
      return {
        treeDataSource: api.getTreeDataSource(`${store.state.baseURL}/json/listGroup?includeSystem=`+this.AdminPage, 'id', true, 'list'),
        grid: null,
        gridInitialized: false,
        autoCompleteValue : '',
        timer : null,
        parentId : null,
        searchType : 'user',
        templateScript : null,
        treeWidget : null,
        groupId : null,
        gridColumns : null,
        searchState: false,
        emptyMessage:{template: "<br><center>" + i18n.t('label.group_empty') + "</center>" },
        searchList: [
           {id: 'user', text: 'label.user', icon: 'fa fa-user'},
           {id: 'group', text: 'label.group', icon: 'fa fa-group'},
        ],
        selectedDataTag:[],
      }
  },
  computed: {
    ...mapState(['user']),
    treeWidgetId() {
      return this.widgetId + '-tree'
    },
    showTypeIcon() {
      return this.viewType != Constants.VIEW_TYPES.USER
    },
    showAssign : function() {
      return this.viewType == constants.VIEW_TYPES.GROUP && this.isAdmin
    },
    showGroupPath : function() {
      return this.viewType == constants.VIEW_TYPES.USER || this.viewType == constants.VIEW_TYPES.SEL_USERGROUP || this.viewType == constants.VIEW_TYPES.SEL_USER || this.viewType == constants.VIEW_TYPES.SEL_GROUP
    },
    showTree : function() {
      return this.viewType == constants.VIEW_TYPES.GROUP || this.viewType == constants.VIEW_TYPES.SEL_USERGROUP || this.viewType == constants.VIEW_TYPES.SEL_USER || this.viewType == constants.VIEW_TYPES.SEL_GROUP || this.viewType == constants.VIEW_TYPES.SEL_GROUP_TREE
    },
    showSearch () {
      return this.viewType != constants.VIEW_TYPES.GROUP || this.viewType == constants.VIEW_TYPES.GROUP && this.isAdmin
    },
    showUpdateUser() {
      return this.viewType == constants.VIEW_TYPES.USER && this.isAdmin
    },
    showOnlyGroupTree(){
      return this.viewType != constants.VIEW_TYPES.SEL_GROUP_TREE
    },
    showSEL_GROUP(){
      return this.viewType == constants.VIEW_TYPES.SEL_GROUP
    },
    showDoubleClick(){
      return this.viewType == constants.VIEW_TYPES.SEL_USERGROUP || this.viewType == constants.VIEW_TYPES.SEL_USER || this.viewType == constants.VIEW_TYPES.SEL_GROUP
    },
    showMemoryList(){
      return this.memoryList; 
    },
    isAdmin () {
      return this.user.isAdmin
    },
    grid_commands() {
      let currentVue = this
      let commands = []
      if (currentVue.showUpdateUser) {
        commands.push({ name:'edit', text: this.$t('label.edit'), click: (e) => {this.editUser(e)}})
        commands.push({ name:'remove', text: this.$t('label.remove'), iconClass: "k-icon k-i-close", click: (e) => {this.removeUser(e)}})
      } else if(currentVue.showAssign){
        commands.push({name:'unassign', text: this.$t('label.unassign'), iconClass: "k-icon k-i-minus setUnassign", click: (e) => {this.unassignMember(e)}})
        commands.push({name:'edit', text: this.$t('label.edit'), iconclass: "k-icon k-i-edit", click: (e) => { console.log(e);this.editGroup(e)}})
        commands.push({name:'remove', text: this.$t('label.remove'), iconClass: "k-icon k-i-close", click: (e) => {this.removeGroup(e)}})
      }
      return commands
    },
    containerStyle () {
      return 'height: ' + this.containerHeight + ';'
    },
    gridTemplate() {
      if(this.viewType == constants.VIEW_TYPES.SEL_GROUP){
            let templates = [
          // type
          ' <i class="fa fa-users"></i> ' ,
          // id
            '#=id#' ,
          // name
            '#=description#',
            '',
          ];
          return templates
      }else{
          let templates = [
            // type
            "# if(data.type != undefined && data.type != 0) { # " +
              '<i class="fa fa-user"></i>' +
            '# } else { #' +
               ' <i class="fa fa-users"></i> ' +
            '# } #',
            // id
            '#=id#',
            // name
            '# if (data.type != undefined && data.type != 0) { # ' +
              '#=name#'+
            '# } else { #' +
               '#=description#' +
            '# } # ',
            // path
            '# if (data.parentGroupNamePath != undefined) { #' +
              '#= Utils.makeGroupPath(parentGroupNamePath) #' +
            '# } #',
            // space
            '# if (volume_info) {#'+
              '# if (volume_info.maxSpace && volume_info.spaceLeft) {#'+
                '#: parseFloat(((volume_info.maxSpace-volume_info.spaceLeft)/volume_info.maxSpace*100).toFixed(2))#% (#: Utils.volumeFormat(volume_info.maxSpace-volume_info.spaceLeft)#/#: Utils.volumeFormat(volume_info.maxSpace)# GB)'+
              '#}#'+
            '#}#',
            // acitivity
            "# if(data.enabled) { # " +
              ' <i class="el-icon-success color-success"></i> ' +
            '# } else { #' +
              '<i class="el-icon-question color-warning"></i>' +
            '# } #',
            // Manager exist
            "# if(Utils.existManager(data)) { # " +
              ' <i class="fa fa-flag" title="#: i18n.t("adminMenu.group_manager") #"></i> ' +
            '# } #'
          ];
          return templates
      }
    },
  },
  mounted () {
    this.init()
    this.initColumns()

    if (this.containerHeight === '100%') {
      // resize
      $(window).resize(() => {
        this.resizeGrid();
      })
    }

    Event.off(EventList.PROFILE_REFRESH)
    Event.listen(EventList.PROFILE_REFRESH, this.loadData)

    //kendo grid double click
    if(this.showDoubleClick){
      $("#"+this.widgetId).on("dblclick", "tr.k-state-selected", function (e) {
           Event.fire(EventList.USERGROUP_DOUBLECLICK);
      })
    }
  },
  methods: {
    resizeGrid() {
        var gridElement = $("#"+ this.widgetId);
        var dataArea = gridElement.find(".k-grid-content");
        var newHeight = gridElement.parent().innerHeight() - 2;
        var diff = gridElement.innerHeight() - dataArea.innerHeight();
        gridElement.height(newHeight);
        dataArea.height(newHeight - diff);
    },
    gridHeight(){
      var gridElement = $("#"+ this.widgetId);
      var newHeight = gridElement.parent().innerHeight() - 2;
      return newHeight;
    },
    initColumns() {
      this.gridColumns = []
      if (this.showTypeIcon){
        if(this.AdminPage){
          this.gridColumns.push({ template: this.gridTemplate[6], width: 40 })
        }
        this.gridColumns.push({ template: this.gridTemplate[0], width: 40 })
      }
      this.gridColumns.push({ template: this.gridTemplate[1], title: this.$t('label.id'), width: 100 })
      this.gridColumns.push({ template: this.gridTemplate[2], title: this.$t('label.name'), width: 120 })
      if (this.showGroupPath)
      this.gridColumns.push({ template: this.gridTemplate[3], title: this.$t('label.group') })
      if (this.showUpdateUser)
      this.gridColumns.push({ template: this.gridTemplate[4], title: this.$t('label.space'), width: 200})
      if (this.user.isAdmin)
        if(this.viewType==constants.VIEW_TYPES.USER){
          this.gridColumns.push({ template: this.gridTemplate[5],  title: this.$t('label.user_state'), width: 60 })
        }
        if(this.AdminPage){
          this.gridColumns.push({ title: '&nbsp;', command: this.grid_commands, width: 170 })
        }

      return this.gridColumns
    },
    getTemplateScript() {
      if (!this.templateScript)
        this.templateScript = $('#treeViewTemplate').html()
      return this.templateScript
    },
    // common
    calcTotal(response) {
      // listGroupAndUser 는 현재 paging/more 지원하지 않기때문에 그대로 리턴
      if (response.moreData === undefined){
        this.moreData = false
        this.totalCount = response.totalCount
      } else {
        this.moreData = response.moreData
        this.totalCount = response.totalCount - 1
      }
      return this.totalCount
    },
    getNewDataSource() {
        let vue = this
        return new kendo.data.DataSource({
            transport: {
                read: {
                    url: `${store.state.baseURL}/json/listGroupAndUser?includeSystem=`+this.AdminPage,
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    beforeSend: function(req) {
                        console.log(req);
                        req.setRequestHeader('Authorization', `Bearer ${Utils.getCookie('auth')}`);
                    },
                    complete : this.onDataBound
                }
            },
            schema: {
                model: {id:"id"},
                total : function(response) {
                  return vue.calcTotal(response)
                }, data: 'list'
            },
            serverPaging : true, serverFiltering : false, serverSorting : false, page : 1, pageSize : vue.viewOption.pageSize,
        })
    },
    async createGroup() {
      // TODO: open createGroup dialog
      const result = await groupDialog({
          type: Constants.ADMINMENU.CREATE,title: this.$t('adminMenu.group_create'), width: '35%', containerHeight: '200px',
          parentId_prop : this.groupId
      });
      if(result){
        this.loadData()
        this.refreshSelectedTreeNode()
      }
    },
    async editGroup(e) {
      // TODO: open editGroup dialog
      let node = $(e.target).closest('tr')
      let dataItem = this.grid.dataItem(node)
      console.log(dataItem);
      if (dataItem && dataItem.id) {
        if(dataItem.type!=0){
          this.editUser(e);
        }else{
          let param ={
              type: Constants.ADMINMENU.EDIT,title: this.$t('adminMenu.group_edit'),
              width: '35%', ontainerHeight: '200px',
              groupId_prop : dataItem.id, parentId_prop : dataItem.parentId,
              attr_prop: dataItem.attrList, desc_prop : dataItem.description
          }
          const result = await groupDialog(param);
          if(result){
            this.loadData()
            this.refreshSelectedTreeNode()
          }
        }
      }
    },
    async createUser() {
      let data={type: Constants.ADMINMENU.CREATE,title: this.$t('adminMenu.user_create'), width: '50%', containerHeight: '600px' }
      Event.fire(EventList.PROFILE, data)
    },
    requestCompleted(param) {
      this.$notify({
        title: this.$t('label.success'),
        message: this.$t('messages.completed'), type: 'success'
      })
      this.loadData()
      if(param!=true){
        this.refreshSelectedTreeNode()
      }
    },
    async assignMember() {
      console.log('assign clicked')
      const result = await userGroupDialog({
        type: Constants.VIEW_TYPES.SEL_USERGROUP, title: this.$t('messages.selectUserAndGroup'), width: '80%', containerHeight: '600px',
        gridSelectable: Constants.SELECTABLE.MULTIPLE
      })
      if (process.env.NODE_ENV === 'development') {
        console.log('selected data is..')
        console.log(result)
      }
      if (result) {
        api.assignMembers(this.groupId, result)
        .then(data => { this.requestCompleted();
        })
        .catch((error) => {
              console.log(error);
        })
      }
    },
    refreshSelectedTreeNode() {
      // refresh tree
      let selectedNode = this.treeWidget.select();
      if (selectedNode) {
        let selectedDataItem = this.treeWidget.dataItem(selectedNode);
        if (selectedDataItem) {
          selectedDataItem.loaded(false);
          selectedDataItem.load();
          this.treeWidget.select(selectedNode);
        }
      }
    },
    // TODO: 20180413 여기서부터....
    async unassignMember(e) {
      let node = $(e.target).closest('tr')
      let dataItem = this.grid.dataItem(node)
      if (dataItem && dataItem.id) {
          console.log(dataItem);
          if(dataItem.type!=0){
            const result = await deleteDialog({
              title: this.$t('label.unassign'), width: '30%', containerHeight: '400px',
              targetParentId: dataItem.parentId,
              target_prop: dataItem.name, targetId_prop: dataItem.id, targetType_prop: ''+dataItem.type+'',
              btnType :  Constants.ADMINMENU.UNSSIGN,
            });
            if(result){
              api.unassignMembers(this.groupId, result.id, result.type)
              .then(data => { this.requestCompleted();
              })
              .catch((error) => {
                    console.log(error);
              })
            }
          }else{
            console.log(dataItem);
            const result = await deleteDialog({
              title: this.$t('label.unassign'), width: '30%', containerHeight: '400px',
              targetParentId: dataItem.parentId,
              target_prop: dataItem.description, targetId_prop: dataItem.id, targetType_prop: ''+dataItem.type+'',
              btnType :  Constants.ADMINMENU.UNSSIGN,
            });
            if(result){
              console.log(result.type);
              api.unassignMembers(this.groupId, result.id, result.type)
              .then(data => { this.requestCompleted();
              })
              .catch((error) => {
                    console.log(error);
              })
            }
          }
      }
    },
    async removeUser(e) {
      let node = $(e.target).closest('tr')
      let dataItem = this.grid.dataItem(node)
      if (dataItem && dataItem.id) {
          console.log(dataItem);
          const result = await deleteDialog({
              title: this.$t('label.remove'), width: '30%', containerHeight: '400px',
              target_prop: dataItem.name, targetId_prop: dataItem.id,
              btnType :  Constants.ADMINMENU.DELETE,
          });
          if(result){
            console.log(result);
            api.deleteUser(result.id)
            .then(data => { this.requestCompleted();
            })
            .catch((error) => {
                  console.log(error);
            })
          }
      }
    },
    async removeGroup(e) {
      let node = $(e.target).closest('tr')
      let dataItem = this.grid.dataItem(node)
      if (dataItem && dataItem.id) {
          console.log(dataItem);
          if(dataItem.type!=0){
            this.removeUser(e);
          }else{
            const result = await deleteDialog({
                title: this.$t('label.remove'), width: '30%', containerHeight: '400px',
                target_prop: dataItem.name, targetId_prop: dataItem.id,
                btnType :  Constants.ADMINMENU.DELETE,
            });
            if(result){
              api.deleteGroup(result.id)
              .then(data => { this.requestCompleted();
              })
              .catch((error) => {
                    console.log(error);
              })
            }
          }
      }

    },
    async editUser(e) {
      console.log('edit(vue) clicked')
      let node = $(e.target).closest('tr')
      let dataItem = this.grid.dataItem(node)
      if (dataItem && dataItem.id) {
         let data={type: Constants.ADMINMENU.EDIT,title: this.$t('adminMenu.user_edit'), width: '50%', containerHeight: '400px', userName_prop: dataItem.userName}
         Event.fire(EventList.PROFILE, data)
      }
    },
    // tree select
    onSelectTree: function(ev) {
      let node = ev.node;
      let dataItem = ev.sender.dataItem(node);
      console.log("Event select :: " + dataItem.id);
      ev.sender.expand(node);
      this.searchState=false
      this.$Utils.displayhidden('class','k-grid-unassign',false);
//      this.treeWidget.select(ev.node);
        // if(item.id==null){
        //   changeUserList("root",item.id);
        // }else{
        //   changeUserList("group",item.id);
        // }
      this.groupId = dataItem.id
      this.$emit('selected', dataItem)
      //this.$emit('selected', [])
      this.loadData()
      // this.search(dataItem.id )

    },

    handleChange(e) {
      clearTimeout(this.timer);
      if (e.keyCode === 13) {
        this.search(e.target.value);
      } else {
        if (Utils.isSearchableKey(e.keyCode))
          this.timer = setTimeout(() => this.search(e.target.value), 500);
      }
    },
    // autocomplete search
    search(value) {
      // TODO: search
      if (this.searchType === 'user') {
        let dataSource = this.sharedDataSource()
        dataSource.transport.options.read.url = `${store.state.baseURL}/json/pagingUsersByIdOrName?userName=`+encodeURI(value)+`&moreData=true`;
        dataSource.query({ page: 1, pageSize: this.viewOption.pageSize, orderBy:store.state.viewOption.orderBy, dir:'asc' });
      }
      if (this.searchType === 'group') {
        let dataSource = this.sharedDataSource()
        //dataSource.transport.options.read.url = `${store.state.baseURL}/json/pagingGroupsByName?groupName=${value}&moreData=true`;
        dataSource.transport.options.read.url = `${store.state.baseURL}/json/pagingGroupsByName?groupName=`+encodeURI(value)+`&moreData=true`;
        dataSource.query({ page: 1, pageSize: this.viewOption.pageSize, orderBy:store.state.viewOption.orderBy, dir:'asc' });
      }
      this.autoCompleteValue = value
      this.searchState=true
      this.$Utils.displayhidden('class','k-grid-unassign',true);
    },
    loadData() {
      // user정보만 표시하면 무시
      if (this.viewType == constants.VIEW_TYPES.USER) {
        this.search(this.autoCompleteValue)
        return
      }

      let dataSource = this.sharedDataSource()

      let parentId = ''
      if (this.groupId) {
        parentId = this.groupId
      }
      if (this.viewType == constants.VIEW_TYPES.SEL_USER) {
        dataSource.transport.options.read.url = `${store.state.baseURL}/json/listGroupAndUser?groupId=${parentId}&onlyUser=true&includeSystem=`+this.AdminPage;
      }else if (this.viewType == constants.VIEW_TYPES.SEL_GROUP) {
        dataSource.transport.options.read.url = `${store.state.baseURL}/json/listGroup?id=${parentId}&includeSystem=`+this.AdminPage;
      } else {
        dataSource.transport.options.read.url = `${store.state.baseURL}/json/listGroupAndUser?groupId=${parentId}&moreData=true&includeSystem=`+this.AdminPage;
      }
      dataSource.query({ page: 1, pageSize: this.viewOption.pageSize, orderBy:store.state.viewOption.orderBy, dir:'asc' });

    },
    resetSearch() {
      this.autoCompleteValue = ''
      this.search('')
    },
    onTreeDataBound: function(ev) {
      console.log("Event :: tree dataBound");
    },
    onDataBound: function(ev) {
      // kendo 버그로 직접 갱신
      if ($(".usergroup-grid .k-pager-info")[0])
        $(".usergroup-grid .k-pager-info")[0].textContent = this.getPageMessage()

      if(this.searchState){
        this.$Utils.displayhidden('class','k-grid-unassign',true);
      }else{
         this.$Utils.displayhidden('class','k-grid-unassign',false);
      }
      // set grid status message
      // if (this.$refs.usergroupGrid) {
      //   this.$refs.usergroupGrid.kendoWidget().pager.options.messages.display = this.getPageMessage();
      // }
    },
    // grid selection changed
    onChange(e) {
      var selectedRows = this.grid.select();
      var selectedDataItems = [];
      var selectedDataTagId=[];

      if(this.showMemoryList){
        for(var i = 0; i < this.selectedDataTag.length; i++){
          selectedDataTagId.push(this.selectedDataTag[i].id);
        }
      }

      for (var i = 0; i < selectedRows.length; i++) {
        var dataItem = this.grid.dataItem(selectedRows[i]);
        selectedDataItems.push(dataItem);
        // 보내기전 
        if(this.showMemoryList){
          if(selectedDataTagId.indexOf(dataItem.id)==-1){
            this.selectedDataTag.push(dataItem);
          }
        }
      }

      if(this.showMemoryList){
        this.$emit('selected', this.selectedDataTag)
      }else{
        this.$emit('selected', selectedDataItems)
      }
      
    },
    onTreeExpandComplete (e) {

    },
    selectSearchType(cmd){
      this.searchType=cmd
      $(".selectType").html(""+this.$t("label."+cmd));
    },
    handleRemoveManager(data){
      this.selectedDataTag.splice(this.selectedDataTag.findIndex(e => e === data), 1);
    },
    init() {
      this.pageNum = 1;
      let vue = this;
      if (!this.gridInitialized) {
        //grid
        if(this.showOnlyGroupTree){
          this.grid = this.$refs.usergroupGrid.kendoWidget() // $("#"+this.widgetId).data("kendoGrid");
          // $("#"+this.widgetId).dblclick(this.select);
          this.gridInitialized = true;
        }
        // tree
        if (this.showTree) {
          this.treeDataSource.add({"id": null,"name": "/","description": "/"});
          this.treeDataSource.bind();
          // load root and select
          this.treeWidget = $("#" + this.treeWidgetId).data("kendoTreeView");
          this.treeWidget.expandPath([null], this.onTreeExpandComplete);
          var dataItem = this.treeDataSource.get(null);
          var node = this.treeWidget.findByUid(dataItem.uid);
          this.treeWidget.select(node);
        }

        //할당해제 이벤트

        //오직 그룹 선택시 그룹 검색 영역 설정
        // if(this.showSEL_GROUP){
        //   this.searchType='group'
        // }
      }
    }
  }
};
</script>

<style lang="scss">
.usergroup-class .el-header, .usergroup-class .el-footer {
    line-height: 50px;
  }

.usergroup-class .el-input {
    min-width: 200px;
    width: auto;
  }

  .height100 {
    height: 100%;
  }
  .wdith100{
    width: 100% !important;
  }

  .usergroup-class {
    //height: 100%;
  }
  // .usergroup-class .el-main .k-grid  {
  //   height: calc(100% - 2px);
  // }
  .toolbar {
    margin-left: 5px;
    margin-right: 5px;
    margin-bottom: 5px;
    border-radius: 4px;
  }
  .usergroup-grid {
    padding-left: 5px;
    padding-right: 5px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }

  .usergroup-grid td {
    text-align: center;
  }

  ul.groupPath {
    font-family: FontAwesome;
  }

  ul.groupPath li:before{
      content:"\f105 ";
      font-size:15px;
      vertical-align:middle;
  }
  ul.groupPath li span {
      padding: 0 5px;
  }
  .color-success{
    color: #67C23A;
  }
  .color-warning{
    color: #E6A23C;
  }
  .space{
    margin-right: 5px;
  }
  #usergroupSelectedList .boxlist{
    width: 165px;
    border-bottom: 1px solid #ccc;
    margin-left: 2px;
    height: 30px;
  }
  #usergroupSelectedList i{
    margin-right: 5px;
    font-size: 10pt
  }
  #usergroupSelectedList .view{
    width: 120px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 10pt;
    margin-left: 5px;
    float:left;
  }
  #usergroupSelectedList .viewdel{
    float: right;
    cursor: pointer;
  }
  .usergroup-class .el-header{
    height: 42px !important;
    line-height: 40px !important;
  }
  .usergroup-class input{
    height: 30px !important;
  }
  .usergroup-class .el-dropdown{
    margin-left: -15px !important;
  }
</style>
