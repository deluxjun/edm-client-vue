<template>
<div class='searchNotificationDIV'>
   <kendo-dropdownlist id="targetdrop" v-model.trim="targetAction" :data-source="targetActionList" data-text-field='name' :data-value-field="'id'" @change="changeTargetAction"></kendo-dropdownlist>
    <el-input :placeholder="''" class="alarmSearch" v-if="!selectedUserTab" v-model.trim="targetSearch" @keyup.native.enter="loadData(true)"></el-input>
    <el-input :placeholder="this.$t('messages.selectUser')" v-if="selectedUserTab" class="alarmSearch" v-model="tempName" :disabled="true">
      <el-button class='right-line' slot="append" icon="el-icon-search" @click="openUserPicker"></el-button>
      <el-button slot="append" icon="el-icon-error" @click="resetinput"></el-button>
    </el-input>
    <el-button type="primary" size="mini" @click="loadData(true)">{{ $t('buttons.search') }}</el-button>
    <div style="float:right">
    <el-button size="mini" @click="init(true)"><i class='el-icon-refresh'></i></el-button>
    <el-button size="mini" v-if="isAdmin&&selectedRow" @click="AddOpenUserPicker">{{ $t('buttons.add') }}</el-button>
    </div>
    <div class='searchAlarmTable' :style="{ height: dialogSearchGridHeight }">
      <div>
      <ag-grid-vue id="searchGrid" :style="{ height: dialogSearchGridHeight }"  class="ag-theme-balham ag-folderlist" :gridOptions="gridOptions" :selectionChanged="onSelectionChanged">
      </ag-grid-vue>
      </div>
      <div v-if="isAdmin">
        <ag-grid-vue id="searchGrid2" :style="{ height: dialogSearchGridHeight }" class="ag-theme-balham ag-userlist" :gridOptions="gridOptions2">
        </ag-grid-vue>
      </div>
    </div>
</div>
</template>
<script>
import {mapGetters, mapState} from 'vuex'
import {AgGridVue} from "ag-grid-vue";
import constants from '@/Constants'
import SelectUserGroupDialog from '@/views/SelectUserGroupDialog'
import { create } from 'vue-modal-dialogs'

const userGroupDialog = create(SelectUserGroupDialog)

