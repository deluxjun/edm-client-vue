<template>
    <kendo-splitter :orientation="'horizontal'" :panes="[{size: getTreePanePercent()},{ }]" :style="{height: containerHeight}">
        <div id="multipleUpload-left">
            <kendo-treeview id="treeview" ref="ref_treeview" :data-source="remoteDataSource"
                :data-text-field="'text'"
                @databound='onDataBound'
                @select='onTreeSelect'
                :template="$Constants.TREEVIEW_FILE_TEMPLATE">
            </kendo-treeview>
        </div>
        <div id="upload-right">
            <div class='multi-select-upload-box'>
                <div class="select-click-button" @click="handleBtnCheck"><i class='el-icon-d-arrow-right'></i></div>
                <div class="select-upload-box-list">
                     <el-tag :key="folder.id" type="info" v-for="folder in selectedFolderList" :closable="true" :disable-transitions="false" @close="handleRemove(folder)">
                        <i class="fa fa-folder" aria-hidden="true"></i>
                        {{ returnFolder(folder)}}
                    </el-tag>
                </div>
            </div>
            <div class='multi-upload-area'>
                <uploadform ref="uploadform" :uploadUrl="uploadUrl" :multiple="true" :closeWhenUploaded="false" @minusCount="minusCount" @onSelected="onSelected" @enableUpload="enableUpload" @uploadDone="uploadDone" @successCallback="successCallback" @errorCallback="errorCallback"></uploadform>
                <span slot="footer" class="dialog-footer">
                <el-button size="mini" id="uploadBtn" class='multiUpload' type="primary" @click="upload()" :disabled="uploadBtndisabled">{{ $t('buttons.upload') }}</el-button>
                </span>
            </div>
            <progressbar ref="multiProgressbar" message="Compress" :autoClose="true" @postAction="postAction"></progressbar>
        </div>

      
    </kendo-splitter>

