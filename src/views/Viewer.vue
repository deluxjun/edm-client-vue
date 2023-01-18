<template>
    <el-container style="height:100%;border: 1px solid #eee">
        <el-header style="text-align: right; font-size: 13px;">
            <file-card v-if="element" :element="element">
                <span><a @click="download">{{ $t('viewer.download') }}</a></span>
            </file-card>
        </el-header>
        <el-container>
        <el-main >
            <iframe id="docViewerFrame" class="iframe-class" :src="url"></iframe>
        </el-main>
        <el-aside id="comment_area" style="width:auto%;">
            <div style="text-align:right">
                <i v-if="!isHidden" @click="hideCommentArea" class="fa fa-arrow-right" aria-hidden="true"></i>
                <i v-else @click="showCommentArea" class="fa fa-arrow-left" aria-hidden="true"></i>
            </div>
            <div v-if="!isHidden">
            <h4>{{$t('viewer.rate')}}</h4>
            <el-rate
                v-model="rateValue"
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                @change="doRate">
            </el-rate>
            <h4>{{$t('viewer.comment')}}</h4>
            <el-input
                type="textarea"
                v-model="comment_input"
                :autosize="{ minRows: 2, maxRows: 3}"
                :clearable='true'
                placeholder="Enter Comment">
            </el-input>
            <el-button type="primary" size="mini" @click="submitComment">등록</el-button>
            <table style="width:100%" v-loading="comment_loading">
                <template v-for="(list,index) in commentList">
                    <tr>
                        <td>{{list.creatorName}}({{list.creatorId}}) <a v-if="checkPermission(list.creatorId)" v-on:click="deleteComment(list.id)">X</a></td>
                    </tr>
                    <tr>
                        <td>{{list.content}}</td>
                    </tr>
                    <tr>
                        <td><font color="Silver">{{list.createdAt}}</font></td>
                    </tr>
                </template>
            </table>
            <a v-if="seemore" @click="moreComment" :disabled="comment_loading">더보기</a>
            <br><br><br><br>
            </div>
        </el-aside>
        </el-container>
    </el-container>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import { Grid, GridInstaller } from "@progress/kendo-grid-vue-wrapper";
import FileCard from './FileCard'

Vue.use(GridInstaller);

export default {
    name: 'viewer',
    data: function () {
    return {
        commentPage:1,
        commentList: [],
        object_id:"",
        url:"",
        element: null,
        fileinfo:{
            filename:"",
            crete_date:"",
            edit_date:"",
            creator:"",
            owner:"",
            size:""
        },
        err:{
            code:500,
            errmsg:"",
            msg:"",
        },
        userId:"",
        isAdmin:false,
        rateValue:0,
        isHidden:false,
        comment_loading:false,
        seemore:false,
        comment_input:"",
    }
  },
  components: {
    'file-card' : FileCard
  },
  methods: {
      hideCommentArea(){
          this.isHidden=true;
      },
      showCommentArea(){
          this.isHidden=false;
      },
      moreComment(){
          this.comment_loading=true;
          this.commentPage+=1;
          this.getCommentList();
      },
      getFileInfo:function(object_id){
            api.getDocInfo(object_id).then(data=>{
                if(data.list.length==0) return;
                this.element = data.list[0]
                // this.fileinfo.filename=data.list[0].object_name;
                // this.fileinfo.create_date=data.list[0].r_creation_date;
                // this.fileinfo.edit_date=data.list[0].r_modify_date;
                // this.fileinfo.creator=data.list[0].producer_name;
                // this.fileinfo.size=Utils.convertByteSizeToString(data.list[0].r_content_size);
                this.rateValue=parseFloat(data.list[0]["p:rating"] || 0);
            }).catch(error=>{
                Utils.showResultMessage(false,"Fail to load doc info",this);
            });
      },
      download:function(){
            let url=`${store.state.baseURL}/json/download?from=${store.state.rootId}&elementId=${this.object_id}`
            Utils.fileDownload(url)
      },
      submitComment:function(){
            let successMessage=this.$t('success.complete')
            if(this.comment_input.length==0) return;
            api.submitComment(this.object_id,this.comment_input).then(data=>{
                Utils.showResultMessage(true,successMessage,this);
                this.comment_input="";
                this.commentList.splice((this.commentPage-1)*10.10);
                this.getCommentList();
            }).catch(error=>{
                Utils.showResultMessage(false,error,this);
            });
      },
      getCommentList:function(){
            api.getComment(this.object_id,this.commentPage,10).then(data=>{
                var cnt=data.list.length;
                if(cnt==0){
                    if(this.commentPage>1)
                        this.commentPage-=1;
                }
                for(var i=0;i<cnt;i++){
                    this.commentList.push(data.list[i]);
                }
                if(cnt>0) this.seemore=true;
                this.comment_loading=false;
            }).catch(error=>{
                console.log(error)
                this.comment_loading=false;
            });
      },
      checkPermission:function(userid){
            return this.isAdmin || ((userid==this.userId) || false);
      },
      deleteComment:function(commentId){
            let successMessage=this.$t('success.complete')
            api.deleteComment(this.object_id,commentId).then(data=>{
                Utils.showResultMessage(true,successMessage,this);
                this.commentList.splice((this.commentPage-1)*10.10);
                this.getCommentList();
            }).catch(error=>{
                Utils.showResultMessage(false,error,this);
            });
      },
      doRate:function(){
            let successMessage=this.$t('success.complete')
            api.addRate(this.object_id,this.rateValue).then(data=>{
                    Utils.showResultMessage(true,successMessage,this);
            }).catch(error=>{
                    Utils.showResultMessage(false,error,this);
            });
      }
  },
  created(){
        // Vue.prototype.$openLoading();
        this.userId=store.state.user.userId;
        this.isAdmin=store.state.user.isAdmin;
        var path=this.$route.path.split('/');
        if(path.length==0) return;
        this.object_id=path[path.length-1];
        this.getFileInfo(this.object_id);
        this.getCommentList();
        this.url = api.getFullUrl(`/service/viewer/inlineViewer?recordId=${this.object_id}&type=1`)
    }
}
</script>
<style>
.iframe-class {
    height: calc(100% - 100px);
    width:100%;overflow: scroll;
}
.centered {
  position: relative;
  display: inline-block;
 
  width: 50%;
  padding: 1em;
  background: orange;
  color: white;
}

  .el-aside {
    /* background-color: #ebf1f5; */
    color: #333;
    height:auto;
  }
  .el-main{
      /* background-color: #ebf1f5; */
      height:auto;
      padding:0px;
  }
</style>