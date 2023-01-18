<template>
  <el-dialog
    :title="title"
    width="45%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="handleClose"
    >
    <span>{{ $t('prompts.deleteMessage') }}</span>
    <span slot="footer" class="dialog-footer">
      <el-button type="danger" @click="remove()">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
    <progressbar ref="progressbar" message="Compress" :autoClose="true" @postAction="postAction" ></progressbar>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import buttons from '@/utils/buttons'
import progressbar from './Progressbar'
export default {
  name: 'delete',
  components: { progressbar },
  data: function () {
    return {
      title: '',
      selectedList:null,
      dialogVisible: true
    }
  },
  computed: mapState(['selected','rootId','lastSearchOption']),
  mounted:function(){
    this.selectedList=Utils.getCurrentSelect();

    if(this.selectedList.length > 1) {
      this.title = this.$t('prompts.deleteMultipleTitle');
    }
    else {
      if(this.selectedList[0].isFolder) {
        this.title = this.$t('prompts.deleteFolderTitle');
      }else {
        this.selectedList[0].r_object_type === 'dm_folder' ? this.title = this.$t('prompts.deleteFolderTitle') : this.title = this.$t('prompts.deleteTitle');
      }
    }
  },
  methods: {
    ...mapMutations(["setReload"]),
    remove: function (event) {
      var delList="";
      for(var i=0;i<this.selectedList.length;i++){
        delList+=this.selectedList[i].r_object_id;
        if(i<this.selectedList.length){
          delList+=',';
        }
      }
      api.remove(delList).then(data=>{
        this.hide();
        this.$refs.progressbar.getStatus(data.actionId,true);
      }).catch(error=>{
      });
    },
    postAction() {
      if (this.rootId=='search') {
        Event.fire(EventList.SEARCH,this.lastSearchOption)
        if (this.lastSearchOption.mode=='duplistname'){
          Event.fire(EventList.LOAD_SPLITTER,this.lastSearchOption);
        }
        return;
      }
      if (this.selectedList[0].reloadParent)
        Event.fire(EventList.RELOAD_TREE, true)
      else 
        Event.fire(EventList.RELOAD_TREE, false)
      this.close()
    },
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    hide(){
      this.dialogVisible=false;
    },
    handleClose(done) {
      this.close();
    }
  }
}
</script>
