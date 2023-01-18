<template>
  <el-dialog
    :title="$t('prompts.history')"
    :visible.sync="dialogVisible" v-draggable
    width="75%"
    :before-close="handleClose"
    >
    <div class='history-card'>
      <file-card v-if="element" :element="element">
      </file-card>
    </div>
    <div id="history_pmpt">
      <ag-grid-vue id="searchGrid" :style="{ height: calcHeight }" class="ag-theme-balham" :gridOptions="gridOptions"></ag-grid-vue>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close()">{{ $t('buttons.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import FileCard from '@/views/FileCard'
import {AgGridVue} from "ag-grid-vue";

export default {
  name: 'history',
  data: function () {
    return {
      dialogVisible: true,
      loading:true,
      historyData:[],
      selectedList:null,
      element: "",
      calcHeight: "380px",
      gridOptions:{                
                enableColResize: true,
                rowBuffer: 0,
                rowSelection: 'multiple',
                rowDeselection: true,
                columnDefs: [ //초기 기본값이 반드시 있어야함
                    {headerName: this.$t('version.version'), field: 'version', width: 80},
                    {headerName: this.$t('adminMenu.history_path'), field: 'path', width: 180 },
                    {headerName: this.$t('adminMenu.history_action'), field: 'comment', width: 180},
                    {headerName: this.$t('history.event'), field: 'event', width: 100 },
                    {headerName: this.$t('version.modifier'), field: 'userName', width: 120 },
                    {headerName: this.$t('version.modify_date'), field: 'date', width: 150},
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
      elementId: '',
    }
  },
  mounted(){
    this.init();
  },
  components:{
     ...mapState(['selected']),
    'file-card' : FileCard,
    AgGridVue
  },
  methods: {
    close(){
      this.$store.commit('closeHovers')
    },
    handleClose(done) {
      this.close();
    },
    async init(){
      this.selectedList=Utils.getCurrentSelect();
      if(this.selectedList.length!=1) this.close();
      this.elementId=this.selectedList[0].r_object_id;
      let elementData = await api.getElement(this.elementId)
      this.element = elementData.list[0];
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
                    requestFunc = obj.requestHistoryList;
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
            this.gridOptions.api.setDatasource(dataSource);                   
    },
    resetPage(){            
            this.listOptions.currentPage = 1;
            this.toolbarSelectedMessage="";
            this.toolbarMessage="";
    },
    requestHistoryList(){
        return api.getDocHistory(this.elementId); 
    },
  }
}
</script>
<style>
.container#history_pmpt {
  width:100%;
  height: 40vh;
  overflow: auto;
}
.history-card{
  margin-bottom: 5px;
}
</style>

