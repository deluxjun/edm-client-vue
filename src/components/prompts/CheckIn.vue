<template>
  <el-dialog :title="$t('prompts.checkin')" width="45%" :visible.sync="dialogVisible" v-draggable :before-close="handleClose">
        <!--<td colspan="2"><input type="text" id="comment_input" style="width:100%;"></td>-->
    <el-input type="textarea" :rows="2" placeholder="Comment" v-model="comment_area"></el-input>
    <el-radio v-model="version" :label="2" v-if="showMinor()">{{$t('checkin.minorversion')}}</el-radio>
    <el-radio v-model="version" :label="3" v-if="showMajor()">{{$t('checkin.majorversion')}}</el-radio>
    <uploadform ref="uploadform" :uploadUrl="uploadUrl" :multiple="false" :closeWhenUploaded="true" @enableUpload="enableUpload" @uploadDone="uploadDone" @closePopup="close"></uploadform>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="upload()" id="uploadBtn" :disabled="uploadBtndisabled" >{{ $t('buttons.ok') }}</el-button>
      <el-button type="info" @click="cancel">{{ $t('buttons.editCancel') }}</el-button>
      <el-button @click="handleClose()">Close</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import buttons from '@/utils/buttons'
import UploadForm from '@/components/UploadForm'
import * as api from '@/utils/api'
import Utils from '@/utils/utils'
export default {
  name: 'checkin',
  components:{
    uploadform:UploadForm
  },
  data: function () {
    return {
      version:2,
      comment_area:"",
      selectedList:null,
      dialogVisible: true,
      uploadUrl:"/tmp",
      uploadBtndisabled:true,
      isUploading:false,
      isUploaded:false,
    }
  },
  methods:{
    upload:function(){
        $("#uploadBtn").hide();
        this.isUploaded=true;
        var version_sel=document.getElementsByName('version_sel');
        var elementId=this.selectedList[0].r_object_id;
        if(this.version==1) this.version=2;
        this.uploadUrl=`${store.state.baseURL}/json/upload_checkin?from=${store.state.rootId}&docId=${elementId}&CHECKIN_CD=${this.version}&comment=${encodeURI(this.comment_area)}`;
        this.$refs.uploadform.uploadWithUrl(this.uploadUrl);
        Event.fire(EventList.TABLE_REFRESH);
    },
    close(){
        this.dialogVisible=false;
        var elementId=this.selectedList[0].r_object_id;
        if(this.isUploaded) this.$store.dispatch('reloadSelectedFolder')
       // if(this.isUploaded) Utils.updateIndicator(elementId,'lock',this.selectedList[0])
        this.$store.commit('closeHovers')
    },
    cancel(){
      var elementId=this.selectedList[0].r_object_id;
      var obj=this;
      api.cancelCheckout(elementId).then(data=>{
        Utils.showResultMessage(true);  
        Utils.updateIndicator(elementId,'lock',obj.selectedList[0])
      }).catch(error=>{
        Utils.showResultMessage(false);  
      });
      this.close();
    },
    handleClose(done) {
      if(this.isUploading){
        this.$confirm(this.$t('label.cancelMessage'))
          .then(_ => {
            this.close();
          })
      }
      else this.close();
    },
    enableUpload(result,fileinfo){
      if (fileinfo==null) {
        this.uploadBtndisabled=true;
        return;
      }
      if(fileinfo.files.length==1){
        if(!Utils.featuresDefault('needSameNameCheckIn',true) || this.selectedList[0].object_name==fileinfo.files[0].name){
          this.uploadBtndisabled=false;
        }
        else{
          var obj=this;
          setTimeout(function(){
            obj.filterBlackListFile(fileinfo.files[0].uid)
          },500);
          this.uploadBtndisabled=true;
        }
      }
      else{
        this.uploadBtndisabled=true;
      }
    },
    showMinor(){
      let minor=this.$Utils.featuresDefault('checkInShowMinor',false)
      return minor
    },
    showMajor(){
      let minor=this.$Utils.featuresDefault('checkInShowMinor',false)
      let major=this.$Utils.featuresDefault('checkInShowMajor',true)
      if(!minor){
        this.version=3;
      }
      return major
    },
    uploadDone(e){
      this.isUploading=false;
      let elementId=this.selectedList[0].r_object_id;
      console.log(e);
      if(e){
        let data=e.response.version;
        Utils.updateVersionLabel(elementId,data)
        Utils.updateIndicator(elementId,'lock',this.selectedList[0])
      }else{
        Utils.updateIndicator(elementId,'lock',this.selectedList[0])
      }
    },
    filterBlackListFile(uid){
      this.$refs.uploadform.setErrorMessage(uid,this.$t('messages.mustBeSameName'))
    }
  },
  computed: mapState(['selected']),
  created(){
    this.selectedList=Utils.getCurrentSelect();
    if(this.selectedList.length!=1) this.close();
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
</style>