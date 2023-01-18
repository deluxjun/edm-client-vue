<template>
    <div>
          <el-input type="text" :placeholder="this.$t('buttons.search')" v-model="autoCompleteValue" @keydown.native="handleSearchChange" class='permissionSearch2'>
            <i class="el-icon-circle-close-outline el-input__icon" slot="suffix" @click='resetSearch'></i>
          </el-input>
          <ag-grid-vue id="listPrivGroupList" :style="{ height: '300px' }" class="ag-theme-balham" 
            :gridOptions="gridOptions"
            :selectionChanged="onSelectionChanged"
          >
          </ag-grid-vue>
    </div>
</template>



<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState,mapActions } from 'vuex'
import {AgGridVue} from "ag-grid-vue";
import Utils from '@/utils/utils'
import MemberDialog from '@/views/security/memberDialog'

import { create } from 'vue-modal-dialogs'
import Constants from '@/Constants'

const memberDialog = create(MemberDialog)

export default {
  name: 'listPrivGroup-page',
  components:{
    AgGridVue
  },
  props: {
        elementId: String,
  },
  computed: {
  
  },
  
  data: function () {
    return {
      dialogVisible: true,
      autoCompleteValue: '',
      timer : null,
      gridOptions:{           
                enableColResize: true,
                rowBuffer: 0,
                rowSelection: 'multiple',
                rowDeselection: true,
                columnDefs: [ //초기 기본값이 반드시 있어야함
                    {headerName: this.$t('label.pgroupName'), field: 'description', width: 200},
                    {headerName: this.$t('label.member'), field: 'action', width: 150, cellRenderer: this.actionCellCreator},
                ],
                getRowNodeId: function(data) { return data.id; },
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
    }
  },
  mounted() {
    this.init();
  },
  methods: {
      init(){   
          this.loadGrid();
          Event.off(EventList.PERMISSION_REUSE)
          Event.listen(EventList.PERMISSION_REUSE, this.loadGrid)
          Event.off(EventList.PERMISSION_PRIVGROUP)
          Event.listen(EventList.PERMISSION_PRIVGROUP, this.callmemberDialog)
      },
      close() {
        this.dialogVisible=false;
        this.$store.commit('closeHovers')
      },
      handleSearchChange(e){
        clearTimeout(this.timer);
        if (e.keyCode === 13) {
          this.search(e.target.value);
        } else {
          if (Utils.isSearchableKey(e.keyCode))
            this.timer = setTimeout(() => this.search(e.target.value), 500);
        }
      },
      search(value){
        this.autoCompleteValue=value
        this.loadGrid();
      },
      resetSearch(){
          this.autoCompleteValue=""
          this.loadGrid();
      },
      loadGrid(){
         this.resetPage();
         this.loadGridData();
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
                    requestFunc = obj.requestPrivGroupList;
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
    requestPrivGroupList(){
          return api.getlistPrivGroup(this.elementId,this.autoCompleteValue,this.listOptions.currentPage,this.listOptions.dataCnt);                              
    },
    divCellCreator(){
      return this.$t("permission.pgroup")
    },
    actionCellCreator(params){
      let template="<button onclick='Utils.memeberDialog(\""+params.data.id+"\",\""+params.data.description+"\")'>"+this.$t('label.view')+"</button>"
      return template;
    },
    onSelectionChanged(e) {
        var SetSelected = this.gridOptions.api.getSelectedRows();            
        if(SetSelected){
          this.$emit('selectedList', SetSelected)
        }     
    },
     async callmemberDialog(param){
      let items={
         groupId: param.id,
         desc: param.name,
      }
      let params = {
        editable: false,
        title: this.$t('label.permissionGroup-view'),
        width: '50%',
        ruleForm: items,
        type_prop : 1
      }
      var results = await memberDialog(params)
    },
  }
}
</script>

<style lang="scss">
.searchUser{
  width : 100% !important;
  top: 2px;
}
.history-table{
  margin-top: 5px;
}
.pager{
  width: 100%;
  text-align: center;
}
.xicon{
  margin-top: -5px;
  cursor: pointer;
}
.search-condition-left{
  float: left;
  width: 49%;
}
.search-condition-left div{
  margin-bottom : 3px;
}
.search-condition-right div{
  margin-bottom : 3px;
}
.search-condition-right{
  float: right;
  width: 49%;
}
.search-condition{
  width: 100%;
  float: left;
}
.search-condition-button{
  width: 100%;
  float: left;
}
.search-condition-button .el-button{
  float: right;
  margin: 4px;
}

.el-input__icon{
  line-height: 0px !important;
}
#searchGrid{
  float: left;
  width: 100%;
}
#listPrivGroupList{
  margin-top: 10px;
  margin-bottom: 10px;
  float: left;
  width: 100%;
}
.permissionSearch2{
  width: 100% !important;
  float: right;
}
</style>

