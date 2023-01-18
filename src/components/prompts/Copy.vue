<template>
  <el-dialog
    :title="$t('prompts.copy')"
    width="50%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="close"
    >
    <span>{{ $t('prompts.copyMessage') }}</span>
    <div>
      <!--  <el-checkbox class="overwrite-check" v-model="overwrite">{{ $t('label.overwrite') }} </el-checkbox>
      <span class='overwriteMessage'>(※ {{ $t('label.overwriteMessage') }})</span> -->
      <filefolders
        @notifySelected="onSelected" :containerHeight="'40vh'" :disableList="true">
      </filefolders>
      <progressbar ref="progressbar" message="Copy" :autoClose="true" @postAction="postAction"></progressbar>
      <overwrite-select :setting="checked" @onSelectedRadio="onSelectedRadio"></overwrite-select>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="copy()" :disabled="copyBtnDisabled">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import * as api from '@/utils/api'
import buttons from '@/utils/buttons'
import filefolders from '@/views/FileFolders'
import Utils from '@/utils/utils'
import overWriteSelect from '@/components/overWriteSelect'

export default {
  name: 'copy',
  components: { 
    filefolders,
    'progressbar': () => import('@/components/prompts/Progressbar'),
    'overwrite-select': overWriteSelect, 
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true,
      targetPath:"",
      copyBtnDisabled:true,
      checked: "overwrite",
      namePath:null,
    }
  },
  mounted(){
    this.selectedList=Utils.getCurrentSelect();
  },
  computed: mapState(['selected']),
  methods: {
    copy: function (event) {
      let copyList=[];
      for(var i=0;i<this.selectedList.length;i++){
        copyList.push(this.selectedList[i].r_object_id);
      }
      let successMessage=this.$t('success.complete')
      api.copy(copyList,this.targetPath,this.checked).then(data=>{
        this.hide();
        this.$refs.progressbar.getStatus(data.actionId,true);
      }).catch(error=>{
        console.log(error);
      });
    },
    close(){
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    hide(){
      this.dialogVisible=false;
    },
    postAction(){
      Event.fire(EventList.RELOAD_LIST);
      //Event.fire(EventList.RELOAD_TREE);
      var tree = $("#treeview").data("kendoTreeView");
      var currentDataItem = tree.dataSource.get(store.state.currentDir);
      var currentNode= tree.findByUid(currentDataItem.uid);
      var selectedDataItem = tree.dataItem(currentNode);
      selectedDataItem.loaded(false);
      selectedDataItem.load();
      Event.fire(EventList.RESTORE_RELOAD,{path: this.namePath});
      this.close();
    },
    onSelected(selected){
      this.targetPath=selected.rid;
      let path=selected.r_folder_path || selected.pathName
      let namePath=[];
      if(path){
        namePath=path.split('/')
        namePath.shift();
        namePath.splice(namePath.length-1,1,selected.text);
      }
      this.namePath=namePath
      this.copyBtnDisabled=false;
    },
    onSelectedRadio(e){
      this.checked=e;
    },
  }
}
</script>
<style>
.overwrite-check {
  padding: 10px;
}

</style>
