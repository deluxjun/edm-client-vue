<template id="main">
    <div id="edrm-right-sub">
      <toolbar ref="listToolbar" @openActions="openActions"></toolbar>
        <component ref="currentComp" :is="currentView" v-bind="properties" :isDialog="false"></component>

        <!-- <Upload ref="dragUpload" name="files_drag" id="files_drag" :async-save-url="upload.url"
                  :async-auto-upload="true"
                  :async-with-credentials="false"
                  :showFileList="false"
                  :dropZone="useDragDropUpload()"
                  :multiple="true"
                  :upload="beforeUpload"
                  :success="uploadSuccess"
                  :error="uploadError"
                  :directory="true"
                  :directory-drop="true"
        >
        </Upload> -->
        <MessageBox ref="messageBox"></MessageBox>
        <el-dialog        
            :title="dialogMessage"
            :visible.sync="dialogVisible"
            :show-close="false"
            :close-on-click-modal="false"
            v-draggable
            width="38%">                
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" :status="processStatus" :color="processColor"></el-progress>
            <div v-if="completeUpload">
                <span>{{this.$t('messages.uploadState', {totalCount: this.uploadTotalCount, successCount: (this.uploadTotalCount - this.errCount),failCount: this.errCount})}}</span>            
            </div>        
            <span slot="footer" class="dialog-footer">
                <el-button :disabled="btnDisabled" @click="closeDialog">{{ $t("buttons.close") }}</el-button>
            </span>            
            <el-table v-if="errCount > 0"
                :data="errMessage"
                style="width: 100%;margin-top: 20px;max-height: 300px;overflow: auto">
                <el-table-column
                    prop="fileName"
                    :label="$t('label.filename')">
                </el-table-column>
                <el-table-column
                    prop="message"
                    :label="$t('label.errorDetails')">                    
                </el-table-column>                
            </el-table>
        </el-dialog>
    </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import lodash from 'lodash'
import store from '@/store'

import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import { mapGetters, mapState, mapMutations } from 'vuex'

import EdrmList from './EdrmList'
import EdrmGrid from './EdrmGrid'
import EdrmTable from './EdrmTable'

import { Message } from 'element-ui';

import ListToolbar from './ListToolbar'
import { Upload, UploadInstaller } from '@progress/kendo-upload-vue-wrapper'

import ErrorMessageBox from '@/components/prompts/ErrorMessageBox'