export default {
  name: 'searchNotification',
  props: {
    title: String,
    dialogSearchGridHeight: {
      default: '800px',
      type: String
    },
    containerHeight: String,
  },
  computed: {
    ...mapState(['user']),
    isAdmin() {
      return this.user.isAdmin
    },
    userId() {
      return this.user.userId
    },
  },
  components:{
        AgGridVue
  },
  data: function () {
    return {
      elemetnid: '',
      targetAction: "doc",
      targetActionList : [
          { name: this.$t("files.folderName") ,id: "doc"}
      ],
      columnSize: 400,
      targetSearch: '',
      gridOptions:{                
                enableColResize: true,
                rowBuffer: 0,
                rowSelection: 'multiple',
                rowDeselection: true,
                columnDefs: [ //초기 기본값이 반드시 있어야함
                    {headerName: this.$t("files.folderName"), field: 'object_name',sort:'asc'},
                    {headerName: this.$t("label.path"), field: 'path' ,width:this.columnSize, width: 400},
                    {headerName: '', field: '', cellRenderer:this.editCellCreator, width: 100},
                ],
                getRowNodeId: function(data) { return data.r_object_id; },
                rowModelType: 'infinite',
                paginationPageSize: 50,
                cacheOverflowSize: 3,
                maxConcurrentDatasourceRequests: 1,
                infiniteInitialRowCount: 0,
                maxBlocksInCache: 60,
                enableServerSideSorting: false,
                overlayNoRowsTemplate: '',
                overlayLoadingTemplate:'<span style="padding: 10px; border: 1px solid #444; background: lightgoldenrodyellow;">'+i18n.t('files.loading')+'</span>'
      },
      gridOptions2:{                
                enableColResize: true,
                rowBuffer: 0,
                rowSelection: 'multiple',
                rowDeselection: true,
                columnDefs: [ //초기 기본값이 반드시 있어야함
                    {headerName: this.$t("label.user"), field: 'name' ,width: 150},
                    {headerName: '', field: '', cellRenderer:this.removeCellCreator},
                ],
                getRowNodeId: function(data) { return data.r_object_id; },
                rowModelType: 'infinite',
                paginationPageSize: 50,
                cacheOverflowSize: 3,
                maxConcurrentDatasourceRequests: 1,
                infiniteInitialRowCount: 0,
                maxBlocksInCache: 60,
                enableServerSideSorting: false,
                overlayNoRowsTemplate: '',
                overlayLoadingTemplate:'<span style="padding: 10px; border: 1px solid #444; background: lightgoldenrodyellow;">'+i18n.t('files.loading')+'</span>'
      },
      listOptions:{
                currentPage:1,
                dataCnt:100,
                folderId:null,
                sort:"name",
                desc:"asc",
      },
      searchRequest:false,
      userlistRequest:false,
      selectedEid: null,
      selectedRow: false,
      tempName : "",
      currentValue : "",
      selectedUserTab : false,
      targetActionPushAble : false,
    }
  },
  mounted() {
    this.init();
    Event.off(EventList.ALARM_RELEASE)
    Event.listen(EventList.ALARM_RELEASE, this.removeUser)
    Event.off(EventList.ALARM_USERRELEASE)
    Event.listen(EventList.ALARM_USERRELEASE, this.loadData)
  },
  methods:{
    init(refresh){
      if(refresh){
        this.targetSearch="";
        this.tempName="";
      }
      this.tableWidth();
      this.loadData();
      if(this.isAdmin&&!this.targetActionPushAble){
        this.targetActionList.push({ name: this.$t("adminMenu.history_user") ,id: "user"});
        this.targetActionPushAble=true;
      }
    },
    tableWidth(){
      if(this.isAdmin){
        $('.ag-folderlist').css("width",'68%');
        $('.ag-userlist').css("width","30%");
        this.columnSize=300
      }else{
        $('.ag-folderlist').css("width",'100%');
        this.columnSize=500
      }
    },
    loadData(searchAble,userlistAble,removeUserAble){
        this.resetPage();
        if(searchAble){
          this.searchRequest=true;
          //검색값 초기화
          this.selectedRow=false;
          if(this.isAdmin){
            this.gridOptions2.api.setDatasource({})
          }
          this.gridOptions.api.deselectAll();
          if(this.targetSearch==""){
            this.$showError(this.$t('search.alarminput'))
            return
          }
        }
        this.loadGridData(userlistAble,removeUserAble)   
                                  
    },
    loadGridData(userlistAble,removeUserAble){          
            var obj = this;            
            var dataSource = {
                rowCount: null, // behave as infinite scroll                
                getRows: function(params){
                    obj.gridOptions.api.showLoadingOverlay();
                    var currentPage = obj.listOptions.currentPage;
                    var requestFunc = null;
                    var requestOption={};
                    if(userlistAble){
                      requestFunc=obj.requestAlarmUserList;
                      requestOption={
                            folderId:obj.dialogFolderId,
                            currentPage:currentPage,
                            type:obj.rootId
                      }
                    }else{
                      requestFunc = obj.requestAlarmList;
                      requestOption={
                            folderId:obj.dialogFolderId,
                            currentPage:currentPage,
                            type:obj.rootId
                      }
                    }                  
                   
                    requestFunc(params,requestOption).then(data=>{
                        if(data.list.length==0&&removeUserAble){
                          Event.fire(EventList.ALARM_USERRELEASE,true);
                        }                       
                        // 막누를 때 리스트 로딩 안되고 비어있는 열들이 로딩될 때 다시 로드함
                        if(obj.listOptions.currentPage > 1 && data.list.length == 0 && ((data.totalCount -1) > data.list.length)) {                            
                            return false;
                        }

                        if(obj.listOptions.currentPage == 1){
                            if(data.list.length<=0){
                                obj.gridOptions.api.showNoRowsOverlay();
                                $(".ag-overlay-no-rows-center").html(constants.LISTGRID_EMPTY_MESSAGE_FACTORY(obj.rootId,obj.currentDir));
                                params.successCallback([], 0);
                                return;
                            }
                        } 

                        if(data.list.length>0){
                            obj.listOptions.currentPage = currentPage+1;
                        }

                        var lastRow = -1;
                        if (data.list.length<obj.listOptions.dataCnt) { //moreData로 확인불가(반환이 안되는 곳도 있음)
                            lastRow = (currentPage-1) * obj.listOptions.dataCnt + data.list.length;
                        }
                                                                                                          
                        params.successCallback(data.list, lastRow);
                        obj.gridOptions.api.hideOverlay(); //로딩창 가리기
                        
                    }).then(() => {
                        if(obj.isDialog == false) {
                            $(".ag-row").attr("draggable", true);                            
                        }                        
                    });
                }
            };
            if(userlistAble){
               this.gridOptions2.api.setDatasource(dataSource);  
            }else{
               this.gridOptions.api.setDatasource(dataSource);  
            }           
                     
    },
    requestAlarmList(params,requestOption){
           let param={};
           if(this.searchRequest&&this.targetSearch!=""){ //검색 요청
                if(this.targetAction=="doc"){ //파일명 검색
                  if(this.isAdmin){
                      param={
                        id: "",
                        userId: "",
                        name : this.targetSearch,
                      }
                  }else{
                      param={
                        id: "",
                        userId: this.userId,
                        name : this.targetSearch,
                      }
                  }
                   
                }else if(this.targetAction=="user"){ //사용자 검색
                   param={
                    id: "",
                    userId: this.targetSearch,
                    name : "",
                  }
               }

           }else{ //기본 값.
                param={
                    id: "",
                    userId: this.userId,
                    name : "",
                }
           }
                
           return api.setAlarmFolderList(param);                                
    },
    requestAlarmUserList(params){
      var selected = this.gridOptions.api.getSelectedRows();
      var elementId=selected[0].r_object_id;
      return api.setAlarmUserList(elementId);
    },
    removeUser(data){
      api.removeAlarmUser(data.elementId,data.userId).then(data => {
         this.$showSuccess();
         if(this.isAdmin){
            this.loadData(false,true,true);
         }else{
            this.loadData();
         }
      }).catch( e => {
          console.log(e)
      })
    },
    resetPage(){            
            this.listOptions.currentPage = 1;
            this.toolbarSelectedMessage="";
            this.toolbarMessage="";
    },
    editCellCreator(params){
      let template="";
      if(!this.isAdmin){
         template="<button onclick='Utils.removeAlarm(\""+params.data.r_object_id+"\",\""+this.userId+"\")'>"+this.$t('buttons.release')+"</button>"
      } 
      return template;
    },
    removeCellCreator(params){
      let template="<button onclick='Utils.removeAlarm(\""+this.selectedEid+"\",\""+params.data.id+"\")'>"+this.$t('buttons.release')+"</button>"
      return template;
    },
    onSelectionChanged(e){
      var selected = this.gridOptions.api.getSelectedRows();
      if(selected.length>0&&this.isAdmin){
        var elementId=selected[0].r_object_id;
        this.selectedEid=elementId;
        this.selectedRow=true
        this.loadData(false,true)
      }
    },
    changeTargetAction(ev){
      let dataItem = ev.sender.dataItem();
      if(dataItem.id=="doc"){
        this.selectedUserTab=false;
      }else{
        this.selectedUserTab=true;
      }
    },
    async openUserPicker() {
            let params = {
                type: constants.VIEW_TYPES.SEL_USER,
                title: this.$t('messages.selectUser'),
                width: '80%', 
                containerHeight: '600px',
                gridSelectable: constants.SELECTABLE.ROW
            }
            const result = await userGroupDialog(params)
            if (result) {
                this.tempName=result[0].name+"("+result[0].id+")";
                this.targetSearch=result[0].id;
            }
    },
    async AddOpenUserPicker(){
       let params = {
                type: constants.VIEW_TYPES.SEL_USER,
                title: this.$t('messages.selectUser'),
                width: '80%', 
                containerHeight: '600px',
                gridSelectable: constants.SELECTABLE.ROW
        }
        const result = await userGroupDialog(params)
        if (result) {
          api.addAlarmUser(this.selectedEid,result[0].id).then(data => { 
            this.onSelectionChanged();
          }).catch((error) => {
            console.log(error); 
          });
        }
    },
    resetinput(){
      this.tempName="";
      this.targetSearch="";
    }

  },
 
}
</script>

<style lang="scss">
.delBtn{
  float: right;
  right: 10px;
}
.font20{
  font-size: 20px;
}
.loadingview{
    width: 80%;
    margin: auto;
    top: 100px;
    text-align: center;
    position: relative;
}
.alarmSearch{
  width: 300px !important;
}
.searchAlarmTable{
  margin-top : 10px;
}
.ag-folderlist{
  height:300px; float: left;
}
.ag-userlist{
  height:300px; float: right;
}
.searchNotificationDIV{
  margin: 10px;
}
</style>
