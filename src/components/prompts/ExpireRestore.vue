<template>
  <el-dialog  v-if="this.isSelectLocation"
    :title="$t('prompts.restore')"
    width="45%"
    :visible.sync="dialogVisible" v-draggable
    >
    <span>{{ $t('prompts.restoreMessage') }}</span>
    <div id="restore_pmpt" class='container'>
      <el-checkbox v-model="useDefaultLocation">{{ $t('prompts.restoreOriginalPath') }}</el-checkbox>
      <filefolders :disabled="useDefaultLocation"
          @notifySelected="onSelected" :containerHeight="'40vh'" :disableList="true">
      </filefolders>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit()">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import Utils from '@/utils/utils'
import filefolders from '@/views/FileFolders'
import * as api from '@/utils/api'
import { mapState } from 'vuex'

export default {
  name: 'expireRestore',
  components: { filefolders },
  data: function () {
    return {
      useDefaultLocation:true,
      dialogVisible: true,
      targetFolderId:null,
      namePath:null,
      restoreLocation:"",
      isSelectLocation: null
    }
  },
  computed: {
    ...mapState(['selected', 'currentDir']),
  },
  mounted(){
    if(this.selected.length==0){
      return;
    }
    this.setRestoreLocation()

    if(!this.isSelectLocation){
      this.useDefaultLocation = false
      this.submit();
    }
  },
  methods: {
    submit: function (event) {
      if(this.useDefaultLocation || !this.isSelectLocation) this.targetFolderId="";
      let successMessage = this.$t('success.complete')
      var restoreList="";
      var cnt=this.selected.length;
      for(var i=0;i<cnt;i++){
        restoreList+=this.selected[i].r_object_id;
        if(i<cnt){
          restoreList+=',';
        }
      }
      api.restoreFile(restoreList,this.targetFolderId,this.restoreLocation).then(data=>{
        Utils.showResultMessage(true);
        Event.fire(EventList.RELOAD_LIST)
        for(var i=0;i<cnt;i++){
          this.searchPath(this.selected[i].r_folder_path,this.selected[i].docTypeName);
        }
      }).catch(error=>{
      });
      this.close();
    },
    searchPath(path,type){
       let urlParts=path.split('/');
       if(!this.useDefaultLocation){
         urlParts=this.namePath
       }else{
          urlParts.shift();
          urlParts.splice(urlParts.length-1,1);
          urlParts.splice(urlParts.length-1,1);
       }
       let data={
         path: urlParts,
       }
       Event.fire(EventList.RESTORE_RELOAD,data);
    },
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    handleClose(done) {
      this.$confirm(this.$t('messages.closeMessage'))
        .then(_ => {
          this.close();
        })
    },
    onSelected(item){
      let tempPath="";
      this.targetFolderId=item.rid;
      let path=item.r_folder_path || item.pathName
      let namePath=[];
      if(path){
        namePath=path.split('/')
        namePath.shift();
        namePath.splice(namePath.length-1,1);
      }
      this.namePath=namePath
    },
    setRestoreLocation(){
      this.restoreLocation = Utils.featuresDefault('restore.location','')

      if(this.restoreLocation == undefined)
        this.isSelectLocation = true
      else
        this.isSelectLocation = false
    }
  }
}
</script>
<style>
</style>

