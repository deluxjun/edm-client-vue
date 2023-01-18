<template>
<div class='permission-search'>
      <div class='search-margin'>
        <div class='search-left search-text'>{{this.$t("label.user")}} :  </div>
        <div class='search-left'>
          <el-input :placeholder="''" class="inputSearchPermission"  v-model.trim="tempName" :disabled="true">
            <el-button class='right-line' slot="append" icon="el-icon-search" @click="openUserPicker"></el-button>
          </el-input>
        </div>
        <div class='search-right'>
              <el-button type="primary" size="mini" style="width:100%;" @click="search"><i class='el-icon-search headericon'></i> {{ $t('login.permission')}}</el-button>
        </div>
      </div>
      <div class='search-margin'>
        <div class='search-left search-text'>{{this.$t("label.filefolderName")}}:</div>  
        <div class='search-left'><el-input :placeholder="''" class="inputSearchPermission" v-model.trim="targetSearch"></el-input></div>
        <div class='search-right'>
              <el-button type="info" size="mini" style="width:100%;" @click="resetinput"><i class='el-icon-refresh headericon'></i> {{ $t('buttons.init')}}</el-button>
        </div>
      </div>
      <div class='searchPermission'>
        <ag-grid-vue id="searchPermission" :style="{ height: dialogSearchGridHeight }"  class="ag-theme-balham" :gridOptions="gridOptions">
        </ag-grid-vue>
      </div>
</div>
</template>
<script>
import {mapGetters, mapState,mapActions} from 'vuex'
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
      default: '300px',
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
      userIdSearch: '',
      targetSearch: '',
      elemetnid: '',
      definedPermissions: [],
      gridOptions:{                
                enableColResize: true,
                rowBuffer: 0,
                rowSelection: 'multiple',
                rowDeselection: true,
                columnDefs: [ //초기 기본값이 반드시 있어야함
                    {headerName: this.$t("label.type"), field: 'object_name', width: 100, cellRenderer:this.typeCellCreator},
                    {headerName: this.$t("label.filefolderName"), field: 'object_name', width: 150, cellRenderer:this.filefolderCellCreator},
                    {headerName: this.$t("label.path"), field: 'path' , width: 300, cellRenderer:this.pathCellCreator},
                    {headerName: this.$t("permission.current"), field: '', cellRenderer:this.currentCellCreator, width: 100},
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

      tempName : "",
    }
  },
  mounted() {
    this.init();
  },
  methods:{
    ...mapActions(['getSecurityProfiles','getPreDefinedPermissions']),
    init(){
      //this.loadGrid();
      this.callDefinedPermissions();
    },
    loadGrid(){
         this.resetPage();
         this.loadGridData();
    },
    search(){
      if(this.userIdSearch){
        this.loadGrid();
      }else{
        this.$alert(this.$t('messages.searchPermission'), '', {
          confirmButtonText: this.$t('buttons.ok'),
          type: 'warning'
			  }).then(() => {
			
			  }).catch(() => { });   
      }
    },
    loadGridData(){          
            var obj = this;            
            var dataSource = {
                rowCount: null, // behave as infinite scroll                
                getRows: function(params){
                    obj.gridOptions.api.showLoadingOverlay();
                    var currentPage = obj.listOptions.currentPage;
                    var requestFunc = null;
                    var requestOption={};
                    requestFunc = obj.requestSearchPermission;
                    requestOption={
                            currentPage:currentPage,
                    }                 
                   
                    requestFunc(params,requestOption).then(data=>{                  
                        // 막누를 때 리스트 로딩 안되고 비어있는 열들이 로딩될 때 다시 로드함
                        if(obj.listOptions.currentPage > 1 && data.list.length == 0 && ((data.totalCount -1) > data.list.length)) {                            
                            return false;
                        }

                        if(obj.listOptions.currentPage == 1){
                            if(data.list.length<=0){
                                obj.gridOptions.api.showNoRowsOverlay();
                                $(".ag-overlay-no-rows-center").html('데이터 없음');
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
            this.gridOptions.api.setDatasource(dataSource);                   
    },
    resetPage(){            
            this.listOptions.currentPage = 1;
    },
    requestSearchPermission(){
          return api.getlistElementByACL(this.userIdSearch,this.targetSearch,this.listOptions.currentPage,this.listOptions.dataCnt);                              
    },
    typeCellCreator(params){
      if(params.data){
        if(params.data.element.docTypeName=="FOLDER"){
          return this.$t('files.folders');
        }else{
          return this.$t('files.files');
        }
      }
    },
    filefolderCellCreator(params){
       if(params.data){
        if(params.data.element.representativeFileName){
          return params.data.element.representativeFileName
        }
      }
    },
    pathCellCreator(params){
      if(params.data){
        if(params.data.element.path){
          return params.data.element.path
        }
      }
    },
    currentCellCreator(params){
      if(params.data){
        if(params.data.myRights){
          return this.currentMyPermission(params.data.myRights)
        }
      }
    },
    async callDefinedPermissions(){
       this.definedPermissions = await this.getPreDefinedPermissions()
    },
    currentMyPermission(myRights){
      let array=[]
      if(myRights){
         this.definedPermissions.forEach(e => {
           let permissionName=e.permissionGroupName
           let depends=e.depends
           if(myRights[permissionName]==1){
             array.push(permissionName);
           }
         })
         if(array.length!=0){
           return this.$t("permission.name."+array[0])
         }else{
           return ""
         }
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
                this.userIdSearch=result[0].id;
            }
    },
    resetinput(){
      this.tempName="";
      this.userIdSearch="";
      this.targetSearch="";
      this.loadGrid();
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
.search-text{
  width: 120px;
}
.inputSearchPermission{
  width: 300px !important;
}
.searchPermission{
  width: 100%;
  float: left;
}
.permission-search{
  height: 600px;
}
.search-margin{
  float: left;
  width: 100%;
  margin-bottom: 5px;
}
.search-left{
  float: left;
}
.search-right{
  float: right;
  width: 18%;
}
</style>
