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
    <div id="version_pmpt" class="container">
      <el-table :data="versionData" v-loading="loading">
          <el-table-column align="center" prop="version" :label="$t('version.version')" ></el-table-column>
          <el-table-column align="center" prop="comment" :label="$t('version.des')" ></el-table-column>
          <el-table-column align="center" prop="size" :label="$t('version.size')" ></el-table-column>
          <el-table-column align="center" prop="creater" :label="$t('version.creater')" ></el-table-column>
          <el-table-column align="center" prop="create_date" :label="$t('version.create_date')" ></el-table-column>
          <el-table-column align="center" :label="$t('version.options')" >
            <template slot-scope="scope">
              <el-tooltip class="item" effect="dark" :content="$t('buttons.revert')" placement="bottom">
                <i v-if="permission.revert" v-on:click="revert(scope.$index)" class="fa fa-history" alt="Revert"></i>
              </el-tooltip>
              <el-tooltip class="item" effect="dark" :content="$t('buttons.download')" placement="bottom">
                <i v-if="permission.download" v-on:click="download(scope.$index)" class="fa fa-download" alt="download"></i>
              </el-tooltip>
              <!--<i v-on:click="detail(scope.$index)" class="fa fa-info" alt="detail"></i>-->
            </template>
          </el-table-column>
      </el-table>
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

export default {
  name: 'version',
  components:{
    'file-card' : FileCard,
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
      detailData:{title:"",version:"",object_id:"",list:"",create_date:"",comment:"",expire_date:"",type:""}
    }
  },
  mounted(){
    if(this.selectedList.length!=1){
      this.close();
    }
    this.getVersionList();
  },
  methods: {
    async getVersionList(){
      this.versionData=[];
      this.loading=true;
      var object_id=this.selectedList[0].r_object_id;
      let elementData = await api.getElement(object_id)
      this.element = elementData.list[0];
      api.getDocVersion(object_id).then(data=>{
        if(data.errcode==0){
          var dataCnt=data.list.length;
          for(var i=0;i<dataCnt;i++){
            var tmp={ version:"1.0", title:"", comment:"", size:"1MB", creater:"root", create_date:"", modifier:"root", modify_date:"", object_id:"",list:null,expire_date:null,type:"" }
            tmp.version=data.list[i].version;
            tmp.title=data.list[i].title;
            tmp.comment=data.list[i].comment || "";
            tmp.size=Utils.convertByteSizeToString(data.list[i].fileList[0].fileSize);
            tmp.creater=data.list[i].creator;
            tmp.create_date= Utils.formatMoment(data.list[i].createDate);
            tmp.modifier=data.list[i].modifier;
            tmp.modify_date=data.list[i].date;
            tmp.object_id=data.list[i].id;
            tmp.list="";
            tmp.expire_date=data.list[i].expireDate;
            tmp.type=data.list[i].docType;
            this.versionData.push(tmp);
          }
          this.loading=false;
        }
        else{
          this.close();
        }

      }).catch(err=>{
        Utils.showResultMessage(false);
        this.close();
      });
    },
    revert(idx){
      this.$confirm(this.$t('version.revertConfirmMsg'),'',{
        confirmButtonText: vue.$t('buttons.ok'),
        cancelButtonText: vue.$t('buttons.cancel'),
        type: 'info'
      }).then(()=>{
        api.revertDocs(this.versionData[idx].object_id).then(data=>{
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
    download(idx){
      let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${this.versionData[idx].object_id}&sid=${Utils.getCookie('auth')}`
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