Vue.use(UploadInstaller)
export default {
    name: 'edrm-list2',
    components: {
      'toolbar' : ListToolbar,
        'list' : EdrmList,
        'grid' : EdrmGrid,
        'tablev' : EdrmTable,
        Upload,
        'MessageBox':ErrorMessageBox
    },    
    data () {
        return {
            isDialog: false,
            dialogMessage: "",
            completeUpload: false,
            oldView : null,
            properties : {
                requestData : {
                    url : null,
                    data : null
                },
                type : 'main'
            },
            upload:{
                url:"/upload",
                totalFileCount:0,
                completeCount:0,
                errorCount:0,
                successList:[],
                errorList:[],
                messageObj:null,
                errobj:[]
            },
            totalSize: 0,
            totalCount: 0,
            resultCount: 0,
            uploadResultCount: 0,            
            uploadTotalCount: 0,
            errCount: 0,
            errMessage: [],
            percentage: 0,
            dialogVisible: false,
            processStatus: "",
            processColor: "",
            btnDisabled: true,
            canDrop: true,    
            items: null,        
            percentageNum: 0,
            tmpPercentageNum: 0,
            extList: null,
            exceptionExtList: null,
        }
    },
    watch: {
        'viewOption.view': function () {
            console.log('viewOption.view changed : ' + this.viewOption.view)
            console.log(this.$refs.currentComp.$el.id)
            // if (this.oldView == this.currentView)
            //     this.$refs.currentComp.loadData()

            // this.oldView = this.currentView
        //   Event.fire(EventList.RELOAD_LIST)
        },
        'rootId':function(){
            //$('.k-widget.k-upload.k-header.k-upload-empty').prop( "disabled",  );
            this.$refs.dragUpload.disabled=!constants.FEATURES_DRAGFILEUPLOAD(this.rootId);
        }
    },
    computed: {
        ...mapState([
            'viewOption','currentDir'
        ]),
        currentView() {
            var re = this.isGrid;
            if (re == 0) {
                //return 'grid'
                return 'tablev'
            }
            else if(re == 1){
                return 'tablev'
            }
            return 'list'
        },
        isGrid() {
            if(this.viewOption.view === 'grid') return 0;
            else if(this.viewOption.view === 'table') return 1;
            else return -1;
        },
    },
    mounted() {
        let self = this;        

        let ext=Utils.featuresDefault('extension',"");        

        let exceptionExtension=Utils.featuresDefault('upload.exceptionExtension',"");            

        try{
            this.extList = ext.split('/');
        }
        catch(exception){
            this.extList=[];
        }

        try{
            this.exceptionExtList= exceptionExtension.split('/');
        }catch(exception){
            this.exceptionExtList=[];
        }
        
        this.dialogMessage = this.$t("messages.checkingFiles");
        $('.k-widget.k-upload.k-header.k-upload-empty').hide();        
                
        // 드래그 & 드랍 업로드
        if(Utils.featuresDefault('useDragDropUpload',false)) {
            $(document).on("dragover", "#edrm-right", function(e) {
                e.originalEvent.preventDefault();
                $("#edrm-right").off("drop").on("drop", function(e) {
                    if(self.canDrop == false) {                    
                        return false;
                    }else {
                        if(store.state.isDragged == false) {
                            e.originalEvent.preventDefault();                        
                            self.dialogMessage = self.$t("messages.checkingFiles");
                            self.dialogVisible = true;
                            self.processStatus = "";
                            self.canDrop = false;
                            
                            var items = e.originalEvent.dataTransfer.items;
                            var tmp = {};
                            
                            for(var i = 0, l = items.length; i< l; i++) {
                                tmp[i] = items[i].webkitGetAsEntry()                            
                            }
                            tmp.length = items.length;

                            self.items = tmp;

                            for(var i = 0, l = items.length; i < l; i++) {                            
                                let item = items[i].webkitGetAsEntry();

                                if(item) {                                                                                                           
                                    self.scanFileSize(item);                                
                                }                
                            }
                            self.setTotalCount(items.length);
                        }
                    }
                });
            });
        }
    },    
    methods:{        
        setTotalCount(cnt) {            
            this.totalCount = cnt;               
        },    
        setUploadTotalCount(cnt) {
            this.uploadTotalCount = cnt;
        }, 
        setUploadResultCount(cnt){
            this.uploadResultCount = cnt;                   
            
            if(this.uploadTotalCount == this.uploadResultCount){                
                this.btnDisabled = false;
                
                this.completeUpload = true;
                this.dialogMessage = this.$t("prompts.progressEnd");
                this.percentage = 100;

                if(this.errCount > 0) {
                    if((this.uploadTotalCount - this.errCount) == 0) {
                        this.processStatus = "exception";
                    }else {
                        this.processColor = "#f5a36c";
                    }
                }else {
                    this.processStatus = "success";
                }
                    
            }

        },
        setResultCount(cnt){
            this.resultCount = cnt;
           
            if(this.resultCount == this.totalCount) {                
                let totalSizeLimit = Number((Utils.features('totalfileSizeLimit')) || 10737418240);                
                
                if(this.totalSize > totalSizeLimit) {                    
                    this.dialogMessage = this.$t("messages.totalSizeLimit",{size: Utils.convertByteSizeToString(totalSizeLimit)});
                    this.percentage = 100;
                    this.processStatus = "exception"; 
                    this.btnDisabled = false;
                    this.completeUpload = false;                   
                }else {                    
                    this.dialogMessage = this.$t('prompts.progress');
                    this.setUploadTotalCount(this.items.length);
                    for(var i = 0, l = this.items.length; i < l; i++) {
                        this.scanFiles(this.items[i]);
                    }
                }
            }                    
        },
        setPercentage() {            
            var percentageTmp = ((this.percentageNum + this.tmpPercentageNum) / this.totalSize) * 100;    
            if(percentageTmp >= this.percentage) {
                if(percentageTmp >= 100) {
                    this.percentage = 100;
                }else {
                    this.percentage = parseInt(percentageTmp);                
                }                
            }
        },
        closeDialog() {
            this.uploadResultCount = 0;
            this.uploadTotalCount = 0;
            this.resultCount = 0;
            this.totalCount = 0;
            this.totalSize = 0;
            this.percentage = 0;                                
            this.errCount = 0;  
            this.processStatus = "";   
            this.processColor = "";
            this.items = null;
            this.percentageNum = 0;
            this.tmpPercentageNum = 0;
            Event.fire(EventList.RELOAD_LIST);
            Event.fire(EventList.RELOAD_TREE);
            Event.fire(EventList.RESTORE_RELOAD,{path: store.state.currentDir});                                
            this.dialogVisible = false;
            this.dialogMessage = "";
            this.btnDisabled = true;
            this.canDrop = true;
            this.completeUpload = false;
            this.errMessage = [];
        },
        scanFileSize(item) {
            let self = this;            
                      
            if(item.isDirectory) {
                let directoryReader = item.createReader();
                let done = false;

                let f1 = function() {                        
                    return new Promise((resolve, reject) => {
                        directoryReader.readEntries(function(entries) {                                                    
                            if(entries.length != 0) {                                    
                                entries.forEach(function(entry){                                                                        
                                    self.setTotalCount(self.totalCount + 1);              
                                    self.totalSize += 1;                                                                      
                                    self.scanFileSize(entry);
                                    
                                });                                                                      
                            }else {                                                                 
                                self.setResultCount(self.resultCount + 1);                                                          
                            }                                

                            resolve(entries);                                                       
                        });       
                    });                        
                }                                                               

                async function readEntriesLoop() {
                    while(!done) {                    
                    await f1().then(result => {
                        if(result.length == 0) {
                                done = true;                                    
                            }
                        })
                    }  
                }      
                
                readEntriesLoop();
            }else {
                item.file(file => {                    
                    self.totalSize += file.size;
                    self.setResultCount(self.resultCount + 1);
                });
            }
        },
        scanFiles(item, currentDir) {

            let self = this;
            let current;
            if(currentDir == null) {
                current = store.state.currentDir;
            }else {
                current = currentDir
            }

            if(item.isDirectory) {                
                let directoryReader = item.createReader();                

                api.createFolder(current, item.name, "", false, false).then((result) => {                    
                    let folderId = result.list[0].r_folder_id;
                    let done = false;                                        

                    let f1 = function() {                        
                        return new Promise((resolve, reject) => {
                            directoryReader.readEntries(function(entries) {                                                        
                                if(entries.length != 0) {                                    
                                    entries.forEach(function(entry){                                                                 
                                        self.setUploadTotalCount(self.uploadTotalCount + 1);
                                        self.percentageNum += 1;
                                        self.scanFiles(entry, folderId);                       
                                    });                                                                      
                                }else {                                                                   
                                    self.setUploadResultCount(self.uploadResultCount + 1);                          
                                }                                

                                resolve(entries);                                                       
                            });       
                        });                        
                    }                                                               

                    async function readEntriesLoop() {
                        while(!done) {                        
                        await f1().then(result => {
                            if(result.length == 0) {
                                    done = true;                                    
                                }
                            })
                        }  
                    }      
                    
                    readEntriesLoop();

                }).catch(result => {     
                    self.errMessage.push({fileName: item.name, message: result.errmsg});               
                    self.errCount++;                                        
                    self.setUploadResultCount(self.uploadResultCount + 1);          
                });                                
            }else {                            
                let formData = new FormData();                                
                item.file(function(file) {
                    let getLimit = Number((Utils.features('fileSizeLimit')) || 2147483647);       
                    
                    let ext = Utils.getFileExtension(file.name);                    

                    if(self.exceptionExtList.includes('.' + ext)) {
                        self.errCount++;
                        self.errMessage.push({fileName: file.name, message: self.$t('messages.exceptionExtfileUpload')});
                        self.setUploadResultCount(self.uploadResultCount + 1);
                        self.percentageNum += file.size;
                        self.tmpPercentageNum = 0;
                    }
                    else if(!self.extList.includes('.' + ext) && getLimit != 0 && file.size > getLimit) {                            
                        self.errCount++;
                        self.errMessage.push({fileName: file.name, message: self.$t('messages.totalSizeLimit', {size: Utils.convertByteSizeToString(getLimit)})});
                        self.setUploadResultCount(self.uploadResultCount + 1);
                        self.percentageNum += file.size;
                        self.tmpPercentageNum = 0;
                    }else {
                        formData.append("files", file);                        
                        axios.post(`${store.state.baseURL}/json/upload_createDoc?from=${store.state.rootId}&folderId=${current}&overwrite=true&allowRename=false`, formData, 
                        {
                            onUploadProgress: progressEvent => {
                                var stmp = progressEvent.total - file.size;
                                self.tmpPercentageNum = progressEvent.loaded - stmp;
                                self.setPercentage();
                            }
                        })
                        .then(response => {                             
                            if(response.data.errcode == 0) {
                                self.setUploadResultCount(self.uploadResultCount + 1);
                                self.percentageNum += file.size;
                                self.tmpPercentageNum = 0; 
                            }else {                                            
                                self.errMessage.push({fileName: file.name, message: response.data.errmsg});                                                                                                   
                                self.errCount++;                        
                                self.setUploadResultCount(self.uploadResultCount + 1);          
                                self.percentageNum += file.size;
                                self.tmpPercentageNum = 0;    
                            }                                                
                        }).catch(result => {                            
                            self.errMessage.push({fileName: file.name, message: result.errmsg});               
                            self.errCount++;                        
                            self.setUploadResultCount(self.uploadResultCount + 1);          
                            self.percentageNum += file.size;
                            self.tmpPercentageNum = 0;
                        });                                             
                    }                    
                });                                
            }
        },
        // kendo 업로드 코드
        // useDragDropUpload(){
        //     if (store.state.info.features.useDragDropUpload=="true") {
        //         return '#edrm-right';
        //     }
        //     else{
        //         return 'false';
        //     }
        // },
        // beforeUpload(e){
        //     this.upload.url=`${store.state.baseURL}/json/upload_createDoc?folderId=${this.currentDir}`;
        //     e.sender.options.async.saveUrl=this.upload.url;
        //     if(this.checkIsDone()){
        //         this.upload.errobj=[];
        //         if(this.upload.messageObj) this.upload.messageObj.close();
        //         this.upload.totalFileCount=1;
        //         this.upload.completeCount=0;
        //         this.upload.errorCount=0;
        //         this.upload.messageObj=this.$message({
        //             message:this.messageFactory(),
        //             duration:0
        //         });
        //     }
        //     else{
        //         this.upload.totalFileCount+=1;
        //     }
        // },
        // uploadSuccess(e){
        //     if(e.response.errcode!=0){ //서버반환 http 상태코드가 200이여서 수동으로 에러처리를 해야함
        //         this.uploadError(e);
        //         return;
        //     }
        //     if(e.response.dupActionId && e.response.dupActionId.length>0){
        //         console.log(e.response.dupActionId);
        //         this.upload.errorCount+=1;
        //         this.upload.errobj.push({errname:e.files[0].name,errmsg:this.$t('messages.isduplicateDoc'),actionId:e.response.dupActionId});
        //         this.upload.messageObj.type="warning";
        //     }
        //     else
        //         this.upload.completeCount+=1;
        //     this.upload.messageObj.message=this.messageFactory();
        //     this.checkIsDone();
        // },
        // uploadError(e){
        //     this.upload.errorCount+=1;
        //     this.upload.messageObj.message=this.messageFactory();
        //     // this.upload.errobj.push({errname:e.files[0].name, errmsg:e.response.errmsg || "Unknown Error"});
        //     this.upload.errobj.push({errname:e.files[0].name, errmsg: JSON.parse(e.XMLHttpRequest.response).errmsg || "Unknown Error"});
        //     this.checkIsDone();
        // },
        // checkIsDone(){
        //     if(this.upload.totalFileCount==0) return true;
        //     if(this.upload.totalFileCount<=this.upload.completeCount+this.upload.errorCount){
        //         if(this.upload.errorCount==this.upload.totalFileCount && this.upload.messageObj.type!="warning") {
        //             this.upload.messageObj.type="error";
        //         }
        //         if(this.upload.errorCount==0){
        //             this.upload.messageObj.type="success";
        //         }
        //         else{
        //             this.showError();
        //         }
        //         setTimeout(function(){
        //             obj.upload.messageObj.close();
        //         },3000);
        //         this.upload.totalFileCount=0;
        //         this.upload.completeCount=0;
        //         this.upload.errorCount=0;
        //         var obj=this;
        //         this.upload.messageObj.showClose=true;
        //         store.dispatch('reloadSelectedFolder')
        //         return true;
        //     }
        //     else{
        //         if(this.upload.errorCount>0) this.upload.messageObj.type="warning";
        //         this.showError();
        //         return false;
        //     }
        // },
        // messageFactory(){
        //     return `${this.$t('label.uploading')} ${this.upload.completeCount+this.upload.errorCount}/${this.upload.totalFileCount}  ${this.$t('label.success')}:${this.upload.completeCount} ${this.$t('label.error')}:${this.upload.errorCount}`;
        // },
        // showError(){
        //     if(this.upload.errorCount<=0 || this.upload.errobj.length<=0) return;
        //     this.$refs.messageBox.show(this.upload.errobj);
        // },
        openActions(params){
          console.log('listgrid openActions called')
          let viewOption=this.$store.state.viewOption
        //   if(viewOption.view=='table'){
        //       Event.fire(EventList.OPEN_CONTEXT, {event: params.event, from: constants.ATTRIBUTE.COMMON_FILE})
        //   }else{
              this.$refs.currentComp.openContext(params.event, null, constants.ATTRIBUTE.NONE)
        //   }
          
        }
    }
}
</script>
<style>
    #edrm-right-sub {
        height: 100%;
    }

