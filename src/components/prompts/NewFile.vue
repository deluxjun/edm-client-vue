<template>
  <el-dialog :title="$t('prompts.newfile')" width="45%" :visible.sync="dialogVisible" v-draggable :before-close="handleClose" id="dragzone">
    <uploadform ref="uploadform" :uploadUrl="uploadUrl" :multiple="true" :closeWhenUploaded="false" @minusCount="minusCount" @onSelected="onSelected" @enableUpload="enableUpload" @uploadDone="uploadDone" @successCallback="successCallback" @errorCallback="errorCallback"></uploadform>
    <br>
    <span>{{this.$t('messages.uploadState', {totalCount: this.totalCount,successCount: this.successCount,failCount: this.failCount})}}</span>
    <span id='clearbtn' class='clearbtn'><el-checkbox v-if="!isUploading" v-model="clear" @change="handleClear">{{$t('messages.uploadClear')}}</el-checkbox></span>
    <div v-if="!this.ShowOverWriteDialog()">
      <overwrite-select :setting="checked" @onSelectedRadio="onSelectedRadio"></overwrite-select>
    </div>
    <span slot="footer" class="dialog-footer">
    <el-button id="uploadBtn" type="primary" @click="upload()" :disabled="uploadBtndisabled">{{ $t('buttons.upload') }}</el-button>
    <el-button @click="handleClose()">{{ $t('buttons.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import { create } from 'vue-modal-dialogs'
import buttons from '@/utils/buttons'
import UploadForm from '@/components/UploadForm'
import overWriteDialog from '@/components/overWriteDialog'
import overWriteSelect from '@/components/overWriteSelect'
const overwriteDialog = create(overWriteDialog)

export default {
  name: 'newfile',
  components:{
    uploadform:UploadForm,
    'overwrite-select': overWriteSelect
  },
  data: function () {
    return {
      current: window.location.pathname,
      dest: null,
      dialogVisible: true,
      failList:[],
      isUploading:false,
      reload:false,
      uploadBtndisabled:true,
      checkfile: false,
      totalCount: 0,
      successCount: 0,
      failCount:0,
      clear:false,
      checked: 'overwrite'
    }
  },
  mounted() {
     Event.off(EventList.CLEAR_DATA)
     Event.listen(EventList.CLEAR_DATA,this.handleClear)
  },
  methods:{
    upload:function(){
        this.isUploading=true;
        this.uploadBtndisabled=true;
        this.reload=true;        
        let url=this.uploadUrl+"&overwrite=false&allowRename=false"
        if(!this.ShowOverWriteDialog()){
          if(this.checked=='overwrite'){
            url=this.uploadUrl+"&overwrite=true&allowRename=false"
          }else if(this.checked=='allowRename'){
            url=this.uploadUrl+"&overwrite=false&allowRename=true"
          }else if(this.checked=='skipfile'){
            console.log('');
          }
        }
        this.$refs.uploadform.uploadWithUrl(url);
        //this.$refs.uploadform.upload();
    },
    successCallback:function(e){
      this.successCount+=1;
      var element=$('.k-file').filter(`[data-uid=${e.files[0].uid}]`);
      element.removeClass('k-file-success').addClass('successborder');
      $('.successborder').find('.successMark').remove();
      $('.successborder').append("<span class='successMark'><i class='fa fa-check-circle-o'></i></span>");
      if(this.totalCount === (this.successCount + this.failCount)) {
        this.isUploading = false;
      }
    },
    errorCallback:function(e){
      let overwriteUpload=Utils.featuresDefault('overwriteUpload',false)
      if(overwriteUpload){
        this.checkFileOverWrite(e)
      }
      this.failCount+=1;
    },
    minusCount:function(status){
      console.log(status);
      if(status=='total'){
        this.totalCount-=1;
      }else if(status=='success'){
        this.successCount-=1;
      }else if(status=='fail'){
        this.failCount-=1;
      }
    },
    handleClear(e){
      if(e){
        this.uploadBtndisabled=true;
        this.reload=true;
        this.isUploading=false;
        // $('#clearbtn').hide();
        $('.k-file').remove();
        this.totalCount=0;
        this.successCount=0;
        this.failCount=0;
        this.clear=false;
      }
    },
    async checkFileOverWrite(e){
          const result = await overwriteDialog({
                  title: this.$t('messages.fileChangeOrUpload'), width: '30%', containerHeight: '200px', fileName: e.fileName, allcheckType: true
          });
          if(result){
              if(result.all){
                  $("span[wrapper-name='default'] > div").hide();
                  $(".v-modal").hide();
                  if(result.close){
                    this.$refs.uploadform.allErrorMessage();
                  }else if(result.skipfile){
                    this.$refs.uploadform.allskipFileDelete();
                  }else{
                    let url=this.uploadUrl+"&overwrite="+result.overwrite+"&allowRename="+result.allowRename
                    this.$refs.uploadform.allcheckedUpload(url);
                  }
              }else{
                if(result.close){
                  this.$refs.uploadform.setErrorMessage(e.uid,e.msg);
                }else if(result.skipfile){
                  this.$refs.uploadform.skipFileDelete(e.uid,e.msg);
                }else{
                  let url=this.uploadUrl+"&overwrite="+result.overwrite+"&allowRename="+result.allowRename
                  this.$refs.uploadform.initUploadClass(e.uid);
                  this.$refs.uploadform.uploadWithUrl(url);
                }
              }
              
          }
    },
    close(){
        this.dialogVisible=false;
        this.$store.commit('closeHovers')
        if(this.reload) this.$store.dispatch('reloadSelectedFolder')
        $(".v-modal").hide();
    },
    handleClose(done) {
      if(this.isUploading){
        this.$confirm(this.$t('label.cancelMessage'))
          .then(_ => {
            this.$refs.uploadform.cancelAll();
            this.close();
          })
      }
      else{
        this.close();
      }
    },
    uploadDone(){      
      //  $('#clearbtn').show();
    },
    onSelected(e){
      this.totalCount=e.files.length;
    },
    onSelectedRadio(e){
      console.log(e);
      this.checked=e;
    },
    enableUpload(result){
      this.uploadBtndisabled=!result;
    },
    ShowOverWriteDialog(){
      let overwriteUpload=this.$Utils.featuresDefault('overwriteUpload',false)
      return overwriteUpload
    }
  },
  computed: mapState(['currentDir']),
  created(){
    this.uploadUrl=`${store.state.baseURL}/json/upload_createDoc?from=${store.state.rootId}&folderId=${this.currentDir}`
  }
}
</script>
<style>

.el-upload-dragger {
  width:100%;
}
.el-upload {
  width:100%;
}
.clearbtn{
  /* display: none; */
  float:right;  
}
.successborder{
  border-bottom: 1px solid #37b400!important;
}
.successMark{
  font-size: 20pt !important;
  color: #37b400 !important;
  position: absolute;
  right:5px;
  top: 3px;
}
.errorborder{
  border-bottom: 1px solid red!important;
}
.errorMark{
  font-size: 20pt !important;
  color: red !important;
  position: absolute;
  right:5px;
}
</style>