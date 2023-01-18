<template>
  <el-dialog :top="top" :title="$t('label.results')" width="600px"
    :visible.sync="errDialogVisible" :before-close="close" v-draggable>
    <div>
      <el-card v-if="message" class="box-card">
        <h3 class="h3">{{ message }}</h3>
      </el-card>

      <h3 class="h3" style="margin-top: 10px;"><i class='fa fa-arrow-circle-right'></i> {{ $t('label.errorDetails') }}</h3>
      <el-table :data="list" max-height="350">
        <el-table-column prop="name" width="180" :label="$t('label.filename')" ></el-table-column>
        <el-table-column prop="message" :label="$t('label.message')" ></el-table-column>
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
  name: 'ResultList',
  props: {
    message: String,
    list : {
      default: [],
      type: Array
    },
    dynamic: {  // createDialog 로 생성되면 true
      default: true,
      type: Boolean
    }
  },
  data() {
    return {
      top : '50px',
      errDialogVisible:true,
      messageList:[]
    }
  },
  methods: {
    close(){
      this.errDialogVisible=false;
      if (this.dynamic)
        this.$close(null)
      else
        this.$store.commit('closeHovers')
    },
  },
}
</script>
<style>
</style>
