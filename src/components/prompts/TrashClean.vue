<template>
  <el-dialog
    :title="$t('prompts.trashClean')"
    width="45%"
    :visible.sync="dialogVisible" v-draggable
    :before-close="close"
    >
    <span>{{ $t('prompts.trashCleanMessage') }}</span>
    <span slot="footer" class="dialog-footer">
      <el-button type="danger" @click="remove()">{{ $t('buttons.ok') }}</el-button>
      <el-button @click="close()">{{ $t('buttons.cancel') }}</el-button>
    </span>
    <progressbar ref="progressbar" message="Compress" :autoClose="true" @postAction="postAction" ></progressbar>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import Utils from '@/utils/utils'
import * as api from '@/utils/api'
import buttons from '@/utils/buttons'
import progressbar from './Progressbar'
export default {
  name: 'trashclean',
  components: { progressbar },
  data: function () {
    return {
      dialogVisible: true
    }
  },
  methods: {
    remove: function (event) {
      let successMessage=this.$t('success.complete')
      api.trashCleanup().then(data=>{
        this.hide();
        this.$refs.progressbar.getStatus(data.actionId,true);
      }).catch(error=>{
        
      });
    },
    hide(){
      this.dialogVisible=false;
    },
    postAction(){
      Event.fire(EventList.RELOAD_LIST);
      this.close();
    },
    close() {
      this.dialogVisible=false;
      
      this.$store.commit('closeHovers')
    },
    handleClose(done) {
      this.$confirm(this.$t('label.closeMessage'))
        .then(_ => {
          this.close();
        })
    }
  }
}
</script>
