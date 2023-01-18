<template>
  <el-dialog
    :title="$t('prompts.history')"
    :visible.sync="dialogVisible" v-draggable
    width="75%"
    :before-close="handleClose"
    >
    <div class='history-card'>
      <file-card v-if="element" :element="element">
      </file-card>
    </div>
    <div id="history_pmpt" class="container">
      <el-table
        v-loading="loading"
        :data="historyData"
        >
          <el-table-column align="center" prop="version" :label="$t('history.version')" width="50"></el-table-column>
          <el-table-column align="center" prop="title" :label="$t('history.name')"></el-table-column>
          <el-table-column align="center" prop="event" :label="$t('history.event')" width="120"></el-table-column>
          <el-table-column align="center" prop="comment" :label="$t('history.des')" width="160"></el-table-column>
          <el-table-column align="center" prop="userName" :label="$t('history.user')" width="90"></el-table-column>
          <el-table-column align="center" prop="date" :label="$t('history.date')" width="100"></el-table-column>
      </el-table>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close()">{{ $t('buttons.close') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import Vue from 'vue'
import url from '@/utils/url'
import * as api from '@/utils/api'
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import FileCard from '@/views/FileCard'

export default {
  name: 'history',
  data: function () {
    return {
      dialogVisible: true,
      loading:true,
      historyData:[],
      selectedList:null,
      element: "",
    }
  },
  mounted(){
    this.init();
  },
  components:{
     ...mapState(['selected']),
    'file-card' : FileCard,
  },
  methods: {
    close(){
      this.$store.commit('closeHovers')
    },
    handleClose(done) {
      this.close();
    },
    async init(){
      this.selectedList=Utils.getCurrentSelect();
      if(this.selectedList.length!=1) this.close();
      var object_id=this.selectedList[0].r_object_id;
      let elementData = await api.getElement(object_id)
      this.element = elementData.list[0];
      api.getDocHistory(object_id).then(data=>{
        if(data.errcode==0){
          this.historyData=data.list;
          this.historyData.forEach(element => {
            element.date = Utils.formatMoment(element.date)
          });
          this.loading=false;
        }
        else{
          this.close();
        }
      }).catch(err=>{
        this.close();
      });
    }
  }
}
</script>
<style>
.container#history_pmpt {
  width:100%;
  height: 40vh;
  overflow: auto;
}
.history-card{
  margin-bottom: 5px;
}
</style>

