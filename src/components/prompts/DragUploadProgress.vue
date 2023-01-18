<template>
	<el-dialog
		:title="$t('label.error')"
		width="38%"
		:visible.sync="uploadDialogVisible"
		:before-close="close"
		>
		<Upload ref="dragUpload" name="files_drag" id="files_drag" :async-save-url="'/awef'"
			:async-auto-upload="false"
			:async-with-credentials="false"
			:dropZone="'#edrm-right'"
			:multiple="true"
			:upload="beforeUpload"
			:success="uploadSuccess"
			:error="uploadError"                      
		/>
	</el-dialog>
</template>

<script>
import Vue from 'vue'
import {mapState, mapGetters} from 'vuex'
import { Upload, UploadInstaller } from '@progress/kendo-upload-vue-wrapper'

Vue.use(UploadInstaller)
export default {
	name: 'dragprogress',
	components:{
		Upload,
	},
	data() {
		return {
			uploadDialogVisible:true,
			messageList:[],
			upload:{
      	        url:"/upload",
                totalFileCount:0,
                completeCount:0,
                errorCount:0,
                successList:[],
                errorList:[],
                messageObj:null,
                errobj:[]
            }
		}
	},
	methods: {
		show(){
			this.uploadDialogVisible=true;
		},
		close(){
			this.uploadDialogVisible=false;
			//this.$store.commit('closeHovers')
		},
		beforeUpload(e){
            this.uploadDialogVisible=true;
            this.upload.url=`${store.state.baseURL}/json/upload_createDoc?from=${store.state.rootId}&folderId=${this.currentDir}`;
            e.sender.options.async.saveUrl=this.upload.url;
            if(this.checkIsDone()){
                this.upload.errobj=[];
                if(this.upload.messageObj) this.upload.messageObj.close();
                this.upload.totalFileCount=1;
                this.upload.completeCount=0;
                this.upload.errorCount=0;
                this.upload.messageObj=this.$message({
                    message:this.messageFactory(),
                    duration:0
                });
            }
            else{
                this.upload.totalFileCount+=1;
            }
        },
        uploadSuccess(e){
            if(e.response.errcode!=0){ //서버반환 http 상태코드가 200이여서 수동으로 에러처리를 해야함
                this.uploadError(e);
                return;
            }
            if(e.response.dupActionId && e.response.dupActionId.length>0){
                this.upload.errobj.push({errname:e.files[0].name,errmsg:this.$t('messages.isduplicateDoc'),actionId:e.response.dupActionId});
                this.upload.messageObj.type="warning";
            }
            this.upload.completeCount+=1;
            this.upload.messageObj.message=this.messageFactory();
            this.checkIsDone();
        },
        uploadError(e){
            this.upload.errorCount+=1;
            this.upload.messageObj.message=this.messageFactory();
            this.upload.errobj.push({errname:e.files[0].name,errmsg:e.response.errmsg || "Unknown Error"});
            this.checkIsDone();
        },
        checkIsDone(){
            if(this.upload.totalFileCount==0) return true;
            if(this.upload.totalFileCount<=this.upload.completeCount+this.upload.errorCount){
                if(this.upload.errorCount==this.upload.totalFileCount) {
                    this.upload.messageObj.type="error";
                }
                if(this.upload.errorCount==0){
                    this.upload.messageObj.type="success";
                }
                this.showError();
                this.upload.totalFileCount=0;
                this.upload.completeCount=0;
                this.upload.errorCount=0;
                var obj=this;
                setTimeout(function(){
                    obj.upload.messageObj.close();
                },3000);
                this.upload.messageObj.showClose=true;
                store.dispatch('reloadSelectedFolder')
                return true;
            }
            else{
                if(this.upload.errorCount>0) this.upload.messageObj.type="warning";
                return false;
            }
        },
        messageFactory(){
            return `${this.$t('label.uploading')} ${this.upload.completeCount+this.upload.errorCount}/${this.upload.totalFileCount}  ${this.$t('label.success')}:${this.upload.completeCount} ${this.$t('label.error')}:${this.upload.errorCount}`;
        },
        showError(){
            console.log(this.upload.errorCount);
            if(this.upload.errorCount<=0 || this.upload.errobj.length<=0) return;
            this.$refs.messageBox.show(this.upload.errobj);
        },
        open(){
            this.open();
        }
    },
    mounted(){

    }
}
</script>
<style>
	#errmsgDialog{
		width:100%;
		height: 40vh;
		overflow: auto;
	}
</style>
