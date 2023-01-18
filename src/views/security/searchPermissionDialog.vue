<template>
   <el-dialog id="scan-dialog" ref="windowRef"
    :title='title' :width='width' :visible.sync="dialogVisible" :before-close="setclose">
    <searchNotification :dialogSearchGridHeight="'500px'"></searchNotification>
  </el-dialog>
</template>
<script>
import {mapGetters, mapState, mapActions} from 'vuex'
import * as api from '@/utils/api'
import * as ruleapi from '@/utils/RulesApi'
import searchNotification from '@/views/security/searchPermission'
import { create } from 'vue-modal-dialogs'

export default {
  name: 'search-permission',
  components: {
    searchNotification
  },
  props: {
    title: String,
    width: {
      default: '50%',
      type: String
    },
  },
  data: function () {
    return {
      selectedList:null,
      dialogVisible: true,
      elemetnid: ''
    }
  },
  mounted() {
    this.init();
  },
  methods:{
    setclose(){
      this.dialogVisible=false;
      this.$store.commit('closeHovers')
    },
    alldelete(){
      
    },
    init(){
  
    }
  },
 
}
</script>

<style lang="scss">
.delBtn{
  float: right;
  right: 10px;
}
.font20{
  font-size: 20px;
}
.loadingview{
    width: 80%;
    margin: auto;
    top: 100px;
    text-align: center;
    position: relative;
}
</style>
