<template>
  <el-dialog
    :title="$t('adminMenu.task_result')"
    width="55%"
    :visible.sync="errDialogVisible"
    :before-close="close"
    append-to-body
    >
    <div id="errmsgDialog">
      <el-table :data="messageList">
        <el-table-column prop="errname" :label="$t('label.filename')" ></el-table-column>
        <el-table-column prop="errmsg" :label="$t('label.message')" ></el-table-column>
        <el-table-column width="100">
          <template slot-scope="scope">
              <el-button v-if="messageList[scope.$index].actionId" v-on:click="deleteDuplicate(scope.$index)" type="danger" icon="el-icon-delete" circle size="mini"></el-button>
              <el-button v-if="messageList[scope.$index].actionId" v-on:click="ignoreDuplicate(scope.$index)" type="success" icon="el-icon-check" circle size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="close()" >{{ $t('buttons.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {mapState, mapGetters} from 'vuex'

export default {
  name: 'ErrorMessageBox',
  data() {
    return {
      errDialogVisible:false,
      messageList:[]
    }
  },
  methods: {
    show(messageList){
      this.messageList=messageList;
      this.errDialogVisible=true;
    },
    addError(message){
      this.messageList.push(message);
      this.errDialogVisible=true;
    },
    clear(){
      this.messageList=[];
    },
    close(){
      this.errDialogVisible=false;
      for(var i=0;i<this.messageList.length;i++){
        if (this.messageList[i].actionId) {
          api.ignoreDuplicateDoc(this.messageList[i].actionId);
        }
      }
      this.$store.commit('closeHovers')
      store.dispatch('reloadSelectedFolder')
    },
    deleteDuplicate(idx){
      var actionId=this.messageList[idx].actionId || null;
      if (!actionId) {
        return;
      }
      api.removeDuplicateDocDirectly(actionId).then(data=>{
        this.clearRow(idx);
      })
    },
    ignoreDuplicate(idx){
      var actionId=this.messageList[idx].actionId || null;
      if(!actionId){
        return;
      }
      api.ignoreDuplicateDoc(actionId).then(data=>{
        this.clearRow(idx);
      })
    },
    clearRow(idx){
      this.messageList.splice(idx, 1);
      console.log(this.messageList)
      if(this.messageList.length<=0){
        this.close();
      }
      else{

      }
    }
  },
}
</script>
<style>
  #errmsgDialog{
    width:100%;
    height: 40vh;
    overflow: auto;
  }
</style>
