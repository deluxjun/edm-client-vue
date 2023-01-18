<template>
  <el-dialog
    :title="$t('prompts.alert')"
    width="40%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="close"
     append-to-body
    >
    <span>{{ message }} {{filename}}</span>
      <el-button type="primary" @click="skip">{{ $t('buttons.skip') }}</el-button><br>
      <el-button type="primary" @click="overwrite">{{ $t('buttons.overwrite') }}</el-button><br>
      <el-button type="primary" @click="overwriteall">{{ $t('buttons.overwriteall') }}</el-button><br>
      <el-button type="primary" @click="cancel">{{ $t('buttons.cancel') }}</el-button><br>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import * as api from '@/utils/api'
import buttons from '@/utils/buttons'
import filefolders from '@/views/FileFolders'
import constants from '@/Constants';
import Utils from '@/utils/utils'
export default {
  name: 'mvcpop',
  props: ['actionId'],
  components: { filefolders },
  data: function () {
    return {
        dialogVisible:false,
        message:"",
        filename:""
    }
  },
  methods: {
    show(message,filename){
        api.setExecutionExOption(this.actionId,constants.MVCP_OPTIONS.WAIT).then(data=>{
            this.message=message;
            this.filename=filename;
            this.dialogVisible=true;
        }).catch(error=>{
            console.log(error);
        });
    },
    overwrite(){
        api.setExecutionExOption(this.actionId,constants.MVCP_OPTIONS.OVERWRITE).then(data=>{
            this.close();
        }).catch(error=>{
            console.log(error);
        });
    },
    overwriteall(){
        api.setExecutionExOption(this.actionId,constants.MVCP_OPTIONS.OVERWRITEALL).then(data=>{
            this.close();
        }).catch(error=>{
            console.log(error);
        });
    },
    skip(){
        api.setExecutionExOption(this.actionId,constants.MVCP_OPTIONS.SKIP).then(data=>{
            this.close();
        }).catch(error=>{
            console.log(error);
        });
    },
    cancel(){
        api.setExecutionExOption(this.actionId,constants.MVCP_OPTIONS.CANCEL).then(data=>{
            this.close();
        }).catch(error=>{
            console.log(error);
        });
    },
    close(){
        this.$emit('restartcheck');
        this.dialogVisible=false;
    }
  }
}
</script>
<style>

</style>