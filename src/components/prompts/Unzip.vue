<template>
<div>
  <el-dialog
    :title="$t('prompts.unzip')"
    width="45%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="close"
    v-if='positionUnzip'
    >
    <span>{{ $t('prompts.unzipMessage') }}</span>
    <filefolders
        @notifySelected="onSelected" :disableList="true" :containerHeight="'40vh'">
    </filefolders><br>
    <el-input v-model="password" type="password" placeholder="password(option)"></el-input>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="submit()" :disabled="unzipBtnDisabled">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
   <progressbar ref="progressbar" message="Compress" :autoClose="true" @postAction="postAction"></progressbar>
  </div>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import filefolders from '@/views/FileFolders'
import newdir from './NewDir'

export default {
  name: 'unzip',
  components: {
    'progressbar': () => import('@/components/prompts/Progressbar'),
    filefolders,newdir },
  data: function () {
    return {
      selectedList:null,
      targetPath:"",
      dialogVisible: true,
      unzipBtnDisabled:true,
      password:"",
      positionUnzip: false,
    }
  },
  mounted(){
    let unzipPosition=Utils.featuresDefault('prompts.unzipPosition', false)
    if(unzipPosition){
      this.positionUnzip=true;
    }else{
      this.$confirm(this.$t('prompts.unzipConfirmMsg'),'',{
          confirmButtonText: vue.$t('buttons.ok'),
          cancelButtonText: vue.$t('buttons.cancel'),
          type: 'info'
      }).then(()=>{
          this.submit();
      }).catch(()=>{
          
      })
    }
    this.selectedList=Utils.getCurrentSelect();
  },
  methods: {
    submit: function (event) {
      api.zipDeCompress(this.selectedList[0].r_object_id,this.targetPath,"",this.password).then(data=>{
        this.hide();
        this.$refs.progressbar.getStatus(data.actionId,true);
      }).catch(error=>{
        console.log(error);
      })
    },
    onSelected(selected){
      this.targetPath=selected.rid;
      this.unzipBtnDisabled=false;
    },
    postAction(){
      Event.fire(EventList.RELOAD_LIST);
      Event.fire(EventList.RELOAD_TREE);
      this.close();
    },
    close() {
      this.dialogVisible=false;
      this.$store.commit('closeHovers')

    },
    hide(){
      this.dialogVisible=false;
    }
  }
}
</script>

