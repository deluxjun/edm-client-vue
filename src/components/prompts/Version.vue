<template>
  <el-dialog :title="$t('prompts.version')" :visible.sync="dialogVisible" v-draggable width="75%" :before-close="handleClose">
    <div class='version-card'>
      <file-card v-if="element" :element="element">
      </file-card>
    </div>
    <el-dialog width="75%" title="Detail" :visible.sync="childdialogVisable" :before-close="handleCloseChild" append-to-body>
        <label><b>MetaData</b></label>
          <div id="detail_area" style="border:1px solid; padding:10px;">
            <!--<li>{{$t('detail.title')}} : <span>{{detailData.title}}</span></li>-->
            <li>{{$t('detail.version')}} : <span>{{detailData.version}}</span></li>
            <li>{{$t('detail.object_id')}} : <span>{{detailData.object_id}}</span></li>
            <li>{{$t('detail.list')}} : <span>{{detailData.list}}</span></li>
            <li>{{$t('detail.create_date')}} : <span>{{detailData.create_date}}</span></li>
            <li>{{$t('detail.comment')}} : <span>{{detailData.comment}}</span></li>
            <li>{{$t('detail.expire_date')}} : <span>{{detailData.expire_date}}</span></li>
            <li>{{$t('detail.type')}} : <span>{{detailData.type}}</span></li>
          </div>
    </el-dialog>
    <div id="version_pmpt">
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

import commentViewDialog from '@/components/prompts/VersionComment'
import { create } from 'vue-modal-dialogs'

const commentDialog = create(commentViewDialog)

export default {
  name: 'version',
  components:{
    'file-card' : FileCard,
    AgGridVue
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true,
      childdialogVisable:false,
      loading:true,
      versionData:[],
      permission:{
        download:true,
        revert:false
      },
      element: "",
      detailData:{title:"",version:"",object_id:"",list:"",create_date:"",comment:"",expire_date:"",type:""},
      calcHeight: "380px",
      gridOptions:{                
                enableColResize: true,
                rowBuffer: 0,
                rowSelection: 'multiple',
                rowDeselection: true,
                columnDefs: [ //초기 기본값이 반드시 있어야함
                    {headerName: this.$t('version.version'), field: 'version', width: 80},
                    {headerName: this.$t('files.files')+this.$t('files.name'), field: 'file', width: 150 ,cellRenderer: this.fileNameCellCreator},
                    {headerName: this.$t('version.comment'), field: 'comment', width: 150},
                    {headerName: this.$t('version.size'), field: 'size', width: 100 , cellRenderer: this.SizeCellCreator},
                    {headerName: this.$t('version.modifier'), field: 'modifer', width: 120 ,cellRenderer: this.NameCellCreator},
                    {headerName: this.$t('version.modify_date'), field: 'modiferDate', width: 150 ,cellRenderer: this.DateCellCreator},
                    {headerName: '', field: 'action', width: 250 ,cellRenderer: this.ActionCellCreator},
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
    if(this.selectedList.length!=1){
      this.close();
    }
    this.getVersionList();
    Event.off(EventList.VERSION_REVERT);
    Event.listen(EventList.VERSION_REVERT, this.revert);
    Event.off(EventList.VERSION_DOWN);
    Event.listen(EventList.VERSION_DOWN, this.download);
    Event.off('VERSION_COMMENT');
    Event.listen('VERSION_COMMENT', this.comment);
  },
  methods: {
    async getVersionList(){
      this.versionData=[];
      this.loading=true;
      this.elementId=this.selectedList[0].r_object_id;
      let elementData = await api.getElement(this.elementId);
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
                    requestFunc = obj.requestVersionList;
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
    requestVersionList(){
        return api.getDocVersion(this.elementId); 
    },
    fileNameCellCreator(params){
      let list=params.data
      if(list.fileList.length>0){
        return list.fileList[0].fileName;
      }
    },
    SizeCellCreator(params){
      let list=params.data
      if(list.fileList.length>0){
        return Utils.convertByteSizeToString(list.fileList[0].fileSize);
      }
    },
    NameCellCreator(params){
      let list=params.data
      if(list){
        return list.modifier_name+"("+list.modifier+")";
      }
    },
    DateCellCreator(params){
      let list=params.data
      return list.date;
    },
    ActionCellCreator(params){
      let list=params.data
      let bnkVersion = Utils.featuresDefault('bnk.versionChange',false);
      console.log(bnkVersion);
      if(!bnkVersion){
         return "<button onclick='Utils.VersionRevert(\""+params.data.id+"\",\""+params.data.versionId+"\")'>"+this.$t('prompts.restore')+
      "</button> <button onclick='Utils.VesionDown(\""+params.data.id+"\",\""+params.data.versionId+"\")'>"+this.$t('buttons.download')
      }else{
        return "<button onclick='Utils.VersionRevert(\""+params.data.id+"\",\""+params.data.versionId+"\")'>"+this.$t('prompts.restore')+
      "</button> <button onclick='Utils.VesionDown(\""+params.data.id+"\",\""+params.data.versionId+"\")'>"+this.$t('buttons.download')+"</button>"+
      " <button onclick='Utils.VersionCommentChange(\""+params.data.id+"\",\""+params.data.comment+"\")'>"+this.$t('version.commentChange')
      }
      
    },
    async comment(data){
      console.log("버전 ID :"+data.eid);
      console.log("docId:"+this.elementId);
      console.log(data.comment);
      const result = await commentDialog({
            title: this.$t('version.commentChange'), width: '30%', containerHeight: '100px',
            comment: Utils.blankValue(data.comment),
      })
      if (result) {
         api.modifyVersionComment(this.elementId,data.eid,result)
        .then(data => {
            Utils.showResultMessage(true);
            this.getVersionList();
            Event.fire(EventList.RELOAD_LIST);
        }).catch(error => {
            Utils.showResultMessage(false);
            Event.fire(EventList.RELOAD_LIST);
        })
      }

    },
    revert(data){
      console.log(data);
      this.$confirm(this.$t('version.revertConfirmMsg'),'',{
        confirmButtonText: vue.$t('buttons.ok'),
        cancelButtonText: vue.$t('buttons.cancel'),
        type: 'info'
      }).then(()=>{
        api.revertDocs(data.eid,data.versionId).then(data=>{
            Utils.showResultMessage(true);
            this.getVersionList();
            Event.fire(EventList.RELOAD_LIST);
        }).catch(err=>{
            Utils.showResultMessage(false);
            Event.fire(EventList.RELOAD_LIST);
        })
      }).catch(()=>{
        
      })
    },
    download(data){
      let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${data.eid}&versionId=${data.versionId}&sid=${Utils.getCookie('auth')}`
      Utils.fileDownload(url)
    },
    detail(idx){
      this.detailData=this.versionData[idx];
      this.childdialogVisable=true;
    },
    close(){
      this.$store.commit('closeHovers')
    },
    handleClose(done) {
      this.close();
    },
    handleCloseChild(){
      this.childdialogVisable=false;
    },
    checkPermission(){
      this.selectedList=Utils.getCurrentSelect();
      if(this.selectedList.length!=1) this.close();
      api.getMenu(this.selectedList[0].r_object_id,null).then(data=>{
        if(data.check=='Y'){
          this.permission.revert=true;
        }
      }).catch(error=>{
        this.permission.revert=false;
      });
    },
  },
  created(){
    this.checkPermission();
  }
}
</script>
<style>
.container#version_pmpt {
  width:100%;
  height: 40vh;
  overflow: auto;
}
.version-card{
  margin-bottom: 5px;
}

</style>

