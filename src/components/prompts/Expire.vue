<template>
  <el-dialog
    :title="$t('prompts.expireTitle')"
    width="45%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="handleClose"
    >
    <span>{{ $t('prompts.expireMessage') }}</span>
    <span slot="footer" class="dialog-footer">
      <el-button type="danger" @click="remove()">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="closeWithoutRefresh()">{{ $t('buttons.cancel') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import buttons from '@/utils/buttons'
export default {
  name: 'expire',
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true
    }
  },
  computed: mapState(['selected']),
  mounted:function(){
    this.selectedList=Utils.getCurrentSelect();
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
      api.expireFilePermanently(delList).then(data=>{
        this.close();
      }).catch(error=>{
        this.close();
      });
    },
    close() {
      this.dialogVisible=false;
      Event.fire(EventList.RELOAD_LIST);
      this.$store.commit('closeHovers')
    },
    closeWithoutRefresh(){
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    hide(){
      this.dialogVisible=false;
    },
    handleClose(done) {
      this.closeWithoutRefresh();
    }
  }
}
</script>