.grayfont, .grayfont-10 {
    color: #888;
    font-size: 9pt;
    letter-spacing: -0.1px;
}
.class-con {
    display: inline-block;
    vertical-align: bottom;
}
.class-con span.k-icon {
    vertical-align: baseline;
}
#edrm-right-sub .box {
    box-shadow: none;
    border-bottom: 1px solid #ebebeb;
    border-radius: 0;
    padding: 2px 0px;
}
#edrm-right-sub .box:not(:last-child) {
    margin-bottom: 0;
}

.list-item-detail {
  display: flex;
  padding: 0;
  flex-wrap: wrap;
  justify-content: flex-start;
  position: relative;
}

.list-item-detail .size,
.list-item-detail .modified {
  font-size: 0.9em;
}

.media-content .content p:not(:last-child) {
  margin-bottom: 0.3em !important;
  margin-top: 0.3em !important;
}

.list-item-detail .name {
  font-weight: bold;
}

.margin-r-15 {
    margin-right: 15px;
}
.list-indicator {
    white-space: nowrap;
}
.hold-line {
    white-space: nowrap;
}

/* tags */
/* .tags:not(:last-child) {
    margin-bottom: 0.2rem;
}

.tags:last-child {
   margin-bottom: -0.5rem;
} */

.x-tags .tag {
    margin-bottom: 0;
}

.list-item-path {
    color: #888;
    font-size: 9pt;
    padding: 0px 0px 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.list-item-path:hover {
    text-decoration: underline;
    cursor: pointer;
}

.el-dialog .el-progress {
    margin: 15px 0;
}

.failed {
    color: #f66;
}

</style>