</template>
<script>
    import * as api from '@/utils/api'
    import { mapState} from "vuex";

    import { Splitter } from '@progress/kendo-layout-vue-wrapper'
    import { DataSourceInstaller } from '@progress/kendo-datasource-vue-wrapper'
    import { TreeView,
            TreeViewItem,
            TreeViewInstaller } from '@progress/kendo-treeview-vue-wrapper'
    import Constants from '@/Constants'
    import UploadForm from '@/components/UploadForm'
    import overWriteDialog from '@/components/overWriteDialog'
    import overWriteSelect from '@/components/overWriteSelect'

    export default {
        name: 'filefolders',
        components: {
            Splitter,
            uploadform:UploadForm,
            'overwrite-select': overWriteSelect,
            'progressbar': () => import('@/components/prompts/Progressbar'),
        },
        props : {
            containerHeight: {
                default: '450px',
                type: String
            },
            disableList : {
                default: false,
                type: Boolean
            },
            type : {
                default: 'explorer',
                type: String
            },
            gridSelectable: {
                default: Constants.SELECTABLE.MULTIPLE,
                type: String
            },
            isFolder: {
                default : null,
                type : Boolean
            },
            isRoad:{
                dafalut : false,
                type : Boolean
            }
        },
        computed: {
            ...mapState([
                "user", "currentDir"
            ]),
            remoteDataSource() {
                let attr = false
                return api.getTreeDataSource(`${store.state.baseURL}/json/getTreeList2?targetType=filefolder&attr=${attr}`, 'rid', 'hasChildren', 'list');
            }
        },
        data() {
            return {
                requestData : {
                    url : null,
                    data : null
                },
                isDialog: true,
                selectedFolderList: [],
                tempDataItem:{},

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
                checked: 'overwrite',

                docCopyList: [],
            }
        },
        mounted() {
            this.remoteDataSource.bind("error", this.handleError);
            this.$emit('position');            
            this.road=this.isRoad
            Event.off(EventList.CLEAR_DATA)
            Event.listen(EventList.CLEAR_DATA,this.handleClear)
        },
        methods: {
            getTreePanePercent() {
                if (!this.user.treePanePercent) return "30%";
                return this.user.treePanePercent;
            },
            onDataBound: function (ev) {
               
            },
            onTreeSelect: function (ev) {                
                let dataItem = ev.sender.dataItem(ev.node)
                
                let el = $('#multipleUpload-left').find('#treeview');
                let tree = el.data('kendoTreeView');

                tree.select(ev.node);
                tree.expand(ev.node);
                console.log(dataItem);
                this.tempDataItem=dataItem;
            }, 
            handleBtnCheck(){
                if(this.selectedFolderList.length==0){
                    this.selectedFolderList.push(this.tempDataItem);
                }else{
                   let folderState=true;
                   for(var i=0; i < this.selectedFolderList.length ; i++){
                       if(this.selectedFolderList[i].id==this.tempDataItem.id){
                           alert('이미 선택된 폴더입니다.');
                           folderState=false;
                       }
                   }
                   if(folderState){
                       this.selectedFolderList.push(this.tempDataItem);
                   }

                }
            },
            handleError(e) {
                if (e.xhr.readyState == 0 || e.xhr.status == 401) {
                    api.toLogin()
                }
            },
            handleRemove(folder){
                 this.selectedFolderList.splice(this.selectedFolderList.findIndex(e => e.id === folder.id), 1);
            },
            returnFolder(fodler){
                if(fodler.r_folder_path){
                    return fodler.r_folder_path+fodler.text
                }else{
                    return fodler.text
                }
            },
            upload:function(){
                this.isUploading=true;
                this.uploadBtndisabled=true;
                this.reload=true;
                this.uploadUrl=`${store.state.baseURL}/json/upload_createDoc?from=${store.state.rootId}&folderId=${this.selectedFolderList[0].id}` ;       
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
            postAction(){
                console.log("다됫냐???");
            },
            successCallback:function(e){
                this.successCount+=1;
                var element=$('.k-file').filter(`[data-uid=${e.files[0].uid}]`);
                element.removeClass('k-file-success').addClass('successborder');
                $('.successborder').find('.successMark').remove();
                $('.successborder').append("<span class='successMark'><i class='fa fa-check-circle-o'></i></span>");
                this.docCopyList.push(e.response.docId);
                if(this.totalCount === (this.successCount + this.failCount)) {
                    this.isUploading = false;
                    for(var i=1; i < this.selectedFolderList.length; i++){
                        this.copyFileList(this.selectedFolderList[i].id);
                    }
                    
                }
            },
            errorCallback:function(e){
                let overwriteUpload=Utils.featuresDefault('overwriteUpload',false)
                if(overwriteUpload){
                    this.checkFileOverWrite(e)
                }
                this.failCount+=1;
            },
            copyFileList(copyFolderEid){
                console.log('복사처리');
                
                api.copy(this.docCopyList, copyFolderEid, "allowRename").then(data=>{                        
                    Utils.showResultMessage(true);
                    this.$refs.multiProgressbar.getStatus(data.actionId, true); 
                    Event.fire(EventList.TABLE_REFRESH);       
                });               

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
                console.log(result);
                this.uploadBtndisabled=!result && this.selectedFolderList.length > 0;
            },
            ShowOverWriteDialog(){
                let overwriteUpload=this.$Utils.featuresDefault('overwriteUpload',false)
                return overwriteUpload
            }

            
        },
        created(){
          this.uploadUrl=`${store.state.baseURL}/json/upload_createDoc?from=${store.state.rootId}&folderId=${this.currentDir}` ; 
        },

    }
</script>
<style>
.multiUpload{
    width: 100%;
    margin-top: 10px;
}
#upload-right{
    border-left: 1px solid #efefef;
}
.select-click-button{
    font-size: 20px;
    width: 10px;
    padding: 20px;
    height: 130px;
    float: left;
    background-color: #efefef;
    display: table;
    cursor: pointer;
}
.select-click-button i{
    text-align: center;
    margin-top: 40px;
}
.select-upload-box-list{
    float: left;
    width: calc(100% - 62px);
    height: 130px;
    border-bottom: 1px solid #efefef;
    overflow-y : auto;
    padding: 5px;
}
.multi-select-upload-box{
  width: 100%;
  float: left;
}
.multi-upload-area{
  width: 100%;
  float: left;
}
.select-upload-box-list .el-tag{
    margin-left: 10px;
}
.successMark{
  font-size: 20pt !important;
  color: #37b400 !important;
  position: absolute;
  right:5px;
  top: 3px;
}
</style>
